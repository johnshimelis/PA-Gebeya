import React, { useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "../styles/slider.css";

// Importing images directly
import slider1 from "../images/assets/men.jpg";
import slider2 from "../images/assets/slider-2.png";
import slider3 from "../images/assets/slider-3.png";
import slider4 from "../images/assets/slider-4.png";
import slider5 from "../images/assets/slider-5.png";
import slider6 from "../images/assets/slider-6.png";
import slider7 from "../images/assets/slider-7.png";
import slider8 from "../images/assets/slider-8.png";
import slider9 from "../images/assets/slider-9.png";
import slider10 from "../images/assets/slider-10.png";
import slider11 from "../images/assets/slider-11.png";
import slider12 from "../images/assets/slider-12.png";
import slider13 from "../images/assets/slider-10.png";
import slider14 from "../images/assets/slider-11.png";
import slider15 from "../images/assets/slider-12.png";

const RoundSlider = () => {
  const sliderRef = useRef(null);

  // Image array
  const sliderImages = [
    { src: slider1, category: "ELECTRONICS" },
    { src: slider2, category: "Men" },
    { src: slider3, category: "Women" },
    { src: slider4, category: "Home " },
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
            <div key={index} className="nav-slider-box">
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
