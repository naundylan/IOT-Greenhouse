import express from 'express'
import { presetValidation } from '~/validations/preset.validation'
import { presetController } from '~/controllers/preset.controller'
import { auth } from '~/middlewares/auth'

const Router = express.Router()

Router.route('/')
  .post(auth.isAuthorized, presetValidation.createNew, presetController.createNew)
  .get(auth.isAuthorized, presetController.getAll)

Router.route('/:id')
  .put(auth.isAuthorized, presetValidation.update, presetController.update)

export const presetRouter = Router

/**
 * @swagger
 * /presets/:
 *  post:
 *    summary: Create new preset
 *    tags: [Preset]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              plantId:
 *                type: string
 *                example: "60f7c0c2b4d1c826d8f0e6b7"
 *              co2:
 *                type: object
 *                properties:
 *                  min: { type: number, example: 10 }
 *                  max: { type: number, example: 15 }
 *              humidity:
 *                type: object
 *                properties:
 *                  min: { type: number, example: 60 }
 *                  max: { type: number, example: 80 }
 *              airTemperature:
 *                type: object
 *                properties:
 *                  min: { type: number, example: 20 }
 *                  max: { type: number, example: 30 }
 *              soilMoisture:
 *                type: object
 *                properties:
 *                  min: { type: number, example: 30 }
 *                  max: { type: number, example: 50 }
 *              soilTemperature:
 *                type: object
 *                properties:
 *                  min: { type: number, example: 18 }
 *                  max: { type: number, example: 25 }
 *              light:
 *                type: object
 *                properties:
 *                  min: { type: number, example: 500 }
 *                  max: { type: number, example: 800 }
 *    responses:
 *     201:
 *        description: Create success
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                _id: { type: string, example: "60f7c0c2b4d1c826d8f0e6b7" }
 *                plantId:
 *                  type: string
 *                  example: "60f7c0c2b4d1c826d8f0e6b7"
 *                co2:
 *                  type: object
 *                  properties:
 *                    min: { type: number, example: 10 }
 *                    max: { type: number, example: 15 }
 *                humidity:
 *                  type: object
 *                  properties:
 *                    min: { type: number, example: 60 }
 *                    max: { type: number, example: 80 }
 *                airTemperature:
 *                  type: object
 *                  properties:
 *                    min: { type: number, example: 20 }
 *                    max: { type: number, example: 30 }
 *                soilMoisture:
 *                  type: object
 *                  properties:
 *                    min: { type: number, example: 30 }
 *                    max: { type: number, example: 50 }
 *                soilTemperature:
 *                  type: object
 *                  properties:
 *                    min: { type: number, example: 18 }
 *                    max: { type: number, example: 25 }
 *                light:
 *                  type: object
 *                  properties:
 *                    min: { type: number, example: 500 }
 *                    max: { type: number, example: 800 }
 *                createdAt:
 *                  type: number
 *                  format: int64
 *                  example: 1626867205123
 *                updatedAt:
 *                  type: number
 *                  format: int64
 *                  example: null
 *                _destroy: { type: boolean, example: false }
 *     422:
 *      description: Validation error
 *      content:
 *       application/json:
 *        schema:
 *         properties: {}
 *
 * /presets/{id}:
 *  put:
 *    summary: Update preset by id
 *    tags: [Preset]
 *    parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *        type: string
 *        example: "60f7c0c2b4d1c826d8f0e6b7"
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *         schema:
 *          type: object
 *          properties:
 *            plantId:
 *              type: string
 *              example: "60f7c0c2b4d1c826d8f0e6b7"
 *            co2:
 *              type: object
 *              properties:
 *                min: { type: number, example: 10 }
 *                max: { type: number, example: 15 }
 *            humidity:
 *              type: object
 *              properties:
 *                min: { type: number, example: 60 }
 *                max: { type: number, example: 80 }
 *            airTemperature:
 *              type: object
 *              properties:
 *                min: { type: number, example: 20 }
 *                max: { type: number, example: 30 }
 *            soilMoisture:
 *              type: object
 *              properties:
 *                min: { type: number, example: 30 }
 *                max: { type: number, example: 50 }
 *            soilTemperature:
 *              type: object
 *              properties:
 *                min: { type: number, example: 18 }
 *                max: { type: number, example: 25 }
 *            light:
 *              type: object
 *              properties:
 *                min: { type: number, example: 500 }
 *                max: { type: number, example: 800 }
 *    responses:
 *     200:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                _id: { type: string, example: "60f7c0c2b4d1c826d8f0e6b7" }
 *                plantId:
 *                  type: string
 *                  example: "60f7c0c2b4d1c826d8f0e6b7"
 *                co2:
 *                  type: object
 *                  properties:
 *                    min: { type: number, example: 10 }
 *                    max: { type: number, example: 15 }
 *                humidity:
 *                  type: object
 *                  properties:
 *                    min: { type: number, example: 60 }
 *                    max: { type: number, example: 80 }
 *                airTemperature:
 *                  type: object
 *                  properties:
 *                    min: { type: number, example: 20 }
 *                    max: { type: number, example: 30 }
 *                soilMoisture:
 *                  type: object
 *                  properties:
 *                    min: { type: number, example: 30 }
 *                    max: { type: number, example: 50 }
 *                soilTemperature:
 *                  type: object
 *                  properties:
 *                    min: { type: number, example: 18 }
 *                    max: { type: number, example: 25 }
 *                light:
 *                  type: object
 *                  properties:
 *                    min: { type: number, example: 500 }
 *                    max: { type: number, example: 800 }
 *                createdAt:
 *                  type: number
 *                  format: int64
 *                  example: 1626867205123
 *                updatedAt:
 *                  type: number
 *                  format: int64
 *                  example: 1626867205555
 *                _destroy: { type: boolean, example: false }
 *     422:
 *      description: Validation error
 *      content:
 *       application/json:
 *        schema:
 *         properties: {}
 */