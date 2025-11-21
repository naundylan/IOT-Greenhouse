import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { Logger } from '~/config/logger'

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

const startHourlyDataJob = async () => {
  try {
    const now = new Date()
    const lastHour = new Date(now)
    lastHour.setHours(now.getHours() - 1)

    const timePrefix = lastHour.toISOString().slice(0, 13) // Lấy đến giờ

    Logger.info(`[CRON] chạy data cho khung giờ: ${timePrefix}`)

    const pipeline = [
      { $match: {
        time: { $regex: `^${timePrefix}` } } },
      { $group: {
        _id: {
          sensor: '$sensor',
          timeKey: { $substr: ['$time', 0, 13] }
        },
        avg_light: { $avg: '$light' },
        avg_co2: { $avg: '$co2' },
        avg_soil_moisture: { $avg: '$soil_moisture' },
        avg_soil_temperature: { $avg: '$soil_temperature' },
        avg_air_temperature: { $avg: '$air_temperature' },
        avg_air_humidity: { $avg: '$air_humidity' }
      }
      },
      { $project: {
        _id: 0, // ẩn id
        sensorId: '$_id.sensor', // ID của Sensor
        timeKey: '$_id.timeKey',
        light: { $round: ['$avg_light', 2] },
        co2: { $round: ['$avg_co2', 2] },
        soil_moisture: { $round: ['$avg_soil_moisture', 2] },
        soil_temperature: { $round: ['$avg_soil_temperature', 2] },
        air_temperature: { $round: ['$avg_air_temperature', 2] },
        air_humidity: { $round: ['$avg_air_humidity', 2] },
        updateAt: Date.now()
      } },
      // Merge vào collection hourly_sensor_data
      {
        $merge: {
          into: 'hourly_sensor_data', // chuyển đến collection
          on: ['sensorId', 'timeKey'], // Khóa để so sánh
          whenMatched: 'replace', // Nếu đã có thì ghi đè lại
          whenNotMatched: 'insert' // chưa có thì thêm mới
        }
      }
    ]
    const result = await GET_DB().collection(SENSOR_DATA_COLLECTION_NAME).aggregate(pipeline).toArray()
    Logger.info(`[CRON] Đã hoàn thành data cho khung giờ: ${timePrefix}`)
    return result
  } catch (error) {
    Logger.error(`Lỗi khi chạy auto hourly data job: ${error.message}`)
  }
}
// Hàm tạo collecton nếu chưa tồn tại vì query theo sensorId, timeKey
const createIndex = async () => {
  try {
    const db = GET_DB()
    await db.collection('hourly_sensor_data').createIndex(
      { sensorId: 1, timeKey: 1 },
      { unique: true,
        background: true, // chạy ngầm
        name: 'idx_sensorid_timekey'
      }
    )
  } catch (error) {
    Logger.error(`Lỗi khi tạo index cho collection hourly_sensor_data: ${error.message}`)
  }
}


const getHourlyData = async (day, sensorId) => {
  try {
    const data = await GET_DB().collection('hourly_sensor_data')
      .find({
        sensorId: new ObjectId(sensorId),
        timeKey: { $regex: `^${day}` } // Lấy tất cả các bản ghi trong ngày
      })
      .sort({ timeKey: 1 })
      .toArray()
    return data.map(item => ({
      time: item.timeKey.slice(0, 13) + ':00',
      light: item.light,
      co2: item.co2,
      soil_moisture: item.soil_moisture,
      soil_temperature: item.soil_temperature,
      air_temperature: item.air_temperature,
      air_humidity: item.air_humidity
    }))
  } catch (error) { throw new Error(error)}
}

export const sensorDataModel = {
  SENSOR_DATA_COLLECTION_NAME,
  SENSOR_DATA_COLLECTION_SCHEMA,
  createNew,
  findDataBySensor,
  countDataBySensor,
  getHourlyData,
  startHourlyDataJob,
  createIndex
}