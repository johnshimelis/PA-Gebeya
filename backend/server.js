const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Firebase Admin SDK
const serviceAccount = require("./firebaseAdminKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.use(cors());
app.use(express.json());

// 🔹 Temporary storage for OTPs (Replace with Redis or DB in production)
const otpStore = {};

// 🔹 SIGNUP Route (Adds user to Firebase Authentication)
app.post("/signup", async (req, res) => {
  const { email, password, fullName, phoneNumber } = req.body;
  console.log("Signup request:", req.body);

  if (!email || !password || !fullName || !phoneNumber) {
    console.log("Missing required fields");
    return res.status(400).json({ error: "All fields are required" });
  }

  if (password.length < 6) {
    console.log("Password too short");
    return res.status(400).json({ error: "Password must be at least 6 characters long" });
  }

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: fullName,
      phoneNumber, // Save phone number in Firebase Authentication
    });

    console.log("User created successfully:", userRecord);
    res.status(201).json({ message: "User created successfully", user: userRecord });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(400).json({ error: error.message });
  }
});

// 🔹 SEND OTP Route (Generates and stores OTP)
app.post("/send-otp", async (req, res) => {
    const { phoneNumber } = req.body;
  
    if (!phoneNumber) {
      return res.status(400).json({ error: "Phone number is required" });
    }
  
    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
    // Store OTP temporarily (expires in 5 minutes)
    otpStore[phoneNumber] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };
  
    // Log OTP data for debugging
    console.log(`📲 OTP sent to ${phoneNumber}: ${otp}`);
    console.log("Current OTP Store:", otpStore);  // Log the full OTP store
  
    res.status(200).json({ message: "OTP sent successfully" });
  });
  
// 🔹 VERIFY OTP Route
app.post("/verify-otp", async (req, res) => {
  const { phoneNumber, otp } = req.body;
  console.log("Verify OTP request:", req.body);

  if (!phoneNumber || !otp) {
    console.log("Phone number and OTP are required");
    return res.status(400).json({ error: "Phone number and OTP are required" });
  }

  const storedOtpData = otpStore[phoneNumber];
  console.log("Stored OTP data:", storedOtpData);

  if (!storedOtpData) {
    console.log("OTP expired or not found");
    return res.status(401).json({ error: "OTP expired or not found" });
  }

  if (storedOtpData.otp !== otp) {
    console.log("Invalid OTP entered:", { enteredOtp: otp, storedOtp: storedOtpData.otp });
    return res.status(401).json({ error: "Invalid OTP" });
  }

  // OTP verified, remove from store
  delete otpStore[phoneNumber];

  console.log("OTP verified successfully");
  res.status(200).json({ message: "OTP verified successfully" });
});

// 🔹 LOGIN Route
app.post("/login", async (req, res) => {
    const { phoneNumber, otp } = req.body;
  
    if (!phoneNumber || !otp) {
      return res.status(400).json({ error: "Phone number and OTP are required" });
    }
  
    const storedOtpData = otpStore[phoneNumber];
  
    if (!storedOtpData) {
      console.log(`No OTP found for phone number: ${phoneNumber}`); // Log for debugging
      return res.status(401).json({ error: "OTP expired or not found" });
    }
  
    if (storedOtpData.otp !== otp) {
      console.log(`OTP mismatch for phone number: ${phoneNumber}`); // Log for debugging
      return res.status(401).json({ error: "Invalid OTP" });
    }
  
    try {
      // Add more debug logs to inspect the phone number used
      console.log(`Attempting to find user with phone number: ${phoneNumber}`);
  
      const userRecord = await admin.auth().getUserByPhoneNumber(phoneNumber);
  
      if (userRecord) {
        console.log(`User found: ${JSON.stringify(userRecord)}`);
      } else {
        console.log(`User not found for phone number: ${phoneNumber}`);
      }
  
      delete otpStore[phoneNumber]; // Remove OTP after successful login
  
      res.status(200).json({
        message: "Login successful",
        user: {
          uid: userRecord.uid,
          displayName: userRecord.displayName,
          photoURL: userRecord.photoURL || "https://via.placeholder.com/30", // Default placeholder if no avatar
          email: userRecord.email,
        },
      });
    } catch (error) {
      console.error("Login Error:", error);
      res.status(404).json({ error: "User not found" });
    }
  });
  

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
