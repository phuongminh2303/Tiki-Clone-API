const router = require('express').Router({ mergeParams: true });
const {
  getProducts,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
  productPhotoUpload
} = require('../controller/products');

const advancedResults = require('../middleware/advancedResults');
const Product = require('../models/Product');

const { protect, authorize } = require('../middleware/auth');
const { checkCachedShopProducts, checkCachedAllProducts } = require('../middleware/redisProducts');

// Include other resource routers
const reviewRouter = require('./reviews');
// Reroute into other resoure routers
router.use('/:productId/reviews', reviewRouter);

router
  .route('/')
  .get(
    checkCachedShopProducts,
    checkCachedAllProducts,
    advancedResults(Product, {
      path: 'shop',
      select: 'name'
    }),
    getProducts
  )
  .post(protect, authorize('seller', 'admin'), addProduct);

router
  .route('/:id')
  .get(getProduct)
  .put(protect, authorize('seller', 'admin'), updateProduct)
  .delete(protect, authorize('seller', 'admin'), deleteProduct);

router
  .route('/:id/photo')
  .put(protect, authorize('seller', 'admin'), productPhotoUpload);

module.exports = router;
