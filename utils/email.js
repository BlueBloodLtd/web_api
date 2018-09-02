const nodemailer = require('../nodemailer')

const sendEmail = (_to, _from, _link) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.email,
      pass: process.env.password
    }
  })

  const clientUrl = `https://blueblood.ltd/invite/${_from}-${_link}`
  const mailOptions = {
    from: 'info@blueblood.ltd',
    to: _to,
    subject: 'You have been Invited to BB',
    html: `<p> Your invitation link is: <a href='${clientUrl}'> ${clientUrl}</a>`
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error)
    } else {
      console.log('Email sent: ' + info.response)
    }
  })
}

module.exports = sendEmail
