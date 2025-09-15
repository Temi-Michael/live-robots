require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully."))
  .catch((err) => console.error("MongoDB connection error:", err));

// Import the Robot model
const Robot = require("./models/Robot");

// API Routes
// GET: Fetch all robots
app.get("/api/robots", async (req, res) => {
  try {
    const robots = await Robot.find();
    res.json(robots);
  } catch (error) {
    console.error("Error fetching robots:", error);
    res.status(500).json({ error: "Server error while fetching robots." });
  }
});

// GET: Check if a phone number exists
app.get("/api/robots/check-phone/:phone", async (req, res) => {
  try {
    const robot = await Robot.findOne({ phone: req.params.phone });
    res.json({ exists: !!robot });
  } catch (error) {
    console.error("Error checking phone number:", error);
    res.status(500).json({ error: "Server error while checking phone number." });
  }
});

// POST: Add a new robot
app.post("/api/robots", async (req, res) => {
  try {
    const { name, username, email, phone, image, styleType } = req.body;

    // Basic validation
    if (!name || !username || !email || !phone || !image || !styleType) {
      return res.status(400).json({ msg: "Please enter all fields" });
    }

    const newRobot = new Robot({
      name,
      username,
      email,
      phone,
      image,
      styleType,
    });

    const savedRobot = await newRobot.save();
    const debugResponse = savedRobot.toObject();
    debugResponse.name = "DEBUG: " + savedRobot.name;
    res.status(201).json(debugResponse); // Respond with the created robot
  } catch (error) {
    // Handle potential errors, like duplicate username/email
    if (error.code === 11000) { // This is the error code for a duplicate key
        return res.status(400).json({ msg: "A robot with this email, username, or phone number already exists." });
    }
    console.error("Error saving robot:", error);
    res.status(500).json({ error: "Server error while saving robot." });
  }
});


app.get("/", (req, res) => {
  res.send("Backend server is running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});