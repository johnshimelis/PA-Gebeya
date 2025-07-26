on this code
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
  const { setCartItems } = useCart();
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [shuffledDeals, setShuffledDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Enhanced shuffle function with Fisher-Yates algorithm
  const shuffleArray = useCallback((array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }, []);

  // Robust data fetching with retry logic
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

      // Data normalization and validation
      const validProducts = response.data
        .map(product => {
          try {
            return {
              ...product,
              _id: product._id || Math.random().toString(36).substring(2, 11),
              imageUrls: product.imageUrls || 
                        (product.images?.map(img => img.url) || []),
              rating: Math.min(5, Math.max(0, Number(product.rating) || 0)),
              sold: Math.max(0, Number(product.sold) || 0),
              price: Math.max(0, Number(product.price) || 0),
              discount: Math.min(100, Math.max(0, Number(product.discount) || 0),
              hasDiscount: Boolean(product.hasDiscount),
              shortDescription: product.shortDescription || "No description available",
              category: product.category || { _id: null, name: "Uncategorized" }
            };
          } catch (e) {
            console.error("Error processing product:", product, e);
            return null;
          }
        })
        .filter(Boolean);

      if (validProducts.length === 0) {
        throw new Error("No valid discounted products found");
      }

      setDeals(validProducts);
      setShuffledDeals(shuffleArray(validProducts));
    } catch (err) {
      console.error("Fetch error details:", {
        error: err,
        response: err.response?.data,
        config: err.config
      });

      let errorMessage = "Failed to load discounted products";
      if (err.response) {
        errorMessage += ` (Status: ${err.response.status})`;
        if (err.response.data?.message) {
          errorMessage += `: ${err.response.data.message}`;
        }
      } else if (err.code === "ECONNABORTED") {
        errorMessage = "Request timed out. Please check your connection";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      
      // Auto-retry logic (max 3 retries)
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

    const refreshInterval = setInterval(() => {
      setRetryCount(0);
      fetchDiscountedProducts();
    }, 3600000); // Refresh every hour

    return () => clearInterval(refreshInterval);
  }, [fetchDiscountedProducts]);

  useEffect(() => {
    if (deals.length > 0) {
      setShuffledDeals(shuffleArray(deals));
    }
  }, [deals, shuffleArray]);

  // Helper functions with validation
  const formatSoldCount = (sold) => {
    const num = Math.max(0, Number(sold) || 0);
    if (num < 10) return `${num} sold`;
    if (num < 20) return "10+ sold";
    if (num < 50) return "20+ sold";
    if (num < 100) return "50+ sold";
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

  const handleProductClick = (product) => {
    if (!product?._id) {
      console.error("Invalid product data:", product);
      toast.error("Cannot view this product");
      return;
    }

    const productDetails = {
      ...product,
      calculatedPrice: (product.price * (100 - product.discount) / 100).toFixed(2),
      originalPrice: product.price.toFixed(2),
      status: "Discounted"
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
    } catch (err) {
      console.error("Add to cart error:", err);
      toast.error(err.response?.data?.message || "Failed to add to cart");
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
          {retryCount > 0 && (
            <p className="retry-count">Attempt {retryCount + 1} of 3</p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="discount-section">
      <h4>Discounted Products</h4>
      
      {shuffledDeals.length > 0 ? (
        <div className="products-grid">
          {shuffledDeals.map((deal) => {
            const calculatedPrice = (deal.price * (100 - deal.discount) / 100).toFixed(2);
            const originalPrice = deal.price.toFixed(2);

            return (
              <div key={deal._id} className="product-card">
                <div className="image-container" onClick={() => handleProductClick(deal)}>
                  {deal.videoLink && (
                    <div 
                      className="tiktok-badge"
                      onClick={(e) => handleTikTokClick(deal.videoLink, e)}
                      title="View TikTok video"
                    >
                      <img src={tiktokIcon} alt="TikTok" />
                    </div>
                  )}
                  
                  <Carousel
                    showThumbs={false}
                    showStatus={false}
                    infiniteLoop={true}
                    autoPlay={true}
                    interval={5000}
                    stopOnHover={true}
                    showArrows={deal.imageUrls?.length > 1}
                    showIndicators={deal.imageUrls?.length > 1}
                    dynamicHeight={true}
                  >
                    {deal.imageUrls?.length > 0 ? (
                      deal.imageUrls.map((url, index) => (
                        <div key={index} className="carousel-slide">
                          <img
                            src={url}
                            alt={`${deal.name} - ${index + 1}`}
                            onError={(e) => {
                              e.target.src = '/default-product-image.jpg';
                              e.target.onerror = null;
                            }}
                            loading="lazy"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="carousel-slide">
                        <img 
                          src="/default-product-image.jpg" 
                          alt={deal.name} 
                        />
                      </div>
                    )}
                  </Carousel>
                </div>

                <div className="product-info">
                  <div className="discount-badge">
                    {deal.discount}% OFF
                  </div>
                  <h3 onClick={() => handleProductClick(deal)}>{deal.name}</h3>
                  <p className="description">{deal.shortDescription}</p>
                  
                  <div className="rating-container">
                    {renderRatingStars(deal.rating)}
                    <span className="rating-value">{deal.rating.toFixed(1)}</span>
                    <span className="sold-count">{formatSoldCount(deal.sold)}</span>
                  </div>

                  <div className="price-container">
                    <span className="current-price">ETB {calculatedPrice}</span>
                    <span className="original-price">ETB {originalPrice}</span>
                  </div>

              
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="no-products">
          <p>No discounted products available right now.</p>
          <button onClick={fetchDiscountedProducts}>Check Again</button>
        </div>
      )}
    </section>
  );
};

export default Discount;
