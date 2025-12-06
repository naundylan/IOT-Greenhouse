/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'
import { plantModel } from '~/models/Plant.model'
import { presetModel } from '~/models/Preset.model'
import { userModel } from '~/models/User.model'
import ApiError from '~/utils/ApiError'

const createNew = async (reqBody) => {
  try {
    const newPlant = {
      ...reqBody
    }
    const createPlant = await plantModel.createNew(newPlant)
    const getNewPlant = await plantModel.findOneById(createPlant.insertedId)

    if (getNewPlant) {
      await userModel.pushPlantOrderIds(getNewPlant)
    }

    return getNewPlant
  } catch (error) {
    throw error
  }
}

const getDetails = async (plantId) => {
  try {
    const result = await plantModel.getDetails(plantId)
    if (!result)
      throw new ApiError(StatusCodes.NOT_FOUND, 'Plant not found')
    return result
  } catch (error) {
    throw error
  }
}

const getAll = async (userId) => {
  try {
    const result = await plantModel.getAll(userId)
    if (!result)
      throw new ApiError(StatusCodes.NOT_FOUND, 'Plant not found')
    return result
  } catch (error) {
    throw error
  }
}

const updatePlant = async (plantId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updateAt: Date.now()
    }
    const updatePlant = await plantModel.updatePlant(plantId, updateData)
    return updatePlant
  } catch (error) {
    throw error
  }
}

const deletePlant = async (plantId) => {
  try {
    //Xóa plant
    await plantModel.deleteOneById(plantId)
    //Xóa toàn bộ preset
    await presetModel.deleteManyByPlantId(plantId)
    return { deleteResult: 'Plant and preset deleted successfully' }
  } catch (error) {
    throw error
  }
}

export const plantService = {
  createNew,
  getDetails,
  getAll,
  updatePlant,
  deletePlant
}