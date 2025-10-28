import React, { useState, useEffect, useCallback } from "react";
import "../styles/recommended.css";
import { useNavigate } from "react-router-dom";
import { useCart } from "../components/CartContext";
import { toast } from "react-toastify";
import axios from "axios";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import tiktokIcon from "../images/assets/tiktok.png";

const RecommendedDeals = () => {
  const { addToCart, cartItems, setCartItems } = useCart();
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [shuffledDeals, setShuffledDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on component mount and resize
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

  // Fisher-Yates shuffle algorithm
  const shuffleArray = useCallback((array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("https://pa-gebeya-backend.onrender.com/api/products");
      const nonDiscountedProducts = response.data.filter(product => !product.discount);
      setDeals(nonDiscountedProducts);
      setShuffledDeals(shuffleArray(nonDiscountedProducts));
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [shuffleArray]);

  useEffect(() => {
    fetchProducts();
    
    const shuffleInterval = setInterval(() => {
      setShuffledDeals(prev => shuffleArray(prev));
    }, 600000);
    
    const refreshInterval = setInterval(() => {
      fetchProducts();
    }, 3600000);
    
    return () => {
      clearInterval(shuffleInterval);
      clearInterval(refreshInterval);
    };
  }, [fetchProducts, shuffleArray]);

  useEffect(() => {
    if (deals.length > 0) {
      setShuffledDeals(shuffleArray(deals));
    }
  }, [deals, shuffleArray]);

  const formatSoldCount = (sold) => {
    if (sold < 10) return `${sold} sold`;
    if (sold >= 10 && sold < 20) return "10+ sold";
    if (sold === 20) return "20 sold";
    if (sold > 20 && sold < 30) return "20+ sold";
    return `${Math.floor(sold / 10) * 10}+ sold`;
  };

  const renderRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">&#9733;</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">&#9733;</span>);
    }

    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star">&#9733;</span>);
    }

    return stars;
  };

  const handleProductClick = (deal) => {
    const productWithStatus = {
      ...deal,
      status: "Recommended",
      categoryId: deal.category?._id || null,
      categoryName: deal.category?.name || "Uncategorized"
    };

    localStorage.setItem("currentProduct", JSON.stringify(productWithStatus));
    
    navigate("/product_detail", { 
      state: { 
        product: productWithStatus,
        fromRecommendations: true
      } 
    });
  };

  const handleTikTokClick = (videoLink, e) => {
    e.stopPropagation();
    if (videoLink) {
      window.open(videoLink, "_blank");
    } else {
      toast.info("No TikTok video available for this product");
    }
  };

  const handleCardHover = (cardId) => {
    if (!isMobile) {
      setHoveredCard(cardId);
    }
  };

  const handleCardLeave = () => {
    if (!isMobile) {
      setHoveredCard(null);
    }
  };

  const handleTouchStart = (cardId) => {
    if (isMobile) {
      setHoveredCard(cardId);
    }
  };

  const handleTouchEnd = () => {
    if (isMobile) {
      setTimeout(() => setHoveredCard(null), 300);
    }
  };

  if (loading) {
    return (
      <section className="recommended-section">
        <h4 style={{ 
          margin: "30px 25px 20px", /* Reduced top margin from 50px to 30px, added bottom margin */
          textAlign: "left", 
          fontSize: "28px", /* Reduced from 32px to 28px */
          fontWeight: 800,
          background: "linear-gradient(135deg, #667eea, #764ba2)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          Recommended for you
        </h4>
        <div className="recommended-container">
          <div className="nav-deals-main">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="nav-rec-cards">
                <div className="card-img">
                  <div className="skeleton-image"></div>
                </div>
                <div className="card-content">
                  <div className="skeleton-text" style={{width: '40%'}}></div>
                  <div className="skeleton-text"></div>
                  <div className="skeleton-text short"></div>
                  <div className="skeleton-price"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="recommended-section">
      <h4 style={{ 
        margin: "30px 25px 20px", /* Reduced top margin from 50px to 30px, added bottom margin */
        textAlign: "left", 
        fontSize: "28px", /* Reduced from 32px to 28px */
        fontWeight: 800,
        background: "linear-gradient(135deg, #667eea, #764ba2)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent"
      }}>
        Recommended for you
      </h4>
      <div className="recommended-container">
        <div id="rec" className="nav-deals-main">
          {shuffledDeals.map((deal) => (
            <div 
              key={deal._id} 
              className="nav-rec-cards"
              onMouseEnter={() => handleCardHover(deal._id)}
              onMouseLeave={handleCardLeave}
              onTouchStart={() => handleTouchStart(deal._id)}
              onTouchEnd={handleTouchEnd}
            >
              <div className="card-img" onClick={() => handleProductClick(deal)}>
                <div className="image-overlay"></div>
                
                <div className="tiktok-icon-container">
                  <div
                    className="tiktok-icon"
                    onClick={(e) => handleTikTokClick(deal.videoLink, e)}
                  >
                    <img src={tiktokIcon} alt="TikTok" className="tiktok-img" />
                  </div>
                </div>
                
                <Carousel
                  showThumbs={false}
                  showStatus={false}
                  infiniteLoop={true}
                  autoPlay={true}
                  interval={4000}
                  stopOnHover={true}
                  showArrows={false}
                  dynamicHeight={false}
                  emulateTouch={true}
                  swipeable={true}
                  transitionTime={500}
                >
                  {deal.imageUrls?.map((imageUrl, index) => (
                    <div key={index} className="carousel-image-container">
                      <img 
                        src={imageUrl} 
                        alt={`${deal.name} ${index + 1}`} 
                        className="carousel-image"
                        onError={(e) => {
                          e.target.src = '/default-product-image.jpg';
                        }}
                      />
                    </div>
                  )) || (
                    <div className="carousel-image-container">
                      <img 
                        src="/default-product-image.jpg" 
                        alt={deal.name} 
                        className="carousel-image" 
                      />
                    </div>
                  )}
                </Carousel>
              </div>
              
              <div className="card-content" onClick={() => handleProductClick(deal)}>
                <div className="card-header">
                  <span className="best-seller-tags">🔥 Recommended</span>
                </div>
                <div className="deal-name-container">
                  <span className="product-name">{deal.name}</span>
                </div>
                <p className="short-description">
                  {deal.shortDescription || "Premium quality product with excellent features and customer satisfaction guarantee."}
                </p>
                <div className="card-rating">
                  <div className="stars">
                    {renderRatingStars(deal.rating || 0)}
                  </div>
                  <span className="rating-number">| {deal.rating?.toFixed(1) || 0}</span>
                  <span className="sold-count">| {formatSoldCount(deal.sold || 0)}</span>
                </div>
                <div className="price-sold-container">
                  <div className="card-price">ETB {deal.price?.toFixed(2)}</div>
                  <div className="sold-info">{formatSoldCount(deal.sold || 0)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecommendedDeals;