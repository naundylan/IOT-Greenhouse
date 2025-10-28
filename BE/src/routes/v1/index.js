import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { userRoute } from '~/routes/v1/user.route'
import { sensorRoute } from '~/routes/v1/sensor.route'
import { plantRouter } from './plant.route'
import { presetRouter } from './preset.route'
import { historyRouter } from './history.route'


const Router = express.Router()

Router.get('/_healthcheck', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'API are ready use' })
})

/** User API */
Router.use('/users', userRoute)

Router.use('/sensors', sensorRoute)

Router.use('/plants', plantRouter )

Router.use('/presets', presetRouter)

Router.use('/history', historyRouter)

export const APIs_V1 = Router