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

/**
 * @swagger
 * /sensors/register:
 *  post:
 *    summary: Register sensor device
 *    tags: [Sensor]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              deviceId: { type: string, example: "nhakinh01" }
 *              name: { type: string, example: "abc" }
 *    responses:
 *     201:
 *      description: Create success
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 *         properties:
 *          _id: { type: string, example: "60f7c0c2b4d1c826d8f0e6b7" }
 *          user: { type: string, example: "60f7c0a9b4d1c826d8f0e6b6" }
 *          deviceId: { type: string, example: "nhakinh01" }
 *          name: { type: string, example: "abc" }
 *          plantId: { type: string, nullable: true, example: null }
 *          thresholds:
 *           type: object
 *           example: {}
 *          createdAt:
 *           type: number
 *           format: int64
 *           example: 1626867205123
 *          updatedAt:
 *           type: number
 *           format: int64
 *           example: null
 *          _destroy: { type: boolean, example: false }
 *     422:
 *      description: Validation error
 *      content:
 *       application/json:
 *        schema:
 *         properties: {}
 *
 * /sensors/:
 *  get:
 *    summary: Get my sensors
 *    tags: [Sensor]
 *    responses:
 *     200:
 *      description: OK
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 *         properties:
 *          _id: { type: string, example: "60f7c0c2b4d1c826d8f0e6b7" }
 *          user: { type: string, example: "60f7c0a9b4d1c826d8f0e6b6" }
 *          deviceId: { type: string, example: "nhakinh01" }
 *          name: { type: string, example: "abc" }
 *          plantId: { type: string, nullable: true, example: null }
 *          thresholds:
 *           type: object
 *           example:
 *            co2:
 *             min: 300
 *             max: 800
 *            humidity:
 *             min: 40
 *             max: 70
 *            airTemperature:
 *             min: 40
 *             max: 70
 *            soilMoisture:
 *             min: 40
 *             max: 70
 *            soilTemperature:
 *             min: 40
 *             max: 70
 *            light:
 *             min: 40
 *             max: 70
 *          createdAt:
 *           type: number
 *           format: int64
 *           example: 1626867205123
 *          updatedAt:
 *           type: number
 *           format: int64
 *           example: null
 *          _destroy: { type: boolean, example: false }
 *
 * /sensors/{deviceId}/data/:
 *  get:
 *    summary: Get sensor data by current date
 *    tags: [Sensor]
 *    parameters:
 *     - in: path
 *       name: deviceId
 *       required: true
 *       schema:
 *        type: string
 *        example: nhakinh01
 *    responses:
 *     200:
 *      description: OK
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 *         properties:
 *          _id: { type: string, example: "60f7c0c2b4d1c826d8f0e6b7" }
 *          sensor: { type: string, example: "60f7c0a9b4d1c826d8f0e6b6" }
 *          time: { type: string, example: "2025-11-02T21:55:28" }
 *          co2: { type: number, example: 500 }
 *          humidity: { type: number, example: 500 }
 *          airTemperature: { type: number, example: 500 }
 *          soilMoisture: { type: number, example: 500 }
 *          soilTemperature: { type: number, example: 500 }
 *          light: { type: number, example: 500 }
 *          serverReceivedAt:
 *           type: string
 *           example: 1626867205123
 *          createdAt:
 *           type: string
 *           example: null
 *     422:
 *      description: Validation error
 *      content:
 *       application/json:
 *        schema:
 *        properties: {}
 *
 * /sensors/{deviceId}/data/hourly:
 *  get:
 *    summary: Get hourly sensor data by day
 *    tags: [History]
 *    parameters:
 *     - in: path
 *       name: deviceId
 *       required: true
 *       schema:
 *        type: string
 *        example: nhakinh01
 *     - in: query
 *       name: day
 *       required: true
 *       schema:
 *       type: string
 *       example: 2023-11-01
 *    responses:
 *     200:
 *       description: OK
 *       content:
 *        application/json:
 *         schema:
 *          type: array
 *          items:
 *           type: object
 *           properties:
 *            time:
 *             type: string
 *             example: "21:00"
 *            light:
 *             type: number
 *             example: 33.24
 *            co2:
 *             type: number
 *             example: 660.43
 *            soil_moisture:
 *             type: number
 *             example: 44.92
 *            soil_temperature:
 *             type: number
 *             example: 26.81
 *            air_temperature:
 *             type: number
 *             example: 27.08
 *            air_humidity:
 *             type: number
 *             example: 91.91
 *     422:
 *      description: Validation error
 *      content:
 *       application/json:
 *        schema:
 *        properties: {}
 *
 * /sensors/{deviceId}/data/export:
 *  get:
 *    summary: Export data to excel file
 *    tags: [History]
 *    parameters:
 *     - in: path
 *       name: deviceId
 *       required: true
 *       schema:
 *        type: string
 *        example: nhakinh01
 *     - in: query
 *       name: day
 *       required: true
 *       schema:
 *       type: string
 *       example: 2023-11-01
 *    responses:
 *     200:
 *       description: OK
 *       content:
 *        application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *         schema:
 *          type: string
 *          example: attachments
 *     422:
 *      description: Validation error
 *      content:
 *       application/json:
 *        schema:
 *        properties: {}
 *
 * /sensors/{deviceId}/assignPlant:
 *  put:
 *    summary: Sensors used for plants
 *    tags: [Sensor]
 *    parameters:
 *     - in: path
 *       name: deviceId
 *       required: true
 *       schema:
 *        type: string
 *        example: nhakinh01
 *    requestBody:
 *     required: true
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        properties:
 *         plantId: { type: string, example: "60f7c0a9b4d1c826d8f0e6b6" }
 *    responses:
 *     200:
 *      description: OK
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 *         properties:
 *          _id: { type: string, example: "60f7c0c2b4d1c826d8f0e6b7" }
 *          user: { type: string, example: "60f7c0a9b4d1c826d8f0e6b6" }
 *          deviceId: { type: string, example: "nhakinh01" }
 *          name: { type: string, example: "abc" }
 *          plantId: { type: string, nullable: true, example: null }
 *          thresholds:
 *           type: object
 *           example:
 *            co2:
 *             min: 300
 *             max: 800
 *            humidity:
 *             min: 40
 *             max: 70
 *            airTemperature:
 *             min: 40
 *             max: 70
 *            soilMoisture:
 *             min: 40
 *             max: 70
 *            soilTemperature:
 *             min: 40
 *             max: 70
 *            light:
 *             min: 40
 *             max: 70
 *          createdAt:
 *           type: number
 *           format: int64
 *           example: 1626867205123
 *          updatedAt:
 *           type: number
 *           format: int64
 *           example: null
 *          _destroy: { type: boolean, example: false }
 *     422:
 *      description: Validation error
 *      content:
 *       application/json:
 *        schema:
 *          properties: {}
 */