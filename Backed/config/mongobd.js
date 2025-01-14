import mongoose from "mongoose";

const connecDB = async () => {
  mongoose.connection.on("connected", () => console.log("Database connected"));
  await mongoose.connect(`${process.env.MONGODB_URL}/DocApp`);
};

export default connecDB;
