const User = require("../models/User");
const ErrorHander = require("../../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendToken = require("../../utils/jwtToken");
const sendEmail = require("../../utils/sendEmail");
const crypto = require("crypto");

//Create User
exports.CreateUser = catchAsyncErrors(async (req, res, next) => {
  const newUser = await User.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    profilepic: {
      public_id: "this is sample id",
      url: "profilepicUrl",
    },
  });

  sendToken(newUser, 201, res);
});

//get all users
exports.findAll = catchAsyncErrors(async (req, res, next) => {
  const allUsers = await User.find();
  if (!allUsers.length) {
    return next(new ErrorHander("Users not found", 404));
  }
  res.status(200).json({
    sucess: true,
    data: allUsers,
    message: "User Successfully get.",
  });
});

//Update User

exports.updateUser = catchAsyncErrors(async (req, res, next) => {
  let updateuser = await User.findById(req.params.id);

  if (!updateuser) {
    return next(new ErrorHander("User not found", 500));
  }

  updateuser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    sucess: true,
    data: updateuser,
    message: "User Successfully updated.",
  });
});

//User Details

exports.getUserDetail = catchAsyncErrors(async (req, res, next) => {
  let userdetail = await User.findById(req.params.id);

  if (!userdetail) {
    return next(new ErrorHander("User not found", 404));
  }

  res.status(200).json({
    status: true,
    data: userdetail,
    message: "User Successfully get.",
  });
});

//Delete User

exports.findAndDelete = catchAsyncErrors(async (req, res, next) => {
  let deleteuser = await User.findById(req.params.id);

  if (!deleteuser) {
    return next(new ErrorHander("User not found", 404));
  }
  await deleteuser.remove();

  res.status(200).json({
    success: true,
    message: "User Successfully Deleted.",
  });
});

//Login User

exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  //checking if user has given password and email both
  if (!email || !password) {
    return next(new ErrorHander("Please Enter Email or Password", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHander("Invalid email or password", 401));
  }
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHander("Invalid email or password", 401));
  }
  sendToken(user, 200, res);
});

//Logout

exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

//Forgot Password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHander("User not found", 404));
  }

  //Get ResetPassword Token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/password/resetPassword/${resetToken}`;

  const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then please ignore it`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Ecommerce Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHander(error.message, 500));
  }
});

//Reset Password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  // Creating Token Hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHander(
        "Reset Password Token is invalid or has been expired",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHander("Password does not Match", 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});

//Backend API For Admin
//Get User Details By Auth Token
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

//Update User Password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHander("Old Password is incorrect", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHander("Password does not match", 400));
  }

  user.password = req.body.newPassword;

  await user.save();
  sendToken(user, 200, res);
});

//Update User Profile
exports.updateUserProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    username: req.body.username,
    email: req.body.email,
  };
  sendToken(user, 200, res);
});

//Update User Role
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.username,
    role: req.body.role,
  };
  //We Will add cloudinary later

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

//Delete User - Admin
exports.deleteUserByAdmin = catchAsyncErrors(async (req, res, next) => {
  const user = await Usesr.findById(req.param.id);

  if (!user) {
    return next(
      new ErrorHander(`User does not exist with Id: ${req.param.id}`)
    );
  }
  await user.remove();
  res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
  });
});
