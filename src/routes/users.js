var express = require("express");
const multer = require("multer");
var userController = require("../controllers/Usercontroller");
const { authorizeRoles, isAuthenticatedUser } = require("../middleware/auth");

var router = express.Router();
const path = require("path");

//User Registration

// router.get("/getUsers", auth.verifyToken, userController.findAll);
router.get(
  "/admin/getUsers",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  userController.findAll
);
//Testing Route
router.get("/userData", (req, res) => {
  console.log(req.body, "body");
  res.status(200).json({ message: "user" });
});
router.get(
  "/admin/getUser/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  userController.getUserDetail
);
router.post("/createUser", userController.CreateUser);
router.post(
  "/updateUser/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  userController.updateUser
);

router.get(
  "/deleteUser/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  userController.findAndDelete
);
router.get(
  "/getUserDetails",
  isAuthenticatedUser,
  userController.getUserDetails
);

router.put(
  "/updatePassword",
  isAuthenticatedUser,
  userController.updatePassword
);

//Login User
router.post("/userLogin", userController.loginUser);
router.get("/loginOut", userController.logout);
router.post("/password/forgotPassword", userController.forgotPassword);
router.put("/password/resetPassword/:token", userController.resetPassword);

router.put(
  "/updateUserRole/:id",
  isAuthenticatedUser,
  userController.updateUserRole
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
