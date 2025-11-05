export const OBJECT_ID_RULE = /^[0-9a-fA-F]{24}$/
export const OBJECT_ID_RULE_MESSAGE = 'Your string fails to match the Object Id pattern!'

export const FIELD_REQUIRED_MESSAGE = 'This field is required.'

export const PASSWORD_RULE = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d\W]{8,256}$/
export const PASSWORD_RULE_MESSAGE ='password must include at least 1 letter, a number and at least 8 characters.'

export const EMAIL_RULE = /^\S+@\S+\.\S+$/
export const EMAIL_RULE_MESSAGE = 'Email is invalid.'

export const USERNAME_RULE = /^[a-zA-Z0-9._-]{3,24}$/
export const USERNAME_RULE_MESSAGE = 'Username must be 3-24 characters long and can only contain letters, numbers, periods (.), underscores (_), and hyphens (-).'

export const PHONE_RULE = /^(0|\+84)\d{9}$/
export const PHONE_RULE_MESSAGE = 'Phone number is invalid.'

export const LIMIT_COMMON_FILE__SIZE = 10485760 //10 * 1024 * 1024 // 10MB
export const ALLOWED_COMMON_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png']

export const DEVICE_ID = 'Device ID is required.'
export const DEVICE_NAME = 'Device Name is required.'

export const DAY_RULE = /^\d{4}-\d{2}-\d{2}$/
export const DATE_RULE_MESSAGE = 'Day must be in YYYY-MM-DD format'