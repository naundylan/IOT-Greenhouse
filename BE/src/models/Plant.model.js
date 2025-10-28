import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validator'
import { presetModel } from '~/models/Preset.model'

const PLANT_COLLECTION_NAME = 'plants'
const PLANT_COLLECTION_SCHEMA = Joi.object({
  plantName: Joi.string().required().trim().strict(),
  userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  presetOrderIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updateAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data) => {
  return await PLANT_COLLECTION_SCHEMA.validateAsync(data)
}

const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']

const createNew = async(data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const createPlant = {
      ...validData,
      userId: new ObjectId(validData.userId)
    }
    return await GET_DB().collection(PLANT_COLLECTION_NAME).insertOne(createPlant)
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async(id) => {
  try {
    return await GET_DB().collection(PLANT_COLLECTION_NAME).findOne({
      _id: new ObjectId(id)
    })
  } catch (error) {
    throw new Error(error)
  }
}

const getDetails = async(id) => {
  try {
    const result = await GET_DB().collection(PLANT_COLLECTION_NAME).aggregate([
      { $match: { _id: new ObjectId(id), _destroy: false } },
      { $lookup: {
        from: presetModel.PRESET_COLLECTION_NAME,
        localField: '_id',
        foreignField: 'plantId',
        as: 'presets'
      } }
    ]).toArray()
    return result[0] || {}
  } catch (error) {
    throw new Error(error)
  }
}

const getAll = async() => {
  try {
    const result = await GET_DB().collection(PLANT_COLLECTION_NAME).find({ _destroy: false }).toArray()
    return result || {}
  } catch (error) {
    throw new Error(error)
  }
}

// Cập nhật giá trị của preset vào cuối mảng plant
const pushPresetOrderIds = async(preset) => {
  try {
    const result = await GET_DB().collection(PLANT_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(preset.plantId) },
      { $set: { presetOrderIds: new ObjectId(preset._id), updateAt: new Date().getTime() } }, // Ghi đè trường mới nếu dùng push thì không ghì đè được
      { returnDocument: 'after' } // trả về sau khi cập nhật
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const updatePlant = async(plantId, updateData) => {
  try {
    Object.keys(updateData).forEach(fieldName => {
      if ( INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData(fieldName)
      }
    })

    const result = await GET_DB().collection(PLANT_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(plantId) },
      { $set: updateData },
      { returnDocument: 'after' } // trả về sau khi cập nhật
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const deleteOneById = async(id) => {
  try {
    return await GET_DB().collection(PLANT_COLLECTION_NAME).deleteOne(
      { _id: new ObjectId(id) },
      { $set: { _destroy: true } }
    )
  } catch (error) {
    throw new Error(error)
  }
}

export const plantModel = {
  PLANT_COLLECTION_NAME,
  PLANT_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails,
  getAll,
  pushPresetOrderIds,
  updatePlant,
  deleteOneById
}