/* eslint-disable no-useless-catch */
import { userModel } from '~/models/User.model'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatter'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { BrevoProvider } from '~/providers/Brevo.provider'
import { env } from '~/config/environment'
import { JwtProvider } from '~/providers/Jwt.provider'
import { CloudinaryProvider } from '~/providers/Cloudinary.provider'

const createNew = async (reqBody) => {
  try {
    // Kiểm tra email tồn tại
    const existUser = await userModel.findOneByEmail(reqBody.email)
    if ( existUser ) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exist!')
    }
    // Tạo data lưu vào db
    const nameFromEmail = reqBody.email.split('@')[0]
    const newUser = {
      email: reqBody.email,
      password: bcryptjs.hashSync(reqBody.password, 8), // Tham số thứ 2 là độ phức tạp giá trị càng cao thì hash càng lâu
      username: nameFromEmail,
      displayName: nameFromEmail, // Mặc định để giống username
      verifyToken: uuidv4()
    }
    // add vào db
    const createdUser = await userModel.createdNew(newUser)
    const getNewUser = await userModel.findOneById(createdUser.insertedId)
    // Gửi email cho người dùng xác thực
    const verifycationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
    const customSubject = 'Please verify your email before using our services!'
    const htmlContent = `
      <h3>Here is your verification link:</h3>
      <h3>${verifycationLink}</h3>
    `

    await BrevoProvider.sendEMail(getNewUser.email, customSubject, htmlContent)

    return pickUser(getNewUser)
  } catch (error) { throw error }
}

const verifyAccount = async (reqBody) => {
  try {
    //Query user trong db
    const existUser = await userModel.findOneByEmail(reqBody.email)

    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'ACCOUNT NOT FOUND')
    if (existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'YOUR ACCOUNT IS ALREADY ACTIVE')
    if (reqBody.token !== existUser.verifyToken)
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'TOKEN IS INVALID')

    const updateData = {
      isActive: true,
      verifyToken: null
    }

    const updatedUser = await userModel.update(existUser._id, updateData)

    return pickUser(updatedUser)
  } catch (error) { throw error }
}

const login = async (reqBody) => {
  try {
    const existUser = await userModel.findOneByEmail(reqBody.email)

    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'ACCOUNT NOT FOUND')
    if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'YOUR ACCOUNT IS NOT ACTIVE')
    if (!bcryptjs.compareSync(reqBody.password, existUser.password))
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'YOUR EMAIL OR PASSWORD IS INCORRRECT')

    //Tạo token trả về FE
    const userInfo = {
      _id: existUser._id,
      email: existUser.email
    }

    const accessToken = await JwtProvider.generateToken(userInfo, env.SECRET_KEY, env.ACCESS_TOKEN_EXPIRE)

    const refreshToken = await JwtProvider.generateToken(userInfo, env.SECRET_KEY, env.REFRESH_TOKEN_EXPIRE)

    return { accessToken, refreshToken, ...pickUser(existUser) }
  } catch (error) { throw error }
}

const refreshToken = async (clientRefreshToken) => {
  try {
    const refreshTokenDecoded = await JwtProvider.verifyToken(clientRefreshToken, env.SECRET_KEY)

    const userInfo = {
      _id: refreshTokenDecoded._id,
      email: refreshTokenDecoded.email
    }

    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.SECRET_KEY,
      env.ACCESS_TOKEN_EXPIRE
    )

    return { accessToken }
  } catch (error) { throw error }
}

const update = async (userId, reqBody, userAvtarFile) => {
  try {
    //query user trong db cho chắc chắn
    const existUser = await userModel.findOneById(userId)
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'ACCOUNT NOT FOUND')
    if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'YOUR ACCOUNT IS NOT ACTIVE')

    //Khởi tạo update user
    let updateUser = {}
    //Trường hợp change password
    if (reqBody.current_password && reqBody.new_password) {
      //kiểm tra current_password đúng hay không ?
      if (!bcryptjs.compareSync(reqBody.current_password, existUser.password)) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'YOUR CURRENT PASSWORD IS INCORRECT')
      }
      updateUser = await userModel.update(existUser._id, {
        password: bcryptjs.hashSync(reqBody.new_password, 8)
      })
    } else if (userAvtarFile) {
      // Trường hợp update avatar cloudinary
      const uploadResult = await CloudinaryProvider.streamUpload(userAvtarFile.buffer, 'users')
      // Lưu url ảnh vào db
      updateUser = await userModel.update(existUser._id, { avatar: uploadResult.secure_url })
    } else {
      // Trường hợp update thông tin khác
      updateUser = await userModel.update(existUser._id, reqBody)
    }

    return pickUser(updateUser)
  } catch (error) {throw error}
}

export const userService = {
  createNew,
  verifyAccount,
  login,
  refreshToken,
  update
}