const express = require("express");
require("dotenv").config()

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Paitent = require("../models/Patient");
const router = express.Router();

router.post("/login/doctor", async (req, res) => {

    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username, role: "doctor" });
        if (!user) return res.status(401).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const doctor = await Doctor.findById(user.refId)

        const token = jwt.sign({ id: user._id, username: user.username }, process.env.SECRET_KEY, {
            expiresIn: "1h"
        });

        res
            .status(200)
            .json({
                message: "Login successful",
                token,
                doctorId: user.refId
            });

    } catch (err) {
        console.log(err.message)
        res.status(500).json({ err });
    }
});

router.post("/signup/doctor", async (req, res) => {
    try {
        const { username, password, name, address } = req.body;

        const existingUser = await User.findOne({ username, role: "doctor" });
        console.log("user doctor signup")
        console.log(existingUser)
        if (existingUser) return res.status(400).json({ message: "Username already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const doctor = new Doctor({ name, address })
        await doctor.save()

        const newUser = new User({
            username,
            password: hashedPassword,
            role: "doctor",
            refId: doctor._id

        });
        await newUser.save();

        const token = jwt.sign(
            { id: doctor._id, username: newUser.username },
            SECRET_KEY,
            { expiresIn: "1h" }
        );


        res.status(200).json({
            message: "User created",
            token,
            doctorId: doctor._id

        });

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: err.message });
    }
})

router.post("/signup/patient", async (req, res) => {
    try {
        const { username, password, name, address } = req.body;

        const existingUser = await User.findOne({ username, role: "patient" });
        if (existingUser) return res.status(400).json({ message: "Username already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const patient = new Paitent({ name, address })
        await patient.save()

        console.log("new patient")
        console.table(patient)

        const user = new User({
            username,
            password: hashedPassword,
            role: "patient",
            refId: patient._id

        });
        await user.save();

        const token = jwt.sign(
            {
                id: user._id,
                username: user.username,
                patientName: patient.name,
                patientId: patient._id
            },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            message: "User created",
            token,
            patientId: patient._id

        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

router.post("/login/patient", async (req, res) => {

    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username, role: "patient" });
        if (!user) return res.status(401).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const patient = await Paitent.findById(user.refId)

        const token = jwt.sign(
            {
                id: user._id,
                username: user.username,
                patientName: patient.name,
                patientId: patient._id
            },
            SECRET_KEY, {
            expiresIn: "1h"
        });


        res.status(200).json({
            message: "Login successful",
            token,
            patientId: user._id
        });
    } catch (err) {
        console.log(err.message)
        res.status(500).json({ err });
    }
})

module.exports = router