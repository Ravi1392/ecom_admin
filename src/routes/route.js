var express = require("express");
const multer = require("multer");
var router = express.Router();
const path = require("path");

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
