import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoImage from "../images/assets/PA-Logos.png"; // Import the logo
import backgroundImage from "../images/assets/ecommerce.jpg"; // Import the background image
import "../styles/cart.css";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const toggleAuthMode = () => setIsLogin(!isLogin);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
    }
    if (!isLogin) {
      if (!formData.fullName) newErrors.fullName = "Full name is required";
      if (!formData.email) newErrors.email = "Email is required";
      if (!formData.password) newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Proceed with login or signup logic
      console.log("Form submitted", formData);
      if (isLogin) {
        // Login logic
      } else {
        // Signup logic
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer} className="form-container">
        {/* Logo at the top of the form */}
        <img src={logoImage} alt="Logo" style={styles.logo} />

        <h2 style={styles.title}>{isLogin ? "Login" : "Sign Up"}</h2>

        <form style={styles.form} onSubmit={handleSubmit}>
          {/* Only phone number input for login */}
          {isLogin && (
            <div style={styles.phoneContainer}>
              <span style={styles.countryCode}>+251</span>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                placeholder="Phone Number"
                style={styles.input}
                onChange={handleInputChange}
              />
              {errors.phoneNumber && (
                <span style={styles.error}>{errors.phoneNumber}</span>
              )}
            </div>
          )}

          {/* Full Name input only for sign up */}
          {!isLogin && (
            <>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                placeholder="Full Name"
                style={styles.input}
                onChange={handleInputChange}
              />
              {errors.fullName && <span style={styles.error}>{errors.fullName}</span>}
            </>
          )}

          {/* Phone Number input for sign up */}
          {!isLogin && (
            <div style={styles.phoneContainer}>
              <span style={styles.countryCode}>+251</span>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                placeholder="Phone Number"
                style={styles.input}
                onChange={handleInputChange}
              />
              {errors.phoneNumber && (
                <span style={styles.error}>{errors.phoneNumber}</span>
              )}
            </div>
          )}

          {/* Email input for sign up */}
          {!isLogin && (
            <>
              <input
                type="email"
                name="email"
                value={formData.email}
                placeholder="Email"
                style={styles.input}
                onChange={handleInputChange}
              />
              {errors.email && <span style={styles.error}>{errors.email}</span>}
            </>
          )}

          {/* Password input for sign up */}
          {!isLogin && (
            <>
              <input
                type="password"
                name="password"
                value={formData.password}
                placeholder="Password"
                style={styles.input}
                onChange={handleInputChange}
              />
              {errors.password && (
                <span style={styles.error}>{errors.password}</span>
              )}
            </>
          )}

          {/* Button changes based on the mode */}
          <button type="submit" style={styles.button}>
            {isLogin ? "Send OTP" : "Sign Up"}
          </button>
        </form>

        <p style={styles.switchText}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span onClick={toggleAuthMode} style={styles.switchLink}>
            {isLogin ? "Sign Up" : "Login"}
          </span>
        </p>
        <Link to="/" style={styles.homeLink}>← Back to Home</Link>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "120vh",
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
    position: "relative",
  },
  formContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    width: "100%",
    maxWidth: "400px",
    marginTop: "100px",
  },
  logo: {
    width: "120px",
    marginBottom: "10px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#E60000",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    width: "100%",
    padding: "12px",
    margin: "10px 0",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "16px",
  },
  button: {
    backgroundColor: "#E60000",
    color: "#fff",
    padding: "12px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    marginTop: "10px",
  },
  switchText: {
    marginTop: "15px",
    fontSize: "14px",
    color: "#555",
  },
  switchLink: {
    color: "#E60000",
    fontWeight: "bold",
    cursor: "pointer",
  },
  homeLink: {
    display: "block",
    marginTop: "15px",
    color: "#333",
    textDecoration: "none",
    fontSize: "14px",
  },
  phoneContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "10px 0",
    backgroundColor: "#E60000",
    padding: "5px",
    borderRadius: "5px",
  },
  countryCode: {
    fontSize: "16px",
    color: "#fff",
    marginRight: "10px",
  },
  error: {
    color: "red",
    fontSize: "12px",
    marginTop: "5px",
  },
  // Media query for screens < 480px
  "@media (max-width: 480px)": {
    formContainer: {
      marginTop: "-900px", // Move form closer to the top
    },
  },
};

export default AuthPage;
