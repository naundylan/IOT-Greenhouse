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
import ExcelJs from 'exceljs'


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

const getSensorData = async ( userId, deviceId ) => {
  try {
    const sensor = await sensorModel.findOneUserAndDeviceId(userId, deviceId)
    if (!sensor) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'SENSOR NOT FOUND')
    }

    const data = await sensorDataModel.findDataBySensor(sensor._id)

    return data
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
  const isAuto = alertPayload.mode === 'AUTO'
  console.log('[DEBUG-2] Kết quả check:', check)
  if (!check) {
    if ( isAuto && commands?.off) {
      await PUBLISH_MQTT(commandTopic, JSON.stringify({ command: commands.off }))
    }
    return}
  if ( !isAuto ) {
    try {
      await sensorModel.update(alertPayload.sensorId, { controlMode: 'AUTO' })
      alertPayload.mode = 'AUTO'
    } catch (error) {
      console.log('Failed to update sensor control mode:', error.message)
    }
  }
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
    (async () => {
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

      emitToUser(alertPayload.userId, 'BE_ALERT', {
        type: 'ALERT',
        sensorId: alertPayload.sensorId,
        parameterName,
        triggeredValue: value,
        message,
        timestamp: new Date(),
        mode: alertPayload.mode
      })
    ])
  } catch (error) {
    console.error(`Failed to process ${parameterName} alert:`, error)
  }
}

const checkAndCreateAlerts = async (sensor, data) => {
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
    sensorName: sensor.name,
    mode: sensor.controlMode
  }

  const commandTopic = `smartfarm/${sensor.deviceId}/commands`
  const tasks = [
    processThreshold('CO2', data.co2, co2, { high: 'FAN_ON', low: 'FAN_OFF', off: 'FAN_OFF' }, alertPayload, commandTopic),
    processThreshold('Nhiệt độ', data.air_temperature, airTemperature, { high: 'COOLER_ON', low: 'COOLER_OFF', off: 'COOLER_OFF' }, alertPayload, commandTopic),
    processThreshold('Độ ẩm KK', data.air_humidity, humidity, { high: 'DRYER_ON', low: 'DRYER_OFF', off: 'DRYER_OFF' }, alertPayload, commandTopic),
    processThreshold('Độ ẩm đất', data.soil_moisture, soilMoisture, { high: 'PUMP_OFF', low: 'PUMP_ON', off: 'PUMP_OFF' }, alertPayload, commandTopic),
    processThreshold('Nhiệt độ đất', data.soil_temperature, soilTemperature, { high: 'SOIL_ON', low: 'SOIL_OFF', off: 'SOIL_OFF' }, alertPayload, commandTopic),
    processThreshold('Ánh sáng', data.light, light, { high: 'LAMP_ON', low: 'LAMP_OFF', off: 'LAMP_OFF' }, alertPayload, commandTopic)
  ]
  await Promise.all(tasks)

}

//query lấy lịch sử theo giờ
const getHourlyData = async (day, sensorId ) => {
  try {
    const data = await sensorDataModel.getHourlyData(day, sensorId)
    return data
  } catch (error) {
    throw (error)
  }
}

const exportData = async (day, sensorId) => {
  try {
    const data = await sensorDataModel.getHourlyData(day, sensorId)

    const workbook = new ExcelJs.Workbook()
    workbook.creator = 'Smart Farm'
    workbook.created = new Date()
    const worksheet = workbook.addWorksheet(`Dữ liệu - ${day}`)

    worksheet.columns = [
      { header: 'Giờ', key: 'time', width: 15 },
      { header: 'Nhiệt độ KK TB (°C)', key: 'air_temperature', width: 20 },
      { header: 'Độ ẩm KK TB (%)', key: 'air_humidity', width: 20 },
      { header: 'CO2 TB (ppm)', key: 'co2', width: 15 },
      { header: 'Ánh sáng TB (lux)', key: 'light', width: 15 },
      { header: 'Nhiệt độ đất TB (°C)', key: 'soil_temperature', width: 20 },
      { header: 'Độ ẩm đất TB (%)', key: 'soil_moisture', width: 20 }
    ]
    // in đậm tiêu đề
    worksheet.getRow(1).font = { bold: true }
    // insert data
    worksheet.addRows(data)

    const buffer = await workbook.xlsx.writeBuffer()
    return buffer
  } catch (error) {
    throw (error)
  }
}

export const sensorService = {
  registerDevice,
  getMySensors,
  getSensorData,
  saveMqttData,
  checkAndCreateAlerts,
  assignPlant,
  getHourlyData,
  exportData
}