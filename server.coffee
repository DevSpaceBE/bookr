express = require 'express'
expressCoffee = require 'express-coffee'
inspect       = require('util').inspect
app           = express()
Book          = require './models/book'

staticServer = express.static("#{__dirname}/public")

app.configure ->
  coffeeCompiler = expressCoffee
    path: __dirname + '/public'
    live: !process.env.PRODUCTION
    uglify: process.env.PRODUCTION

  app.use express.logger({format: 'dev', stream: process.stdout})
  app.use express.bodyParser()
  app.use coffeeCompiler
  app.use staticServer

app.get '/books', (req, res) ->
  Book.find (err, books) ->
    if err?
      res.status 500
      res.end inspect(err)
    else
      res.status 200
      res.json(books)

app.post '/books', (req, res) ->
  bookAttrs = req.body
  Book.create bookAttrs, (err, book) ->
    if err?
      res.status 500
      res.end inspect(err)
    else
      res.status 201
      res.json(book)

app.delete '/books/:id', (req, res) ->
  Book.findByIdAndRemove req.params.id, (err, book) ->
    if err?
      res.status 500
      res.end inspect(err)
    else
      res.status 200
      res.end()

app.listen 1337
console.log "Listening on 1337..."