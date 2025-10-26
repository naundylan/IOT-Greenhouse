import { StatusCodes } from 'http-status-codes'
import { plantService } from '~/services/plant.service'

const createNew = async(req, res, next) => {
  try {
    const createPlant = await plantService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createPlant)
  } catch (error) { next(error) }
}

const getDetails = async(req, res, next) => {
  try {
    const plantId = req.params.id
    const result = await plantService.getDetails(plantId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const getAll = async(req, res, next) => {
  try {
    const result = await plantService.getAll()
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const updatePlant = async(req, res, next) => {
  try {
    const plantId = req.params.id
    const result = await plantService.updatePlant(plantId, req.body)

    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const deletePlant = async(req, res, next) => {
  try {
    const plantId = req.params.id
    const result = await plantService.deletePlant(plantId)

    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const plantController = {
  createNew,
  getDetails,
  getAll,
  updatePlant,
  deletePlant
}