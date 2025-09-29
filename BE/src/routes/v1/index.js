import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { userRoute } from '~/routes/v1/user.route'

const Router = express.Router()

Router.get('/_healthcheck', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'API are ready use' })
})

/** User API */
Router.use('/users', userRoute)

export const APIs_V1 = Router