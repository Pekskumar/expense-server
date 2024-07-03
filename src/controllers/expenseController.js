const Expense = require("../Models/Expense");
const { getResponse } = require("../utils/utils");

exports.createExpense = async (req, res) => {
  try {
    const { userId } = req.user;
    const { title, amount, date, description, type, category, paymentMode } =
      req.body; // Include all fields

    const expense = new Expense({
      userId,
      title,
      amount,
      date,
      description,
      type, // Add type to the new Expense object
      category, // Add category
      paymentMode, // Add paymentMode
      createdBy : userId
    });

    const savedExpense = await expense.save();

    

    return res.send(
      getResponse(1, "Expense created successfully.", savedExpense)
    );
  } catch (error) {
    console.log(error);
    return res.send(getResponse(0, "INTERNAL_SERVER_ERROR.", []));
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const { userId } = req.body;
    
    const expenses = await Expense.find({ createdBy: userId });

    return res.send(getResponse(1, "Expenses fetched successfully.", expenses));
  } catch (error) {
    console.log(error);
    return res.send(getResponse(0, "INTERNAL_SERVER_ERROR.", []));
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    const { title, amount, date, description, type, category, paymentMode } = req.body;

    const expense = await Expense.findOneAndUpdate(
      { _id: id, userId },
      { title, amount, date, description,type, category, paymentMode  },
      { new: true }
    );

    if (!expense) {
      return res.send(getResponse(0, "Expense not found.", []));
    }

    return res.send(getResponse(1, "Expense updated successfully.", expense));
  } catch (error) {
    console.log(error);
    return res.send(getResponse(0, "INTERNAL_SERVER_ERROR.", []));
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const expense = await Expense.findOneAndDelete({ _id: id, userId });

    if (!expense) {
      return res.send(getResponse(0, "Expense not found.", []));
    }

    return res.send(getResponse(1, "Expense deleted successfully.", expense));
  } catch (error) {
    console.log(error);
    return res.send(getResponse(0, "INTERNAL_SERVER_ERROR.", []));
  }
};
