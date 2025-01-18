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
// app.use(cors);


// List of allowed origins (make sure you include your local development URL)
const allowedOrigins = [
  'http://localhost:5173', // Add your frontend URL for local dev
  'https://startling-kangaroo-bcc26e.netlify.app/' // Add your Netlify production URL
];

// CORS options
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      // Allow the request if the origin is in the allowed list
      callback(null, true);
    } else {
      // Reject the request if the origin is not allowed
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // If you're using cookies or credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow necessary HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Add any custom headers you use
};

// Apply CORS middleware to all routes
app.use(cors(corsOptions));

// Handle preflight (OPTIONS) requests for all routes
app.options('*', cors(corsOptions));





// api endpoint
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);

app.use("/api/doctor", doctorRouter);


app.get("/", (req, res) => {
  res.send("Api working1");
});

app.listen(port, () => console.log("Server is running", port));
