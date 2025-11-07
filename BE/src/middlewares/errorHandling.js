/* eslint-disable no-unused-vars */
import { StatusCodes } from 'http-status-codes'
import { env } from '~/config/environment'
import { Logger } from '~/config/logger'

export const errorHandling = (err, req, res, next) => {
  if (!err.statusCode) err.statusCode = StatusCodes.INTERNAL_SERVER_ERROR

  const reponseError = {
    statusCode: err.statusCode,
    message: err.message || StatusCodes[err.statusCode],
    stack: err.stack
  }

  if (env.BUILD_MODE !== 'dev') delete reponseError.stack

  Logger.error(reponseError.message, { stack: reponseError.stack })

  res.status(reponseError.statusCode).json(reponseError)
}