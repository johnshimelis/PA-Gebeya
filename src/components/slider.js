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
    { src: slider1, category: "Category 1" },
    { src: slider2, category: "Category 2" },
    { src: slider3, category: "Category 3" },
    { src: slider4, category: "Category 4" },
    { src: slider5, category: "Category 5" },
    { src: slider6, category: "Category 6" },
    { src: slider7, category: "Category 7" },
    { src: slider8, category: "Category 8" },
    { src: slider9, category: "Category 9" },
    { src: slider10, category: "Category 10" },
    { src: slider11, category: "Category 11" },
    { src: slider12, category: "Category 12" },
    { src: slider13, category: "Category 13" },
    { src: slider14, category: "Category 14" },
    { src: slider15, category: "Category 15" },
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
