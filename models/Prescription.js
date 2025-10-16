const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema({
    symptoms: { type: String, required: true },
    diagnosis: { type: String, required: true },
    notes: { type: String, required: true },
    medName: { type: String, required: true },
    medDose: { type: String, required: true },
    medDur: { type: String, required: true },
    forAppt: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Prescription = mongoose.model("Prescription", prescriptionSchema)
module.exports = Prescription