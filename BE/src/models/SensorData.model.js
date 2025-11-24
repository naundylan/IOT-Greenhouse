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

const aggregateHourlyData = async (timePrefix) => {
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
  return await GET_DB().collection(SENSOR_DATA_COLLECTION_NAME).aggregate(pipeline).toArray()
}
// Hàm xử lý dữ liệu hourly nếu chạy server
const startHourlyDataJob = async () => {
  try {
    const baseTime = new Date()
    const lastHour = new Date(baseTime)
    lastHour.setHours(baseTime.getHours() - 1)

    const timePrefix = lastHour.toISOString().slice(0, 13) // Lấy đến giờ

    Logger.info(`[CRON] chạy data cho khung giờ: ${timePrefix}`)

    await aggregateHourlyData(timePrefix)
    Logger.info(`[CRON] Đã hoàn thành data cho khung giờ: ${timePrefix}`)
  } catch (error) {
    Logger.error(`Lỗi khi chạy auto hourly data job: ${error.message}`)
  }
}
// Hàm xử lý tất cả dữ liệu cũ chưa được aggregate (chạy khi server khởi động)
const processHistoricalData = async () => {
  try {
    Logger.info('[CRON] Bắt đầu xử lý dữ liệu lịch sử chưa aggregate...')

    // Lấy timeKey mới nhất đã được xử lý từ hourly_sensor_data
    const latestProcessed = await GET_DB().collection('hourly_sensor_data')
      .find()
      .sort({ timeKey: -1 })
      .limit(1)
      .toArray()

    let startTime
    // Check dữ liệu
    if (latestProcessed.length > 0) {
      // Nếu đã có dữ liệu, bắt đầu từ giờ tiếp theo
      const lastTimeKey = latestProcessed[0].timeKey
      startTime = new Date(lastTimeKey + ':00:00')
      startTime.setHours(startTime.getHours() + 1)
      Logger.info(`[CRON] Tiếp tục từ timeKey(thời gian): ${startTime.toISOString().slice(0, 13)}`)
    } else {
      // Nếu chưa có dữ liệu nào, lấy thời điểm cũ nhất từ sensor_data
      const oldestData = await GET_DB().collection(SENSOR_DATA_COLLECTION_NAME)
        .find()
        .sort({ time: 1 })
        .limit(1)
        .toArray()

      if (oldestData.length === 0) {
        Logger.info('[CRON] Không có dữ liệu sensor để xử lý')
        return
      }

      startTime = new Date(oldestData[0].time)
      startTime.setMinutes(0, 0, 0) // Làm tròn về đầu giờ
      Logger.info(`[CRON] Bắt đầu từ dữ liệu cũ nhất: ${startTime.toISOString().slice(0, 13)}`)
    }

    const now = new Date()
    const currentHour = new Date(now)
    currentHour.setMinutes(0, 0, 0)

    let processedCount = 0
    let currentTime = new Date(startTime)

    // Xử lý từng giờ cho đến giờ hiện tại
    while (currentTime < currentHour) {
      const timePrefix = currentTime.toISOString().slice(0, 13)

      await aggregateHourlyData(timePrefix)
      processedCount++

      // Tăng thêm 1 giờ
      currentTime.setHours(currentTime.getHours() + 1)
    }

    Logger.info(`[CRON] Đã xử lý ${processedCount} khung giờ dữ liệu lịch sử`)
  } catch (error) {
    Logger.error(`[CRON] Lỗi khi xử lý dữ liệu lịch sử: ${error.message}`)
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

    // Sau khi tạo index, xử lý dữ liệu lịch sử
    await processHistoricalData()
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
  createIndex,
  processHistoricalData
}