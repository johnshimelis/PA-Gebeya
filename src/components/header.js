import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../components/CartContext"; // Import the cart context
import "../styles/style.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import flagImage from "../images/assets/Flag_of_Ethiopia.svg";
import logoImage from "../images/assets/PA-Logos.png";

const Header = () => {
  const navigate = useNavigate();
  const { cartItems } = useCart(); // Get cart items from context
  const totalItems = cartItems.length;

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
            <div className="nav-user text-nav">
              Sign In <i className="fas fa-user"></i>
            </div>
            <hr />
            <div className="nav-cart text-nav" onClick={() => navigate("/cart")}>
  Cart <i className="fas fa-shopping-cart"></i>
  {totalItems > 0 && (
    <span className="cart-count-badge">{totalItems}</span>
  )}
</div>

          </div>
        </div>
      </section>
    </>
  );
};

export default Header;
