mongoose = require 'mongoose'

db          = mongoose.createConnection 'localhost', 'bookr'

book_schema = mongoose.Schema
  authors             : [String]
  averageRating       : Number
  ratingsCount        : Number
  categories          : [String]
  description         : String
  contentVersion      : String
  imageLinks          : {smallThumbnail : String, thumbnail : String}
  industryIdentifiers : {identifier : String, type : String}
  language            : String
  pageCount           : Number
  publishedDate       : String
  printType           : String
  publisher           : String
  title               : String
  infoLink            : String
  previewLink         : String
  canonicalVolumeLink : String

Book = db.model 'Book', book_schema

module.exports = Book