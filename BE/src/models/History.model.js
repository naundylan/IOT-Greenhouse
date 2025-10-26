import Joi from 'joi'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validator'

const HISTORY_COLLECTION_NAME = 'History'
const HISTORY_COLLECTION_SCHEMA = Joi.object({
  plantName: Joi.string().required().trim().strict(),
  presetOrderIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updateAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data) => {
  return await HISTORY_COLLECTION_SCHEMA.validateAsync(data)
}

const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']

export const historyModel = {
  HISTORY_COLLECTION_NAME,
  HISTORY_COLLECTION_SCHEMA,
  
}