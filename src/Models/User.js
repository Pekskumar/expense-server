const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  displayname: { type: String, required: true },
  emailid: { type: String, required: true, unique: true },
  password: { type: String, required: true },
},{timestamps:true});

const User = mongoose.model("User", UserSchema);

module.exports = User;
