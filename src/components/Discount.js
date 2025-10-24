import React, { useState, useEffect, useCallback } from "react";
import "../styles/discount.css";
import { useNavigate } from "react-router-dom";
import { useCart } from "../components/CartContext";
import { toast } from "react-toastify";
import axios from "axios";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import tiktokIcon from "../images/assets/tiktok.png";

const Discount = () => {
  const { addToCart, cartItems, setCartItems } = useCart();
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [shuffledDeals, setShuffledDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fisher-Yates shuffle algorithm
  const shuffleArray = useCallback((array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }, []);

  const fetchDiscountedProducts = useCallback(async () => {
    try {
      const response = await axios.get("https://pa-gebeya-backend.onrender.com/api/products/discounted");
      if (response.status !== 200) throw new Error("Failed to fetch products");
      
      const filteredDeals = response.data
        .filter(product => product.hasDiscount && product.discount > 0)
        .map(product => ({
          ...product,
          imageUrls: product.images?.map(img => img.url) || [],
          // TEMPORARY: Add videoLink for testing if it doesn't exist
          videoLink: product.videoLink || "https://tiktok.com" // Temporary test link
        }));
      
      console.log("Fetched deals:", filteredDeals); // Debug log
      setDeals(filteredDeals);
      setShuffledDeals(shuffleArray(filteredDeals));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [shuffleArray]);

  useEffect(() => {
    fetchDiscountedProducts();
    
    const shuffleInterval = setInterval(() => {
      setShuffledDeals(prev => shuffleArray(prev));
    }, 600000);
    
    const refreshInterval = setInterval(() => {
      fetchDiscountedProducts();
    }, 3600000);
    
    return () => {
      clearInterval(shuffleInterval);
      clearInterval(refreshInterval);
    };
  }, [fetchDiscountedProducts, shuffleArray]);

  useEffect(() => {
    if (deals.length > 0) {
      setShuffledDeals(shuffleArray(deals));
    }
  }, [deals, shuffleArray]);

  const formatSoldCount = (sold) => {
    const soldNumber = Number(sold);
    if (isNaN(soldNumber)) return "0 sold";

    if (soldNumber < 10) {
      return `${soldNumber} sold`;
    } else if (soldNumber >= 10 && soldNumber < 20) {
      return "10+ sold";
    } else if (soldNumber === 20) {
      return "20 sold";
    } else if (soldNumber > 20 && soldNumber < 30) {
      return "20+ sold";
    } else {
      return `${Math.floor(soldNumber / 10) * 10}+ sold`;
    }
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
    const productDetails = {
      ...deal,
      calculatedPrice: (deal.price - (deal.price * deal.discount) / 100).toFixed(2),
      originalPrice: deal.price.toFixed(2)
    };

    localStorage.setItem("currentProduct", JSON.stringify(productDetails));
    navigate("/product_detail", { state: { product: deal } });
  };

  const handleTikTokClick = (videoLink, e) => {
    e.stopPropagation();
    if (videoLink) {
      window.open(videoLink, "_blank");
    } else {
      toast.info("No TikTok video available for this product");
    }
  };

  if (loading) {
    return (
      <section className="discount-section">
        <h4 className="discount-title">Discount Deals</h4>
        <div className="discount-deals-main">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="discount-card">
              <div className="discount-card-img">
                <div className="skeleton-image"></div>
              </div>
              <div className="discount-card-content">
                <div className="skeleton-text" style={{width: '40%'}}></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text short"></div>
                <div className="skeleton-price"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) return <p>Error: {error}</p>;

  return (
    <section className="discount-section">
      <h4 className="discount-title">Discount Deals</h4>
      <div className="discount-deals-main">
        {shuffledDeals.map((deal) => {
          const calculatedPrice = (deal.price - (deal.price * deal.discount) / 100).toFixed(2);
          const originalPrice = deal.price.toFixed(2);

          return (
            <div 
              key={deal._id} 
              className="discount-card"
            >
              <div className="discount-card-img" onClick={() => handleProductClick(deal)}>
                {/* TikTok Icon - TEMPORARILY ALWAYS SHOW FOR TESTING */}
                <div
                  className="discount-tiktok-icon"
                  onClick={(e) => handleTikTokClick(deal.videoLink, e)}
                >
                  <img src={tiktokIcon} alt="TikTok" className="discount-tiktok-img" />
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
                  {deal.images?.length > 0 ? (
                    deal.images.map((image, index) => (
                      <div key={index} className="discount-carousel-image-container">
                        <img 
                          src={image.url} 
                          alt={`${deal.name} - ${index + 1}`} 
                          className="discount-carousel-image"
                          onError={(e) => {
                            e.target.src = '/default-product-image.jpg';
                            e.target.onerror = null;
                          }}
                          loading="lazy"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="discount-carousel-image-container">
                      <img 
                        src="/default-product-image.jpg" 
                        alt={deal.name} 
                        className="discount-carousel-image" 
                      />
                    </div>
                  )}
                </Carousel>
              </div>
              
              <div className="discount-card-content" onClick={() => handleProductClick(deal)}>
                <div className="discount-card-header">
                  <span className="discount-badge">🔥 {deal.discount}% OFF</span>
                </div>
                <div className="discount-product-name-container">
                  <span className="discount-product-name">{deal.name}</span>
                </div>
                <p className="discount-short-description">
                  {deal.shortDescription || "Premium quality product with excellent features."}
                </p>
                <div className="discount-card-rating">
                  <div className="discount-stars">
                    {renderRatingStars(deal.rating || 0)}
                  </div>
                  <span className="discount-rating-number">| {deal.rating?.toFixed(1) || 0}</span>
                  <span className="discount-sold-count">| {formatSoldCount(deal.sold)}</span>
                </div>
                <div className="discount-price-container">
                  <div className="discount-price-info">
                    <span className="discount-calculated-price">ETB {calculatedPrice}</span>
                    <span className="discount-original-price">ETB {originalPrice}</span>
                  </div>
                  <div className="discount-sold-info">{formatSoldCount(deal.sold)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Discount;