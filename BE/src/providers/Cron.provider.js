import cron from 'node-cron'
import { sensorDataModel } from '~/models/SensorData.model'
import { historyModel } from '~/models/History.model'

export const initCronJobs = () => {
  cron.schedule('5 * * * *', async () => {
    await sensorDataModel.startHourlyDataJob()
  }, {
    scheduled: true,
    timezone: 'Asia/Ho_Chi_Minh'
  })

  cron.schedule('0 0 * * *', async () => {
    await historyModel.deleteOldHistoryDataJob()
  }, {
    scheduled: true,
    timezone: 'Asia/Ho_Chi_Minh'
  })
}
