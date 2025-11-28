import { env } from '~/config/environment'
import nodemailer from 'nodemailer'
import { Logger } from '~/config/logger'

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: true,
  auth: {
    user: env.SMTP_EMAIL,
    pass: env.SMTP_PASSWORD
  }
})

// eslint-disable-next-line no-unused-vars
transporter.verify((error, success) => {
  if (error) {
    Logger.error('Lỗi kết nối SMTP:', error)
  } else {
    Logger.info('Server đã sẵn sàng gửi email!')
  }
})

export const sendEMailsmtp = async ( toEmail, subject, htmlContent ) => {
  try {
    const mailOptions = {
      from: `"SMART FARM" <${env.SMTP_EMAIL}>`,
      to: toEmail,
      subject: subject,
      html: htmlContent
    }
    const info = await transporter.sendMail(mailOptions)
    Logger.info('Email sent: ' + info.response)
    return info
  } catch (error) {
    Logger.error('Error sending email:', error)
    throw error
  }
}