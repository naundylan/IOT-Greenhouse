import express from 'express'
import { historyValidation } from '~/validations/history.validation'
import { historyController } from '~/controllers/history.controller'
import { auth } from '~/middlewares/auth'

const Router = express.Router()

Router.route('/')
  .get(auth.isAuthorized, historyController.getDetails)

Router.route('/:id')
  .delete(auth.isAuthorized, historyValidation.deleteAlert, historyController.deleteAlert)

Router.route('')

export const historyRouter = Router

/**
 * @swagger
 * /history/:
 *  get:
 *    summary: Get history alert
 *    tags: [History Alert]
 *    responses:
 *     200:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              properties:
 *                id: { type: string, example: "690a28803a3226931912ec98" }
 *                time: { type: string, example: "14:35:21" }
 *                sensorName: { type: string, example: "Cảm biến vườn rau" }
 *                message: { type: string, example: "CO2 vượt ngưỡng 50, giá trị hiện tại: 403" }
 *                parameterName: { type: string, example: "CO2" }
 *                triggeredValue: { type: number, example: 403 }
 *     422:
 *      description: Validation error
 *      content:
 *       application/json:
 *        schema:
 *         properties: {}
 *
 * /history/{id}:
 *  delete:
 *    summary: Delete one line history alert
 *    tags: [History Alert]
 *    parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *        type: string
 *        example: "60f7c0c2b4d1c826d8f0e6b7"
 *    responses:
 *     200:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *               deleteResult: { type: string, example: "History deleted successfully" }
 *     422:
 *      description: Validation error
 *      content:
 *       application/json:
 *        schema:
 *         properties: {}
 */