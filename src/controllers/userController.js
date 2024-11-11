const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const { getResponse } = require("../utils/utils");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const cloudinary = require("../config/cloudinaryConfig");

const JWT_SECRET = process.env.JWT_SECRET;
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
    // pass: "ulrq yxwa ievz oagc",
  },
});

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
    let profilepicUrl = "";
    if (req.file) {
      console.log("req.file ::",req.file);
      
      profilepicUrl = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            public_id: `profilepic/${emailid}`,
            fetch_format: "auto",
            quality: "auto",
          },
          (error, result) => {
            if (error) return reject("Error uploading profile picture.");
            resolve(result.secure_url);
          }
        );
        uploadStream.end(req.file.buffer);
      });
    }

    // Create new user document
    let userDocument;
    if (createdBy === undefined) {
      userDocument = new User({
        displayname,
        emailid,
        password: hashedPassword,
        usertype: "admin",
        createdBy,
        profilepic: profilepicUrl,
      });
    } else {
      userDocument = new User({
        displayname,
        emailid,
        password: hashedPassword,
        usertype: "client",
        createdBy,
        profilepic: profilepicUrl,
      });
    }

    let mailOptions = {
      from: process.env.EMAIL,
      to: `${emailid}`,
      subject: "Welcome to Expense-Tracker",
      html: `
        <!doctype html>
        <html lang="en-US">
        <head>
            <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
            <title>Welcome Email Template</title>
            <meta name="description" content="Welcome Email Template.">
            <style type="text/css">
                a:hover {text-decoration: underline !important;}
                #mail{ width:100% }
            </style>
        </head>
        <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; width: 100%; background-color: #f2f3f8;" leftmargin="0">
            <!--100% body table-->
            <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
                style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
                <tr>
                    <td>
                        <table style="background-color: #f2f3f8; max-width:670px; margin:0 auto;" width="100%" border="0"
                            align="center" cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="height:80px;">&nbsp;</td>
                            </tr>
                            <tr>
                                <td style="text-align:center;">
                                  <a href="https://pekskumar.github.io/expense-tracker/" title="logo" target="_blank">
                                   Expense-Tracker
                                  </a>
                                </td>
                            </tr>
                            <tr>
                                <td style="height:20px;">&nbsp;</td>
                            </tr>
                            <tr>
                                <td>
                                    <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                        style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                        <tr>
                                            <td style="height:40px;">&nbsp;</td>
                                        </tr>
                                        <tr>
                                            <td style="padding:0 35px;">
                                                <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">Welcome to Expense-Tracker, ${displayname}!</h1>
                                                <span
                                                    style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                                <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                                    We’re thrilled to have you on board! If you need any help or have questions, feel free to reach out.
                                                </p>
                                                <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                                    Cheers,<br/>The Expense-Tracker Team
                                                </p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="height:40px;">&nbsp;</td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td style="height:20px;">&nbsp;</td>
                            </tr>
                            
                            <tr>
                                <td style="height:80px;">&nbsp;</td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
            <!--/100% body table-->
        </body>
        </html>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        // Handle the email sending error if needed
      }
    });

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
    if (existingUser) {
      return res.send(getResponse(0, "User already exists.", []));
    }

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
      return res.send(getResponse(0, `Email '${error.keyValue.emailid}' is already registered.`, []));
    }
    console.error("Error in createClientUser:", error);
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

exports.VerifyEmail = async (req, res) => {
  try {
    const { emailid } = req.body;

    const user = await User.findOne({ emailid });
    if (!user) return res.json(getResponse("0", "Email not found.", []));

    // Define the reset password link
    const resetLink = `https://Pekskumar.github.io/expense-tracker/forgot-password?e=${emailid}`;
    // const resetLink = `http://localhost:3000/expense-tracker/forgot-password?e=${emailid}`;

    // Prepare the email options with the provided HTML template
    let mailOptions = {
      from: process.env.EMAIL,
      to: emailid,
      subject: "Forgot Password",
      html: `
        <!doctype html>
        <html lang="en-US">
        <head>
            <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
            <title>Reset Password Email Template</title>
            <meta name="description" content="Reset Password Email Template.">
            <style type="text/css">
                a:hover {text-decoration: underline !important;}
                #mail{
                width:100%
                }
            </style>
        </head>
        <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px;  width="100%"; background-color: #f2f3f8;" leftmargin="0">
            <!--100% body table-->
            <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
                style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
                <tr>
                    <td>
                        <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                            align="center" cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="height:80px;">&nbsp;</td>
                            </tr>
                            <tr>
                                <td style="text-align:center;">
                                  <a href="https://pekskumar.github.io/expense-tracker/" title="logo" target="_blank">
                                   Expense-Tracker
                                  </a>
                                </td>
                            </tr>
                            <tr>
                                <td style="height:20px;">&nbsp;</td>
                            </tr>
                            <tr>
                                <td>
                                    <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                        style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                        <tr>
                                            <td style="height:40px;">&nbsp;</td>
                                        </tr>
                                        <tr>
                                            <td style="padding:0 35px;">
                                                <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">You have
                                                    requested to reset your password</h1>
                                                <span
                                                    style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                                <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                                    We cannot simply send you your old password. A unique link to reset your
                                                    password has been generated for you. To reset your password, click the
                                                    following link and follow the instructions.
                                                </p>
                                                <a href="${resetLink}"
                                                    style="background:#20e277;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Reset
                                                    Password</a>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="height:40px;">&nbsp;</td>
                                        </tr>
                                    </table>
                                </td>
                            <tr>
                                <td style="height:20px;">&nbsp;</td>
                            </tr>
                            
                        </table>
                    </td>
                </tr>
            </table>
            <!--/100% body table-->
        </body>
        </html>
      `,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.json(getResponse("0", "Error sending email.", []));
      }
      return res.json(getResponse("1", "Email sent successfully.", []));
    });
  } catch (error) {
    console.error("Error in VerifyEmail:", error);
    return res.json(getResponse("0", "INTERNAL_SERVER_ERROR", []));
  }
};
exports.forgotPassword = async (req, res) => {
  try {
    // Get the email and new password from the request body
    const { emailid, password } = req.body;

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password in the database
    const result = await User.updateOne(
      { emailid },
      { $set: { otpnumber: "", password: hashedPassword } }
    );

    // Check if the password was updated successfully
    if (result.nModified > 0) {
      return res.json(getResponse("1", "Password reset successfully.", []));
    } else if (result.modifiedCount > 0) {
      // For some MongoDB configurations, use `modifiedCount`
      return res.json(getResponse("1", "Password reset successfully.", []));
    } else {
      return res.json(
        getResponse(
          "0",
          "Password reset failed. Email not found or password not changed.",
          []
        )
      );
    }
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    return res.json(getResponse("0", "INTERNAL_SERVER_ERROR", []));
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
