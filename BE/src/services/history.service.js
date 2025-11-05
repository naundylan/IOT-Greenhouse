/* eslint-disable no-useless-catch */
import { historyModel } from '~/models/History.model'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'


const createNew = async (payload) => {
  try {
    const result = await historyModel.createNew(payload)
    return result
  } catch (error) {
    throw error
  }
}

const getDetails = async (userId ) => {
  try {
    const data = await historyModel.getDetails(userId)
    if (!data || data.length === 0)
      return {}

    const groupedByDate = data.reduce((acc, item) => {
      const dateObj = new Date(item.createdAt)

      const dateKey = dateObj.toLocaleDateString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        day: '2-digit', month: '2-digit', year: 'numeric'
      })

      const timeKey = dateObj.toLocaleTimeString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        hour: '2-digit', minute: '2-digit'
      })

      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].push({
        _id: item._id,
        time: timeKey,
        sensorName: item.sensorName,
        message: item.message,
        parameterName: item.parameterName,
        triggeredValue: item.triggeredValue
      })

      return acc
    }, {})

    return groupedByDate
  } catch (error) {
    throw error
  }
}


const deleteAlert = async (plantId) => {
  try {
    //Xóa plant
    await historyModel.deleteOneById(plantId)
    return { deleteResult: 'History deleted successfully' }
  } catch (error) {
    throw error
  }
}


export const historyService = {
  createNew,
  getDetails,
  deleteAlert
}