import jwt from "jsonwebtoken";
import Doctor from "../models/DoctorSchema.js";
import User from "../models/UserSchema.js";

export const authenticate = async (req, res, next) => {
  // Get token from headers
  const authToken = req.headers.authorization;

  if (!authToken || !authToken.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "No token, authorization denied" });
  }

  try {
    const token = authToken.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.userId = decoded.id;
    req.role = decoded.role;

    console.log("Authenticated user ID:", req.userId);

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ success: false, message: "Token has expired" });
    }
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export const restrict = (roles) => async (req, res, next) => {
  const userId = req.userId;

  try {
    // Try to find the user in both collections
    const user =
      (await User.findById(userId)) || (await Doctor.findById(userId));

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if the user's role is in the allowed roles
    if (!roles.includes(user.role)) {
      return res
        .status(403)
        .json({ success: false, message: "You are not authorized" });
    }

    next();
  } catch (error) {
    console.error("Error in restrict middleware:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
