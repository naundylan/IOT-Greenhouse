import { Server } from 'socket.io'
import { corsOptions } from '~/config/cors'
import { env } from '~/config/environment'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { PUBLISH_MQTT } from '~/config/mqtt'
import cookie from 'cookie'
import { JwtProvider } from '~/providers/Jwt.provider'
import { sensorModel } from '~/models/Sensor.model'
import { Logger } from '~/config/logger'

export let io = null

const VALID_COMMANDS = {
  MODE: ['AUTO', 'MANUAL'],
  RELAY: ['FAN_ON', 'FAN_OFF', 'LIGHT_ON', 'LIGHT_OFF']
}

const RELAY_MAP = {
  'FAN': 'FAN',
  'LAMP': 'LIGHT'
}

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

        const sensor = await sensorModel.findOneByDeviceId(deviceId)
        if (!sensor) throw new Error('Sensor not found')
        if ( VALID_COMMANDS.MODE.includes(command) ) {
          await sensorModel.update(sensor._id, { controlMode: command === 'AUTO' ? 'AUTO' : 'MANUAL' })
          Logger.info(`Thiết bị ${deviceId} chuyển sang chế độ ${command}`)
        } else if ( VALID_COMMANDS.RELAY.includes(command) ) {
          const parts = command.split('_')
          const relay = parts[0]
          const state = parts[1]
          const relayKey = RELAY_MAP[relay]
          if (!relayKey) throw new Error('Invalid relay in command')
          const updateData = {
            [`relays.${relayKey}`]: state
          }
          await sensorModel.update(sensor._id, updateData)
          Logger.info(`Thiết bị ${deviceId} nhận lệnh ${command}`)
        }
        const commandTopic = `smartfarm/${deviceId}/commands`
        const payload = JSON.stringify({ command: command })

        await PUBLISH_MQTT(commandTopic, payload)
      } catch (error) {
        Logger.error(`FE_COMMAND error: ${error.message}`)
      }
    })
    socket.on('disconnect', () => {
      Logger.info(`Socket disconnected: ${socket.id}`)
    })
  })
}

export function emitToUser(userId, event, data) {
  try {
    io.to(`user:${userId}`).emit(event, data)
  } catch (error) {
    Logger.error(`emitToUser error: ${error.message}`)
  }
}