import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/nav.css";
import {
  FaChevronLeft,
  FaChevronRight,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import screenshotImage from "../images/assets/free-delivery1.png";
import axios from "axios";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollContainerRef = useRef(null);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const scrollLeft = () =>
    scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" });
  const scrollRight = () =>
    scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" });

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
    }
    return () =>
      container && container.removeEventListener("scroll", handleScroll);
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

          <div className="hamburger-menu">
            <button className="nav-skeleton-hamburger" disabled>
              <FaBars />
            </button>
          </div>

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
      <div className={`nav-second ${isMenuOpen ? "open" : ""}`}>
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

        <div className="hamburger-menu">
          <button onClick={toggleMenu}>
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

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