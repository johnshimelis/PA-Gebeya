import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/carousel.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";

const Banner3 = () => {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await axios.get("https://pa-gebeya-backend.onrender.com/api/ads/banner1");
        setBanners(response.data);
        
        // Initialize carousel after data loads
        const carouselElement = document.getElementById('carouselExampleIndicators');
        if (carouselElement) {
          new window.bootstrap.Carousel(carouselElement, {
            interval: 1000, // 1 seconds
            ride: 'carousel'
          });
        }
      } catch (error) {
        console.error("Error fetching banners:", error);
      }
    };

    fetchBanners();
  }, []);

  return (
    <section className="full-width-carousel-container1">
      <div id="carouselExampleIndicators" className="carousel slide h-100" data-bs-ride="carousel">
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
            <div key={banner._id} className={`carousel-item h-100 ${index === 0 ? "active" : ""}`}>
              <img 
                src={banner.images[0]} 
                className="d-block w-100 stretched-carousel-image" 
                alt={`Banner ${index + 1}`}
                onError={(e) => {
                  e.target.src = '/default-banner.jpg';
                }}
              />
            </div>
          ))}
        </div>
        
        {/* Controls */}
        <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>
    </section>
  );
};

export default Banner3;