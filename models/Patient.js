const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Paitent = mongoose.model("Patient", patientSchema)
module.exports = Paitent;