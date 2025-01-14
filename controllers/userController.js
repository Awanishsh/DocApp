import validator from "validator";
import bcrypt from "bcryptjs";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import mongoose from "mongoose";

import appointmentModel from "../models/appoinmentModel.js";

// API to register user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all fields" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Password must be at least 8 characters",
        });
    }

    // Hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = { name, email, password: hashedPassword };

    const newUser = new userModel(userData);
    const user = await newUser.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// API for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all fields" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    // Find the user by email
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Api to get user profile

const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.body;

    const userData = await userModel.findById(userId).select("-password");
    console.log(userData);
    res.json({ success: true, userData });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { userId, name, phone, address, dob, gender } = req.body;

    const imageFile = req.file;

    const user = await userModel.findById(userId);

    if (!name || !gender || !phone || !dob) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all fields" });
    }

    await userModel.findByIdAndUpdate(userId, {
      name,
      phone,
      address: JSON.parse(address),
      dob,
      gender,
    });
    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path);
      const imageURL = imageUpload.secure_url;

      await userModel.findByIdAndUpdate(userId, { image: imageURL });
    }
    res.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update user profile error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// api to booking appoinmet

const bookAppointment = async (req, res) => {
  try {
    const { userId, doctorId, slotDate, slotTime } = req.body;

    if (!userId || !doctorId || !slotDate || !slotTime) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    // Fetch doctor data
    const docData = await doctorModel.findById(doctorId).select("-password");
    if (!docData || !docData.available) {
      return res
        .status(400)
        .json({ success: false, message: "Doctor not available" });
    }
    // Ensure slots_booked is initialized
    // Slot management
    let slots_booked = docData.slots_booked || {};
    if (!slots_booked[slotDate]) {
      slots_booked[slotDate] = [];
    }
    if (slots_booked[slotDate].includes(slotTime)) {
      return res
        .status(400)
        .json({ success: false, message: "Slot already booked" });
    }
    slots_booked[slotDate].push(slotTime);
    // Fetch user data
    const userData = await userModel.findById(userId).select("-password");
    if (!userData) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    // Create appointment data
    const appointmentData = {
      doctorId,
      userData,
      docData,
      amount: docData.fees,
      slotDate,
      slotTime,
      date: new Date(),
    };
    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    // Update doctor's slots_booked data
    await doctorModel.findByIdAndUpdate(doctorId, { slots_booked });

    res.json({ success: true, message: "Appointment booked" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// api to get appoinment for frontend

const listAppoinmentn = async (req, res) => {
  try {
    const { userId } = req.body;

    const appointment = await appointmentModel.find({
      "userData._id": new mongoose.Types.ObjectId(userId),
    });

    res.json({ success: true, appointment });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// api to cancal aapointment

const cancelAppointment = async (req, res) => {
  try {
    const { userId, appointmentId } = req.body;
    console.log(userId, appointmentId);

    if (!userId || !appointmentId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }
    console.log("UserID:", userId, "AppointmentID:", appointmentId);

    // Fetch appointment data
    const appointmentData = await appointmentModel.findById(appointmentId);
    if (!appointmentData) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    // Validate user ownership
    if (appointmentData.userData._id.toString() !== userId) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized action" });
    }

    // Mark appointment as cancelled
    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    // releasing doctor slots

    const { doctorId, slotDate, slotTime } = appointmentData;
    const doctorData = await doctorModel.findById(doctorId);

    let slots_booked = doctorData.slots_booked;

    slots_booked[slotDate] = slots_booked[slotDate].filter(
      (e) => e !== slotTime
    );

    await doctorModel.findByIdAndUpdate(doctorId, { slots_booked });
    console.log("Doctor Data:", doctorData);
    console.log("Slots Booked:", slots_booked);
    console.log("Slot Date:", slotDate);

    res.json({ success: true, message: " Appoinment Cancelled" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  registerUser,
  loginUser,
  getUserProfile,
  updateProfile,
  bookAppointment,
  listAppoinmentn,
  cancelAppointment,
};
