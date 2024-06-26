const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { createExpense, getExpenses, updateExpense, deleteExpense } = require("../controllers/expenseController");

router.post("/expenses", authMiddleware, createExpense);
router.post("/expenseslist", authMiddleware, getExpenses);
router.post("/expenses/:id", authMiddleware, updateExpense);
router.delete("/expenses/:id", authMiddleware, deleteExpense);

module.exports = router;
