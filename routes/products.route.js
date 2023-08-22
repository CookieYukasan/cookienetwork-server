const express = require('express')
const router = express.Router()
const messages = require('../config/messages.config')
const Product = require('../data/models/products.model')
const usersMiddleware = require('../middlewares/users.middleware')
const authMiddleware = require('../middlewares/authentication.middleware')
const validateFieldsMiddleware = require('../middlewares/validateFields.middleware')

router.get('/', async (req, res) => {
  try {
    const products = await Product.paginate({ limit: 10 })

    res.send(products)
  } catch (error) {
    sentryCaptureException(error)
    res.status(500).send({ message: messages.database_error })
  }
})

router.get('/:slug', async (req, res) => {
  try {
    const product = await Product.findBySlug(req.params.slug)

    if (!product) {
      return res.sendStatus(404)
    }

    res.send(product)
  } catch (error) {
    sentryCaptureException(error)
    res.status(500).send({ message: messages.database_error })
  }
})

router.post(
  '/',
  validateFieldsMiddleware({
    slug: 'required|string|min:3|max:36',
    title: 'required|string|min:3|max:36',
    price: 'required|number',
    description: 'required|string|min:3|max:36',
    images: 'required|array',
    sizes: 'required|array',
    categoryId: 'required|string',
  }),
  authMiddleware.authenticateJwt,
  authMiddleware.authorizeAdmin,
  async (req, res) => {
    try {
      // const hasCategory = await Category.findOne({ _id: req.body.categoryId })

      // if(!hasCategory) {
      //   return res.status(400).send({ message: messages.database_error })
      // }

      const product = await Product.create({
        slug: req.body.slug,
        title: req.body.title,
        price: req.body.price,
        description: req.body.description,
        images: req.body.images,
        sizes: req.body.sizes,
        categoryId: req.body.categoryId,
      })

      res.send(product)
    } catch (error) {
      sentryCaptureException(error)
      res.status(500).send({ message: messages.random_error })
    }
  }
)

module.exports = router
