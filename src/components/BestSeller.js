import React, { useState, useEffect } from "react";
import "../styles/recommended.css";
import { useNavigate } from "react-router-dom";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import tiktokIcon from "../images/assets/tiktok.png";

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
        
        // Process data to ensure images are properly formatted
        const processedData = data.map(deal => ({
          ...deal,
          // Create imageUrls from images array if it exists
          imageUrls: deal.images?.map(img => img.url) || []
        }));
        
        setDeals(processedData);
        console.log("Fetched Product Details:", processedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, []);

  const formatSoldCount = (sold) => {
    const soldNum = Number(sold) || 0;
    if (soldNum < 10) return `${soldNum} sold`;
    if (soldNum < 20) return "10+ sold";
    if (soldNum === 20) return "20 sold";
    if (soldNum > 20 && soldNum < 30) return "20+ sold";
    return `${Math.floor(soldNum / 10) * 10}+ sold`;
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
      rating: deal.rating || 0,
      sold: deal.sold || 0
    };

    localStorage.setItem("productDetail", JSON.stringify(productDetails));
    navigate("/product_detail", { state: { product: deal } });
  };

  const handleTikTokClick = (e, videoLink) => {
    e.stopPropagation();
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
              {deal.videoLink && (
                <div
                  className="tiktok-icon"
                  onClick={(e) => handleTikTokClick(e, deal.videoLink)}
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
                <span className="best-seller-tags">Best Seller</span>
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
              <div className="card-price">ETB {deal.price.toFixed(2)}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BestSeller;
