import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/carousel.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import carouselSecond1 from "../images/assets/carousel-second.png";
import carouselSecond2 from "../images/assets/carousel-second1.png";

const Carousel = () => {
  const [ads, setAds] = useState([]);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await axios.get("https://pa-gebeya-backend.onrender.com/api/ads/ads");
        setAds(response.data);
      } catch (error) {
        console.error("Error fetching ads:", error);
      }
    };

    fetchAds();
  }, []);

  return (
    <section>
      <div className="nav-carousel">
        {/* Main Carousel */}
        <div className="nav-carousel-1">
          <div
            id="carouselExampleIndicators"
            className="carousel slide"
            data-bs-ride="carousel"
            data-bs-interval="3000"
          >
            {/* Indicators */}
            <div className="carousel-indicators">
              {ads.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  data-bs-target="#carouselExampleIndicators"
                  data-bs-slide-to={index}
                  className={index === 0 ? "active" : ""}
                  aria-label={`Slide ${index + 1}`}
                  aria-current={index === 0 ? "true" : undefined}
                ></button>
              ))}
            </div>
            {/* Carousel Items */}
            <div className="carousel-inner">
              {ads.map((ad, index) => (
                <div key={ad._id} className={`carousel-item ${index === 0 ? "active" : ""}`}>
                  <img src={`https://pa-gebeya-backend.onrender.com/${ad.images[0]}`} className="d-block w-100" alt={`Ad ${index + 1}`} />
                </div>
              ))}
            </div>
            {/* Controls */}
            <button
              className="carousel-control-prev"
              type="button"
              data-bs-target="#carouselExampleIndicators"
              data-bs-slide="prev"
            >
              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Previous</span>
            </button>
            <button
              className="carousel-control-next"
              type="button"
              data-bs-target="#carouselExampleIndicators"
              data-bs-slide="next"
            >
              <span className="carousel-control-next-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Next</span>
            </button>
          </div>
        </div>
        {/* Secondary Images with Buttons */}
        <div className="nav-carousel-2">
          <div className="nav-carousel-img position-relative">
            <img src={carouselSecond1} alt="Secondary 1" />
            <button className="shop-btn shop-btn-left">
              Shop Men <span>&gt;</span>
            </button>
          </div>
          <div className="nav-carousel-img position-relative">
            <img src={carouselSecond2} alt="Secondary 2" />
            <button className="shop-btn shop-btn-right">
              <span>&lt;</span> Shop Women
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Carousel;
