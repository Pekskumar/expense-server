const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { createTodo, updateTodo, deleteTodo, listTodos, listTodosByStatus } = require("../controllers/todoController");

router.post("/todos", authMiddleware, createTodo);
router.post("/todos/:id", authMiddleware, updateTodo);
router.delete("/todos/:id", authMiddleware,deleteTodo);
router.post("/todolist",authMiddleware, listTodos);
router.get("/todolist/:status", authMiddleware, listTodosByStatus);

module.exports = router;
