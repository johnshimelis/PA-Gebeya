import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../components/CartContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import '../styles/ProductDetails.css';
import tiktokIcon from '../images/assets/tiktok.png';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Carousel } from 'react-responsive-carousel';

const S3_BASE_URL = 'https://pa-gebeya-upload.s3.eu-north-1.amazonaws.com/';

const ProductDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart, cartItems, setCartItems } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  const getFullImageUrl = (imagePath) => {
    if (imagePath.startsWith('http')) return imagePath;
    return `${S3_BASE_URL}${imagePath}`;
  };

  useEffect(() => {
    const initializeProduct = (productData) => {
      setProduct(productData);
      setSelectedImage(getFullImageUrl(productData.images?.[0] || productData.photo));
      localStorage.setItem('selectedProduct', JSON.stringify(productData));

      if (productData.hasDiscount && productData.discount > 0) {
        setHasDiscount(true);
        setDiscountPercentage(productData.discount);
      } else {
        setHasDiscount(false);
        setDiscountPercentage(0);
      }
    };

    if (location.state?.product) {
      initializeProduct(location.state.product);
    } else {
      const storedProduct = localStorage.getItem('selectedProduct');
      if (storedProduct) {
        initializeProduct(JSON.parse(storedProduct));
      }
    }
  }, [location.state]);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product?.category?._id) {
        console.error("No valid category ID available for the product.");
        return;
      }
    
      setLoadingRelated(true);
    
      try {
        console.log("Fetching related products for category:", product.category._id);
        const response = await axios.get(
          `https://pa-gebeya-backend.onrender.com/api/products/category/${product.category._id}`
        );
    
        console.log("API Response:", response);
    
        if (response.status === 200) {
          const productsData = Array.isArray(response.data) 
            ? response.data 
            : response.data.products || [];
          
          console.log("Products data:", productsData);
    
          const filteredProducts = productsData.filter(
            (p) => p._id !== product._id
          );
          
          console.log("Filtered products:", filteredProducts);
          setRelatedProducts(filteredProducts);
        } else {
          throw new Error(`Unexpected status code: ${response.status}`);
        }
      } catch (error) {
        console.error("Error fetching related products:", error);
        toast.error("Failed to load related products");
        setRelatedProducts([]);
      } finally {
        setLoadingRelated(false);
      }
    };

    fetchRelatedProducts();
  }, [product]);

  const handleSmallImageClick = (image) => {
    setSelectedImage(getFullImageUrl(image));
  };

  const handleTikTokClick = (url) => {
    window.open(url, '_blank');
  };

  const handleRelatedProductClick = (relatedProduct) => {
    setProduct(relatedProduct);
    setSelectedImage(getFullImageUrl(relatedProduct.images?.[0] || relatedProduct.photo));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = async (productToAdd) => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (!userId || !token) {
      toast.error('Please log in to add items to the cart');
      navigate('/auth');
      return;
    }

    if (!productToAdd) {
      toast.error('Error: No product data available.');
      return;
    }

    const productId = productToAdd._id;
    if (!productId) {
      console.error('Error: Product ID is undefined');
      toast.error('Error adding item to cart: Product ID missing');
      return;
    }

    const thumbnailImage = productToAdd.images?.[0] || productToAdd.photo;
    const cartItem = {
      userId,
      productId,
      productName: productToAdd.name,
      price: productToAdd.price,
      quantity: quantity,
      img: getFullImageUrl(thumbnailImage),
    };

    try {
      const response = await axios.post(
        'https://pa-gebeya-backend.onrender.com/api/cart',
        cartItem,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        toast.success(`${productToAdd.name} added to the cart!`);
        const updatedCart = await axios.get('https://pa-gebeya-backend.onrender.com/api/cart', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartItems(updatedCart.data.items);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleQuantityChange = (delta) => {
    setQuantity((prevQuantity) => Math.max(1, prevQuantity + delta));
  };

  const formatSoldCount = (sold) => {
    const soldCount = Number(sold) || 0;
    if (soldCount === 0) return '0 sold';
    if (soldCount < 10) return `${soldCount} sold`;
    return `${Math.floor(soldCount / 10) * 10}+ sold`;
  };

  const renderRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
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

  if (!product) {
    return <div className="loading-container">Loading product details...</div>;
  }

  const isRecommended = product.status === "Recommended";
  const showDiscount = hasDiscount && discountPercentage > 0;
  const originalPrice = product.price.toFixed(2);
  const discountedPrice = showDiscount
    ? (product.price * (1 - discountPercentage / 100)).toFixed(2)
    : originalPrice;

  return (
    <div className="container">
      <div className="product-details">
        <div className="left-section">
          {product.videoLink && (
            <div className="tiktok-icon" onClick={() => handleTikTokClick(product.videoLink)}>
              <img src={tiktokIcon} alt="TikTok" className="tiktok-img" />
            </div>
          )}

          <div className="main-image-container">
            <img
              src={selectedImage}
              alt="Main Product"
              className="main-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = ''; // Fallback image or empty
              }}
            />
          </div>

          <div className="small-images-container">
            {product.images
              ?.filter((img) => getFullImageUrl(img) !== selectedImage)
              .map((image, index) => (
                <div
                  key={index}
                  className="small-image"
                  onClick={() => handleSmallImageClick(image)}
                >
                  <img
                    src={getFullImageUrl(image)}
                    alt={`Product ${index}`}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = ''; // Fallback image or empty
                    }}
                  />
                </div>
              ))}
          </div>
        </div>

        <div className="right-section">
          {/* Updated Tag Display */}
          <div className="product-tags">
            {showDiscount ? (
              <span className="discount-tag">
                {discountPercentage}% OFF
              </span>
            ) : isRecommended ? (
              <span className="recommended-tag">
                Recommended
              </span>
            ) : (
              <span className="best-seller-tag">
                Best Seller
              </span>
            )}
          </div>

          <div className="product-header">
            <h1 className="product-title" style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
              {product.name}
            </h1>
          </div>

          <div className="rating-sold-container">
            <div className="stars">{renderRatingStars(product.rating || 0)}</div>
            <span className="rating-number">| {product.rating || 0}</span>
            <span className="sold-count">| {formatSoldCount(product.sold || 0)} Sold</span>
          </div>

          <p className="short-description">{product.shortDescription}</p>
          <p className="full-description">{product.fullDescription}</p>

          {/* Updated Price Display */}
          <div className="price-display">
            {showDiscount ? (
              <div className="discounted-price">
                <span className="current-price">{discountedPrice} ETB</span>
                <span className="original-price">{originalPrice} ETB</span>
              </div>
            ) : (
              <div className="regular-price">
                <span className="price">{originalPrice} ETB</span>
              </div>
            )}
          </div>

          <div className="price-counter-row">
            <div className="quantity-selector">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="quantity-button"
              >
                -
              </button>
              <span className="quantity-display">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                className="quantity-button"
              >
                +
              </button>
            </div>
          </div>

          <div className="button-row">
            <button className="add-to-cart" onClick={() => handleAddToCart(product)}>
              🛒 Add to Cart
            </button>
            <button className="favorite">❤️</button>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      <div className="related-products">
        <h3>Related Products</h3>
        {loadingRelated ? (
          <p>Loading related products...</p>
        ) : relatedProducts.length > 0 ? (
          <div className="related-products-grid">
            {relatedProducts.map((relatedProduct) => (
              <div
                key={relatedProduct._id}
                className="related-product-card"
                onClick={() => handleRelatedProductClick(relatedProduct)}
              >
                {relatedProduct.videoLink && (
                  <div
                    className="tiktok-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTikTokClick(relatedProduct.videoLink);
                    }}
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
                  {relatedProduct.images?.map((image, index) => (
                    <div key={index}>
                      <img 
                        src={getFullImageUrl(image)} 
                        alt={`Product ${index}`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = ''; // Fallback image or empty
                        }}
                      />
                    </div>
                  ))}
                </Carousel>

                <div className="card-content">
                  <div className="card-header">
                    <span className="best-seller-tags">
                      {typeof relatedProduct.category === 'object' 
                        ? relatedProduct.category.name 
                        : relatedProduct.category} Product
                    </span>
                    <span className="product-name">{relatedProduct.name}</span>
                  </div>
                  {relatedProduct.shortDescription ? (
                    <p className="short-description">{relatedProduct.shortDescription}</p>
                  ) : (
                    <p className="short-description">No description available.</p>
                  )}
                  <div className="card-rating">
                    <div className="stars">
                      {renderRatingStars(relatedProduct.rating || 0)}
                    </div>
                    <span className="rating-number">| {relatedProduct.rating || 0}</span>
                    <span className="sold-count">| {formatSoldCount(relatedProduct.sold)}</span>
                  </div>
                  <p className="card-price">ETB {relatedProduct.price.toFixed(2)}</p>
                  <button
                    className="add-to-cart"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(relatedProduct);
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No related products found.</p>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;