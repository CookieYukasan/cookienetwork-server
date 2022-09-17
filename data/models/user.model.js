const mongoose = require('mongoose')
const config = require('../../config/application.config')
const MongoPaging = require('mongo-cursor-pagination')
const bcrypt = require('bcrypt')
const { bannedHook, softDeleteHook, updatedAtHook } = require('../../utils/database.utils')

const userSchema = mongoose.Schema({
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
    select: false,
  },
  banned: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'premium', 'admin'],
    index: true,
  },
  device: {
    hash: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    authenticationSource: {
      type: String,
      enum: ['discord', 'web'],
    },
    browser: {
      name: {
        type: String,
      },
      version: {
        type: String,
      },
    },
    os: {
      name: {
        type: String,
      },
      version: {
        type: String,
      },
    },
    platform: {
      type: {
        type: String,
      },
      vendor: {
        type: String,
      },
      model: {
        type: String,
      },
    },
  },
  bannedAt: {
    type: Date,
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

userSchema.statics.verifyExistsUserName = function (userName) {
  return this.exists({ userName: userName })
}

userSchema.statics.verifyPassword = async function (password, encryptedPassword) {
  return await bcrypt.compare(password, encryptedPassword)
}

// userSchema.statics.generateRandomUserName = async function (userName) {
//   const userNamePresentInDb = await this.verifyExistsUserName(userName)

//   if (userNamePresentInDb) {
//     const newUserName = `${userName}_${randomStringGenerator(config.users.userNameCharsLimit - userName.length)}`
//     return this.generateRandomUserName(newUserName)
//   }

//   return userName.toLowerCase()
// }

userSchema.statics.reActivate = function (userId) {
  return Promise.all([
    this.updateOne(
      {
        _id: userId,
      },
      {
        $set: {
          disabled: false,
        },
      }
    ),
  ])
}

userSchema.statics.populateFull = async function (user) {
  let _user = user.toJSON ? user.toJSON() : user

  _user = await this.populateUserLists(_user)

  return _user
}

userSchema.statics.populateUserLists = async function (user) {
  const _user = user.toJSON ? user.toJSON() : user

  _user.isAdmin = user.role === 'admin'
  _user.isPremium = user.role === 'premium'

  return _user
}

userSchema.plugin(MongoPaging.mongoosePlugin)

userSchema.pre('findOne', bannedHook)
userSchema.pre('find', bannedHook)

userSchema.pre('findOne', softDeleteHook)
userSchema.pre('find', softDeleteHook)

userSchema.pre('updateOne', updatedAtHook)
userSchema.pre('save', updatedAtHook)

userSchema.index({ banned: 1, disabled: 1 }, { partialFilterExpression: { disabled: false, banned: false } })
/**
 * @see https://mongoosejs.com/docs/schematypes.html
 */
const User = mongoose.model('User', userSchema)

module.exports = User
