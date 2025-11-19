import winston from 'winston'
import { env } from '~/config/environment'

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.align(),
  winston.format.printf(info => `[${info.level}] ${info.timestamp}: ${info.message}`)
)

const logger = winston.createLogger({
  level: env.BUILD_MODE === 'dev' ? 'debug' : 'info',

  transports: [
    new winston.transports.Console({ format: consoleFormat })
  ]
})

logger.stream = {
  write: (message) => {
    logger.info(message.substring(0, message.lastIndexOf('\n')))
  }
}

export const Logger = logger