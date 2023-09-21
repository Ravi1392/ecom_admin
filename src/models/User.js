const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please Enter Your Name."],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Please Enter Your Email."],
      unique: true,
      validator: [validator.isEmail, "Please Enter Valid Email"],
    },
    password: {
      type: String,
      required: [true, "Please Enter Your Password"],
      minLength: [6, "Password should be grater than 6 characters"],
      select: false,
    },
    profilepic: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    role: {
      type: String,
      default: "user",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

//generate bcrypt password
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hashSync(this.password, 10);
});

//Generate JWT Token

UserSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

//Compare Password
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//Generating Password Reset Token
UserSchema.methods.getResetPasswordToken = function () {
  //Generate Token
  const resetToken = crypto.randomBytes(20).toString("hex");

  //Hashing and adding resetPaswordToken to userSchema
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model("User", UserSchema);
