import { StatusCodes } from 'http-status-codes'
import { presetService } from '~/services/preset.service'

const createNew = async(req, res, next) => {
  try {
    const createPlant = await presetService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createPlant)
  } catch (error) { next(error) }
}

const getDetails = async(req, res, next) => {
  try {
    const presetId = req.params.id
    const result = await presetService.getDetails(presetId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const update = async(req, res, next) => {
  try {
    const presetId = req.params.id
    const result = await presetService.update(presetId, req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const presetController = {
  createNew,
  getDetails,
  update
}