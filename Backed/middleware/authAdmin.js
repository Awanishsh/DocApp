import jwt from "jsonwebtoken";

// Admin Authentication Middleware
const authAdmin = async (req, res, next) => {
  try {
    const { atoken } = req.headers;

    if (!atoken) {
      return res.json({
        success: false,
        message: "Token not provided. Please log in again.",
      });
    }

    const token_decode = jwt.verify(atoken, process.env.JWT_SECRET);

    if (token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
      return res.json({
        success: false,
        message: "Not authorized as admin. Please log in again.",
      });
    }

    next(); // Proceed to the next middleware
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: error.message || "Authentication error",
    });
  }
};

export default authAdmin;
