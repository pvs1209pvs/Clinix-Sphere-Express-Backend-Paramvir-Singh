const express = require("express");
const cors = require("cors")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require('mongoose');

const app = express()
app.use(express.json());
app.use(cors())

const PORT = 8080
const uri = "mongodb+srv://pvs1209_db_user:WJMiLFzPnw8Nh3kS@cluster0.hcce21h.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0&socketTimeoutMS=90000";
const SECRET_KEY = "secret_key";


async function run() {
    await mongoose.connect(uri,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    )
        .then(() => console.log("Connected to MongoDB"))
        .catch(err => console.error(err));
}
run()

const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const patientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const appointmentSchema = new mongoose.Schema({
    doctorName: { type: String, required: true },
    byDoctor: { type: String, required: true }, // id, acts like foreign key
    forPatient: { type: String, required: true },
    ofPatient: { type: String, required: true }, // id, acts like foreign key
    status: { type: String, required: true },
    time: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

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

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true }, // patient or doctor
    refId: { type: mongoose.Schema.Types.ObjectId, } // refers to doctor or patient
});

const Doctor = mongoose.model("Doctor", doctorSchema)
const Appointment = mongoose.model("Appointment", appointmentSchema)
const Prescription = mongoose.model("Prescription", prescriptionSchema)
const User = mongoose.model("User", userSchema);
const Paitent = mongoose.model("Patient", patientSchema)


function authenticateToken(req, res, next) {

    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

    if (!token) return res.status(401).json({ message: "Token required" });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid / expired token" });
        req.user = user;
        next();
    });
}

module.exports = app

app.listen(
    PORT,
    () => console.log("hello world")
)


// testing

app.get("/", async (req, res) => {

    return res.status(200).json({
        message: "Clinix Sphere backend created using Express.js by PARAMVIR SINGH"
    })
})

// auth doctor

app.post("/login/doctor", async (req, res) => {

    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username, role:"doctor" });
        if (!user) return res.status(401).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const doctor = await Doctor.findById(user.refId)

        const token = jwt.sign({ id: user._id, username: user.username }, SECRET_KEY, {
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

app.post("/signup/doctor", async (req, res) => {
    try {
        const { username, password, name, address } = req.body;

        const existingUser = await User.findOne({ username, role:"doctor" });
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

// auth patient

app.post("/signup/patient", async (req, res) => {
    try {
        const { username, password, name, address } = req.body;

        const existingUser = await User.findOne({ username, role:"patient" });
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
        res.status(500).json({ err});
    }
})

app.post("/login/patient", async (req, res) => {

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

// appointment

app.get(
    "/appt",
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

app.post(
    "/appt",
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

app.post(
    "/appt/update/:id",
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

// patient

app.get(
    "/patient/:id",
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

// doctor

app.get(
    "/doctor",
    authenticateToken,
    async (req, res) => {
        try {
            res.status(200).json(await Doctor.find())
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }
)

app.post(
    "/doctor",
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

// prescription

app.get(
    "/pres/:apptId",
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

app.post(
    "/pres",
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