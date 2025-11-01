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
//sensor dùng cho plant nào ?
Router.route('/:deviceId/assignPlant')
  .put(auth.isAuthorized, sensorController.assignPlant)

export const sensorRoute = Router