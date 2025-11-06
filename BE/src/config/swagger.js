import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Greenhouse Monitoring API',
      version: '1.0.0',
      description: 'API documentation for the Greenhouse Monitoring system'
    },
    servers: [
      {
        url: '/v1'
      }
    ],
    components: {
      securitySchemes: {
        OAuth2Password: {
          type: 'oauth2',
          flows: {
            password: {
              tokenUrl: '/v1/users/login',
              scopes: {}
            }
          }
        }
      }
    },
    security: [{ OAuth2Password: [] }]
  },
  apis: ['./src/routes/v1/*.js']
}

const swaggerSpec = swaggerJSDoc(options)

export const swaggerDocs = (app) => {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Greenhouse API Docs',
    swaggerOptions: {
      withCredentials: true,
      persistAuthorization: true,
      tagsSorter: (a, b) => {
        const customTagOrder = ['User', 'Sensor', 'Plant', 'Preset', 'History', 'History Alert']
        return customTagOrder.indexOf(a) - customTagOrder.indexOf(b)
      },
      // Đổi tên field trước khi gửi
      requestInterceptor: (req) => {
        if (req.url.includes('/v1/users/login') && req.body) {
          const bodyParams = new URLSearchParams(req.body)
          if (bodyParams.has('username')) {
            const username = bodyParams.get('username')
            const password = bodyParams.get('password')

            const newBody = {
              email: username,
              password: password
            }

            req.body = JSON.stringify(newBody)
            // Thiết lập Content-Type là JSON
            req.headers['Content-Type'] = 'application/json'
            // Gỡ bỏ Content-Type cũ
            delete req.headers['Content-Type']
            req.headers['Content-Type'] = 'application/json'

          } else if (req.headers['Content-Type'] === 'application/json' && req.body.username) {
            req.body.email = req.body.username
            delete req.body.username
            req.body = JSON.stringify(req.body)
          }
        }
        return req
      }
    },
    customCss: `
      /* Ẩn Label "Client credentials location" */
      label[for="password_type"] {
        display: none !important;
      }

      /* ẩn dropdown */
      .auth-container select {
          display: none !important;
      }

      /*  Ẩn 2 ô input thừa (client_id và client_secret) */
      .auth-container > div:nth-child(4),
      .auth-container > div:nth-child(5) {
          display: none !important;
      }
      /* ẩn thuộc tính cliend_id và client_secret trong ô input */
      input[id*="client_id"],
      input[id*="client_secret"],
      label[for*="client_id"],
      label[for*="client_secret"],
      input[class*="client_id"],
      input[class*="client_secret"] {
        display: none !important;
      }
    `
  }))
}
