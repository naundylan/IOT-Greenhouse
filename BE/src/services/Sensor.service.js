/* eslint-disable no-useless-catch */
import { sensorModel } from '~/models/Sensor.model'
import { sensorDataModel } from '~/models/SensorData.model'
import { plantModel } from '~/models/Plant.model'
import { presetModel } from '~/models/Preset.model'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/User.model'
import { historyService } from '~/services/history.service'
import { PUBLISH_MQTT } from '~/config/mqtt'
import { BrevoProvider } from '~/providers/Brevo.provider'
import { emitToUser } from '~/sockets/socket'


const registerDevice = async ( userId, reqBody ) => {
  try {
    const { deviceId, name } = reqBody
    const existSensor = await sensorModel.findOneByDeviceId(deviceId)
    if (existSensor) {
      throw new ApiError(StatusCodes.CONFLICT, 'Device ID already registered')
    }

    const newSensor = {
      user: userId,
      deviceId: deviceId,
      name: name
    }
    const createdSensor = await sensorModel.createNew(newSensor)
    const getNewSensor = await sensorModel.findOneById(createdSensor.insertedId)

    if (getNewSensor) {
      await userModel.pushSensorOrderIds(getNewSensor)
    }

    return getNewSensor
  } catch (error) { throw error }
}

const getMySensors = async ( userId ) => {
  try {
    const sensors = await sensorModel.findOneByUserId( userId )
    return sensors
  } catch (error) { throw error }
}

const getSensorData = async ( userId, deviceId, { page, limit } ) => {
  try {
    const sensor = await sensorModel.findOneUserAndDeviceId(userId, deviceId)
    if (!sensor) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'SENSOR NOT FOUND')
    }

    const skip = (page - 1) * limit

    const data = await sensorDataModel.findDataBySensor(sensor._id, skip, limit)
    const total = await sensorDataModel.countDataBySensor(sensor._id)

    return {
      sensorInfo: sensor,
      data,
      pagination: {
        totalItems: total,
        currentPage: page,
        itemsPerPage: limit,
        totalPages: Math.ceil(total/limit)
      }
    }
  } catch (error) { throw error }
}

const assignPlant = async (sensorId, plantId) => {
  try {
    const plant = await plantModel.findOneById(plantId)
    if (!plant) throw new ApiError(StatusCodes.NOT_FOUND, 'Plant not found')

    const presetId = plant.presetOrderIds[0]

    if (!presetId) {
      return await sensorModel.update(sensorId, { plantId: plantId, thresholds: {} })
    }

    const preset = await presetModel.findOneById(presetId)
    if (!preset) throw new ApiError(StatusCodes.NOT_FOUND, 'Preset not found for this plant')

    const thresholdsToCopy = {
      co2: preset.co2,
      humidity: preset.humidity,
      airTemperature: preset.airTemperature,
      soilMoisture: preset.soilMoisture,
      soilTemperature: preset.soilTemperature,
      light: preset.light
    }

    const updatedSensor = await sensorModel.update(sensorId, {
      plantId: plantId,
      thresholds: thresholdsToCopy
    })

    return updatedSensor
  } catch (error) { throw error }
}

//service cho mqtt
const saveMqttData = async (deviceId, validateData) => {
  try {
    const sensor = await sensorModel.findOneByDeviceId(deviceId)

    if (!sensor) return // warm

    const newData = {
      sensor: sensor._id.toString(),
      ...validateData
    }
    await sensorDataModel.createNew(newData)

    emitToUser(String(sensor.user), 'BE_DATA', {
      type: 'DATA',
      sensorId: String(sensor._id),
      sensorName: sensor.name,
      deviceId,
      data: validateData,
      ts: newData.ts
    })

    await checkAndCreateAlerts(sensor, validateData)

  } catch (error) { console.log(error.message) }
}

const checkThreshold = (value, threshold) => {
  if (!threshold) return null

  const { min, max } = threshold
  if (max && value > max) return { status: 'HIGH', threshold: max }
  if (min && value < min) return { status: 'LOW', threshold: min }
  return null
}

const processThreshold = async (parameterName, value, thresholds, commands, alertPayload, commandTopic) => {
  console.log(`\n[DEBUG-1] Đang check: ${parameterName} (Giá trị: ${value})`)
  const check = checkThreshold(value, thresholds)
  console.log('[DEBUG-2] Kết quả check:', check)
  if (!check) {
    const offstate = commands.off
    if (offstate)
      PUBLISH_MQTT(commandTopic, JSON.stringify({ command: offstate }))
    return}
  console.log('[DEBUG-3] VI PHẠM! Đang tạo alert và gửi mail...')
  const message = check.status === 'HIGH'
    ? `${parameterName} vượt ngưỡng ${check.threshold}, giá trị hiện tại: ${value}`
    : `${parameterName} thấp hơn ngưỡng ${check.threshold}, giá trị hiện tại: ${value}`

  const finalPayload = {
    ...alertPayload,
    parameterName,
    triggeredValue: value,
    message
  }

  const command = check.status === 'HIGH' ? commands.high : commands.low

  const user = await userModel.findOneById(alertPayload.userId)

  const customSubject = `[CẢNH BÁO] ${alertPayload.sensorName} - ${parameterName} bất thường!`
  const htmlContent = `
    <h3>Cảnh báo hệ thống Smart Farm:</h3>
    <p>Cảm biến <strong>${alertPayload.sensorName}</strong> của bạn vừa ghi nhận một thông số bất thường:</p>
    <p style="font-size: 16px; color: red;"><strong>${message}</strong></p>
    <p>Hệ thống đã tự động gửi lệnh <strong>${command}</strong> để xử lý.</p>
    <br/>
    <p>Vui lòng kiểm tra hệ thống.</p>
  `
  try {
    const emailTask = (async () => {
      if (user && user.email) {
        try {
          await BrevoProvider.sendEMail(user.email, customSubject, htmlContent);
          // 1. LOG KHI GỬI THÀNH CÔNG
          console.log(`[ALERT] Đã gửi email cảnh báo ${parameterName} tới ${user.email} (Sensor: ${alertPayload.sensorName})`);
        } catch (emailError) {
          // 2. LOG KHI GẶP LỖI
          console.error(`[ALERT] Lỗi khi gửi email tới ${user.email}:`, emailError.message);
        }
      } else {
        // 3. LOG NẾU USER KHÔNG CÓ EMAIL
        console.warn(`[ALERT] Bỏ qua gửi email: Không tìm thấy email cho user ${alertPayload.userId}`);
      }
    })()
    await Promise.all([ // Chạy song song
      historyService.createNew(finalPayload),
      PUBLISH_MQTT(commandTopic, JSON.stringify({ command })),

      emailTask,

      emitToUser(alertPayload.userId, 'BE_ALERT', {
        type: 'ALERT',
        sensorId: alertPayload.sensorId,
        parameterName,
        triggeredValue: value,
        message,
        timestamp: new Date()
      })
    ])
  } catch (error) {
    console.error(`Failed to process ${parameterName} alert:`, error)
  }
}

const checkAndCreateAlerts = (sensor, data) => {
  const thresholds = sensor.thresholds || {}
  const {
    light,
    co2,
    soilMoisture,
    soilTemperature,
    airTemperature,
    humidity
  } = thresholds

  const alertPayload = {
    userId: String(sensor.user),
    sensorId: String(sensor._id),
    sensorName: sensor.name
  }

  const commandTopic = `smartfarm/${sensor.deviceId}/commands`

  processThreshold('CO2', data.co2, co2, { high: 'FAN_ON', low: 'FAN_OFF', off: 'FAN_OFF' }, alertPayload, commandTopic)
  processThreshold('Nhiệt độ', data.air_temperature, airTemperature, { high: 'COOLER_ON', low: 'COOLER_OFF', off: 'COOLER_OFF' }, alertPayload, commandTopic)
  processThreshold('Độ ẩm KK', data.air_humidity, humidity, { high: 'DRYER_ON', low: 'DRYER_OFF', off: 'DRYER_OFF' }, alertPayload, commandTopic)
  processThreshold('Độ ẩm đất', data.soil_moisture, soilMoisture, { high: 'PUMP_OFF', low: 'PUMP_ON', off: 'PUMP_OFF' }, alertPayload, commandTopic)
  processThreshold('Nhiệt độ đất', data.soil_temperature, soilTemperature, { high: 'SOIL_ON', low: 'SOIL_OFF', off: 'SOIL_OFF' }, alertPayload, commandTopic)
  processThreshold('Ánh sáng', data.light, light, { high: 'LAMP_ON', low: 'LAMP_OFF', off: 'LAMP_OFF' }, alertPayload, commandTopic)
}

export const sensorService = {
  registerDevice,
  getMySensors,
  getSensorData,
  saveMqttData,
  checkAndCreateAlerts,
  assignPlant
}