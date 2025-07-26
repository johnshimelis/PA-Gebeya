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
  const [retryCount, setRetryCount] = useState(0);

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
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        "https://pa-gebeya-backend.onrender.com/api/products/discounted",
        {
          timeout: 10000,
          headers: {
            'Cache-Control': 'no-cache',
            'Accept': 'application/json'
          }
        }
      );

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("Invalid data format received from server");
      }

      const filteredDeals = response.data.filter(product => 
        product.hasDiscount && product.discount > 0
      ).map(product => ({
        ...product,
        imageUrls: product.imageUrls || (product.images?.map(img => img.url) || [],
        rating: Math.min(5, Math.max(0, Number(product.rating) || 0),
        sold: Math.max(0, Number(product.sold) || 0),
        price: Math.max(0, Number(product.price) || 0),
        discount: Math.min(100, Math.max(0, Number(product.discount) || 0))
      }));

      if (filteredDeals.length === 0) {
        throw new Error("No discounted products available");
      }

      setDeals(filteredDeals);
      setShuffledDeals(shuffleArray(filteredDeals));
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
      
      // Auto-retry logic
      if (retryCount < 3) {
        const retryDelay = Math.min(3000, 1000 * (2 ** retryCount));
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchDiscountedProducts();
        }, retryDelay);
      }
    } finally {
      setLoading(false);
    }
  }, [shuffleArray, retryCount]);

  useEffect(() => {
    fetchDiscountedProducts();
    
    const shuffleInterval = setInterval(() => {
      setShuffledDeals(prev => shuffleArray(prev));
    }, 600000); // 10 minutes
    
    const refreshInterval = setInterval(() => {
      fetchDiscountedProducts();
    }, 3600000); // 1 hour
    
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
    const soldNumber = Number(sold) || 0;
    if (soldNumber < 10) return `${soldNumber} sold`;
    if (soldNumber < 20) return "10+ sold";
    if (soldNumber < 50) return "20+ sold";
    if (soldNumber < 100) return "50+ sold";
    return "100+ sold";
  };

  const renderRatingStars = (rating) => {
    const numRating = Math.min(5, Math.max(0, Number(rating) || 0));
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 >= 0.5;
    
    return (
      <>
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="star filled">&#9733;</span>
        ))}
        {hasHalfStar && <span key="half" className="star half">&#9733;</span>}
        {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
          <span key={`empty-${i}`} className="star">&#9733;</span>
        ))}
      </>
    );
  };

  const handleProductClick = (deal) => {
    if (!deal?._id) {
      toast.error("Invalid product data");
      return;
    }

    const productDetails = {
      ...deal,
      calculatedPrice: (deal.price * (100 - deal.discount) / 100).toFixed(2),
      originalPrice: deal.price.toFixed(2)
    };

    localStorage.setItem("currentProduct", JSON.stringify(productDetails));
    navigate("/product_detail", { state: { product: productDetails } });
  };

  const handleAddToCart = async (product, e) => {
    e.stopPropagation();
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!userId || !token) {
      toast.error("Please log in to add items to cart");
      return;
    }

    try {
      const response = await axios.post(
        "https://pa-gebeya-backend.onrender.com/api/cart",
        {
          userId,
          productId: product._id,
          productName: product.name,
          price: product.price,
          discount: product.discount,
          quantity: 1,
          img: product.imageUrls?.[0] || ""
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          timeout: 5000
        }
      );

      if (response.status === 200) {
        toast.success(`${product.name} added to cart!`);
        const updatedCart = await axios.get(
          "https://pa-gebeya-backend.onrender.com/api/cart",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCartItems(updatedCart.data.items || []);
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error(error.response?.data?.message || "Failed to add to cart");
    }
  };

  const handleTikTokClick = (videoLink, e) => {
    e.stopPropagation();
    if (videoLink) {
      window.open(videoLink, "_blank", "noopener,noreferrer");
    }
  };

  if (loading && retryCount === 0) {
    return (
      <section className="discount-section">
        <h4>Discounted Products</h4>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading amazing deals...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="discount-section">
        <h4>Discounted Products</h4>
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>We're having trouble loading deals</h3>
          <p>{error}</p>
          <button 
            onClick={() => {
              setRetryCount(0);
              fetchDiscountedProducts();
            }}
            className="retry-button"
            disabled={loading}
          >
            {loading ? 'Retrying...' : 'Try Again'}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h4 style={{ margin: "60px 20px", textAlign: "left", fontSize: "35px", fontWeight: 1000 }}>
        Discount
      </h4>
      <div id="rec" className="nav-deals-main">
        {shuffledDeals.length > 0 ? (
          shuffledDeals.map((deal) => {
            const calculatedPrice = (deal.price * (100 - deal.discount) / 100).toFixed(2);
            const originalPrice = deal.price.toFixed(2);

            return (
              <div key={deal._id} className="nav-rec-cards" onClick={() => handleProductClick(deal)}>
                <div className="card-img">
                  {deal.videoLink && (
                    <div
                      className="tiktok-icon"
                      onClick={(e) => handleTikTokClick(deal.videoLink, e)}
                    >
                      <img src={tiktokIcon} alt="TikTok" className="tiktok-img" />
                    </div>
                  )}
                  <Carousel
                    showThumbs={false}
                    showStatus={false}
                    infiniteLoop={true}
                    autoPlay={true}
                    interval={3000}
                    stopOnHover={true}
                  >
                    {deal.imageUrls?.length > 0 ? (
                      deal.imageUrls.map((imageUrl, index) => (
                        <div key={index} className="carousel-image-container">
                          <img 
                            src={imageUrl} 
                            alt={`Product ${index}`} 
                            className="carousel-image"
                            onError={(e) => {
                              e.target.src = '/default-product-image.jpg';
                              e.target.onerror = null;
                            }}
                            loading="lazy"
                          />
                        </div>
                      ))
                    ) : (
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
                <div className="card-content">
                  <div className="card-header">
                    <span className="discount-tag">Discount</span>
                    <span className="product-name">{deal.name}</span>
                  </div>
                  <p className="short-description">
                    {deal.shortDescription || "No description available."}
                  </p>
                  <div className="card-rating">
                    <div className="stars">
                      {renderRatingStars(deal.rating)}
                    </div>
                    <span className="rating-number">| {deal.rating.toFixed(1)}</span>
                    <span className="sold-count">| {formatSoldCount(deal.sold)}</span>
                  </div>
                  <div className="card-pricing">
                    <span className="calculated-price">ETB {calculatedPrice}</span>
                    <span className="original-price">ETB {originalPrice}</span>
                    <span className="discount">{deal.discount}% OFF</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-products">
            <p>No discounted products available right now.</p>
            <button onClick={fetchDiscountedProducts}>Check Again</button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Discount;
