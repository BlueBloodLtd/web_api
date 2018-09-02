const express = require('express')
const path = require('path')
const http = require('http')
const passport = require('passport')
const session = require('express-session')
const cors = require('cors')
const shortid = require('shortid')
const socketio = require('socket.io')
const authRouter = require('./lib/auth.router')
const passportInit = require('./lib/passport.init')
const bodyParser = require('body-parser')
const logger = require('morgan')
const { CLIENT_ORIGIN } = require('./config')
const app = express()
const envLoc = process.env.NODE_ENV === 'production' ? '.env' : '.env.development'
require('dotenv').config({ path: envLoc })
const client = require('./db/conn')
const sendEmail = require('utils/email')

const server = http.createServer(app)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use(passport.initialize())

// passportInit()

app.use(cors({ origin: CLIENT_ORIGIN }))

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true
}))

app.use(logger('dev'))

app.use('/', authRouter)

app.post('/invite', (req, res) => {
  const senderId = req.body.link, sendermsg = req.body.msg, receiverId = req.body.to, newLink = shortid.generate()
  const senderName = req.body.name
  const current = new Date().toISOString()
  client.query(`INSERT INTO invitations (created_at, updated_at, link, senderId, sendermsg,senderName, receiverId) VALUES ('${current}', '${current}', '${newLink}', '${senderId}', '${sendermsg}', '${senderName}', '${receiverId}')`, (err, result) => {
    if (err) {
      return console.log(err)
    } else {
      sendEmail(receiverId, senderId, newLink)
      res.send('invited')
    }
  })
})

app.get('/invitations', (req, res) => {
  const link = req.query.link
  client.query(`SELECT * from invitations where senderId='${link}'`, (err, doc) => {
    if (err) {
      console.log(err)
    } else {
      res.status(200).send(doc.rows)
    }
  })
})

app.get('/invite/:id', (req, res) => {
  const sender = req.params.id.trim().split('-')[0].trim()
  const inviteLink = req.params.id.trim().split('-')[1].trim()
  client.query(`SELECT * FROM invitations WHERE senderid='${sender}' AND link='${inviteLink}'`, (err, doc) => {
    if (err) {
      return console.log(err)
    } else {
      const seen = new Date().toISOString()
      client.query(`UPDATE invitations SET updated_at='${seen}' WHERE senderid='${sender}' AND link='${inviteLink}'`, (err, resp) => {
        if (err) {
          console.log(err)
        } else {
          res.render('invite', { result: resp.rows[0] })
        }
      })
    }
  })
})

const io = socketio(server)
app.set('io', io)

const PORT = process.env.API_PORT ? process.env.API_PORT : 8080
server.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    console.log(err)
  }
  console.info(`==> listening on http://localhost:${PORT}.`)
})
