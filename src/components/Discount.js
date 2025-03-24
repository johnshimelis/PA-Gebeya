import React, { useState, useEffect } from "react";
import "../styles/discount.css";
import { useNavigate } from "react-router-dom";
import { useCart } from "../components/CartContext";
import { toast } from "react-toastify";
import axios from "axios";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // Import carousel styles
import { Carousel } from "react-responsive-carousel"; // Import Carousel component
import tiktokIcon from "../images/assets/tiktok.png"; // Import TikTok icon

const Discount = () => {
  const { addToCart, cartItems, setCartItems } = useCart();
  const navigate = useNavigate();

  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDiscountedProducts = async () => {
      try {
        const response = await axios.get("https://pa-gebeya-backend.onrender.com/api/products/discounted");
        if (response.status !== 200) throw new Error("Failed to fetch products");
        const filteredDeals = response.data.filter(product => product.hasDiscount && product.discount > 0);
        setDeals(filteredDeals);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscountedProducts();
  }, []);

  // Helper function to format the sold count
  const formatSoldCount = (sold) => {
    const soldNumber = Number(sold); // Ensure sold is treated as a number
    if (isNaN(soldNumber)) return "0 sold"; // Fallback if sold is not a number

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
      sold: deal.sold || 0, // Fallback to 0 if sold is not provided
      stockQuantity: deal.stockQuantity,
      updatedAt: deal.updatedAt,
      __v: deal.__v,
    };

    // Store calculated price, original price, and discount in localStorage
    const calculatedPrice = (deal.price - (deal.price * deal.discount) / 100).toFixed(2);
    localStorage.setItem("calculatedPrice", calculatedPrice);
    localStorage.setItem("originalPrice", deal.price.toFixed(2)); // Format original price
    localStorage.setItem("discount", deal.discount);

    // Store product details in localStorage
    localStorage.setItem("productDetail", JSON.stringify(productDetails));
    navigate("/product_detail", { state: { product: deal } });
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
      img: product.photo, // Use the `photo` field for the image URL
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

        // Refresh the cart
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

  if (loading) return <p>Loading discounted products...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <section>
      <h4 style={{ margin: "60px 20px", textAlign: "left", fontSize: "35px", fontWeight: 1000 }}>
        Discount
      </h4>
      <div id="rec" className="nav-deals-main">
        {deals.map((deal) => {
          // Calculate the discounted price and format it to 2 decimal places
          const calculatedPrice = (deal.price - (deal.price * deal.discount) / 100).toFixed(2);
          // Format the original price to 2 decimal places
          const originalPrice = deal.price.toFixed(2);

          return (
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
                {/* Auto-Scrolling Carousel for Images */}
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
              <div className="card-content">
                <div className="card-header">
                  {/* Display "Discount" tag before the product name */}
                  <span className="discount-tag">Discount</span>
                  <span className="product-name">{deal.name}</span>
                </div>
                {/* Add shortDescription with a fallback */}
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
                <div className="card-pricing">
                  {/* Display calculated price with 2 decimal places */}
                  <span className="calculated-price">ETB {calculatedPrice}</span>
                  {/* Display original price with 2 decimal places */}
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