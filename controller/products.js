const Product = require('../models/Product');
const Shop = require('../models/Shop');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const path = require('path');

// @desc    Get all products
// @route   GET /api/v1/products
// @route   GET /api/v1/shops/:shopId/products
// @access  Public
const getProducts = asyncHandler(async (req, res, next) => {
  if (req.params.shopId) {
    const products = await Product.find({ shop: req.params.shopId });
    return res.status(200).json({
      success: true,
      total: products.length,
      data: products
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get single product
// @route   GET /api/v1/products/:id
// @access  Public
const getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate({
    path: 'shop',
    select: 'name description'
  });

  if (!product) {
    return next(
      new ErrorResponse(`No product found with the id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Add product
// @route   POST /api/v1/shops/:shopId/products
// @access  Private
const addProduct = asyncHandler(async (req, res, next) => {
  req.body.shop = req.params.shopId;
  req.body.user = req.user.id;

  const shop = await Shop.findById(req.params.shopId);

  if (!shop) {
    return next(
      new ErrorResponse(`No shop found with id of ${req.params.shopId}`, 404)
    );
  }

  // Make sure that the owner is correct
  if (shop.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} cannot add product to this shop ${shop._id}`,
        401
      )
    );
  }

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    data: product
  });
});

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Private
const updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      new ErrorResponse(`No product found with id ${req.params.id}`, 404)
    );
  }

  // Make sure that the owner is correct
  if (product.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} cannot update product to this shop ${product._id}`,
        401
      )
    );
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Delete product
// @route   DELETE /api/v1/products/:id
// @access  Private
const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      new ErrorResponse(`No product found with id ${req.params.id}`, 404)
    );
  }

  // Make sure that the owner is correct
  if (product.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} cannot update product to this shop ${product._id}`,
        401
      )
    );
  }

  await product.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Upload photo for product
// @route   PUT /api/v1/products/:id/photo
// @access  Private
const productPhotoUpload = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(400).json({ success: false });
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(
      new ErrorResponse(`The file is not an image, please check again!`, 404)
    );
  }

  // Check file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(`The file size is too large, please check again!`, 404)
    );
  }

  // Change the name of the photo so that it is not duplicated
  file.name = `photo_${product._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }
    await Product.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name
    });
  });
});

module.exports = {
  getProducts,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
  productPhotoUpload
};
