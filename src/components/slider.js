import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "../styles/slider.css";
import axios from "axios"; // Import axios for API requests

const RoundSlider = () => {
  const navigate = useNavigate();
  const sliderRef = useRef(null);
  const [categories, setCategories] = useState([]); // State to store fetched categories
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  // Fetch categories from the API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("https://pa-gebeya-backend.onrender.com/api/categories");
        if (response.status === 200) {
          setCategories(response.data); // Set fetched categories
        } else {
          throw new Error("Failed to fetch categories");
        }
      } catch (error) {
        setError(error.message); // Set error message
      } finally {
        setLoading(false); // Set loading to false
      }
    };

    fetchCategories();
  }, []);

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
  const handleCategoryClick = (categoryId) => {
    const categoryPath = `/products/${categoryId}`;
    navigate(categoryPath);
  };

  if (loading) {
    return <div>Loading categories...</div>; // Show loading state
  }

  if (error) {
    return <div>Error: {error}</div>; // Show error state
  }

  return (
    <section>
      <div className="nav-slider">
        {/* Left Arrow */}
        <button className="nav-slider-button left" onClick={handlePrevClick}>
          <FaChevronLeft />
        </button>

        {/* Slider Boxes */}
        <div ref={sliderRef} className="slider-container">
          {categories.map((category, index) => (
            <div
              key={index}
              className="nav-slider-box"
              onClick={() => handleCategoryClick(category._id)} // Redirect on click
            >
              <img
                src={category.image || "https://via.placeholder.com/150"} // Use category image or placeholder
                alt={category.name}
              />
              <span>{category.name}</span>
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