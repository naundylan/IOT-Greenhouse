/* eslint-disable no-useless-catch */
import { presetModel } from '~/models/Preset.model'
import { sensorModel } from '~/models/Sensor.model'
import { plantModel } from '~/models/Plant.model'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const getThresholdsFromPreset = (preset) => {
  return {
    co2: preset.co2,
    humidity: preset.humidity,
    airTemperature: preset.airTemperature,
    soilMoisture: preset.soilMoisture,
    soilTemperature: preset.soilTemperature,
    light: preset.light
  }
}

const createNew = async (data) => {
  try {
    const createdPresetResult = await presetModel.createNew(data)

    const newPreset = await presetModel.findOneById(createdPresetResult.insertedId)
    if (!newPreset) {
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to create preset')
    }

    await plantModel.pushPresetOrderIds(newPreset)

    const thresholdsToCopy = getThresholdsFromPreset(newPreset)

    //  Tìm tất cả sensor dùng plantId này
    //    Và cập nhật (sao chép) thresholds mới cho chúng
    await sensorModel.updateManyByPlantId(
      newPreset.plantId,
      { thresholds: thresholdsToCopy }
    )

    return newPreset
  } catch (error) { throw error }
}

const update = async (presetId, updateData) => {
  try {
    const updatedPreset = await presetModel.update(presetId, updateData)

    if (!updatedPreset) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Preset not found')
    }

    const thresholdsToCopy = getThresholdsFromPreset(updatedPreset)

    //tương tự create
    await sensorModel.updateManyByPlantId(
      updatedPreset.plantId,
      { thresholds: thresholdsToCopy }
    )

    return updatedPreset
  } catch (error) { throw error }
}

export const presetService = {
  createNew,
  update
}