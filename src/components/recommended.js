import React, { useState, useEffect } from "react";
import "../styles/recommended.css";
import { useNavigate } from "react-router-dom";
import { useCart } from "../components/CartContext";
import { toast } from "react-toastify";
import axios from "axios";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // Import carousel styles
import { Carousel } from "react-responsive-carousel"; // Import Carousel component
import tiktokIcon from "../images/assets/tiktok.png"; // Import TikTok icon

const RecommendedDeals = () => {
  const { addToCart, cartItems, setCartItems } = useCart();
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("https://pa-gebeya-backend.onrender.com/api/products");
        const nonDiscountedProducts = response.data.filter(product => !product.discount);
        setDeals(nonDiscountedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  // Helper function to format the sold count
  const formatSoldCount = (sold) => {
    if (sold < 10) {
      return `${sold} sold`;
    } else if (sold >= 10 && sold < 20) {
      return "10+ sold";
    } else if (sold === 20) {
      return "20 sold";
    } else if (sold > 20 && sold < 30) {
      return "20+ sold";
    } else {
      return `${Math.floor(sold / 10) * 10}+ sold`;
    }
  };

  // Helper function to render yellow stars based on rating
  const renderRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5; // Check if there's a half star
    const stars = [];

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">&#9733;</span>); // Full star
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">&#9733;</span>); // Half star
    }

    // Add empty stars to fill the remaining space
    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star">&#9733;</span>); // Empty star
    }

    return stars;
  };

  const handleProductClick = (deal) => {
    const productWithStatus = {
      ...deal,
      status: "Recommended",
      category: deal.category ? deal.category.name : "Uncategorized",
    };

    localStorage.setItem("Stored Product", JSON.stringify(productWithStatus));
    console.log("Product stored in localStorage:", productWithStatus);

    navigate("/product_detail", { state: { product: productWithStatus } });
  };

  const handleAddToCart = async (product) => {
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

  const handleTikTokClick = (videoLink) => {
    window.open(videoLink, "_blank");
  };

  return (
    <section>
      <h4 style={{ margin: "60px 20px", textAlign: "left", fontSize: "35px", fontWeight: 1000 }}>
        Recommended for you
      </h4>
      <div id="rec" className="nav-deals-main">
        {deals.map((deal) => (
          <div key={deal._id} className="nav-rec-cards" onClick={() => handleProductClick(deal)}>
            <div className="card-img">
              {/* TikTok Icon for Video Link */}
              {deal.videoLink && (
  <div
    className="tiktok-icon"
    onClick={(e) => {
      e.stopPropagation(); // Prevent the parent onClick from firing
      handleTikTokClick(deal.videoLink);
    }}
  >
    <img
      src={tiktokIcon} // Use imported TikTok icon
      alt="TikTok"
      className="tiktok-img"
    />
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
            e.target.src = '/default-product-image.jpg'; // Fallback image
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
            <div className="card-content" id="recommend">
              <div className="card-header">
                <span className="best-seller-tags">Recommended</span>
                <span className="product-name">{deal.name}</span>
              </div>
              {deal.shortDescription ? (
                <p className="short-description">{deal.shortDescription}</p>
              ) : (
                <p className="short-description">No description available.</p>
              )}
              <div className="card-rating">
                <div className="stars">
                  {renderRatingStars(deal.rating || 0)}
                </div>
                <span className="rating-number">| {deal.rating || 0}</span>
                <span className="sold-count">| {formatSoldCount(deal.sold)}</span>
              </div>
              <div className="card-price">ETB {deal.price}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecommendedDeals;