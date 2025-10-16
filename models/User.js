const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true }, // patient or doctor
    refId: { type: mongoose.Schema.Types.ObjectId, } // refers to doctor or patient
});

const User = mongoose.model("User", userSchema);
module.exports = User;