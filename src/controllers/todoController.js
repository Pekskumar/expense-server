const Todo = require("../Models/Todo");
const { getResponse } = require("../utils/utils");

// Create a Todo
exports.createTodo = async (req, res) => {
  try {
    const { userId } = req.user;
    const { title, status, date, description, addedby } = req.body;

    const todo = new Todo({
      userId,
      title,
      status,
      date,
      description,
      addedby,
      createdBy: userId,
    });

    const savedTodo = await todo.save();

    return res.send(getResponse(1, "Task created successfully.", savedTodo));
  } catch (error) {
    console.log(error);
    return res.send(getResponse(0, "INTERNAL_SERVER_ERROR.", []));
  }
};

// Update a Todo
exports.updateTodo = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params; // Assuming you pass the ID as a URL parameter
    const { title, status, date, description,addedby } = req.body;

    const todo = await Todo.findOneAndUpdate(
      { _id: id, userId },
      { title, status, date, description,addedby },
      { new: true }
    );

    if (!todo) {
      return res.send(getResponse(0, "Task not found.", []));
    }

    return res.send(getResponse(1, "Task updated successfully.", todo));
  } catch (error) {
    console.log(error);
    return res.send(getResponse(0, "INTERNAL_SERVER_ERROR.", []));
  }
};

// Delete a Todo
exports.deleteTodo = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params; // Assuming you pass the ID as a URL parameter

    const todo = await Todo.findOneAndDelete({ _id: id, userId });

    if (!todo) {
      return res.send(getResponse(0, "Task not found.", []));
    }

    return res.send(getResponse(1, "Task deleted successfully.", []));
  } catch (error) {
    console.log(error);
    return res.send(getResponse(0, "INTERNAL_SERVER_ERROR.", []));
  }
};

// List all Todos
exports.listTodos = async (req, res) => {
  try {
    const { userId } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Tomorrow's start time

    // Fetch all todos created by the user
    const todos = await Todo.find({ createdBy: userId }).populate({ path: "addedby", select: "displayname" }); ;

    // Separate todos into today, future, and past
    const todayTodos = todos
      .filter((todo) => {
        const todoDate = new Date(todo.date);
        return todoDate >= today && todoDate < tomorrow; // Today’s tasks
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort in ascending order

    const futureTodos = todos
      .filter((todo) => {
        const todoDate = new Date(todo.date);
        return todoDate >= tomorrow; // Future tasks
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort in ascending order

    const pastTodos = todos
      .filter((todo) => {
        const todoDate = new Date(todo.date);
        return todoDate < today; // Past tasks
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort in descending order

    // Combine the lists: today’s todos, future todos, and past todos
    const finalList = [...todayTodos, ...futureTodos, ...pastTodos];

    return res.send(getResponse(1, "Tasks retrieved successfully.", finalList));
  } catch (error) {
    console.log(error);
    return res.send(getResponse(0, "INTERNAL_SERVER_ERROR.", []));
  }
};

// List all Todos with optional status filter from URL parameter
exports.listTodosByStatus = async (req, res) => {
  try {
    const { userId } = req.user;
    const { status } = req.params; // Get status from URL parameters

    let query = { userId };

    if (status) {
      query.status = status;
    }

    const todos = await Todo.find(query);

    return res.send(getResponse(1, "Tasks retrieved successfully.", todos));
  } catch (error) {
    console.log(error);
    return res.send(getResponse(0, "INTERNAL_SERVER_ERROR.", []));
  }
};
