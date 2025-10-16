const express = require("express");
const Appointment = require("../models/Appointment");
const { authenticateToken } = require("../middleware/auth");
const router = express.Router();

router.get(
    "/",
    authenticateToken,
    async (req, res) => {

        try {

            const { docId, patId } = req.query

            if (docId) {
                return res.status(200).json(await Appointment.find({
                    byDoctor: docId,
                    status: "pending"
                }))
            }

            if (patId) {
                console.log("Getting appts for patients " + patId)
                return res.status(200).json(await Appointment.find({ ofPatient: patId }))
            }

            if (!docId && !patId) {
                throw new Error("doc id and pat id not found")
            }

        } catch (error) {
            res.status(500).json({ message: error })
        }

    }
)

router.post(
    "/",
    authenticateToken,
    async (req, res) => {
        try {
            const { time, status, ofPatient, byDoctor, doctorName, forPatient } = req.body
            console.log(time, status, ofPatient, byDoctor)
            const appt = new Appointment({ byDoctor, doctorName, ofPatient, forPatient, time, status })
            await appt.save()
            res.status(200).json({ message: "Appointment created" })
        } catch (error) {
            console.log(error)
            res.status(500).json({ messae: error.message })

        }

    }
)

router.put(
    "/:id",
    authenticateToken,
    async (req, res) => {

        try {
            const id = req.params.id;

            const updatedAppt = await Appointment.findByIdAndUpdate(
                id,
                { status: "completed" },                           // update object
                { new: true }                         // return the updated document
            );

            if (!updatedAppt) {
                return res.status(404).json({ message: "Comment not found" });
            }

            res.status(200).json({ message: "Comment updated", comment: updatedAppt });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }

    }
);


module.exports = router
