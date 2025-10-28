import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/nav.css";
import {
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import screenshotImage from "../images/assets/free-delivery1.png";
import axios from "axios";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const scrollContainerRef = useRef(null);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = isMobile ? 150 : 200;
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = isMobile ? 150 : 200;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Fetch categories from the API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "https://pa-gebeya-backend.onrender.com/api/categories"
        );
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

  // Handle scroll visibility for arrows
  useEffect(() => {
    const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const containerScrollLeft = container.scrollLeft;
      const containerWidth = container.clientWidth;
      const containerScrollWidth = container.scrollWidth;

      setShowLeftArrow(containerScrollLeft > 0);
      setShowRightArrow(
        containerScrollLeft + containerWidth < containerScrollWidth - 1
      );
    };

    const container = scrollContainerRef.current;
    if (container) {
      handleScroll();
      container.addEventListener("scroll", handleScroll);
      // Also check on resize
      window.addEventListener('resize', handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // Handle touch events for better mobile interaction
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let startX;
    let scrollLeft;

    const handleTouchStart = (e) => {
      startX = e.touches[0].pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    };

    const handleTouchMove = (e) => {
      if (!startX) return;
      const x = e.touches[0].pageX - container.offsetLeft;
      const walk = (x - startX) * 2; // Scroll speed multiplier
      container.scrollLeft = scrollLeft - walk;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Loading skeleton component
  const LoadingSkeleton = () => {
    return (
      <section>
        <div className="nav-second">
          {/* Left Arrow Skeleton */}
          <button className="scroll-btn left nav-skeleton-arrow" disabled>
            <FaChevronLeft />
          </button>

          <div className="scrollable-wrapper">
            <ul ref={scrollContainerRef}>
              {[...Array(8)].map((_, index) => (
                <li key={index} className="nav-skeleton-item">
                  <div className="nav-skeleton-text"></div>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Arrow Skeleton */}
          <button className="scroll-btn right nav-skeleton-arrow" disabled>
            <FaChevronRight />
          </button>

          <div className="fixed-img">
            <div className="nav-skeleton-image"></div>
          </div>
        </div>
      </section>
    );
  };

  if (loading) return <LoadingSkeleton />;
  if (error) return <div className="nav-error">Error: {error}</div>;

  return (
    <section>
      <div className="nav-second">
        {showLeftArrow && (
          <button className="scroll-btn left" onClick={scrollLeft}>
            <FaChevronLeft />
          </button>
        )}

        <div className="scrollable-wrapper">
          <ul ref={scrollContainerRef}>
            {categories.map((category, index) => {
              const categoryPath = `/products/${category._id}`;
              const isActive = location.pathname === categoryPath;

              return (
                <li
                  key={category._id}
                  className={isActive ? "active-category" : ""}
                  onClick={() => {
                    navigate(categoryPath, {
                      state: {
                        categoryId: category._id,
                        categoryName: category.name,
                      },
                    });
                  }}
                >
                  {category.name}
                </li>
              );
            })}
          </ul>
        </div>

        {showRightArrow && (
          <button className="scroll-btn right" onClick={scrollRight}>
            <FaChevronRight />
          </button>
        )}

        <div className="fixed-img">
          <img
            src={screenshotImage}
            alt="Screenshot"
            className="nav-img-li"
          />
        </div>
      </div>
    </section>
  );
};

export default Navbar;