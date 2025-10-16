const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
    doctorName: { type: String, required: true },
    byDoctor: { type: String, required: true }, // id, acts like foreign key
    forPatient: { type: String, required: true },
    ofPatient: { type: String, required: true }, // id, acts like foreign key
    status: { type: String, required: true },
    time: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Appointment = mongoose.model("Appointment", appointmentSchema)
module.exports = Appointment