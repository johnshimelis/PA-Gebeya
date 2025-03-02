import React, { createContext, useContext, useState, useEffect } from "react";

// Create AuthContext
const AuthContext = createContext();

// Custom hook to use AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};

// AuthProvider to manage authentication
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [confirmationCode, setConfirmationCode] = useState(null);

  // Load user from local storage on startup
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token"); // Retrieve the token from localStorage
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      console.log("✅ User logged in:", JSON.parse(savedUser));
      console.log("✅ Token:", token); // Print the token
    } else {
      console.log("❌ No user or token found");
    }
  }, []);

  // Function to send OTP (simulated)
  const sendOTP = (phoneNumber) => {
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit code
    setConfirmationCode(generatedCode);
    console.log(`✅ OTP Sent to ${phoneNumber}:`, generatedCode);
  };

  // Function to verify OTP (simulated)
  const verifyOTP = (otp, phoneNumber) => {
    if (otp === confirmationCode) {
      const loggedInUser = {
        userId: "67c1f65e58d7fc75cca7658b",
        fullName: "Yohannes Shimelis",
        phoneNumber,
        email: "johnshimelis40@gmail.com",
      };
      const token = "sample-jwt-token"; // Simulate getting a token (replace with actual token from backend)
      
      // Store user and token in localStorage
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      localStorage.setItem("token", token); // Store the token in localStorage

      setUser(loggedInUser);
      console.log("✅ OTP Verified, User Logged In:", loggedInUser);
      console.log("✅ Token:", token); // Print the token here
    } else {
      console.error("❌ Invalid OTP");
    }
  };

  // Function to log out
  const logoutUser = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token"); // Remove the token on logout
    setUser(null);
    console.log("✅ User Logged Out");
  };

  return (
    <AuthContext.Provider value={{ user, sendOTP, verifyOTP, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};
