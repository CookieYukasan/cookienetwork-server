const mongoose = require('mongoose')
const config = require('../../config/application.config')
const MongoPaging = require('mongo-cursor-pagination')

const categoriesSchema = mongoose.Schema({
  title: {
    type: String,
    trim: true,
  },
  slug: {
    type: String,
    index: true,
    unique: true,
  },
  productsCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

categoriesSchema.statics.populateFull = async function (category) {
  let _category = category.toJSON ? category.toJSON() : category

  return _category
}

categoriesSchema.plugin(MongoPaging.mongoosePlugin)

/**
 * @see https://mongoosejs.com/docs/schematypes.html
 */
const Category = mongoose.model('Category', categoriesSchema)

module.exports = Category
