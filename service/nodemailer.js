const nodemailer = require('nodemailer');
const { MAIL_FROM, MAIL_PASS } = require('../config/keys');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  // host: 'smtp.gmail.com',
  // port: '587',
  // secure: false,
  auth: {
    user: MAIL_FROM,
    pass: MAIL_PASS
  }
});


const sendEmail = (payload) => {
  console.log(payload);
  const mailOptions = {
    from: 'no-reply@Sepiagram.com',
    to: payload.to,
    subject: payload.subject,
    html: payload.html
  }
  
  transporter.sendMail(mailOptions, (error, info) => {
    if(error) {
      console.log('Nodemailer service error: ', error);
    }
    else {
      console.log(`Email Sent to ${mailOptions.to} : ${info.response}`);
    }
  })
}

module.exports = sendEmail;
