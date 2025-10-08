/* eslint-disable indent */
import JWT from 'jsonwebtoken'
import { env } from '~/config/environment'

const generateToken = async (userInfo, secretKey, tokenExp) => {
    try {
      return JWT.sign(userInfo, secretKey, { algorithm: env.ALGORITHM, expiresIn: tokenExp })
    } catch (error) { throw new Error(error)}
}

const verifyToken = async (token, secretKey) => {
    try {
      return JWT.verify(token, secretKey)
    } catch (error) { throw new Error(error)}
}

export const JwtProvider = {
    generateToken,
    verifyToken
}