import React, { useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"; // Importing React icons
import "../styles/slider.css"; // Assuming you have a CSS file for styling

// Importing images directly
import slider1 from "../images/assets/slider-1.png";
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
    slider1, slider2, slider3, slider4, slider5, slider6,
    slider7, slider8, slider9, slider10, slider11, slider12, 
  ];

  // Scroll to the previous slide
  const handlePrevClick = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollLeft -= 200; // Adjust scroll distance as needed
    }
  };

  // Scroll to the next slide
  const handleNextClick = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollLeft += 200; // Adjust scroll distance as needed
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
          {sliderImages.map((image, index) => (
            <div key={index} className="nav-slider-box">
              <img src={image} alt={`Slider ${index + 1}`} />
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
