import React, { useState, useEffect } from "react";
import "../styles/recommended.css";
import { useNavigate } from "react-router-dom";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // Import carousel styles
import { Carousel } from "react-responsive-carousel"; // Import Carousel component
import tiktokIcon from "../images/assets/tiktok.png"; // Import TikTok icon

const BestSeller = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const response = await fetch("https://pa-gebeya-backend.onrender.com/api/products/bestsellers");
        if (!response.ok) {
          throw new Error("Failed to fetch best-selling products");
        }
        const data = await response.json();
        setDeals(data);
        console.log("Fetched Product Details:", data); // Log fetched data to the console
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
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
    // Store all product details, including rating and sold count, in localStorage
    const productDetails = {
      _id: deal._id,
      name: deal.name,
      category: deal.category,
      createdAt: deal.createdAt,
      fullDescription: deal.fullDescription,
      image: deal.image,
      photo: deal.photo,
      price: deal.price,
      shortDescription: deal.shortDescription,
      sold: deal.sold || 0, // Fallback to 0 if sold is not provided
      stockQuantity: deal.stockQuantity,
      updatedAt: deal.updatedAt,
      __v: deal.__v,
      rating: deal.rating || 0, // Use the product's rating or default to 0
    };

    localStorage.setItem("productDetail", JSON.stringify(productDetails));
    navigate("/product_detail", { state: { product: deal } });
  };

  const handleTikTokClick = (videoLink) => {
    window.open(videoLink, "_blank");
  };

  if (loading) return <p>Loading best-selling products...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <section>
      <h4 style={{ margin: "60px 20px", textAlign: "left", fontSize: "35px", fontWeight: 1000 }}>
        Best Seller
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
            <div className="card-content">
              <div className="card-header">
                <span className="best-seller-tags">Best Seller</span>
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
              {/* Format the price to 2 decimal places */}
              <div className="card-price">ETB {deal.price.toFixed(2)}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BestSeller;