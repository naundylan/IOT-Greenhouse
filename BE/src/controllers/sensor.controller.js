import { StatusCodes } from 'http-status-codes'
import { sensorService } from '~/services/sensor.service'

const registerDevice = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const createSensor = await sensorService.registerDevice( userId, req.body )
    res.status(StatusCodes.CREATED).json(createSensor)
  } catch (error) { next(error) }
}

const getMySensors = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const sensors = await sensorService.getMySensors( userId )
    res.status(StatusCodes.OK).json(sensors)
  } catch (error) { next(error) }
}

const getSensorData = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const { deviceId } = req.params
    const { page, limit } = req.query

    const sensorData = await sensorService.getSensorData( userId, deviceId, { page, limit } )
    res.status(StatusCodes.OK).json(sensorData)
  } catch (error) { next(error) }
}

export const sensorController = {
  registerDevice,
  getMySensors,
  getSensorData
}