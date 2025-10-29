import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/carousel1.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import carouselSecond1 from "../images/assets/carousel-second.png";
import carouselSecond2 from "../images/assets/carousel-second1.png";

const Carousel = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await axios.get("https://pa-gebeya-backend.onrender.com/api/ads/ads");
        setAds(response.data);
        
        // Initialize carousel after data loads
        setTimeout(() => {
          const carouselElement = document.getElementById('carouselExampleIndicators');
          if (carouselElement) {
            new window.bootstrap.Carousel(carouselElement, {
              interval: 3000,
              ride: 'carousel'
            });
          }
        }, 100);
      } catch (error) {
        console.error("Error fetching ads:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  // Loading skeleton component
  const LoadingSkeleton = () => {
    return (
      <div className="nav-carousel">
        <div className="nav-carousel-1">
          <div className="carousel-skeleton-container">
            <div className="carousel-skeleton-main">
              <div className="carousel-skeleton-image"></div>
              <div className="carousel-skeleton-indicators">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="carousel-skeleton-indicator"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="nav-carousel-2">
          <div className="nav-carousel-img position-relative">
            <div className="carousel-skeleton-secondary"></div>
            <div className="carousel-skeleton-btn carousel-skeleton-btn-left"></div>
          </div>
          <div className="nav-carousel-img position-relative">
            <div className="carousel-skeleton-secondary"></div>
            <div className="carousel-skeleton-btn carousel-skeleton-btn-right"></div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <section>
      <div className="nav-carousel">
        <div className="nav-carousel-1">
          <div
            id="carouselExampleIndicators"
            className="carousel slide h-100"
            data-bs-ride="carousel"
          >
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
            
            <div className="carousel-inner h-100">
              {ads.map((ad, index) => (
                <div key={ad._id} className={`carousel-item h-100 ${index === 0 ? "active" : ""}`}>
                  <img 
                    src={ad.images[0]?.url || '/default-banner.jpg'} 
                    className="d-block w-100 stretched-carousel-image" 
                    alt={`Ad ${index + 1}`}
                    onError={(e) => {
                      e.target.src = '/default-banner.jpg';
                    }}
                  />
                </div>
              ))}
            </div>
            
            <button
              className="carousel-control-prev centered-carousel-control"
              type="button"
              data-bs-target="#carouselExampleIndicators"
              data-bs-slide="prev"
            >
              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Previous</span>
            </button>
            <button
              className="carousel-control-next centered-carousel-control"
              type="button"
              data-bs-target="#carouselExampleIndicators"
              data-bs-slide="next"
            >
              <span className="carousel-control-next-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Next</span>
            </button>
          </div>
        </div>
        
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