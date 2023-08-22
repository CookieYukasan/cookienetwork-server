const express = require('express')
const router = express.Router()
const messages = require('../config/messages.config')
const validateFieldsMiddleware = require('../middlewares/validateFields.middleware')
const authMiddleware = require('../middlewares/authentication.middleware')
const Category = require('../data/models/categories.model')
const { sentryCaptureException } = require('../modules/log/sentry.module')
const { formatSlug } = require('../utils/string.utils')

router.get('/', async (req, res) => {
  try {
    const { next } = req.query
    const categories = await Category.paginate({ limit: 10, next })

    res.send(categories)
  } catch (error) {
    sentryCaptureException(error)
    res.status(500).send({ message: messages.database_error })
  }
})

router.delete('/:categoryId', async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId)

    if (!category) {
      return res.status(400).send({ message: messages.bad_request })
    }

    await Category.deleteOne({ _id: req.params.categoryId })

    res.sendStatus(200)
  } catch (error) {
    sentryCaptureException(error)
    res.status(500).send({ message: messages.database_error })
  }
})

router.get('/:categoryId', async (req, res) => {
  try {
    const category = await Category.findById(categoryId)

    if (!category) {
      return res.sendStatus(404)
    }

    res.send(category)
  } catch (error) {
    sentryCaptureException(error)
    res.status(500).send({ message: messages.database_error })
  }
})

router.post(
  '/',
  validateFieldsMiddleware({
    slug: 'required|string',
    title: 'required|string',
  }),
  // authMiddleware.authenticateJwt,
  // authMiddleware.authorizeAdmin,
  async (req, res) => {
    try {
      const category = await Category.create({
        slug: formatSlug(req.body.slug),
        title: req.body.title,
      })
      // const hasCategory = await Category.findOne({ _id: req.body.categoryId })

      // if(!hasCategory) {
      //   return res.status(400).send({ message: messages.database_error })
      // }

      res.send(category)
    } catch (error) {
      sentryCaptureException(error)
      res.status(500).send({ message: messages.random_error })
    }
  }
)

module.exports = router
