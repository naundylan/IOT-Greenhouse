import { env } from '~/config/environment'

export const WHITELIST_DOMAINS = [
  `http://${env.APP_HOST}:${env.APP_PORT}`,
  'http://localhost:5173'
]
export const WEBSITE_DOMAIN = (env.BUILD_MODE === 'production') ? env.WEBSITE_DOMAIN_PRODUCTION : env.WEBSITE_DOMAIN_DEV