import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import '../styles/search.css';
import tiktokIcon from '../images/assets/tiktok.png';

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('q') || '';
  
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const apiUrl = "https://pa-gebeya-backend.onrender.com/api/products";

  useEffect(() => {
    if (searchQuery) {
      performSearch(searchQuery);
    }
  }, [searchQuery]);

  const performSearch = async (query) => {
    setIsLoading(true);
    
    try {
      const response = await axios.get(apiUrl);
      if (response.status === 200) {
        const allProducts = response.data;
        const filteredProducts = allProducts.filter(product => {
          const name = product.name?.toString().toLowerCase() || '';
          const description = product.shortDescription?.toString().toLowerCase() || '';
          const searchLower = query.toLowerCase();
          return name.includes(searchLower) || description.includes(searchLower);
        });
        setSearchResults(filteredProducts);
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatSoldCount = (sold) => {
    const soldCount = Number(sold) || 0;
    if (soldCount === 0) return "0 sold";
    if (soldCount < 10) return `${soldCount} sold`;
    if (soldCount < 20) return "10+ sold";
    if (soldCount === 20) return "20 sold";
    if (soldCount < 30) return "20+ sold";
    return `${Math.floor(soldCount / 10) * 10}+ sold`;
  };

  const renderRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="products-page-star filled">★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="products-page-star half">★</span>);
    }

    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<span key={`empty-${i}`} className="products-page-star">★</span>);
    }

    return stars;
  };

  const highlightSearchTerm = (text) => {
    if (!searchQuery) return text;
    
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    return text.split(regex).map((part, index) => 
      part.toLowerCase() === searchQuery.toLowerCase() ? 
      <span key={index} className="highlight">{part}</span> : 
      part
    );
  };

  const ProductCard = ({ product }) => {
    const imageUrls = product.imageUrls || 
                     (product.images?.map(img => `https://pa-gebeya-upload.s3.eu-north-1.amazonaws.com/${img}`)) || 
                     [product.thumbnailPath || 'https://via.placeholder.com/300'];

    const calculateDiscountedPrice = () => {
      if (product.discount > 0) {
        const discountAmount = product.price * (product.discount / 100);
        return Math.round(product.price - discountAmount);
      }
      return product.price;
    };

    const currentPrice = calculateDiscountedPrice();
    const showDiscount = product.discount > 0 && currentPrice !== product.price;

    return (
      <div className="products-page-product-card" onClick={() => navigateToProductDetail(product)}>
        <div className="products-page-card-img">
          {product.videoLink && (
            <div
              className="products-page-tiktok-icon"
              onClick={(e) => {
                e.stopPropagation();
                window.open(product.videoLink, "_blank");
              }}
            >
              <img src={tiktokIcon} alt="TikTok" className="products-page-tiktok-img" />
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
            {imageUrls.map((imageUrl, index) => (
              <div key={index} className="products-page-carousel-image-container">
                <img 
                  src={imageUrl} 
                  alt={`${product.name} ${index}`}
                  className="products-page-carousel-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/300';
                  }}
                />
              </div>
            ))}
          </Carousel>
          {showDiscount && (
            <div className="discount-badge">
              {product.discount}%
            </div>
          )}
        </div>
        <div className="products-page-card-content">
          <div className="products-page-card-header">
            <span className="products-page-best-seller-tags">{product.category?.name || 'Product'}</span>
            <span className="products-page-product-name">{highlightSearchTerm(product.name)}</span>
          </div>
          <p className="products-page-short-description">
            {highlightSearchTerm(product.shortDescription || "No description available.")}
          </p>
          <div className="products-page-card-rating">
            <div className="products-page-stars">
              {renderRatingStars(product.rating || 0)}
            </div>
            <span className="products-page-rating-number">| {product.rating?.toFixed(1) || 0}</span>
            <span className="products-page-sold-count">| {formatSoldCount(product.sold)}</span>
          </div>
          <div className="products-page-card-price">
            {showDiscount ? (
              <>
                <span className="current-price">ETB {currentPrice}</span>
                <span className="products-page-old-price">ETB {product.price}</span>
              </>
            ) : (
              <span className="current-price">ETB {product.price}</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const LoadingShimmer = () => (
    <div className="products-page-product-grid">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="products-page-product-card shimmer">
          <div className="products-page-card-img shimmer-image"></div>
          <div className="products-page-card-content">
            <div className="shimmer-line" style={{width: '70%'}}></div>
            <div className="shimmer-line" style={{width: '90%'}}></div>
            <div className="shimmer-line" style={{width: '60%'}}></div>
            <div className="shimmer-line" style={{width: '40%'}}></div>
          </div>
        </div>
      ))}
    </div>
  );

  const navigateToProductDetail = (product) => {
    navigate('/product_detail', { 
      state: { 
        product: {
          ...product,
          status: `${product.category?.name || 'Search'} Product`
        }
      }
    });
  };

  return (
    <section>
      <h4 style={{ margin: "60px 20px", textAlign: "left", fontSize: "35px", fontWeight: 1000 }}>
        {searchQuery ? `Results for "${searchQuery}"` : 'Browse Products'}
      </h4>
      
      {isLoading ? (
        <LoadingShimmer />
      ) : searchResults.length > 0 ? (
        <div className="products-page-product-grid">
          {searchResults.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <p style={{ textAlign: "center", width: "100%" }}>
          {searchQuery ? `No results found for "${searchQuery}"` : 'Search for products using the search bar above'}
        </p>
      )}
    </section>
  );
};

export default Search;