import { StatusCodes } from 'http-status-codes'
import { JwtProvider } from '~/providers/Jwt.provider'
import { env } from '~/config/environment'
import ApiError from '~/utils/ApiError'

// Middleware xác thực JWT accessToken
const isAuthorized = async (req, res, next) => {
  let clientAccessToken = null

  if (req.cookies && req.cookies.accessToken) {
    clientAccessToken = req.cookies.accessToken
  }
  // Nếu không có trong cookie lấy từ header Authorization
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    clientAccessToken = req.headers.authorization.slice(7)
  }

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