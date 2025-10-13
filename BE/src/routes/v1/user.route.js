import express from 'express'
import { userValidation } from '~/validations/user.validation'
import { userController } from '~/controllers/user.controller'
import { auth } from '~/middlewares/auth'
import { multerUpload } from '~/middlewares/multerUpload'

const Router = express.Router()

Router.route('/register')
  .post(userValidation.createNew, userController.createNew)

Router.route('/verify')
  .post(userValidation.verifyAccount, userController.verifyAccount)

Router.route('/login')
  .post(userValidation.login, userController.login)

Router.route('/logout')
  .delete(userController.logout)

Router.route('/password/forgot')
  .post(userValidation.forgotPassword, userController.forgotPassword)

Router.route('/password/verify_token')
  .post(userValidation.verifyResetToken, userController.verifyResetToken)

Router.route('/password/reset')
  .post(userValidation.resetPassword, userController.resetPassword)

Router.route('/refresh_token')
  .get(userController.refreshToken)

Router.route('/update')
  .put(auth.isAuthorized,
    multerUpload.upload.single('avatar'),
    userValidation.update,
    userController.update)

export const userRoute = Router