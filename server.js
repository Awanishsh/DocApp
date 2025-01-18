import express from "express";
import cors from "cors";
import "dotenv/config.js";
import connecDB from "./config/mongobd.js";
import connecCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";
import userRouter from "./routes/userRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import mongoose from "mongoose";


const app = express();
const port = process.env.PORT || 4000;
connecDB();

//cloudaniry
connecCloudinary();

// middelwares
app.use(express.json());

// Configure CORS to allow all origins
// List of allowed origins
const allowedOrigins = [
  'https://startling-kangaroo-bcc26e.netlify.app',
  'https://docappppointmentapp.netlify.app',
];

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Custom-Header'], // Add any custom headers you're sending
  credentials: false,
};

// Middleware to handle CORS
app.use(cors(corsOptions));

// Preflight requests handler for all routes
app.options('*', cors(corsOptions));

// api endpoint
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);

app.use("/api/doctor", doctorRouter);


app.get("/", (req, res) => {
  res.send("Api working1");
});

app.listen(port, () => console.log("Server is running", port));
