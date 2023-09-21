var express = require("express");
const orderController = require("../controllers/OrderController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
var router = express.Router();

// Test route
// router.post("/xyz", (req, res) => {
//   console.log("req", req.body);
// });

//Create Product
router.post("/createOrder", isAuthenticatedUser, orderController.createOrder);
router.post(
  "/getOrderDetail/:id",
  isAuthenticatedUser,
  orderController.getOrderDetail
);
router.get("/myOrders", isAuthenticatedUser, orderController.myOrders);

//Get All Orders - Admin
router.get(
  "/getAllOrders",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  orderController.getAllOrders
);

//Update Order Status - Admin
router.put(
  "/updateOrderStatus/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  orderController.updateOrderStatus
);

//Delete Order - Admin
router.post(
  "/deleteOrder/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  orderController.deleteOrder
);

module.exports = router;
