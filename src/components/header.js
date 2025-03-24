import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../components/CartContext"; // Import useCart hook
import "../styles/header.css";
import "../styles/style.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import flagImage from "../images/assets/Flag_of_Ethiopia.svg";
import logoImage from "../images/assets/PA-Logos.png";
import { createPortal } from "react-dom";

const Header = () => {
  const navigate = useNavigate();
  const { cartItems, fetchCartItems, clearCart } = useCart();
  const totalItems = cartItems ? cartItems.length : 0;

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [isLanguageDropdownVisible, setLanguageDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);
  const userRef = useRef(null);
  const languageRef = useRef(null);

  // Function to decode JWT safely
  const decodeToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1])); // Decode payload
      return payload;
    } catch (error) {
      console.error("Invalid token:", error);
      return null;
    }
  };

  // Function to check user status and token expiration
  const checkUser = () => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      const parsedUser = JSON.parse(storedUser);
      const decodedToken = decodeToken(token);
      
      if (decodedToken) {
        const tokenExpiry = decodedToken.exp;
        const currentTime = Math.floor(Date.now() / 1000);

        if (tokenExpiry && tokenExpiry < currentTime) {
          handleLogout(); // Token expired, logout the user
        } else {
          setUser(parsedUser); // Valid token, user is logged in
        }
      } else {
        handleLogout(); // Invalid token, logout the user
      }
    } else {
      setUser(null); // No user, logout
    }
  };

  useEffect(() => {
    checkUser(); // Check user status on component mount

    const handleStorageChange = () => {
      checkUser(); // Recheck on localStorage change (e.g., token expiry)
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem("token");
      if (token) {
        const decodedToken = decodeToken(token);
        const tokenExpiry = decodedToken?.exp;
        const currentTime = Math.floor(Date.now() / 1000);

        if (tokenExpiry && tokenExpiry < currentTime) {
          handleLogout(); // Token expired, logout user
        }
      }
    }, 60000); // Check every 60 seconds for token expiry

    return () => clearInterval(interval);
  }, []);

  // Fetch cart items when user logs in
  useEffect(() => {
    if (user) { 
      fetchCartItems();
    } else {
      clearCart();
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    clearCart();
    setUser(null);
    console.log("Logging out, redirecting to /auth");
    navigate("/auth"); // Redirect to /auth
  };

  const toggleLanguageDropdown = () => {
    setLanguageDropdownVisible(!isLanguageDropdownVisible);
  };

  const handleClickOutside = (event) => {
    if (languageRef.current && !languageRef.current.contains(event.target)) {
      setLanguageDropdownVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <section className="justify-content-center align-items-center d-flex">
        <div className="navbar" id="nav">
          <div className="nav-logo" onClick={() => navigate("/")}>
            <img src={logoImage} alt="Logo" />
          </div>
          <div className="nav-location">
            <div className="nav-location-icon">
              <img src={flagImage} alt="ETH" />
            </div>
          </div>
          <div className="nav-search text-nav">
            <form>
              <input type="text" placeholder="What are you looking for?" />
            </form>
          </div>
          <div className="nav-bar-lang me-4 d-flex justify-content-center align-items-center">
            <div 
              ref={languageRef}
              className="nav-language" 
              onClick={toggleLanguageDropdown}
              style={{ cursor: "pointer", position: "relative" }}
            >
              <i className="fas fa-globe"></i> Language
              {isLanguageDropdownVisible && (
                <div className="language-dropdown-menu">
                  <div className="language-option">
                    <span className="language-code">GB</span>
                    <span className="language-name">English</span>
                  </div>
                  <div className="language-option">
                    <span className="language-code">ET</span>
                    <span className="language-name">አማርኛ</span>
                  </div>
                </div>
              )}
            </div>
            <hr />
            {user ? (
              <div
                ref={userRef}
                className="nav-user text-nav user-dropdown"
                onMouseEnter={() => dropdownRef.current?.classList.add("visible")}
                onMouseLeave={() => dropdownRef.current?.classList.remove("visible")}
              >
                <span style={{ cursor: "pointer" }}>
                  Welcome, {user.fullName} <i className="fas fa-user"></i>
                </span>
                {createPortal(
                  <div className="dropdown-menu" ref={dropdownRef}>
                    <div onClick={() => navigate("/profile")}>Profile</div>
                    <div onClick={() => navigate("/notifications")}>Notifications</div>
                    <div onClick={() => navigate("/messages")}>Messages</div>
                    <div onClick={() => navigate("/orders")}>Orders</div>
                    <hr />
                    <div className="logout" onClick={handleLogout}>Logout</div>
                  </div>,
                  document.body
                )}
              </div>
            ) : (
              <span
                className="nav-user text-nav"
                onClick={() => navigate("/auth")}
                style={{ cursor: "pointer" }}
              >
                Sign In
              </span>
            )}
            <hr />
            <div className="nav-cart text-nav" onClick={() => navigate("/cart")}>
              Cart <i className="fas fa-shopping-cart"></i>
              {totalItems > 0 && <span className="cart-count-badge">{totalItems}</span>}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Header;