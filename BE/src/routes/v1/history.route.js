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