import { Server } from 'socket.io'
import { corsOptions } from '~/config/cors'
import jwt from 'jsonwebtoken'

export let io = null

export function initSocket(server) {
  io = new Server(server, { cors: corsOptions })

  io.on('connection', (socket) => {
    // Nhận token sau khi connect để join room theo user
    socket.on('AUTH', (token) => {
      try {
        const { userId } = jwt.verify(token, process.env.JWT_SECRET)
        socket.join(`user:${userId}`)
        socket.emit('AUTH_OK')
      } catch {
        socket.emit('AUTH_FAIL')
        socket.disconnect(true)
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