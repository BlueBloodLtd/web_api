const express = require('express')
const path = require('path')
const http = require('http')
const passport = require('passport')
const session = require('express-session')
const cors = require('cors')
const socketio = require('socket.io')
const authRouter = require('./lib/auth.router')
const passportInit = require('./lib/passport.init')
const { CLIENT_ORIGIN } = require('./config')
const app = express()
const envLoc = process.env.NODE_ENV === 'production' ? '.env' : '.env.development'
require('dotenv').config({ path: envLoc })

const server = http.createServer(app)

app.use(express.json())
app.use(passport.initialize())
// passportInit()
app.use(cors({ origin: CLIENT_ORIGIN }))
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true
}))
app.use('/', authRouter)

const io = socketio(server)
app.set('io', io)

const PORT = process.env.API_PORT ? process.env.API_PORT : 8080
server.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    console.log(err)
  }
  console.info(`==> listening on http://localhost:${PORT}.`)
})
