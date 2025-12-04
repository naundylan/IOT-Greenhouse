/* eslint-disable no-useless-catch */
import { historyModel } from '~/models/History.model'

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
    if (data.length === 0) return []
    return data
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