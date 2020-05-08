const router = require('express').Router({ mergeParams: true });
const {
  getProducts,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
  productPhotoUpload
} = require('../controller/products');

const { getProductReviews, addReview } = require('../controller/reviews');

const advancedResults = require('../middleware/advancedResults');
const Product = require('../models/Product');

const { protect, authorize } = require('../middleware/auth');
const {
  checkCachedAllProducts,
  checkCachedSingleProduct,
  checkCachedProductReview
} = require('../middleware/redisProducts');

// Include other resource routers
const reviewRouter = require('./reviews');
// Reroute into other resoure routers
// router.use('/:productId/reviews', reviewRouter);

router
  .route('/')
  .get(
    checkCachedAllProducts,
    advancedResults(Product, {
      path: 'shop',
      select: 'name'
    }),
    getProducts
  );

router
  .route('/:productId/reviews')
  .get(getProductReviews)
  .post(protect, authorize('user', 'admin'), addReview);

router
  .route('/:id')
  .get(checkCachedSingleProduct, getProduct)
  .put(protect, authorize('seller', 'admin'), updateProduct)
  .delete(protect, authorize('seller', 'admin'), deleteProduct);

router
  .route('/:id/photo')
  .put(protect, authorize('seller', 'admin'), productPhotoUpload);

module.exports = router;
