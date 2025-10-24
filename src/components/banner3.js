import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/carousel.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import * as bootstrap from "bootstrap";

window.bootstrap = bootstrap;

const Banner3 = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await axios.get("https://pa-gebeya-backend.onrender.com/api/ads/banner1");
        
        // Filter banners with at least one valid image URL
        const filtered = response.data.filter(banner => 
          banner.images?.length > 0 && banner.images[0]?.url
        );
        
        setBanners(filtered);

        // Initialize carousel
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

        initializeCarousel();
        const timeoutId = setTimeout(initializeCarousel, 500);
        
        return () => clearTimeout(timeoutId);
      } catch (error) {
        console.error("Error fetching banners:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Loading skeleton component
  const LoadingSkeleton = () => {
    return (
      <section className="full-width-carousel-container1">
        <div className="carousel-skeleton-wrapper">
          <div className="carousel-skeleton-image"></div>
          <div className="carousel-skeleton-indicators">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="carousel-skeleton-indicator"></div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

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