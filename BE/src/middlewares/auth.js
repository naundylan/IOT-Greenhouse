import { StatusCodes } from 'http-status-codes'
import { JwtProvider } from '~/providers/Jwt.provider'
import { env } from '~/config/environment'
import ApiError from '~/utils/ApiError'

//Xác thực JWT accesstoken
const isAuthorized = async (req, res, next) => {
  //Lấy access token từ phía clinet
  const clinetAccessToken = req.cookies?.clinetAccessToken

  if (!clinetAccessToken) next(new ApiError(StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED! (TOKEN IS NOT FOUND)'))

  try {
    const accessTokenDecoded = await JwtProvider.verifyToken(clinetAccessToken, env.SECRET_KEY)

    req.jwtDecoded = accessTokenDecoded

    next()
  } catch (error) {
    if (error?.message?.includes('jwt expired')) {
      next(new ApiError(StatusCodes.GONE, 'Need to refresh token.'))
      return
    }

    if (!clinetAccessToken) next(new ApiError(StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED!'))
  }
}

export const auth = {
  isAuthorized
}