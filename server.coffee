express = require 'express'
app = express()

staticServer = express.static("#{__dirname}/public")

app.configure ->
  app.use staticServer

app.listen 1337
console.log "Listening on 1337..."