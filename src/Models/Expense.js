const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  payby: { type: String, required: true,ref: "User" },
  description: { type: String },
  type: { type: String, required: true }, // Added type field with required flag
  category: { type: String }, // Added category field
  paymentMode: { type: String }, // Added paymentMode field
  createdBy: { type: mongoose.Schema.Types.ObjectId,ref: "User", default: null },
},{timestamps:true});

const Expense = mongoose.model("Expense", ExpenseSchema);

module.exports = Expense;
