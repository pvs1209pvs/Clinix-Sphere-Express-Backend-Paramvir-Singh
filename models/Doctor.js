const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Doctor = mongoose.model("Doctor", doctorSchema)
module.exports = Doctor