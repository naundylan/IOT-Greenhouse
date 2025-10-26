import Joi from 'joi'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validator'

const thresholdSchema = Joi.object({
  min: Joi.number().allow(null).default(null),
  max: Joi.number().allow(null).default(null).when('min', {
    is: Joi.number().required(),
    then: Joi.number().greater(Joi.ref('min')).allow(null)
  })
})


const createNew = async(req, res, next ) => {
  const correctCondition = Joi.object({
    plantId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    co2: thresholdSchema.required(),
    humidity: thresholdSchema.required(),
    airTemperature: thresholdSchema.required(),
    soilMoisture: thresholdSchema.required(),
    soilTemperature: thresholdSchema.required(),
    light: thresholdSchema.required()
  })
  try {
    await correctCondition.validateAsync(req.body)
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const update = async(req, res, next) => {
  const correctCondition = Joi.object({
    plantId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    co2: thresholdSchema,
    humidity: thresholdSchema,
    airTemperature: thresholdSchema,
    soilMoisture: thresholdSchema,
    soilTemperature: thresholdSchema,
    light: thresholdSchema
  })
  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false, allowUnknown: true })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

export const presetValidation = {
  createNew,
  update
}