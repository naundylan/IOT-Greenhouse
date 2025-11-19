import { StatusCodes } from 'http-status-codes'
import { JwtProvider } from '~/providers/Jwt.provider'
import { env } from '~/config/environment'
import ApiError from '~/utils/ApiError'

// Middleware xác thực JWT accessToken
const isAuthorized = async (req, res, next) => {
  // Lấy access token từ header Authorization
  const authHeader = req.headers.authorization
  let clientAccessToken = null

  if (authHeader && authHeader.startsWith('Bearer ')) {
    clientAccessToken = authHeader.slice(7);
  }

  // Nếu không có token => báo lỗi
  if (!clientAccessToken) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED! (TOKEN IS NOT FOUND)'))
  }

  try {
    // Giải mã token
    const accessTokenDecoded = await JwtProvider.verifyToken(clientAccessToken, env.SECRET_KEY)

    // Lưu thông tin vào request để các middleware sau dùng
    req.jwtDecoded = accessTokenDecoded

    // Cho phép đi tiếp
    return next()
  } catch (error) {
    // Token hết hạn
    if (error?.message?.includes('jwt expired')) {
      return next(new ApiError(StatusCodes.GONE, 'Need to refresh token.'))
    }

    // Token không hợp lệ
    return next(new ApiError(StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED! (INVALID TOKEN)'))
  }
}

export const auth = {
  isAuthorized
}