import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appoinmentModel.js";

const changeAvailability = async (req, res) => {
  try {
    const { doctorId } = req.body;

    const docData = await doctorModel.findById(doctorId);
    await doctorModel.findByIdAndUpdate(doctorId, {
      available: !docData.available,
    });
    res.json({ success: true, message: "Availability changed" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Internal Server Error" });
  }
};

const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select("-password -email");
    res.json({ success: true, doctors });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const doctor = await doctorModel.findOne({ email });
    if (!doctor) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const appointmentsDoctor = async (req, res) => {
  try {
    const { docterId } = req.body;

    const appointments = await appointmentModel.find({ doctorId: docterId });
    console.log(appointments);
    res.json({ success: true, appointments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// api to mark appointment complete

const appointmentCompete = async (req, res) => {
  try {
    const { doctorId, appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);
    if (appointmentData && appointmentData.doctorId === doctorId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        isCompleted: true,
      });
      return res.json({ success: true, message: "Appointment Completed" });
    } else {
      return res.json({ success: false, message: "Mark fails" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const appointmentCancel = async (req, res) => {
  try {
    const { doctorId, appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);
    if (appointmentData && appointmentData.doctorId === doctorId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        cancelled: true,
      });
      return res.json({ success: true, message: "Appointment Cancelld" });
    } else {
      return res.json({ success: false, message: "Cancellation failed" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const doctorDashboard = async (req, res) => {
  try {
    const { docterId } = req.body;

    // Fetch all appointments for the doctor
    const appointments = await appointmentModel.find({});

    // Extract unique patients
    let patients = [];
    appointments.forEach((item) => {
      if (!patients.includes(item.userId)) {
        patients.push(item.userId);
      }
    });

    const sortedAppointments = appointments.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Get the latest 5 appointments
    const latestAppointments = sortedAppointments.slice(0, 5);

    // Prepare dashboard data
    const dashData = {
      appointments: appointments.length,
      patients: patients.length,
      latestAppointment: latestAppointments,
    };

    res.json({ success: true, dashData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// api to get doctor profile

const doctorProfile = async (req, res) => {
  try {
    const { docterId } = req.body;

    const profileData = await doctorModel
      .findById(docterId)
      .select("-password");
    res.json({ success: true, profileData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// api to update doctor profile

const updateDoctorProfile = async (req, res) => {
  try {
    const { docterId, fees, address, available } = req.body;
    await doctorModel.findByIdAndUpdate(docterId, { fees, address, available });
    res.json({ success: true, message: "profile updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  changeAvailability,
  doctorList,
  loginDoctor,
  appointmentsDoctor,
  appointmentCancel,
  appointmentCompete,
  doctorDashboard,
  updateDoctorProfile,
  doctorProfile,
};
