const express = require("express");
const Prescription = require("../models/Prescription");
const { authenticateToken } = require("../middleware/auth");
const router = express.Router();

router.get(
    "/:apptId",
    authenticateToken,
    async (req, res) => {
        try {
            const pres = await Prescription.findOne({ forAppt: req.params.apptId })
            if (!pres) {
                return res.status(404).json({ message: 'Pres not found' });

            }
            res.status(200).json(pres);

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
            const { symptoms, diagnosis, notes, medName, medDose, medDur, forAppt } = req.body

            const pres = new Prescription({ symptoms, diagnosis, notes, medName, medDose, medDur, forAppt })
            await pres.save()

            res.status(200).json({ message: "Prescription created" })
        }
        catch (err) {
            res.status(500).json({ messae: err.message })
        }
    }
)

module.exports = router