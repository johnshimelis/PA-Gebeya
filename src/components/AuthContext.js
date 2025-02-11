import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase'; // Make sure to import your Firebase setup
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

// Create the AuthContext
const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};

// AuthProvider to manage user authentication state and provide context to other components
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Track logged-in user
  const [confirmationResult, setConfirmationResult] = useState(null); // Store the OTP confirmation result

  // Listen for changes in authentication state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    return unsubscribe;
  }, []);

  // Function to send OTP to the provided phone number
  const sendOTP = (phoneNumber) => {
    const recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
      size: 'invisible',
    }, auth);

    signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)
      .then((confirmationResult) => {
        setConfirmationResult(confirmationResult);
      })
      .catch((error) => {
        console.error('Error sending OTP:', error);
      });
  };

  // Function to verify the OTP and log the user in
  const verifyOTP = (otp, confirmationResult) => {
    confirmationResult.confirm(otp)
      .then((result) => {
        setUser(result.user); // Set the logged-in user
        console.log('User logged in:', result.user);
      })
      .catch((error) => {
        console.error('Error verifying OTP:', error.message);
      });
  };

  // Function to log out the user
  const logoutUser = () => {
    auth.signOut().then(() => {
      setUser(null);
    });
  };

  return (
    <AuthContext.Provider value={{ user, sendOTP, verifyOTP, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};
