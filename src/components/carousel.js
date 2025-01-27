import React from "react";
import "../styles/carousel.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import carousel1 from "../images/assets/carousel-1.png";
import carousel2 from "../images/assets/carousel-2.png";
import carousel3 from "../images/assets/carousel-3.jpg";
import carousel4 from "../images/assets/carousel-4.png";
import carousel5 from "../images/assets/carousel-5.png";
import carousel6 from "../images/assets/carousel-6.png";
import carousel7 from "../images/assets/carousel-7.gif";
import carousel8 from "../images/assets/carousel-8.jpg";
import carouselSecond1 from "../images/assets/carousel-second.png";
import carouselSecond2 from "../images/assets/carousel-second1.png";

const Carousel = () => {
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
              {Array(8)
                .fill()
                .map((_, index) => (
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
              {[carousel1, carousel2, carousel3, carousel4, carousel5, carousel6, carousel7, carousel8].map(
                (image, index) => (
                  <div
                    key={index}
                    className={`carousel-item ${index === 0 ? "active" : ""}`}
                  >
                    <img src={image} className="d-block w-100" alt={`Slide ${index + 1}`} />
                  </div>
                )
              )}
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
