import express from 'express'
import { presetValidation } from '~/validations/preset.validation'
import { presetController } from '~/controllers/preset.controller'
import { auth } from '~/middlewares/auth'

const Router = express.Router()

Router.route('/')
  .post(auth.isAuthorized, presetValidation.createNew, presetController.createNew)

Router.route('/:id')
  .put(auth.isAuthorized, presetValidation.update, presetController.update)

export const presetRouter = Router