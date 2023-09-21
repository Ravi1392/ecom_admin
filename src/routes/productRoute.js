var express = require("express");
const multer = require("multer");
const productController = require("../controllers/ProductController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
var router = express.Router();

// Test route
router.post("/p", (req, res) => {
  console.log("req", req.body);
});
router.post(
  "/createproduct",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  productController.CreateProduct
);
router.get(
  "/products",
  isAuthenticatedUser,
  // authorizeRoles("admin"),
  productController.getAllProducts
);
router.post(
  "/updateproduct/:id",
  authorizeRoles("admin"),
  productController.updateProduct
);
router.post(
  "/deleteproduct/:id",
  authorizeRoles("admin"),
  productController.deleteProduct
);
router.post("/productdetail/:id", productController.getProductDetail);

router.put(
  "/review",
  isAuthenticatedUser,
  productController.createProductReview
);
router.get("/reviews", productController.getProductReviews);
router.delete(
  "/delete_review",
  isAuthenticatedUser,
  productController.deleteReview
);

//Image uploade

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("ABC");
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); //Appending extension
  },
});
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    console.log(ext);
    // if (ext !== ".csv") {
    //     return callback(new Error("Only csv files are allowed"));
    // }
    callback(null, true);
  },
});

module.exports = router;
