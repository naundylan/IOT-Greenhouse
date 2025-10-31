/* eslint-disable no-useless-catch */
import { sensorModel } from '~/models/Sensor.model'
import { sensorDataModel } from '~/models/SensorData.model'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/User.model'
import { historyService } from '~/services/history.service'
import { PUBLISH_MQTT } from '~/config/mqtt'
import { BrevoProvider } from '~/providers/Brevo.provider'
import { emitToUser } from '~/sockets/socket'

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

    emitToUser(String(sensor.user), 'BE_DATA', {
      type: 'DATA',
      sensorId: String(sensor._id),
      sensorName: sensor.name,
      deviceId,
      data: validateData,
      ts: newData.ts
    })

    // 👉 SAU ĐÓ mới kiểm ngưỡng (nếu cần)
    await checkAndCreateAlerts(sensor, validateData)
  
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

  const user = await userModel.findOneById(alertPayload.user)

  const customSubject = `[CẢNH BÁO] ${alertPayload.sensorName} - ${parameterName} bất thường!`
  const htmlContent = `
    <h3>Cảnh báo hệ thống Smart Farm:</h3>
    <p>Cảm biến <strong>${alertPayload.sensorName}</strong> của bạn vừa ghi nhận một thông số bất thường:</p>
    <p style="font-size: 16px; color: red;"><strong>${message}</strong></p>
    <p>Hệ thống đã tự động gửi lệnh <strong>${command}</strong> để xử lý.</p>
    <br/>
    <p>Vui lòng kiểm tra hệ thống.</p>
  `
  try {
    await Promise.all([ // Chạy song song
      historyService.createNew(finalPayload),
      PUBLISH_MQTT(commandTopic, JSON.stringify({ command })),

      user && user.email
        ? BrevoProvider.sendEMail(user.email, customSubject, htmlContent)
        : Promise.resolve(),

      emitToUser(alertPayload.user, 'BE_ALERT', {
        type: 'ALERT',
        sensorId: alertPayload.sensor,
        parameterName,
        triggeredValue: value,
        message,
        timestamp: new Date()
      })
    ])
  } catch (error) {
    console.error(`Failed to process ${parameterName} alert:`, error)
  }
}

const checkAndCreateAlerts = (sensor, data) => {
  const thresholds = sensor.thresholds || {}
  const { light, co2, airTemperature, soil_moisture, soil_temperature, air_temperature, air_humidity } = thresholds

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