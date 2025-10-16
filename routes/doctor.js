const express = require("express");
const Doctor = require("../models/Doctor");
const { authenticateToken } = require("../middleware/auth");
const router = express.Router();

router.get(
    "/",
    authenticateToken,
    async (req, res) => {
        try {
            res.status(200).json(await Doctor.find())
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }
)

router.post(
    "/",
    authenticateToken,
    async (req, res) => {
        try {
            const { name, address } = req.body

            const doctor = new Doctor({ user, address })
            await doctor.save()

            res.status(200).json({ message: "Doctor created" })
        }
        catch (err) {
            res.status(500).json({ messae: err.message })
        }
    }
)


module.exports = router