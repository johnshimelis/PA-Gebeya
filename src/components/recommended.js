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
      const response = await axios.get("https://pa-gebeya-backend.onrender.com/api/products");
      const nonDiscountedProducts = response.data.filter(product => !product.discount);
      setDeals(nonDiscountedProducts);
      setShuffledDeals(shuffleArray(nonDiscountedProducts));
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }, [shuffleArray]);

  useEffect(() => {
    fetchProducts();
    
    // Set up interval to shuffle every 10 minutes (600,000ms)
    const shuffleInterval = setInterval(() => {
      setShuffledDeals(prev => shuffleArray(prev));
    }, 600000); // 10 minutes
    
    // Set up interval to refresh data every hour (3,600,000ms)
    const refreshInterval = setInterval(() => {
      fetchProducts();
    }, 3600000); // 1 hour
    
    return () => {
      clearInterval(shuffleInterval);
      clearInterval(refreshInterval);
    };
  }, [fetchProducts, shuffleArray]);

  // Shuffle on component mount and when deals change
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

  const handleAddToCart = async (product, e) => {
    e.stopPropagation();
    
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!userId || !token) {
      toast.error("Please log in to add items to the cart");
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
          quantity: 1,
          img: product.imageUrls?.[0] || ""
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        toast.success(`${product.name} added to the cart!`);
        const updatedCart = await axios.get("https://pa-gebeya-backend.onrender.com/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartItems(updatedCart.data.items);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(error.response?.data?.message || "Failed to add to cart");
    }
  };

  const handleTikTokClick = (videoLink, e) => {
    e.stopPropagation();
    window.open(videoLink, "_blank");
  };

  return (
    <section>
      <h4 style={{ margin: "60px 20px", textAlign: "left", fontSize: "35px", fontWeight: 1000 }}>
        Recommended for you
      </h4>
      <div id="rec" className="nav-deals-main">
        {shuffledDeals.map((deal) => (
          <div key={deal._id} className="nav-rec-cards">
            <div className="card-img" onClick={() => handleProductClick(deal)}>
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
                {deal.imageUrls?.map((imageUrl, index) => (
                  <div key={index} className="carousel-image-container">
                    <img 
                      src={imageUrl} 
                      alt={`${deal.name} ${index}`} 
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
            
            <div className="card-content" id="recommend" onClick={() => handleProductClick(deal)}>
              <div className="card-header">
                <span className="best-seller-tags">Recommended</span>
                <span className="product-name">{deal.name}</span>
              </div>
              <p className="short-description">
                {deal.shortDescription || "No description available."}
              </p>
              <div className="card-rating">
                <div className="stars">
                  {renderRatingStars(deal.rating || 0)}
                </div>
                <span className="rating-number">| {deal.rating?.toFixed(1) || 0}</span>
                <span className="sold-count">| {formatSoldCount(deal.sold || 0)}</span>
              </div>
              <div className="card-price">ETB {deal.price?.toFixed(2)}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecommendedDeals;