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
      const filteredDeals = response.data.filter(product => product.hasDiscount && product.discount > 0);
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
    
    // Set up interval to shuffle every 10 minutes (600,000ms)
    const shuffleInterval = setInterval(() => {
      setShuffledDeals(prev => shuffleArray(prev));
    }, 600000); // 10 minutes
    
    // Set up interval to refresh data every hour (3,600,000ms)
    const refreshInterval = setInterval(() => {
      fetchDiscountedProducts();
    }, 3600000); // 1 hour
    
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
      _id: deal._id,
      name: deal.name,
      category: deal.category,
      createdAt: deal.createdAt,
      discount: deal.discount,
      fullDescription: deal.fullDescription,
      hasDiscount: deal.hasDiscount,
      image: deal.image,
      photo: deal.photo,
      price: deal.price,
      shortDescription: deal.shortDescription,
      sold: deal.sold || 0,
      stockQuantity: deal.stockQuantity,
      updatedAt: deal.updatedAt,
      __v: deal.__v,
    };

    const calculatedPrice = (deal.price - (deal.price * deal.discount) / 100).toFixed(2);
    localStorage.setItem("calculatedPrice", calculatedPrice);
    localStorage.setItem("originalPrice", deal.price.toFixed(2));
    localStorage.setItem("discount", deal.discount);
    localStorage.setItem("productDetail", JSON.stringify(productDetails));
    navigate("/product_detail", { state: { product: deal } });
  };

  const handleAddToCart = async (product, e) => {
    e.stopPropagation();
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!userId || !token) {
      toast.error("Please log in to add items to the cart");
      return;
    }

    let productId = product._id;
    if (!productId) {
      console.error("Error: Product ID is undefined");
      toast.error("Error adding item to cart: Product ID missing");
      return;
    }

    const cartItem = {
      userId,
      productId,
      productName: product.name,
      price: product.price,
      quantity: 1,
      img: product.photo,
    };

    try {
      const response = await axios.post(
        "https://pa-gebeya-backend.onrender.com/api/cart",
        cartItem,
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
      } else {
        throw new Error("Failed to add item to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(error.message);
    }
  };

  const handleTikTokClick = (videoLink, e) => {
    e.stopPropagation();
    window.open(videoLink, "_blank");
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
          const calculatedPrice = (deal.price - (deal.price * deal.discount) / 100).toFixed(2);
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
                  {deal.imageUrls && deal.imageUrls.length > 0 ? (
                    deal.imageUrls.map((imageUrl, index) => (
                      <div key={index} className="carousel-image-container">
                        <img 
                          src={imageUrl} 
                          alt={`Product ${index}`} 
                          className="carousel-image"
                          onError={(e) => {
                            e.target.src = '/default-product-image.jpg';
                          }}
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
                  <span className="rating-number">| {deal.rating || 0}</span>
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