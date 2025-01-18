import express from "express";
import cors from "cors";
import "dotenv/config.js";
import connecDB from "./config/mongobd.js";
import connecCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";
import userRouter from "./routes/userRoute.js";
import doctorRouter from "./routes/doctorRoute.js";


const app = express();
const port = process.env.PORT || 4000;
connecDB();

//cloudaniry
connecCloudinary();

// middelwares
app.use(express.json());
app.use(cors);



// api endpoint
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);

app.use("/api/doctor", doctorRouter);


app.get("/", (req, res) => {
  res.send("Api working1");
});

app.listen(port, () => console.log("Server is running", port));
