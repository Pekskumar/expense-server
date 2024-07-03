const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    displayname: { type: String, required: true },
    emailid: { type: String, required: true},
    password: { type: String, required: true },
    usertype: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
