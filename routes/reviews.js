const router = require('express').Router({ mergeParams: true });
const {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview
} = require('../controller/reviews');

const Review = require('../models/Review');
const advancedResults = require('../middleware/advancedResults');

const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(
    advancedResults(Review, {
      path: 'product',
      select: 'name'
    }),
    getReviews
  )
  .post(protect, authorize('user', 'admin'), addReview);

router
  .route('/:id')
  .get(getReview)
  .put(protect, authorize('user', 'admin'), updateReview)
  .delete(protect, authorize('user', 'admin'), deleteReview);

module.exports = router;
