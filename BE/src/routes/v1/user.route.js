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
    userValidation.updateUser,
    userController.updateUser)

export const userRoute = Router

/**
 * @swagger
 * /users/register:
 *  post:
 *    summary: Register
 *    tags: [User]
 *    security: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *              username:
 *                type: string
 *              password:
 *                type: string
 *    responses:
 *       201:
 *         description: Create success, please verify your account via email
 *         content:
 *          application/json:
 *           schema:
 *            type: object
 *            properties:
 *             id:
 *              type: string
 *             email:
 *              type: string
 *             username:
 *              type: string
 *             displayName:
 *              type: string
 *             avatar:
 *              type: string
 *             gender:
 *              type: string
 *             dateOfBirth:
 *              type: string
 *              format: date
 *             phoneNumber:
 *              type: string
 *             role:
 *              type: string
 *             isActive:
 *              type: boolean
 *              default: false
 *             createdAt:
 *              type: number
 *              format: int64
 *              example: 1626867205123
 *             updateAt:
 *              type: number
 *              format: int64
 *              example: null
 *       422:
 *         description: Validation error
 *         content:
 *          application/json:
 *           schema:
 *            properties: {}
 * /users/verify:
 *  post:
 *    summary: Verification account
 *    tags: [User]
 *    security: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *              token:
 *                type: string
 *    responses:
 *       201:
 *         description: Verify success, you can login now
 *         content:
 *          application/json:
 *           schema:
 *            type: object
 *            properties:
 *             id:
 *              type: string
 *             email:
 *              type: string
 *             username:
 *              type: string
 *             displayName:
 *              type: string
 *             avatar:
 *              type: string
 *             gender:
 *              type: string
 *             dateOfBirth:
 *              type: string
 *              format: date
 *             phoneNumber:
 *              type: string
 *             role:
 *              type: string
 *             isActive:
 *              type: boolean
 *             createdAt:
 *              type: number
 *              format: int64
 *              example: 1626867205123
 *             updateAt:
 *              type: number
 *              format: int64
 *              example: null
 *       422:
 *         description: Validation error
 *         content:
 *          application/json:
 *           schema:
 *            properties: {}
 * /users/login:
 *   post:
 *     summary: Login
 *     tags: [User]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login success
 *         content:
 *          application/json:
 *           schema:
 *            type: object
 *            properties:
 *             accessToken:
 *              type: string
 *             refreshToken:
 *              type: string
 *             id:
 *              type: string
 *             email:
 *              type: string
 *             username:
 *              type: string
 *             displayName:
 *              type: string
 *             avatar:
 *              type: string
 *             gender:
 *              type: string
 *             dateOfBirth:
 *              type: string
 *              format: date
 *             phoneNumber:
 *              type: string
 *             role:
 *              type: string
 *             isActive:
 *              type: boolean
 *             createdAt:
 *              type: number
 *              format: int64
 *              example: 1626867205123
 *             updateAt:
 *              type: number
 *              format: int64
 *              example: null
 *       422:
 *         description: Validation error
 *         content:
 *          application/json:
 *           schema:
 *            properties: {}
 * /users/refresh_token:
 *   get:
 *     summary: Refresh Access Token
 *     tags: [User]
 *     security: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *            schema:
 *              type: object
 *              properties:
 *                accessToken:
 *                  type: string
 *       404:
 *         description: Please sign in
 *         content:
 *           application/json:
 *            schema:
 *              type: object
 *              properties:
 *                accessToken:
 * /users/password/forgot:
 *   post:
 *     summary: Forgot password
 *     tags: [User]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset link successfully sent to the user's email.
 *         content:
 *          application/json:
 *           schema:
 *            type: object
 *            properties:
 *             message: { type: string , example: 'Please check your email to get the password reset link' }
 *       422:
 *         description: Validation error
 *         content:
 *          application/json:
 *           schema:
 *            properties: {}
 * /users/password/verify_token:
 *   post:
 *     summary: Verify reset password token
 *     tags: [User]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               token: { type: string }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *          application/json:
 *           schema:
 *            type: object
 *            properties:
 *             id: { type: string }
 *             email: { type: string }
 *       422:
 *         description: Validation error
 *         content:
 *          application/json:
 *           schema:
 *            properties: {}
 * /users/password/reset:
 *   post:
 *     summary: Reset password
 *     tags: [User]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               token: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Password reset link successfully sent to the user's email.
 *         content:
 *          application/json:
 *           schema:
 *            type: object
 *            properties:
 *             message: { type: string , example: 'Password reset successful.' }
 *       422:
 *         description: Validation error
 *         content:
 *          application/json:
 *           schema:
 *            properties: {}
 * /users/update:
 *   put:
 *     summary: Update user profile
 *     tags: [User]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName: { type: string }
 *               avatar: { type: string }
 *               currentPassword: { type: string }
 *               newPassword: { type: string }
 *               gender: { type: string, enum: [male, female, non-binary] }
 *               phoneNumber: { type: string, example: "0123456789" }
 *               dateOfBirth: { type: string, format: date, example: "2005-01-01", description: must not be in future }
 *     responses:
 *       200:
 *         description: User information updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 username:
 *                   type: string
 *                 displayName:
 *                   type: string
 *                 avatar:
 *                   type: string
 *                 gender:
 *                   type: string
 *                 dateOfBirth:
 *                   type: string
 *                   format: date
 *                 phoneNumber:
 *                   type: string
 *                 role:
 *                   type: string
 *                 isActive:
 *                   type: boolean
 *                   default: true
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: 1626867205123
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: 1626867205716
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               properties: {}
 * /users/logout:
 *   delete:
 *     summary: Logout
 *     tags: [User]
 *     responses:
 *       200:
 *         description: User information updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 loggedOut:
 *                   type: boolean
 */

