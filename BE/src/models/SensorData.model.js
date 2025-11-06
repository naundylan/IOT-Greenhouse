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

const findDataBySensor = async (sensorId) => {
  try {
    const now = new Date()
    const vn = new Date(now .getTime() + 7 * 60 * 60 * 1000 )
    const today = vn.toISOString().slice(0, 10)

    const result = await GET_DB().collection(SENSOR_DATA_COLLECTION_NAME)
      .find({
        sensor: new ObjectId(sensorId),
        'time': {
          $gte: `${today}T00:00:00`,
          $lt : `${today}T23:59:59.999`
        }
      })
      .sort({ time:   1 }) // Mới nhất lên đầu
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

const getHourlyData = async (day, sensorId) => {
  try {
    const pipeline = [
      { $match: {
        sensor: new ObjectId(sensorId),
        time: { $regex: `^${day}` } } },
      { $addFields: { convertedTime: { $toDate: '$time' } } },
      { $group: {
        _id: {
          hour: { $hour: { date: '$convertedTime' } }
        },
        avg_light: { $avg: '$light' },
        avg_co2: { $avg: '$co2' },
        avg_soil_moisture: { $avg: '$soil_moisture' },
        avg_soil_temperature: { $avg: '$soil_temperature' },
        avg_air_temperature: { $avg: '$air_temperature' },
        avg_air_humidity: { $avg: '$air_humidity' }
      }
      },
      { $sort: { '_id.hour': 1 } },
      { $project: {
        _id: 0, // ẩn id
        time: { $concat: [{ $toString: '$_id.hour' }, ':00'] },

        light: { $round: ['$avg_light', 2] },
        co2: { $round: ['$avg_co2', 2] },
        soil_moisture: { $round: ['$avg_soil_moisture', 2] },
        soil_temperature: { $round: ['$avg_soil_temperature', 2] },
        air_temperature: { $round: ['$avg_air_temperature', 2] },
        air_humidity: { $round: ['$avg_air_humidity', 2] }
      } }
    ]
    const data = await GET_DB().collection(sensorDataModel.SENSOR_DATA_COLLECTION_NAME).aggregate(pipeline).toArray()
    return data
  } catch (error) { throw new Error(error)}
}

export const sensorDataModel = {
  SENSOR_DATA_COLLECTION_NAME,
  SENSOR_DATA_COLLECTION_SCHEMA,
  createNew,
  findDataBySensor,
  countDataBySensor,
  getHourlyData
}