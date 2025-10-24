import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "../styles/slider.css";
import axios from "axios";

const RoundSlider = () => {
  const navigate = useNavigate();
  const sliderRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Fetch categories from the API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("https://pa-gebeya-backend.onrender.com/api/categories");
        if (response.status === 200) {
          setCategories(response.data);
        } else {
          throw new Error("Failed to fetch categories");
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Check scroll position to enable/disable arrows
  const checkScrollPosition = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    // Scroll to very left on initial load
    if (sliderRef.current) {
      sliderRef.current.scrollLeft = 0;
    }
    
    checkScrollPosition();
    window.addEventListener('resize', checkScrollPosition);
    
    return () => {
      window.removeEventListener('resize', checkScrollPosition);
    };
  }, [categories, loading]);

  // Scroll to the previous slide
  const handlePrevClick = () => {
    if (sliderRef.current && canScrollLeft) {
      const scrollAmount = sliderRef.current.firstChild?.offsetWidth + 10 || 120;
      sliderRef.current.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScrollPosition, 300);
    }
  };

  // Scroll to the next slide
  const handleNextClick = () => {
    if (sliderRef.current && canScrollRight) {
      const scrollAmount = sliderRef.current.firstChild?.offsetWidth + 10 || 120;
      sliderRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScrollPosition, 300);
    }
  };

  // Navigate to product page on category click
  const handleCategoryClick = (categoryId, categoryName) => {
    const categoryPath = `/products/${categoryId}`;
    navigate(categoryPath, { state: { categoryName } });
  };

  // Loading skeleton component
  const LoadingSkeleton = () => {
    return (
      <div className="round-nav-slider">
        {/* Left Arrow Skeleton */}
        <button className="round-nav-slider-button left round-skeleton-arrow" disabled>
          <FaChevronLeft />
        </button>

        {/* Slider Boxes Skeleton */}
        <div className="round-slider-container">
          {/* First item starts from very left */}
          {[...Array(12)].map((_, index) => (
            <div key={index} className="round-nav-slider-box round-skeleton-box">
              <div className="round-skeleton-image"></div>
              <div className="round-skeleton-text"></div>
            </div>
          ))}
        </div>

        {/* Right Arrow Skeleton */}
        <button className="round-nav-slider-button right round-skeleton-arrow" disabled>
          <FaChevronRight />
        </button>
      </div>
    );
  };

  if (error) {
    return (
      <section className="round-slider-section">
        <div className="round-slider-error">
          <p>⚠️ Failed to load categories. Please try again later.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="round-slider-section">
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="round-nav-slider">
          {/* Left Arrow */}
          <button 
            className={`round-nav-slider-button left ${!canScrollLeft ? 'round-disabled' : ''}`} 
            onClick={handlePrevClick}
            disabled={!canScrollLeft}
            aria-label="Previous categories"
          >
            <FaChevronLeft />
          </button>

          {/* Slider Boxes - Starts from very left */}
          <div 
            ref={sliderRef} 
            className="round-slider-container"
            onScroll={checkScrollPosition}
          >
            {categories.map((category, index) => (
              <div
                key={category._id || index}
                className="round-nav-slider-box"
                onClick={() => handleCategoryClick(category._id, category.name)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleCategoryClick(category._id, category.name);
                  }
                }}
                aria-label={`Browse ${category.name} products`}
                style={index === 0 ? { marginLeft: '0px' } : {}}
              >
                <div className="round-category-image-container">
                  <img
                    src={category.image || "https://via.placeholder.com/150"}
                    alt={category.name}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/150/cccccc/969696?text=No+Image";
                    }}
                  />
                  <div className="round-category-overlay"></div>
                </div>
                <span className="round-category-name">{category.name}</span>
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          <button 
            className={`round-nav-slider-button right ${!canScrollRight ? 'round-disabled' : ''}`} 
            onClick={handleNextClick}
            disabled={!canScrollRight}
            aria-label="Next categories"
          >
            <FaChevronRight />
          </button>
        </div>
      )}
    </section>
  );
};

export default RoundSlider;