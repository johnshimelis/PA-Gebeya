import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/carousel.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap"; // Ensure Bootstrap JS is imported for carousel functionality

const Carousel2 = () => {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/ads/banner");
        setBanners(response.data);
      } catch (error) {
        console.error("Error fetching banners:", error);
      }
    };

    fetchBanners();
  }, []);

  return (
    <section style={{ padding: "7px" }}>
      <div id="carouselExampleIndicators" className="carousel slide" data-bs-ride="carousel">
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
              aria-current={index === 0 ? "true" : undefined}
            ></button>
          ))}
        </div>
        
        {/* Carousel Items */}
        <div className="carousel-inner">
          {banners.map((banner, index) => (
            <div key={banner._id} className={`carousel-item ${index === 0 ? "active" : ""}`}>
              <img src={`http://localhost:5000/${banner.images[0]}`} className="d-block w-100" alt={`Banner ${index + 1}`} />
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

export default Carousel2;
