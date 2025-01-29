import React from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom
import "../styles/style.css";
import "@fortawesome/fontawesome-free/css/all.min.css"; // Import Font Awesome from local package
import flagImage from "../images/assets/Flag_of_Ethiopia.svg"; // Import your flag image
import logoImage from "../images/assets/PA-Logos.png"; // Import your logo image
// import dropdownImage from "../images/assets/down.png"; // Import your dropdown image

const Header = () => {
  const navigate = useNavigate(); // Initialize the useNavigate hook

  return (
    <>
      <Helmet>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Navbar</title>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
          integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fira+Sans&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      {/* NAVBAR */}
      <section className="justify-content-center align-items-center d-flex">
        <div className="navbar" id="nav">
          <div className="nav-logo" onClick={() => navigate("/")}> {/* On logo click, navigate to home page */}
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
              <i className="fas fa-globe"></i> Eng {/* Added language icon */}
            </div>
            <hr />
            <div className="nav-user text-nav">
              Sign In <i className="fas fa-user"></i> {/* Solid icon for user */}
            </div>
            <hr />
            <div className="nav-cart text-nav">
              Cart <i className="fas fa-shopping-cart"></i> {/* Solid icon for shopping cart */}
            </div>
          </div>
        </div>
      </section>
      {/* NAVBAR END */}
    </>
  );
};

export default Header;
