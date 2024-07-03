const express = require("express");
const router = express.Router();
const {
  createAdminUser,
  signInUser,
  changePassword,
  getUserList,
  updateUser,
  deleteUser,
  createClientUser,
} = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");
const expenseRoutes = require("./expenseRoutes");
const todoRoutes = require("./todoRoutes");

router.post("/signup", createAdminUser);
router.post("/signin", signInUser);
router.post("/createclientuser", createClientUser);
router.post("/users", getUserList);
router.post("/users/:userId", updateUser);
router.delete("/users/:userId", deleteUser);
router.post("/change-password", authMiddleware, changePassword);
router.use("/", expenseRoutes);
router.use("/", todoRoutes);

module.exports = router;
