import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoImage from "../images/assets/PA-Logos.png";
import backgroundImage from "../images/assets/ecommerce.jpg";
import "../styles/cart.css";

const API_BASE_URL = "https://pa-gebeya-backend.onrender.com/api/auth";



const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    password: "",
    otp: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setIsOtpSent(false);
    setFormData({
      fullName: "",
      phoneNumber: "",
      email: "",
      password: "",
      otp: "",
    });
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      console.log("✅ User is logged in.");
    } else {
      console.log("❌ User is logged out. Redirecting...");
      navigate("/auth");
    }
  }, []);
  
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const endpoint = isLogin ? "/login" : "/register";
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Something went wrong");

      console.log("Success:", data);

      if (isLogin) {
        setIsOtpSent(true); // Show OTP input field
      } else {
        setIsLogin(true); // Switch to login page after signup
      }
    } catch (error) {
      setErrors({ apiError: error.message });
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (!formData.otp) {
      setErrors({ otp: "OTP is required" });
      return;
    }
  
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: formData.phoneNumber, otp: formData.otp }),
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Invalid OTP");
  
      console.log("✅ OTP Verified:", data);
  
      // Store userId separately
      localStorage.setItem("userId", data.user.userId);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
  
      console.log("Stored userId:", data.user.userId);
  
      // Fetch and restore the user's cart
      const cartResponse = await fetch(`https://pa-gebeya-backend.onrender.com/api/cart`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.token}`,
        },
      });
  
      if (cartResponse.ok) {
        const cartData = await cartResponse.json();
        localStorage.setItem("cart", JSON.stringify(cartData));
        console.log("🛒 Cart restored:", cartData);
      } else {
        console.log("⚠️ No cart data found.");
      }
  
      // Notify header that user is logged in
      window.dispatchEvent(new Event("storage"));
  
      // Redirect to home
      navigate("/");
    } catch (error) {
      setErrors({ otp: error.message });
    }
    setLoading(false);
  };
  

  return (
    <div style={styles.container} className="container">
      <div style={styles.formContainer} className="form-container">
        <img src={logoImage} alt="Logo" style={styles.logo} />
        <h2 style={styles.title}>{isLogin ? (isOtpSent ? "Enter OTP Sent to Your Email" : "Login") : "Sign Up"}</h2>

        <form style={styles.form} onSubmit={handleSubmit}>
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

          {!isOtpSent && (
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
              {errors.phoneNumber && <span style={styles.error}>{errors.phoneNumber}</span>}
            </div>
          )}

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
              {errors.password && <span style={styles.error}>{errors.password}</span>}
            </>
          )}

          {isOtpSent ? (
            <>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                placeholder="Enter OTP"
                style={styles.input}
                onChange={handleInputChange}
              />
              {errors.otp && <span style={styles.error}>{errors.otp}</span>}

              <button type="button" style={styles.button} onClick={handleVerifyOTP} disabled={loading}>
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </>
          ) : (
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "Processing..." : isLogin ? "Send OTP" : "Sign Up"}
            </button>
          )}
        </form>

        {errors.apiError && <p style={styles.error}>{errors.apiError}</p>}

        {!isOtpSent && (
          <p style={styles.switchText}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <span onClick={toggleAuthMode} style={styles.switchLink}>
              {isLogin ? "Sign Up" : "Login"}
            </span>
          </p>
        )}

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
    height: "100vh",
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  formContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    width: "100%",
    maxWidth: "400px",
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
  phoneContainer: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #ccc",
    borderRadius: "5px",
    padding: "10px",
    margin: "10px 0",
    backgroundColor: "#fff",
  },
  countryCode: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#000",
    marginRight: "10px",
    backgroundColor: "#f2f2f2",
    padding: "8px 12px",
    borderRadius: "5px",
  },
  input: {
    flex: 1,
    border: "1px solid #ccc",
    borderRadius: "5px",
    outline: "none",
    fontSize: "18px",
    padding: "10px",
    marginBottom: "10px", // Creates space between fields
    backgroundColor: "#fff",
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
  error: {
    color: "red",
    fontSize: "14px", // Increased size
    marginBottom: "5px", // Moves error message above the input field
    textAlign: "left",
    fontWeight: "bold",
  },
  homeLink: {
    display: "block",
    marginTop: "15px",
    color: "#333",
    textDecoration: "none",
    fontSize: "14px",
  },
};

export default AuthPage;
