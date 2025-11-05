import express from 'express'
import { plantValidation } from '~/validations/plant.validation'
import { plantController } from '~/controllers/plant.controller'
import { auth } from '~/middlewares/auth'

const Router = express.Router()

Router.route('/')
  .get(auth.isAuthorized, plantController.getAll)
  .post(auth.isAuthorized, plantValidation.createNew, plantController.createNew)

Router.route('/:id')
  .get(auth.isAuthorized, plantController.getDetails)
  .put(auth.isAuthorized, plantValidation.updatePlant, plantController.updatePlant)
  .delete(auth.isAuthorized, plantValidation.deletePlant, plantController.deletePlant)

export const plantRouter = Router

/**
 * @swagger
 * /plants/:
 *  post:
 *    summary: Create new plant
 *    tags: [Plant]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              userId: { type: string, example: "60f7c0c2b4d1c826d8f0e6b7" }
 *              plantName: { type: string, example: "Tomato" }
 *    responses:
 *      201:
 *        description: Create success
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                _id: { type: string, example: "60f7c0c2b4d1c826d8f0e6b7" }
 *                plantName: { type: string, example: "Tomato" }
 *                userId: { type: string, example: "60f7c0a9b4d1c826d8f0e6b6" }
 *                presetOrderIds: { type: array, example: [] }
 *                createdAt: { type: number, example: 1626867205555 }
 *                updatedAt: { type: number, example: null }
 *                _destroy: { type: boolean, example: false }
 *  get:
 *   summary: Get all plants
 *   tags: [Plant]
 *   responses:
 *    200:
 *      description: OK
 *      content:
 *       application/json:
 *        schema:
 *          type: object
 *          properties:
 *            _id: { type: string, example: "60f7c0c2b4d1c826d8f0e6b7" }
 *            plantName: { type: string, example: "Tomato" }
 *            userId: { type: string, example: "60f7c0a9b4d1c826d8f0e6b6" }
 *            presetOrderIds: { type: array, example: ["68fcfe7d9296513dc3bccdd0", "6905ee5739c5b9dd3d6ba04b"] }
 *            createdAt: { type: number, example: 1626867205555 }
 *            updatedAt: { type: number, example: null }
 *            _destroy: { type: boolean, example: false }
 * /plants/{id}:
 *   get:
 *     summary: Get plant details
 *     tags: [Plant]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "60f7c0c2b4d1c826d8f0e6b7"
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "60f7c0c2b4d1c826d8f0e6b7"
 *                 userId:
 *                   type: string
 *                   example: "60f7c0a9b4d1c826d8f0e6b6"
 *                 plantName:
 *                   type: string
 *                   example: "Tomato"
 *                 presetOrderIds:
 *                   type: string
 *                   example: "68fcfe7d9296513dc3bccdd0"
 *                 createdAt:
 *                   type: number
 *                   example: 1626867205555
 *                 updatedAt:
 *                   type: number
 *                   example: null
 *                 _destroy:
 *                   type: boolean
 *                   example: false
 *                 presets:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "68fcfe7d9296513dc3bccdd0"
 *                       plantId:
 *                         type: string
 *                         example: "60f7c0c2b4d1c826d8f0e6b7"
 *                       co2:
 *                         type: object
 *                         properties:
 *                           min: { type: number, example: 400 }
 *                           max: { type: number, example: 600 }
 *                       humidity:
 *                         type: object
 *                         properties:
 *                           min: { type: number, example: 400 }
 *                           max: { type: number, example: 600 }
 *                       airTemperature:
 *                         type: object
 *                         properties:
 *                           min: { type: number, example: 400 }
 *                           max: { type: number, example: 600 }
 *                       soilMoisture:
 *                         type: object
 *                         properties:
 *                           min: { type: number, example: 400 }
 *                           max: { type: number, example: 600 }
 *                       soilTemperature:
 *                         type: object
 *                         properties:
 *                           min: { type: number, example: 400 }
 *                           max: { type: number, example: 600 }
 *                       light:
 *                         type: object
 *                         properties:
 *                           min: { type: number, example: 400 }
 *                           max: { type: number, example: 600 }
 *                       createdAt:
 *                         type: number
 *                         example: 1626867205555
 *                       updatedAt:
 *                         type: number
 *                         example: null
 *                       _destroy:
 *                         type: boolean
 *                         example: false
 *   put:
 *     summary: Update plant information
 *     tags: [Plant]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the plant to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plantName:
 *                 type: string
 *                 example: "Updated Tomato"
 *               userId:
 *                 type: string
 *                 example: "60f7c0a9b4d1c826d8f0e6b6"
 *     responses:
 *       200:
 *         description: The updated plant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "60f7c0c2b4d1c826d8f0e6b7"
 *                 userId:
 *                   type: string
 *                   example: "60f7c0a9b4d1c826d8f0e6b6"
 *                 plantName:
 *                   type: string
 *                   example: "Updated Tomato"
 *                 presetOrderIds:
 *                   type: string
 *                   example: "68fcfe7d9296513dc3bccdd0"
 *                 createdAt:
 *                   type: number
 *                   example: 1626867205555
 *                 updateAt:
 *                   type: number
 *                   example: 1626868205555
 *                 _destroy:
 *                   type: boolean
 *                   example: false
 *       422:
 *         description: Validation error
 *   delete:
 *     summary: Delete plant by ID
 *     tags: [Plant]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the plant to delete
 *     responses:
 *       200:
 *         description: Plant and presets deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 deleteResult:
 *                   type: string
 *                   example: "Plant and preset deleted successfully"
 *       422:
 *         description: Validation error
 */