import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/carousel1.css";
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
        
        // Initialize carousel after data loads
        const carouselElement = document.getElementById('carouselExampleIndicators');
        if (carouselElement) {
          new window.bootstrap.Carousel(carouselElement, {
            interval: 1000, // 1 second as in Carousel2
            ride: 'carousel'
          });
        }
      } catch (error) {
        console.error("Error fetching ads:", error);
      }
    };

    fetchAds();
  }, []);

  return (
    <section>
      <div className="nav-carousel">
        {/* Main Carousel - Updated to match Carousel2 */}
        <div className="nav-carousel-1">
          <div
            id="carouselExampleIndicators"
            className="carousel slide h-100"
            data-bs-ride="carousel"
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
                ></button>
              ))}
            </div>
            
            {/* Carousel Items - Updated to match Carousel2 */}
            <div className="carousel-inner h-100">
              {ads.map((ad, index) => (
                <div key={ad._id} className={`carousel-item h-100 ${index === 0 ? "active" : ""}`}>
                  <img 
                    src={ad.images[0]} 
                    className="d-block w-100 stretched-carousel-image" 
                    alt={`Ad ${index + 1}`}
                    onError={(e) => {
                      e.target.src = '/default-banner.jpg';
                    }}
                  />
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
        
        {/* Secondary Images with Buttons - Kept exactly the same */}
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