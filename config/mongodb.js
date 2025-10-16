require("dotenv").config()
const mongoose = require("mongoose");

async function mongoDbConnect() {

    await mongoose.connect(process.env.MONGO_URI,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    )

    console.log("Connected to MongoDB.")

}

module.exports = mongoDbConnect