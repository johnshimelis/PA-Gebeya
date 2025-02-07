import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "../styles/slider.css";

// Importing images directly
import slider1 from "../images/assets/mens.webp";
import slider2 from "../images/assets/electronics.jpg";
import slider3 from "../images/assets/womens.webp";
import slider4 from "../images/assets/homes.jpg";
import slider5 from "../images/assets/perfum.jpg";
import slider6 from "../images/assets/babys.png";
import slider7 from "../images/assets/toys.jpg";
import slider8 from "../images/assets/sports.jpg";
import slider9 from "../images/assets/best.webp";
import slider10 from "../images/assets/deal.png";
import slider11 from "../images/assets/mobiles.jpg";
import slider12 from "../images/assets/laptops.webp";
import slider13 from "../images/assets/tvs.avif";
import slider14 from "../images/assets/eyewear.jpg";
import slider15 from "../images/assets/gamings.jpg";

const RoundSlider = () => {
  const navigate = useNavigate();
  const sliderRef = useRef(null);

  // Image array
  const sliderImages = [

    { src: slider2, category: "Electronics" },
    { src: slider1, category: "Men" },
    { src: slider3, category: "Women" },
    { src: slider4, category: "Home" },
    { src: slider5, category: "Beauty and Fragrance" },
    { src: slider6, category: "Baby" },
    { src: slider7, category: "Toys" },
    { src: slider8, category: "Sports" },
    { src: slider9, category: "Best Sellers" },
    { src: slider10, category: "Deals" },
    { src: slider11, category: "Mobiles" },
    { src: slider12, category: "Laptops" },
    { src: slider13, category: "TV" },
    { src: slider14, category: "Eyewear" },
    { src: slider15, category: "Gaming" },
  ];

  // Scroll to the previous slide
  const handlePrevClick = () => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.firstChild.offsetWidth + 10; // Includes gap
      sliderRef.current.scrollBy({
        left: -scrollAmount, // Scroll by one category width
        behavior: "smooth",
      });
    }
  };

  // Scroll to the next slide
  const handleNextClick = () => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.firstChild.offsetWidth + 10; // Includes gap
      sliderRef.current.scrollBy({
        left: scrollAmount, // Scroll by one category width
        behavior: "smooth",
      });
    }
  };

  // Navigate to product page on category click
  const handleCategoryClick = (category) => {
    const categoryPath = `/products/${category.toLowerCase()}`;
    navigate(categoryPath);
  };

  return (
    <section>
      <div className="nav-slider">
        {/* Left Arrow */}
        <button className="nav-slider-button left" onClick={handlePrevClick}>
          <FaChevronLeft />
        </button>

        {/* Slider Boxes */}
        <div ref={sliderRef} className="slider-container">
          {sliderImages.map((item, index) => (
            <div
              key={index}
              className="nav-slider-box"
              onClick={() => handleCategoryClick(item.category)} // Redirect on click
            >
              <img src={item.src} alt={`Slider ${index + 1}`} />
              <span>{item.category}</span>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button className="nav-slider-button right" onClick={handleNextClick}>
          <FaChevronRight />
        </button>
      </div>
    </section>
  );
};

export default RoundSlider;
