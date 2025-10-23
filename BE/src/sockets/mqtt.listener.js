import { GET_MQTT, SUBSCRIBE_MQTT } from '~/config/mqtt'
import { sensorValidation } from '~/validations/sensor.validation'
import { sensorService } from '~/services/Sensor.service'

// Dấu '+' là wildcard cho deviceId
const DATA_TOPIC = 'smartfarm/+/data'

export const initializeMqttListener = async () => {
  try {
    const client = GET_MQTT()

    // Subscribe topic
    await SUBSCRIBE_MQTT(DATA_TOPIC)

    // Xử lý khi có message
    client.on('message', async (topic, payload) => {
      const payloadString = payload.toString()

      try {
        // Tách deviceId từ topic
        const topicParts = topic.split('/')
        if (topicParts.length !== 3 || topicParts[0] !== 'smartfarm' || topicParts[2] !== 'data') {
          console.warn(`[MQTT] Topic không hợp lệ: ${topic}`)
          return
        }
        const deviceId = topicParts[1]

        // Parse JSON
        let data
        try {
          data = JSON.parse(payloadString)
        } catch (jsonError) {
          console.error(`[MQTT] Lỗi parse JSON từ ${deviceId}: ${payloadString}`)
          return
        }

        //Validate data bằng Joi
        const validatedData = sensorValidation.validateMqttSensorData(data)
        if (!validatedData) {
          return
        }

        // Gọi service để lưu
        await sensorService.saveMqttData(deviceId, validatedData)

      } catch (error) {
        console.error(`[MQTT] Lỗi xử lý message ${topic}:`, error.message)
      }
    })

  } catch (error) {
    console.error('[MQTT] Không thể khởi tạo listener:', error)
  }
}