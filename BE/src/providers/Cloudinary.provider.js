import cloudinary from 'cloudinary'
import streamifiler from 'streamifier'
import { env } from '~/config/environment'

//comfig cloudinary
const cloudinaryv2 = cloudinary.v2
cloudinaryv2.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
})

//upload file lên cloudinary
const streamUpload = (fileBuffer, folderName) => {
  return new Promise((resolve, reject) => {
    //tạo luồng upload
    const stream = cloudinaryv2.uploader.upload_stream({ folder: folderName }, (error, result) => {
      if (result) resolve(result)
      else reject(error)
    })
    // Thực hiện upload bằng lib streamifiler
    streamifiler.createReadStream(fileBuffer).pipe(stream)
  })
}

export const CloudinaryProvider = { streamUpload }