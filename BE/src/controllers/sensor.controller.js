import { StatusCodes } from 'http-status-codes'
import { sensorService } from '~/services/sensor.service'
import ApiError from '~/utils/ApiError'
import { sensorModel } from '~/models/Sensor.model'

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

    const sensorData = await sensorService.getSensorData( userId, deviceId )
    res.status(StatusCodes.OK).json(sensorData)
  } catch (error) { next(error) }
}

const getHourlyData = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const { deviceId } = req.params
    const { day } = req.query

    const sensor = await sensorModel.findOneUserAndDeviceId(userId, deviceId)
    if (!sensor) throw new ApiError(StatusCodes.NOT_FOUND, 'SENSOR NOT FOUND')

    const data = await sensorService.getHourlyData(day, sensor._id)
    res.status(StatusCodes.OK).json(data)
  } catch (error) { next(error) }
}

const assignPlant = async (req, res, next) => {
  try {
    const { deviceId } = req.params
    const { plantId } = req.body
    const sensor = await sensorModel.findOneByDeviceId(deviceId)
    if (!sensor)
      throw new ApiError(StatusCodes.NOT_FOUND, 'Sensor not found')
    const updatedSensor = await sensorService.assignPlant(sensor._id, plantId)
    res.status(StatusCodes.OK).json(updatedSensor)
  } catch (error) {
    next(error)
  }
}

const exportData = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const { deviceId } = req.params
    const { day } = req.query
    const sensor = await sensorModel.findOneUserAndDeviceId(userId, deviceId)
    if (!sensor)
      throw new ApiError(StatusCodes.NOT_FOUND, 'Sensor not found')
    const buffer = await sensorService.exportData(day, sensor._id)

    const fileName = `Baocao_${deviceId}_${day}`
    //cấu hình file excel
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    //Cấu hình tải file về
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileName}"`
    )

    //Gửi file
    res.send(buffer)
  } catch (error) {
    next (error)
  }
}

export const sensorController = {
  registerDevice,
  getMySensors,
  getSensorData,
  assignPlant,
  getHourlyData,
  exportData
}