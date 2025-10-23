import Joi from 'joi'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { DEVICE_ID, DEVICE_NAME } from '~/utils/validator'

const registerDevice = async (req, res, next) => {
  const correctCondition = Joi.object({
    deviceId: Joi.string().required().trim().message(DEVICE_ID),
    name: Joi.string().required().trim().message(DEVICE_NAME)
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

//validate cho api :id/sensor-data và cơ chế phân trang
const getSensorData = async (req, res, next) => {
  const paramSchema = Joi.object({
    deviceId: Joi.string().required().trim().message(DEVICE_ID)
  })
  const querySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  })

  try {
    await paramSchema.validateAsync(req.params, { abortEarly: false })
    req.query = await querySchema.validateAsync(req.query, { abortEarly: false })

    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const mqttSchemaData = Joi.object({
  time: Joi.string().isoDate().required(),
  light: Joi.number().optional().allow(null),
  co2: Joi.number().optional().allow(null),
  soil_moisture: Joi.number().optional().allow(null),
  soil_temperature: Joi.number().optional().allow(null)
}).strict()

const validateMqttSensorData = (payload) => {
  const { error, value } = mqttSchemaData.validate(payload, { abortEarly: false })
  if (error) {
    return null
  }
  return value
}

export const sensorValidation = {
  registerDevice,
  getSensorData,
  validateMqttSensorData
}