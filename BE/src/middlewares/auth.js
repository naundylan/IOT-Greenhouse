import { StatusCodes } from 'http-status-codes'
import { JwtProvider } from '~/providers/Jwt.provider'
import { env } from '~/config/environment'
import ApiError from '~/utils/ApiError'

const isAuthorized = async (req, res, next) => {
  const clientAccessToken = req.cookies?.accessToken

  if (!clientAccessToken) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED! (TOKEN IS NOT FOUND)'))
  }

  try {
    // Giải mã token
    const accessTokenDecoded = await JwtProvider.verifyToken(clientAccessToken, env.SECRET_KEY)

    // Lưu thông tin vào request để các middleware sau dùng
    req.jwtDecoded = accessTokenDecoded

    return next()
  } catch (error) {
    // Token hết hạn
    if (error?.message?.includes('jwt expired')) {
      return next(new ApiError(StatusCodes.GONE, 'Need to refresh token.'))
    }

    return next(new ApiError(StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED! (INVALID TOKEN)'))
  }
}

export const auth = {
  isAuthorized
}