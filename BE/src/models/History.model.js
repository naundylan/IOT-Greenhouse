import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validator'

const HISTORY_COLLECTION_NAME = 'History'
const HISTORY_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  sensorId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  sensorName: Joi.string().trim(),
  parameterName: Joi.string().required().trim(),
  triggeredValue: Joi.number().required(),
  message: Joi.string().allow('').default(''),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  _destroy: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data) => {
  return await HISTORY_COLLECTION_SCHEMA.validateAsync(data)
}

const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']

const createNew = async(data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const createPlant = {
      ...validData,
      userId: new ObjectId(validData.userId),
      sensorId: new ObjectId(validData.sensorId),
    }
    return await GET_DB().collection(HISTORY_COLLECTION_NAME).insertOne(createPlant)
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async(id) => {
  try {
    return await GET_DB().collection(HISTORY_COLLECTION_NAME).findOne({
      _id: new ObjectId(id)
    })
  } catch (error) {
    throw new Error(error)
  }
}

const getDetails = async(userId, skip = 0, limit = 50) => {
  try {
    const result = await GET_DB().collection(HISTORY_COLLECTION_NAME)
      .find({
        user: new ObjectId(userId),
        _destroy: false
      })
      .sort({ createdAt: -1 }) // Mới nhất lên đầu
      .skip(skip)
      .limit(limit)
      .toArray()
    return result
  } catch (error) { throw new Error(error) }
}

const deleteOneById = async(id) => {
  try {
    return await GET_DB().collection(HISTORY_COLLECTION_NAME).updateOne(
      { _id: new ObjectId(id) },
      { $set: { _destroy: true } }
    )
  } catch (error) {
    throw new Error(error)
  }
}

export const historyModel = {
  HISTORY_COLLECTION_NAME,
  HISTORY_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails,
  deleteOneById
}