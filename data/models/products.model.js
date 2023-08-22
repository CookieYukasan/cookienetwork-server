const mongoose = require('mongoose')
const config = require('../../config/application.config')
const MongoPaging = require('mongo-cursor-pagination')
const bcrypt = require('bcrypt')
const { bannedHook, softDeleteHook, updatedAtHook } = require('../../utils/database.utils')

const productsSchema = mongoose.Schema({
  slug: {
    type: String,
    unique: true,
    index: true,
    trim: true,
  },
  title: {
    type: String,
    unique: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
  images: {
    type: Array,
    required: true,
  },
  categoryId: {
    type: String,
    required: true,
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

productsSchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug: slug.toLowerCase() })
}

productsSchema.statics.verifyExistsSlug = function (slug) {
  return this.exists({ slug: slug.toLowerCase() })
}

productsSchema.statics.populateFull = async function (product) {
  let _product = product.toJSON ? product.toJSON() : product

  return _product
}

productsSchema.plugin(MongoPaging.mongoosePlugin)

productsSchema.pre('findOne', bannedHook)
productsSchema.pre('find', bannedHook)

productsSchema.pre('findOne', softDeleteHook)
productsSchema.pre('find', softDeleteHook)

productsSchema.pre('updateOne', updatedAtHook)
productsSchema.pre('save', updatedAtHook)

// productsSchema.index({ banned: 1, disabled: 1 }, { partialFilterExpression: { disabled: false, banned: false } })
/**
 * @see https://mongoosejs.com/docs/schematypes.html
 */
const Product = mongoose.model('Product', productsSchema)

module.exports = Product
