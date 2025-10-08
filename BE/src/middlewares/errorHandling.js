import { StatusCodes } from 'http-status-codes'
import { env } from '~/config/environment'

export const errorHandling = (err, req, res, next) => {
  if (!err.statusCode) err.statusCode = StatusCodes.INTERNAL_SERVER_ERROR

  const reponseError = {
    statusCode: err.statusCode,
    messeage: err.messeage || StatusCodes[err.statusCode],
    stack: err.stack
  }

  if (env.BUILD_MODE !== 'dev') delete reponseError.stack

  res.status(reponseError.statusCode).json(reponseError)
}