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
      const response = await axios.get("https://pa-gebeya-backend.onrender.com/api/products/discounted");
      
      // Transform products to ensure consistent image structure
      const transformedProducts = response.data.map(product => ({
        ...product,
        // Use imageUrls if exists, otherwise create from images array
        imageUrls: product.imageUrls || 
                  (product.images ? product.images.map(img => img.url) : []),
        // Ensure default values for critical fields
        rating: product.rating || 0,
        sold: product.sold || 0,
        price: product.price || 0,
        discount: product.discount || 0,
        hasDiscount: product.hasDiscount || false,
        shortDescription: product.shortDescription || "No description available"
      }));

      // Filter for products with actual discounts
      const discountedProducts = transformedProducts.filter(
        product => product.hasDiscount && product.discount > 0
      );

      setDeals(discountedProducts);
      setShuffledDeals(shuffleArray(discountedProducts));
      setError(null);
    } catch (err) {
      console.error("Error fetching discounted products:", err);
      setError("Failed to load discounted products. Please try again later.");
      toast.error("Failed to load discounted deals");
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
    if (soldNumber >= 10 && soldNumber < 20) return "10+ sold";
    if (soldNumber === 20) return "20 sold";
    if (soldNumber > 20 && soldNumber < 30) return "20+ sold";
    return `${Math.floor(soldNumber / 10) * 10}+ sold`;
  };

  const renderRatingStars = (rating) => {
    const ratingValue = Number(rating) || 0;
    const fullStars = Math.floor(ratingValue);
    const hasHalfStar = ratingValue % 1 >= 0.5;
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

  const handleProductClick = (product) => {
    const productDetails = {
      ...product,
      categoryId: product.category?._id || null,
      categoryName: product.category?.name || "Uncategorized",
      status: "Discounted"
    };

    const calculatedPrice = (product.price - (product.price * product.discount) / 100).toFixed(2);
    
    localStorage.setItem("currentProduct", JSON.stringify(productDetails));
    localStorage.setItem("calculatedPrice", calculatedPrice);
    localStorage.setItem("originalPrice", product.price.toFixed(2));
    localStorage.setItem("discount", product.discount);
    
    navigate("/product_detail", { 
      state: { 
        product: productDetails,
        fromDiscounts: true
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
          img: product.imageUrls?.[0] || "",
          discount: product.discount
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

  if (loading) {
    return (
      <section>
        <h4 style={{ margin: "60px 20px", textAlign: "left", fontSize: "35px", fontWeight: 1000 }}>
          Discounted Products
        </h4>
        <div className="loading-products">
          <p>Loading discounted deals...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h4 style={{ margin: "60px 20px", textAlign: "left", fontSize: "35px", fontWeight: 1000 }}>
          Discounted Products
        </h4>
        <div className="error-loading">
          <p>{error}</p>
          <button onClick={fetchDiscountedProducts}>Retry</button>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h4 style={{ margin: "60px 20px", textAlign: "left", fontSize: "35px", fontWeight: 1000 }}>
        Discounted Products
      </h4>
      <div id="rec" className="nav-deals-main">
        {shuffledDeals.length > 0 ? (
          shuffledDeals.map((deal) => {
            const calculatedPrice = (deal.price - (deal.price * deal.discount) / 100).toFixed(2);
            const originalPrice = deal.price.toFixed(2);

            return (
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
                    showArrows={deal.imageUrls?.length > 1}
                    showIndicators={deal.imageUrls?.length > 1}
                  >
                    {deal.imageUrls?.length > 0 ? (
                      deal.imageUrls.map((imageUrl, index) => (
                        <div key={index} className="carousel-image-container">
                          <img 
                            src={imageUrl} 
                            alt={`${deal.name} ${index + 1}`} 
                            className="carousel-image"
                            onError={(e) => {
                              e.target.src = '/default-product-image.jpg';
                              e.target.onerror = null; // Prevent infinite loop
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
                
                <div className="card-content" onClick={() => handleProductClick(deal)}>
                  <div className="card-header">
                    <span className="discount-tag">{deal.discount}% OFF</span>
                    <span className="product-name">{deal.name}</span>
                  </div>
                  <p className="short-description">
                    {deal.shortDescription}
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
                  </div>
                  <button 
                    className="add-to-cart-btn"
                    onClick={(e) => handleAddToCart(deal, e)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-products">
            <p>No discounted products available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Discount;
