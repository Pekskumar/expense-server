const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { getResponse } = require("../utils/utils");
const bcrypt = require("bcryptjs");

const JWT_SECRET = process.env.JWT_SECRET;

// Controller for creating a new user (signup)
exports.createAdminUser = async (req, res) => {
  try {
    const { displayname, emailid, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ emailid });

    if (existingUser) {
      return res.send(getResponse(0, "Admin already exists.", []));
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user document
    const userDocument = new User({
      displayname,
      emailid,
      password: hashedPassword,
    });

    // Save user to database
    const userData = await userDocument.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: userData._id, emailid: userData.emailid },
      JWT_SECRET,
      // { expiresIn: "1h" }
    );

    // Respond with success message, token, and user data
    return res.send(
      getResponse(1, "User created successfully.", { token, user: userData })
    );
  } catch (error) {
    console.error("Error in createAdminUser:", error);
    return res.send(getResponse(0, "INTERNAL_SERVER_ERROR.", []));
  }
};

// Controller for user signin
exports.signInUser = async (req, res) => {
  try {
    const { emailid, password } = req.body;

    // Find user by email
    const user = await User.findOne({ emailid });

    // If user does not exist, return error
    if (!user) {
      return res.send(getResponse(0, "User does not exist.", []));
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // If password is invalid, return error
    if (!isPasswordValid) {
      return res.send(getResponse(0, "Invalid credentials.", []));
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, emailid: user.emailid },
      JWT_SECRET,
      // { expiresIn: "1h" }
    );

    // Respond with success message, token, and user data
    return res.send(getResponse(1, "Sign-in successful.", { token, user }));
  } catch (error) {
    console.error("Error in signInUser:", error);
    return res.send(getResponse(0, "INTERNAL_SERVER_ERROR.", []));
  }
};

// Controller for changing user password
exports.changePassword = async (req, res) => {
  try {
    const { userId } = req.user;
    const { oldPassword, newPassword } = req.body;

    // Find user by ID
    const user = await User.findById(userId);

    // If user does not exist, return error
    if (!user) {
      return res.send(getResponse(0, "User does not exist.", []));
    }

    // Validate old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    // If old password is incorrect, return error
    if (!isPasswordValid) {
      return res.send(getResponse(0, "Old password is incorrect.", []));
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    user.password = hashedNewPassword;
    await user.save();

    // Respond with success message
    return res.send(getResponse(1, "Password changed successfully.", {}));
  } catch (error) {
    console.error("Error in changePassword:", error);
    return res.send(getResponse(0, "INTERNAL_SERVER_ERROR.", []));
  }
};
