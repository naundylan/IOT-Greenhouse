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