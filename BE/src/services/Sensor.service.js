/* eslint-disable no-useless-catch */
import { sensorModel } from '~/models/Sensor.model'
import { sensorDataModel } from '~/models/SensorData.model'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/User.model'
import { historyService } from '~/services/alert.historyService'
import { PUBLISH_MQTT } from '~/config/mqtt'

const registerDevice = async ( userId, reqBody ) => {
  try {
    const { deviceId, name } = reqBody
    const existSensor = await sensorModel.findOneByDeviceId(deviceId)
    if (existSensor) {
      throw new ApiError(StatusCodes.CONFLICT, 'Device ID already registered')
    }

    const newSensor = {
      user: userId,
      deviceId: deviceId,
      name: name
    }
    const createdSensor = await sensorModel.createNew(newSensor)
    const getNewSensor = await sensorModel.findOneById(createdSensor.insertedId)

    if (getNewSensor) {
      await userModel.pushSensorOrderIds(getNewSensor)
    }

    return getNewSensor
  } catch (error) { throw error }
}

const getMySensors = async ( userId ) => {
  try {
    const sensors = await sensorModel.findOneByUserId( userId )
    return sensors
  } catch (error) { throw error }
}

const getSensorData = async ( userId, deviceId, { page, limit } ) => {
  try {
    const sensor = await sensorModel.findOneUserAndDeviceId(userId, deviceId)
    if (!sensor) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'SENSOR NOT FOUND')
    }

    const skip = (page - 1) * limit

    const data = await sensorDataModel.findDataBySensor(sensor._id, skip, limit)
    const total = await sensorDataModel.countDataBySensor(sensor._id)

    return {
      sensorInfo: sensor,
      data,
      pagination: {
        totalItems: total,
        currentPage: page,
        itemsPerPage: limit,
        totalPages: Math.ceil(total/limit)
      }
    }
  } catch (error) { throw error }
}

//service cho mqtt
const saveMqttData = async (deviceId, validateData) => {
  try {
    const sensor = await sensorModel.findOneByDeviceId(deviceId)

    if (!sensor) return // warm

    const newData = {
      sensor: sensor._id.toString(),
      ...validateData
    }
    await sensorDataModel.createNew(newData)

  } catch (error) { console.log(error.message) }
}

const checkThreshold = (value, { min, max }) => {
  if (max && value > max) return { status: 'HIGH', threshold: max }
  if (min && value < min) return { status: 'LOW', threshold: min }
  return null
}

const processThreshold = async (parameterName, value, thresholds, commands, alertPayload, commandTopic) => {
  const check = checkThreshold(value, thresholds)
  if (!check) return

  const message = check.status === 'HIGH'
    ? `${parameterName} vượt ngưỡng ${check.threshold}, giá trị hiện tại: ${value}`
    : `${parameterName} thấp hơn ngưỡng ${check.threshold}, giá trị hiện tại: ${value}`

  const finalPayload = {
    ...alertPayload,
    parameterName,
    triggeredValue: value,
    message
  }

  const command = check.status === 'HIGH' ? commands.high : commands.low

  try {
    await Promise.all([ // Chạy song song
      historyService.createNew(finalPayload),
      PUBLISH_MQTT(commandTopic, JSON.stringify({ command }))
    ])
  } catch (error) {
    console.error(`Failed to process ${parameterName} alert:`, error)
  }
}

const checkAndCreateAlerts = (sensor, data) => {
  const thresholds = sensor.thresholds || {}
  const { co2, humidity, airTemperature, soilMoisture, soilTemperature, lightIntensity } = thresholds

  const alertPayload = {
    user: sensor.user,
    sensor: sensor._id,
    sensorName: sensor.name
  }

  const commandTopic = `smartfarm/${sensor.deviceId}/cmd`

  processThreshold('CO2', data.co2, co2, { high: 'FAN_ON', low: 'FAN_OFF' }, alertPayload, commandTopic)
  processThreshold('Nhiệt độ', data.airTemperature, airTemperature, { high: 'COOLER_ON', low: 'COOLER_OFF' }, alertPayload, commandTopic)
}

export const sensorService = {
  registerDevice,
  getMySensors,
  getSensorData,
  saveMqttData,
  checkAndCreateAlerts
}