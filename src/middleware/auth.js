const jwt = require("jsonwebtoken");
const { getResponse } = require("../utils/utils");

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;

  // If no token is provided, deny access
  if (!token) {
    return res
      .status(401)
      .send(getResponse(0, "Access denied. No token provided.", []));
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Set decoded user data to request object
    next();
  } catch (ex) {
    return res.status(400).send(getResponse(0, "Invalid token.", []));
  }
};

module.exports = authMiddleware;
