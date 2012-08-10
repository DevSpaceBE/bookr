express = require 'express'
expressCoffee = require 'express-coffee'
app = express()

staticServer = express.static("#{__dirname}/public")

app.configure ->
  coffeeCompiler = expressCoffee
    path: __dirname + '/public'
    live: true
    uglify: process.env.PRODUCTION

  app.use express.logger format: 'dev', stream: process.stdout
  app.use coffeeCompiler
  app.use staticServer

app.get '/books', (req, res) ->
  res.json([])

app.listen 1337
console.log "Listening on 1337..."