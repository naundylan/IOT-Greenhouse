import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validator'

const thresholdSchema = Joi.object({
  min: Joi.number().allow(null).default(null),
  max: Joi.number().allow(null).default(null).when('min', {
    is: Joi.number().required(),
    then: Joi.number().greater(Joi.ref('min')).allow(null)
  })
})

const PRESET_COLLECTION_NAME = 'presets'
const PRESET_COLLECTION_SCHEMA = Joi.object({
  plantId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  co2: thresholdSchema,
  humidity: thresholdSchema,
  airTemperature: thresholdSchema,
  soilMoisture: thresholdSchema,
  soilTemperature: thresholdSchema,
  light: thresholdSchema,

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updateAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await PRESET_COLLECTION_SCHEMA.validateAsync(data)
}

const createNew = async(data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const createPreset = {
      ...validData,
      plantId: new ObjectId(validData.plantId)
    }
    return await GET_DB().collection(PRESET_COLLECTION_NAME).insertOne(createPreset)
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async(id) => {
  try {
    return await GET_DB().collection(PRESET_COLLECTION_NAME).findOne({
      _id: new ObjectId(id)
    })
  } catch (error) {
    throw new Error(error)
  }
}

const deleteManyByPlantId = async(plantId) => {
  try {
    return await GET_DB().collection(PRESET_COLLECTION_NAME).deleteMany({
      plantId: new ObjectId(plantId)
    })
  } catch (error) {
    throw new Error(error)
  }
}

const update = async(presetId, updateData) => {
  try {
    Object.keys(updateData).forEach(fieldName => {
      if ( INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    const result = await GET_DB().collection(PRESET_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(presetId) },
      { $set: updateData },
      { returnDocument: 'after' } // trả về sau khi cập nhật
    )
    return result.value
  } catch (error) {
    throw new Error(error)
  }
}


export const presetModel = {
  PRESET_COLLECTION_NAME,
  PRESET_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  deleteManyByPlantId,
  update
}