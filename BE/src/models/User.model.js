import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { EMAIL_RULE, PASSWORD_RULE, PHONE_RULE } from '~/utils/validator'

const USER_ROLE = {
  CLIENT: 'client',
  ADMIN: 'admin'
}
const GENDER = { MALE: 'male', FEMALE: 'female', NON_BINARY: 'non-binary' }

const USER_COLLECTION_NAME = 'users'
const USER_COLLECTION_SCHEMA = Joi.object({
  email: Joi.string().required().strict().pattern(EMAIL_RULE),
  password: Joi.string().required().pattern(PASSWORD_RULE),

  username: Joi.string().required().trim().strict(),
  displayName: Joi.string().required().trim().strict(),
  role: Joi.string().valid(USER_ROLE.CLIENT, USER_ROLE.ADMIN).default(USER_ROLE.CLIENT),
  avatar: Joi.string().default(null),
  gender: Joi.string().default(GENDER.NON_BINARY),
  dateOfBirth: Joi.date().max('now').allow(null).default(null),
  phoneNumber: Joi.string().pattern(PHONE_RULE).allow(null).default(null),

  isActive: Joi.boolean().default(false),
  verifyToken: Joi.string(),
  verifyPwdToken: Joi.string().allow(null).default(null),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updateAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

//Các file không update được
const INVALID_UPDATE_FIELDS = ['_id', 'email', 'username', 'createdAt']

const validateBeforeCreate = async(data) => {
  return await USER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createdNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const createUser = await GET_DB().collection(USER_COLLECTION_NAME).insertOne(validData)
    return createUser
  } catch (error) { throw new Error(error)}
}

const findOneById = async (userId) => {
  try {
    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOne({ _id: new ObjectId(userId) })
    return result
  } catch (error) { throw new Error(error) }
}

const findOneByEmail = async (emailValue) => {
  try {
    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOne({ email: emailValue })
    return result
  } catch (error) { throw new Error(error)}
}

const update = async (userId, updateData) => {
  try {
    //Lọc các field không cho phép update
    Object.keys(updateData).forEach(fieldName => {
      if ( INVALID_UPDATE_FIELDS.includes(fieldName)) {
        // correctly delete forbidden fields from the update object
        delete updateData[fieldName]
      }
    })

    // Use findOneAndUpdate and return the updated document (not the command result wrapper)
    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updateData },
      { returnDocument: 'after' } // trả về kết quả mới khi cập nhật
    )
    return result.value
  } catch (error) { throw new Error(error) }
}

export const userModel = {
  USER_COLLECTION_NAME,
  USER_COLLECTION_SCHEMA,
  createdNew,
  findOneById,
  findOneByEmail,
  update
}