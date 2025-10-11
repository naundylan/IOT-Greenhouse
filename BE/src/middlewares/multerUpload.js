// config để lấy reqboy.files
import multer from 'multer'
import { LIMIT_COMMON_FILE__SIZE, ALLOWED_COMMON_FILE_TYPES } from '~/utils/validator'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

// validate file tyype
const customFileFilter = (req, file, callback) => {
  //kiểm tra file bằng mimetype
  if (!ALLOWED_COMMON_FILE_TYPES.includes(file.mimetype)) {
    const errMESSAGE = `File type is invalid. Allowed types are: ${ALLOWED_COMMON_FILE_TYPES.join(', ')}`
    return callback(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errMESSAGE), null)
  }
  //Nếu đúng trả về hợp lệ
  return callback(null, true)
}

// Config multer
const upload = multer({ 
  limits: { fileSize: LIMIT_COMMON_FILE__SIZE },
  fileFilter: customFileFilter
})

export const multerUpload = { upload }