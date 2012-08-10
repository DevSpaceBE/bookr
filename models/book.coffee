mongoose = require 'mongoose'

db       = mongoose.createConnection 'localhost', 'bookr'
schema   = mongoose.Schema
  isbn: 'string'

Book = db.model 'Book', schema

module.exports = Book