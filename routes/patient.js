const express = require("express");
const Patient = require("../models/Patient");
const { authenticateToken } = require("../middleware/auth");
const router = express.Router();

router.get(
    "/:id",
    authenticateToken,
    async (req, res) => {
        try {

            const id = req.params.id;

            const patient = await Paitent.findById(id);

            if (!patient) {
                return res.status(404).json({ message: 'Patient not found' });
            }

            res.status(200).json(patient);

        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }
)

module.exports = router