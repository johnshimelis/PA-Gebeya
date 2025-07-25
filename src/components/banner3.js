import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/carousel.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import * as bootstrap from "bootstrap";

// Make bootstrap globally accessible
window.bootstrap = bootstrap;

const Banner3 = () => {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await axios.get("https://pa-gebeya-backend.onrender.com/api/ads/banner1");
        
        // Filter banners with at least one image
        const filtered = response.data.filter((banner) => 
          banner.images?.length > 0 && banner.images[0]?.url
        );
        
        setBanners(filtered);

        // Initialize carousel with better timing handling
        const initializeCarousel = () => {
          const carouselElement = document.getElementById("carouselExampleIndicators");
          if (carouselElement && !carouselElement._carousel) {
            carouselElement._carousel = new window.bootstrap.Carousel(carouselElement, {
              interval: 3000,
              ride: "carousel",
              wrap: true
            });
          }
        };

        // Try initialization immediately and after a short delay
        initializeCarousel();
        const timeoutId = setTimeout(initializeCarousel, 500);
        
        return () => clearTimeout(timeoutId); // Cleanup
      } catch (error) {
        console.error("Error fetching banners:", error);
      }
    };

    fetchBanners();
  }, []);

  return (
    <section className="full-width-carousel-container1">
      <div 
        id="carouselExampleIndicators" 
        className="carousel slide h-100" 
        data-bs-ride="carousel"
      >
        {/* Indicators */}
        <div className="carousel-indicators">
          {banners.map((_, index) => (
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

        {/* Carousel Items */}
        <div className="carousel-inner h-100">
          {banners.map((banner, index) => (
            <div 
              key={banner._id} 
              className={`carousel-item h-100 ${index === 0 ? "active" : ""}`}
            >
              <img
                src={banner.images[0]?.url || "/default-banner.jpg"}
                className="d-block w-100 stretched-carousel-image"
                alt={`Banner ${index + 1}`}
                onError={(e) => {
                  e.target.src = "/default-banner.jpg";
                  console.error(`Failed to load banner image: ${banner.images[0]?.url}`);
                }}
                loading="lazy"
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
    </section>
  );
};

export default Banner3;
