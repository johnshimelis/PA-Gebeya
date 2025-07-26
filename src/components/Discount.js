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

      // Process products to ensure consistent structure
      const processedDeals = response.data
        .filter(product => product.hasDiscount && product.discount > 0)
        .map(product => ({
          ...product,
          // Create imageUrls array from images array if it exists
          imageUrls: product.images?.map(img => img.url) || []
        }));

      setDeals(processedDeals);
      setShuffledDeals(shuffleArray(processedDeals));
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [shuffleArray]);

  useEffect(() => {
    fetchDiscountedProducts();
    
    // Set up interval to shuffle every 10 minutes
    const shuffleInterval = setInterval(() => {
      setShuffledDeals(prev => shuffleArray(prev));
    }, 600000);
    
    // Set up interval to refresh data every hour
    const refreshInterval = setInterval(() => {
      fetchDiscountedProducts();
    }, 3600000);
    
    return () => {
      clearInterval(shuffleInterval);
      clearInterval(refreshInterval);
    };
  }, [fetchDiscountedProducts, shuffleArray]);

  // Shuffle on component mount and when deals change
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
    const numRating = Math.min(5, Math.max(0, Number(rating) || 0);
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
          img: product.images?.[0]?.url || "" // Use first image URL if available
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
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

  if (loading) return <p>Loading discounted products...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <section>
      <h4 style={{ margin: "60px 20px", textAlign: "left", fontSize: "35px", fontWeight: 1000 }}>
        Discount
      </h4>
      <div id="rec" className="nav-deals-main">
        {shuffledDeals.map((deal) => {
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
                  {deal.images?.length > 0 ? (
                    deal.images.map((image, index) => (
                      <div key={index} className="carousel-image-container">
                        <img 
                          src={image.url} 
                          alt={`${deal.name} - ${index + 1}`} 
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
                    {renderRatingStars(deal.rating || 0)}
                  </div>
                  <span className="rating-number">| {(deal.rating || 0).toFixed(1)}</span>
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
        })}
      </div>
    </section>
  );
};

export default Discount;
