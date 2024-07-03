const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const { getResponse } = require("../utils/utils");
const bcrypt = require("bcryptjs");

const JWT_SECRET = process.env.JWT_SECRET;

// Controller for creating a new user (signup)
exports.createAdminUser = async (req, res) => {
  try {
    const { displayname, emailid, password, createdBy } = req.body;
    
    const existingUser = await User.findOne({ emailid });

    if (existingUser) {
      return res.send(getResponse(0, "User already exists.", []));
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user document
    let userDocument;
    if (createdBy === undefined) {
      userDocument = new User({
        displayname,
        emailid,
        password: hashedPassword,
        usertype: "admin",
        createdBy,
      });
    } else {
      userDocument = new User({
        displayname,
        emailid,
        password: hashedPassword,
        usertype: "client",
        createdBy,
      });
    }

    // Save user to database
    let userData = await userDocument.save();

    if (userData?.usertype === "admin") {
      userData = {
        ...userData.toObject(),
        createdBy: userData._id,
      };
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: userData._id, emailid: userData.emailid },
      JWT_SECRET
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

exports.createClientUser = async (req, res) => {
  try {
    const { displayname, emailid, password, createdBy } = req.body;  
    const existingUser = await User.findOne({ emailid });    
    // if (existingUser) {
    //   // Store the attempted email in a log or database
    //   await saveDuplicateEmailLog(displayname, emailid, password, createdBy);

    //   return res.send(getResponse(0, "User already exists.", []));
    // }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user document
    const userDocument = new User({
      displayname,
      emailid,
      password: hashedPassword,
      usertype: "client",
      createdBy,
    });

    // Save user to database
    let userData = await userDocument.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: userData._id, emailid: userData.emailid },
      JWT_SECRET
    );

    // Respond with success message, token, and user data
    return res.send(
      getResponse(1, "User created successfully.", { token, user: userData })
    );
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyValue) {
      await saveDuplicateEmailLog(error.keyValue.emailid); // Store attempted email
      return res.send(getResponse(0, `Email '${error.keyValue.emailid}' is already registered.`, []));
    }
    console.error("Error in createClientUser:", error);
    return res.send(getResponse(0, "INTERNAL_SERVER_ERROR.", []));
  }
};

// Function to log or store duplicate email attempts
async function saveDuplicateEmailLog(displayname, emailid, password, createdBy) {
  try {

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user document
    const userDocument = new User({
      displayname,
      emailid,
      password: hashedPassword,
      usertype: "client",
      createdBy,
    });

    // Save user to database
    let userData = await userDocument.save();

    const token = jwt.sign(
      { userId: userData._id, emailid: userData.emailid },
      JWT_SECRET
    );

    return res.send(
      getResponse(1, "User created successfully.", { token, user: userData })
    );

    // Here you can implement logic to store the email in a log collection or database
    console.log(`Duplicate email '${emailid}' attempted to be registered.`);
    // Example: await DuplicateEmailLog.create({ email: email, timestamp: new Date() });
  } catch (error) {
    console.error("Error saving duplicate email log:", error);
    // Handle error if necessary
  }
}


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
      JWT_SECRET
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

exports.getUserList = async (req, res) => {
  try {
    const { userId } = req.body;

    // Build the query object
    let query = {};
    if (userId) {
      query = {
        $or: [{ createdBy: userId }, { _id: userId }],
      };
    }

    // Find users based on the query
    const users = await User.find(query, "-password"); // Exclude password field

    // Respond with the list of users
    return res.send(getResponse(1, "User list retrieved successfully.", users));
  } catch (error) {
    console.error("Error in getUserList:", error);
    return res.send(getResponse(0, "INTERNAL_SERVER_ERROR.", []));
  }
};

// Controller for updating a user
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    // Find the user by ID and update with new data
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password"); // Exclude password field

    // If user does not exist, return error
    if (!updatedUser) {
      return res.send(getResponse(0, "User not found.", []));
    }

    // Respond with the updated user data
    return res.send(getResponse(1, "User updated successfully.", updatedUser));
  } catch (error) {
    console.error("Error in updateUser:", error);
    return res.send(getResponse(0, "INTERNAL_SERVER_ERROR.", []));
  }
};

// Controller for deleting a user
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user by ID and delete
    const deletedUser = await User.findByIdAndDelete(userId).select(
      "-password"
    );

    // If user does not exist, return error
    if (!deletedUser) {
      return res.send(getResponse(0, "User not found.", []));
    }

    // Respond with success message
    return res.send(getResponse(1, "User deleted successfully.", deletedUser));
  } catch (error) {
    console.error("Error in deleteUser:", error);
    return res.send(getResponse(0, "INTERNAL_SERVER_ERROR.", []));
  }
};
