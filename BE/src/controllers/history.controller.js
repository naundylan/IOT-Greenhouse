import { StatusCodes } from 'http-status-codes'
import { historyService } from '~/services/history.service'

const getDetails = async(req, res, next) => {
  try {
    const historytId = req.params.id
    const result = await historyService.getDetails(historytId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const deleteAlert = async(req, res, next) => {
  try {
    const historytId = req.params.id
    const result = await historyService.deleteAlert(historytId)

    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const historyController = {
  getDetails,
  deleteAlert
}