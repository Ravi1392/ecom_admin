const Product = require("../models/productModel");
const ErrorHander = require("../../utils/errorhander");
const catchAsynErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../../utils/apifeatures");

//Create Product
exports.CreateProduct = catchAsynErrors(async (req, res, next) => {
  //console.log("body", req.body);
  req.body.user = req.user.id;

  var newProduct = await Product.create(req.body);

  res.status(201).json({
    success: true,
    data: newProduct,
    message: "Product Successfully Created.",
  });
});

//get all products
exports.getAllProducts = catchAsynErrors(async (req, res, next) => {
  const resultPerPage = 1;
  const productCount = await Product.countDocuments();

  const apiFeatures = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage);
  const products = await apiFeatures.query;

  if (!products.length) {
    return next(new ErrorHander("Products not found", 404));
  }
  res.status(200).json({
    success: true,
    data: products,
    totalProducts: productCount,
    message: "Products Successfully get.",
  });
});

exports.updateProduct = catchAsynErrors(async (req, res, next) => {
  let updateproduct = await Product.findById(req.params.id);

  if (!updateproduct) {
    return next(new ErrorHander("Product not found", 500));
  }

  updateproduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    sucess: true,
    data: updateproduct,
    message: "Product Successfully updated.",
  });
});

exports.deleteProduct = catchAsynErrors(async (req, res, next) => {
  let deleteproduct = await Product.findById(req.params.id);

  if (!deleteproduct) {
    return next(new ErrorHander("Product not found", 404));
  }
  await deleteproduct.remove();

  res.status(200).json({
    success: true,
    message: "Product Successfully Deleted.",
  });
});

exports.getProductDetail = catchAsynErrors(async (req, res, next) => {
  let productdetail = await Product.findById(req.params.id);

  if (!productdetail) {
    return next(new ErrorHander("Product not found", 404));
  }

  res.status(200).json({
    status: true,
    data: productdetail,
    message: "Product Successfully get.",
  });
});

//Create New Review or Update the Review
exports.createProductReview = catchAsynErrors(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };
  const product = await Product.findById(productId);

  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString())
        (rev.rating = rating), (rev.comment = comment);
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  let avg = 0;

  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

//Get all Reviews of a product

exports.getProductReviews = catchAsynErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.id);
  if (!product) {
    return next(new ErrorHander("Product not found", 404));
  }
  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

//Delete Reviews

exports.deleteReview = catchAsynErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHander("Product not found", 404));
  }
  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  const ratings = avg / reviews.length;
  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      // runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});
