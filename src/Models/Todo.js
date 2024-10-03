const mongoose = require("mongoose");

const TodoSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    status: { type: String, required: true },
    date: { type: Date, required: true },
    description: { type: String },    
    createdBy: { type: mongoose.Schema.Types.ObjectId,ref: "User", default: null },
  },
  { timestamps: true }
);

const Todo = mongoose.model("Todo", TodoSchema);

module.exports = Todo;
