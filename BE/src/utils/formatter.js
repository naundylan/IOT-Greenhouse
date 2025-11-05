import { pick } from 'lodash'

export const pickUser = (user) => {
  if (!user) return {}
  return pick(user, ['_id', 'email', 'username', 'displayName', 'avatar', 'gender', 'dateOfBirth', 'phoneNumber', 'role', 'isActive', 'createdAt', 'updateAt'])
}