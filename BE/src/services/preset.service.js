/* eslint-disable no-useless-catch */
import { presetModel } from '~/models/Preset.model'
import { plantModel } from '~/models/Plant.model'

const createNew = async (reqBody) => {
  try {
    const newPreset = {
      ...reqBody
    }
    const createPreset = await presetModel.createNew(newPreset)
    const getNewPreset = await presetModel.findOneById(createPreset.insertedId)

    if (getNewPreset) {
      // Cập nhật mảng presetOrderIds trong plant
      await plantModel.pushPresetOrderIds(getNewPreset)
    }

    return getNewPreset
  } catch (error) {
    throw error
  }
}

const update = async (presetId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updateAt: Date.now()
    }
    const result = await presetModel.update(presetId, updateData)
    return result
  } catch (error) {
    throw error
  }
}

export const presetService = {
  createNew,
  update
}