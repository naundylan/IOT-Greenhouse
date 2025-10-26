import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'

const SENSOR_COLLECTION_NAME = 'sensors'
const SENSOR_COLLECTION_SCHEMA = Joi.object({
  user: Joi.string().required(),
  deviceId: Joi.string().required().trim().strict(),
  name: Joi.string().required().trim().strict(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const SENSOR_INVALID_UPDATE_FIELDS = ['_id', 'user', 'deviceId', 'createdAt']

//Tìm kiếm nhanh hơn để tối ưu db
const validateBeforeCreate = async(data) => {
  return await SENSOR_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async(data) => {
  try {
    const validData = await validateBeforeCreate(data)
    // chuyển userId thành ObjectId
    const dataTranfer = {
      ...validData,
      user: new ObjectId(validData.user)
    }
    const createSensor = await GET_DB().collection(SENSOR_COLLECTION_NAME).insertOne(dataTranfer)
    return createSensor
  } catch (error) { throw new Error(error) }
}

const findOneById = async (userId) => {
  try {
    const result = await GET_DB().collection(SENSOR_COLLECTION_NAME).findOne({ _id: new ObjectId(userId) })
    return result
  } catch (error) { throw new Error(error) }
}


const findOneByDeviceId = async (deviceId) => {
  try {
    const result = await GET_DB().collection(SENSOR_COLLECTION_NAME).findOne({ deviceId: deviceId, _destroy: false })
    return result
  } catch (error) { throw new Error(error) }
}

const findOneByUserId = async(userId) => {
  try {
    const result = await GET_DB().collection(SENSOR_COLLECTION_NAME).find({ user: new ObjectId(userId), _destroy: false }).toArray()
    return result
  } catch (error) { throw new Error(error)}
}

const findOneUserAndDeviceId = async(userId, deviceId) => {
  try {
    const result = await GET_DB().collection(SENSOR_COLLECTION_NAME).findOne({ user: new ObjectId(userId), deviceId: deviceId, _destroy: false })
    return result
  } catch (error) { throw new Error(error) }
}

export const sensorModel = {
  SENSOR_COLLECTION_NAME,
  SENSOR_COLLECTION_SCHEMA,
  findOneById,
  createNew,
  findOneByDeviceId,
  findOneByUserId,
  findOneUserAndDeviceId
}