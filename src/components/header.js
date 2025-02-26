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

  const dropdownRef = useRef(null);
  const userRef = useRef(null);

  // Function to safely decode JWT
  const decodeToken = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(atob(base64));
    } catch (error) {
      console.error("Invalid token:", error);
      return null;
    }
  };

  // Function to check if the user is still authenticated
  const checkUser = () => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      const parsedUser = JSON.parse(storedUser);
      const decodedToken = decodeToken(token);

      if (decodedToken) {
        const tokenExpiry = decodedToken.exp;
        const currentTime = Math.floor(Date.now() / 1000);

        if (tokenExpiry && tokenExpiry > currentTime) {
          setUser(parsedUser);
        } else {
          handleLogout();
        }
      } else {
        handleLogout();
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    checkUser(); // Check user immediately on mount

    const handleStorageChange = () => {
      checkUser();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      checkUser(); // Recheck user token every 60 seconds
    }, 60000);

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
    navigate("/auth");
  };

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
            <div className="nav-language">
              <i className="fas fa-globe"></i> Eng
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
                    <div className="logout" onClick={handleLogout}>
                      Logout
                    </div>
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
