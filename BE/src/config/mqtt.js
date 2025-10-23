import * as mqtt from 'mqtt'
import { env } from '~/config/environment'

let mqttClient = null

const mqttCLientInstance = {
  ClientId: env.APP_NAME + '_' + Math.random().toString(16).slice(3),
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000
}

//new Promise dùng để async await
export const CONNECT_MQTT = () => new Promise((resolve, reject) => {
  if (mqttClient) return resolve(mqttClient)

  const c = mqtt.connect(env.MQTT_URI, mqttCLientInstance)

  const onceConnect = () => {
    c.removeListener('error', onError)
    mqttClient = c
    resolve(mqttClient)
  }
  const onError = (err) => {
    c.removeListener('connect', onceConnect)
    reject(err)
  }

  c.once('connect', onceConnect)
  c.once('error', onError)
})

export const CLOSE_MQTT = () => new Promise((resolve) => {
  if (!mqttClient) return resolve()
  mqttClient.end(true, {}, () => { mqttClient = null; resolve() })
})

export const GET_MQTT = () => {
  if (!mqttClient) throw new Error('Must connect to MQTT first')
  return mqttClient
}

//Chuyển API callback thành promise để dùng async await
export const PUBLISH_MQTT = (topic, payload, options = { qos: 0, retain: false }) =>
  new Promise((resolve, reject) => 
    GET_MQTT().publish(topic, payload, options, (err) => err ? reject(err) : resolve())
)

export const SUBSCRIBE_MQTT = (topic, options = { qos: 0 }) =>
  new Promise((resolve, reject) =>
    GET_MQTT().subscribe(topic, options, (err, granted) => err ? reject(err) : resolve(granted))
)