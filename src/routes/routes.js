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
  VerifyEmail,
  forgotPassword,
} = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");
const expenseRoutes = require("./expenseRoutes");
const todoRoutes = require("./todoRoutes");
const multer = require("multer");
const upload = multer();

router.post("/signup",upload.single("profilepic"), createAdminUser);
router.post("/signin", signInUser);
router.post("/verifyemail", VerifyEmail);
router.post("/forgotpassword", forgotPassword);

router.post("/createclientuser",upload.single("profilepic"), createClientUser);
router.post("/users", getUserList);
router.post("/users/:userId", updateUser);
router.delete("/users/:userId", deleteUser);
router.post("/change-password", authMiddleware, changePassword);
router.use("/", expenseRoutes);
router.use("/", todoRoutes);

module.exports = router;
