const express = require("express")
const cors = require("cors")
const authRoutes = require("./routes/auth")
const doctorRoutes = require("./routes/doctor")
const patientRoutes = require("./routes/patient")
const apptRoutes = require("./routes/appointment")
const presRoutes = require("./routes/prescription")
const mongoDbConnect = require("./config/mongodb")

mongoDbConnect()

const app = express()
app.use(express.json())
app.use(cors())
app.use("/auth", authRoutes)
app.use("/doctor", doctorRoutes)
app.use("/patient", patientRoutes)
app.use("/appt", apptRoutes)
app.use("/pres", presRoutes)

app.listen(
    8080,
    () => console.log("Express running.")
)

module.exports = app