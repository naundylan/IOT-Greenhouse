/* eslint-disable no-useless-catch */
import { sensorModel } from '~/models/Sensor.model'
import { sensorDataModel } from '~/models/SensorData.model'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/User.model'

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

export const sensorService = {
  registerDevice,
  getMySensors,
  getSensorData,
  saveMqttData
}