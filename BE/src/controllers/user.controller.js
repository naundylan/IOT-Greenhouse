import { StatusCodes } from 'http-status-codes'
import { userService } from '~/services/user.service'
import ms from 'ms'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {
  try {
    const createUser = await userService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createUser)
  } catch (error) { next(error) }
}

const verifyAccount = async ( req, res, next) => {
  try {
    const result = await userService.verifyAccount(req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const login = async ( req, res, next) => {
  try {
    const result = await userService.login(req.body)
    //Thời gian sống cokkie khác token kiểu thời gian sống web
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSize: 'none',
      maxAge: ms('7 days')
    })
    res.cookie('refreshToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSize: 'none',
      maxAge: ms('7 days')
    })

    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const logout = async (req, res, next) => {
  try {
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')

    res.status(StatusCodes.OK).json({ loggedOut: true })
  } catch (error) { next(error) }
}

const refreshToken = async (req, res, next) => {
  try {
    const result = await userService.refreshToken(req.cookie?.refreshToken)
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSize: 'none',
      maxAge: ms('14 days')
    })
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(new ApiError(StatusCodes.FORBIDDEN, 'PLEASE SIGN IN!'))
  }
}

export const userController = {
  createNew,
  verifyAccount,
  login,
  logout,
  refreshToken
}