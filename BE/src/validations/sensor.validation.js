import Joi from 'joi'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { DATE_RULE_MESSAGE, DAY_RULE, DEVICE_ID, DEVICE_NAME } from '~/utils/validator'

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

//validate cho api :id/sensor-data
const getSensorData = async (req, res, next) => {
  const paramSchema = Joi.object({
    deviceId: Joi.string().required().trim().message(DEVICE_ID)
  })
  try {
    await paramSchema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const getHourlyData = async (req, res, next) => {
  const correctCondition = Joi.object({
    deviceId: Joi.string().required().trim(),
    day: Joi.string().required().pattern(DAY_RULE).message(DATE_RULE_MESSAGE)
  })
  try {
    await correctCondition.validateAsync({ ...req.params, ...req.query })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

//phần này cho data
const mqttSchemaData = Joi.object({
  time: Joi.string().required(),
  light: Joi.number().optional().allow(null),
  co2: Joi.number().optional().allow(null),
  soil_moisture: Joi.number().optional().allow(null),
  soil_temperature: Joi.number().optional().allow(null),
  air_temperature: Joi.number().optional().allow(null),
  air_humidity: Joi.number().optional().allow(null)
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
  validateMqttSensorData,
  getHourlyData
}