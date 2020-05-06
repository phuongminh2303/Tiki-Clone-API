const Review = require('../models/Review');
const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const redis = require('redis');

// const redis_client = redis.createClient(6379);

// @desc    Get all reviews
// @route   GET /api/v1/reviews
// @route   GET /api/v1/products/:productId/reviews
// @access  Public
const getReviews = asyncHandler(async (req, res, next) => {
  return res.status(200).json(res.advancedResults);
});

// @desc    Get all reviews of a product
// @route   GET /api/v1/products/:productId/reviews
// @access  Public
const getProductReviews = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const reviews = await Review.find({ product: productId }).populate({
    path: 'user',
    select: 'name'
  });

  // redis_client.setex(
  //   `reviews_product:${productId}`,
  //   3600,
  //   JSON.stringify(reviews)
  // );

  return res.status(200).json({
    success: true,
    total: reviews.length,
    data: reviews
  });
});

// @desc    Get single review
// @route   GET /api/v1/reviews/:id
// @access  Public
const getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: 'product',
    select: 'name'
  });

  if (!review) {
    return next(
      new ErrorResponse(`No review found with id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: review
  });
});

// @desc    Add review
// @route   POST /api/v1/products/:productId/reviews
// @access  Private. One user can create only 1 review
const addReview = asyncHandler(async (req, res, next) => {
  req.body.product = req.params.productId;
  req.body.user = req.user.id;

  const product = await Product.findById(req.params.productId);

  if (!product) {
    return next(
      new ErrorResponse(`No product with id ${req.params.productId}`, 404)
    );
  }

  const review = await Review.create(req.body);

  res.status(201).json({
    success: true,
    data: review
  });
});

// @desc    Update review
// @route   PUT /api/v1/reviews/:id
// @access  Private
const updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`No review found with id ${req.params.id}`, 404)
    );
  }

  // Check ownership of the review
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`This user cannot update this review`, 401));
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: review
  });
});

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
const deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`No review found with id ${req.params.id}`, 404)
    );
  }

  // Check ownership of the review
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`This user cannot update this review`, 401));
  }

  await review.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

module.exports = {
  getReviews,
  getProductReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview
};
