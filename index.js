import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import doctorRoutes from "./routes/doctor.js";
import reviewRoutes from "./routes/review.js";
import bookingRoutes from "./routes/booking.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

const corsOptions = {
  origin: "*",
};

app.get("/", (req, res) => {
  res.send("Api is working");
});

const connectToDb = () => {
  try {
    mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to Db");
  } catch (error) {
    console.log("Cannot connect to Database: " + error);
  }
};

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

//routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/doctors", doctorRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/bookings", bookingRoutes);

app.listen(port, () => {
  console.log("Server is running on port " + port);
  connectToDb();
});
