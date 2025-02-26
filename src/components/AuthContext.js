import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase'; // Ensure Firebase is initialized correctly
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

// Create the AuthContext
const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};

// AuthProvider to manage user authentication state and provide context to other components
export const AuthProvider = ({ children }) => {
  // Initialize the user state from localStorage if available
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [confirmationResult, setConfirmationResult] = useState(null);

  // Log the user information whenever it changes
  useEffect(() => {
    if (user) {
      console.log('User Information:', user);
    } else {
      console.log('No user logged in');
    }
  }, [user]); // This effect runs whenever the user state changes (login/logout)

  // Listen for changes in authentication state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        const userFullInfo = {
          uid: currentUser.uid,
          phoneNumber: currentUser.phoneNumber,
          displayName: currentUser.displayName,
          email: currentUser.email, // You can expand this with additional user properties
        };
        localStorage.setItem('user', JSON.stringify(userFullInfo)); // Save full user info in localStorage
        setUser(userFullInfo); // Set the user state
      } else {
        localStorage.removeItem('user'); // Remove user info from localStorage when logged out
        setUser(null); // Set user state to null
      }
    });

    return unsubscribe; // Clean up the listener
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
  const verifyOTP = (otp) => {
    if (confirmationResult) {
      confirmationResult.confirm(otp)
        .then((result) => {
          const loggedInUser = {
            uid: result.user.uid,
            phoneNumber: result.user.phoneNumber,
            displayName: result.user.displayName,
            email: result.user.email,
          };
          localStorage.setItem('user', JSON.stringify(loggedInUser)); // Store full user information in localStorage
          setUser(loggedInUser); // Set the logged-in user
          console.log('User logged in:', result.user);
        })
        .catch((error) => {
          console.error('Error verifying OTP:', error.message);
        });
    }
  };

  // Function to log out the user
  const logoutUser = () => {
    auth.signOut().then(() => {
      localStorage.removeItem('user'); // Clear user data from localStorage
      setUser(null); // Reset user state after logging out
      console.log('User logged out');
    });
  };

  return (
    <AuthContext.Provider value={{ user, sendOTP, verifyOTP, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};
