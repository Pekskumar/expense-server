const mongoose = require("mongoose");

const dbConnection = async () => {
  try {
    let db = await mongoose.connect(
      `${process.env.MONGODB_URI}${process.env.DB_NAME}`
    );
    console.log(`DB connected successfully`);
  } catch (error) {
    console.log(`DB connection error::`, error?.message);
  }
};

module.exports = { dbConnection };
