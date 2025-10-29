import express from 'express'
import cors from 'cors'
import { corsOptions } from '~/config/cors'
import { APIs_V1 } from '~/routes/v1'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import { env } from '~/config/environment'
import { errorHandling } from './middlewares/errorHandling'
import cookieParser from 'cookie-parser'

import { initializeMqttListener } from './sockets/mqtt.listener'

const START_SERVER =() => {
  const app = express()
  //fix Cache from disk
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })
  //Cấu hình cookie
  app.use(cookieParser())
  //Cấu hình cors
  app.use(cors(corsOptions))

  app.use(express.json())

  app.use('/v1', APIs_V1)

  app.use(errorHandling)

  app.get('/', (req, res) => {
    res.end('<h1> Hello Word! </h1><hr>')
  })
  app.listen(env.APP_PORT, env.APP_HOST, () => {
    console.log(`Starting server host: ${env.APP_HOST} and port: ${env.APP_PORT}`)
  })
  exitHook(() => {
    CLOSE_DB()
   /* CLOSE_MQTT()*/
  })
}

(async () => {
  try {
    await CONNECT_DB()
    /*await CONNECT_MQTT()*/

    await initializeMqttListener()

    START_SERVER()
  } catch (err) {
    console.error(err)
    process.exit()
  }
})()
