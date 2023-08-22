const mongoose = require('mongoose')
const config = require('../../config/application.config')
const MongoPaging = require('mongo-cursor-pagination')
const bcrypt = require('bcrypt')
const { bannedHook, softDeleteHook, updatedAtHook } = require('../../utils/database.utils')

const usersSchema = mongoose.Schema({
  userName: {
    type: String,
    unique: true,
    index: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  image: {
    type: String,
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

// usersSchema.statics.reActivate = function (userId) {
//   return Promise.all([
//     this.updateOne(
//       {
//         _id: userId,
//       },
//       {
//         $set: {
//           disabled: false,
//         },
//       }
//     ),
//   ])
// }

usersSchema.statics.populateFull = async function (product) {
  let _product = product.toJSON ? product.toJSON() : product

  return _product
}

usersSchema.plugin(MongoPaging.mongoosePlugin)

usersSchema.pre('findOne', bannedHook)
usersSchema.pre('find', bannedHook)

usersSchema.pre('findOne', softDeleteHook)
usersSchema.pre('find', softDeleteHook)

usersSchema.pre('updateOne', updatedAtHook)
usersSchema.pre('save', updatedAtHook)

// usersSchema.index({ banned: 1, disabled: 1 }, { partialFilterExpression: { disabled: false, banned: false } })
/**
 * @see https://mongoosejs.com/docs/schematypes.html
 */
const User = mongoose.model('User', usersSchema)

module.exports = User
