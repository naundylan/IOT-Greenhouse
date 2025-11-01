import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'

const SENSOR_DATA_COLLECTION_NAME = 'sensor_data'
const SENSOR_DATA_COLLECTION_SCHEMA = Joi.object({
  sensor: Joi.string().required(),
  time: Joi.string().required(),
  light: Joi.number().allow(null).default(null),
  co2: Joi.number().allow(null).default(null),
  soil_moisture: Joi.number().allow(null).default(null),
  soil_temperature: Joi.number().allow(null).default(null),
  air_temperature: Joi.number().allow(null).default(null),
  air_humidity: Joi.number().allow(null).default(null),

  serverReceivedAt: Joi.date().timestamp('javascript').default(Date.now),
  createdAt: Joi.date().timestamp('javascript').default(Date.now)
})

const validateBeforeCreate = async (data) => {
  return await SENSOR_DATA_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    // Chuyển sensorId (string) từ service thành ObjectId
    const dataTranfer = {
      ...validData,
      sensor: new ObjectId(validData.sensor)
    }
    const createData = await GET_DB().collection(SENSOR_DATA_COLLECTION_NAME).insertOne(dataTranfer)
    return createData
  } catch (error) { throw new Error(error) }
}

const findDataBySensor = async (sensorId, skip = 0, limit = 20) => {
  try {
    const result = await GET_DB().collection(SENSOR_DATA_COLLECTION_NAME)
      .find({ sensor: new ObjectId(sensorId) })
      .sort({ time: -1 }) // Mới nhất lên đầu
      .skip(skip)
      .limit(limit)
      .toArray()
    return result
  } catch (error) { throw new Error(error) }
}

const countDataBySensor = async (sensorId) => {
  try {
    const result = await GET_DB().collection(SENSOR_DATA_COLLECTION_NAME)
      .countDocuments({ sensor: new ObjectId(sensorId) })
    return result
  } catch (error) { throw new Error(error) }
}

export const sensorDataModel = {
  SENSOR_DATA_COLLECTION_NAME,
  SENSOR_DATA_COLLECTION_SCHEMA,
  createNew,
  findDataBySensor,
  countDataBySensor
}