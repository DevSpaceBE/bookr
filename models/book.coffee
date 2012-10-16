mongoose = require 'mongoose'

db          = mongoose.createConnection 'localhost', 'bookr'

bookSchema = mongoose.Schema
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
  createdAt           : { type: Date, default: Date.now }

Book = db.model 'Book', bookSchema

module.exports = Book