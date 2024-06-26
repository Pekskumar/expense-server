const express = require("express");
const router = express.Router();
const { createAdminUser, signInUser, changePassword } = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");
const expenseRoutes = require("./expenseRoutes");

router.post("/signup", createAdminUser);
router.post("/signin", signInUser);
router.post("/change-password", authMiddleware, changePassword);
router.use("/", expenseRoutes);

module.exports = router;
