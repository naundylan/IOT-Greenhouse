import { Server } from 'socket.io'
import { corsOptions } from '~/config/cors'
import jwt from 'jsonwebtoken'
import { env } from '~/config/environment'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { PUBLISH_MQTT } from '~/config/mqtt'
import cookie from 'cookie'
import { JwtProvider } from '~/providers/Jwt.provider'

export let io = null

export function initSocket(server) {
  io = new Server(server, { cors: corsOptions })

  io.use(async (socket, next) => {
    try {
      const cookieString = socket.handshake.headers.cookie
      if ( !cookieString ) return next(new ApiError(StatusCodes.UNAUTHORIZED, 'No cookie found'))
      const parsedCookies = cookie.parse(cookieString)
      const accessToken = parsedCookies.accessToken
      if (!accessToken)
        return next(new ApiError(StatusCodes.UNAUTHORIZED, 'accessstoken not found in cookies'))
      const accessstokenDecoded = await JwtProvider.verifyToken(accessToken, env.SECRET_KEY)

      socket.user = accessstokenDecoded

      next()
    } catch (error) {
      if (error?.message?.includes('jwt expired')) {
        return next(new ApiError(StatusCodes.GONE, 'Need to refresh token.'))
      }
      return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication error: Invalid token.'))
    }
  })
  io.on('connection', (socket) => {
    // Nhận token sau khi connect để join room theo user
    const userId = socket.user?._id
    if (!userId) {
      socket.disconnect(true)
      return
    }
    socket.join(`user:${userId}`)
    socket.emit('AUTH_OK')

    socket.on('FE_COMMAND', async (data) => {
      try {
        const { deviceId, command } = data
        if ( !deviceId || !command) throw new Error('Invalid deviceId or command')
        console.log(data)
        const commandTopic = `smartfarm/${deviceId}/commands`
        const payload = JSON.stringify({ command: command })

        await PUBLISH_MQTT(commandTopic, payload)
        console.log('da gui')
      } catch (error) {
        console.log('command failed', error.message)
      }
    })
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`)
    })
  })
}

export function emitToUser(userId, event, data) {
  try {
    io.to(`user:${userId}`).emit(event, data)
  } catch (error) {
    console.error(`Failed to emit event "${event}" to user ${userId}:`, error.message)
  }
}