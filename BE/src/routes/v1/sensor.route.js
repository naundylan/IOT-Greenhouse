import express from 'express'
import { sensorValidation } from '~/validations/sensor.validation'
import { sensorController } from '~/controllers/sensor.controller'
import { auth } from '~/middlewares/auth'

const Router = express.Router()

Router.route('/register')
  .post(auth.isAuthorized, sensorValidation.registerDevice, sensorController.registerDevice)

Router.route('/')
  .get(auth.isAuthorized, sensorController.getMySensors)

Router.route('/:deviceId/data')
  .get(
    auth.isAuthorized, sensorValidation.getSensorData, sensorController.getSensorData
  )
// Lấy lịch sử theo giờ
Router.route('/:deviceId/data/hourly')
  .get(
    auth.isAuthorized, sensorValidation.getHourlyData, sensorController.getHourlyData
  )
// xuất file excel
Router.route('/:deviceId/data/export')
  .get(
    auth.isAuthorized, sensorValidation.getHourlyData, sensorController.exportData
  )
//sensor dùng cho plant nào ?
Router.route('/:deviceId/assignPlant')
  .put(auth.isAuthorized, sensorController.assignPlant)

export const sensorRoute = Router