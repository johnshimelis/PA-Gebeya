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

  // Improved image URL handling
  const getFullImageUrl = (image) => {
    if (!image) return '/default-product-image.jpg';
    
    // Handle case where image is an object with url property
    if (typeof image === 'object' && image.url) {
      return image.url.startsWith('http') ? image.url : `${S3_BASE_URL}${image.url}`;
    }
    
    // Handle case where image is a string path
    if (typeof image === 'string') {
      return image.startsWith('http') ? image : `${S3_BASE_URL}${image}`;
    }
    
    return '/default-product-image.jpg';
  };

  useEffect(() => {
    const initializeProduct = (productData) => {
      if (!productData) {
        navigate('/products');
        return;
      }

      setProduct(productData);
      
      // Get first image safely
      const firstImage = Array.isArray(productData.images) && productData.images.length > 0 
        ? productData.images[0] 
        : productData.photo;
      
      setSelectedImage(getFullImageUrl(firstImage));

      // Set discount info
      const hasDisc = productData.hasDiscount && productData.discount > 0;
      setHasDiscount(hasDisc);
      setDiscountPercentage(hasDisc ? productData.discount : 0);

      // Store product in localStorage
      localStorage.setItem('selectedProduct', JSON.stringify(productData));
    };

    if (location.state?.product) {
      initializeProduct(location.state.product);
    } else {
      const storedProduct = localStorage.getItem('selectedProduct');
      if (storedProduct) {
        initializeProduct(JSON.parse(storedProduct));
      } else {
        navigate('/products');
      }
    }
  }, [location.state, navigate]);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product?.category?._id) return;
    
      setLoadingRelated(true);
    
      try {
        const response = await axios.get(
          `https://pa-gebeya-backend.onrender.com/api/products/category/${product.category._id}`
        );
    
        if (response.status === 200) {
          const productsData = Array.isArray(response.data) 
            ? response.data 
            : response.data.products || [];
          
          setRelatedProducts(productsData.filter(p => p._id !== product._id));
        }
      } catch (error) {
        console.error("Error fetching related products:", error);
        toast.error("Failed to load related products");
        setRelatedProducts([]);
      } finally {
        setLoadingRelated(false);
      }
    };

    if (product) {
      fetchRelatedProducts();
    }
  }, [product]);

  const handleSmallImageClick = (image) => {
    setSelectedImage(getFullImageUrl(image));
  };

  const handleTikTokClick = (url, e) => {
    e?.stopPropagation();
    window.open(url, '_blank');
  };

  const handleRelatedProductClick = (relatedProduct) => {
    navigate("/product_detail", { 
      state: { product: relatedProduct },
      replace: true
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = async (productToAdd, e) => {
    e?.stopPropagation();
    
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
      toast.error('Error adding item to cart: Product ID missing');
      return;
    }

    try {
      const cartItem = {
        userId,
        productId,
        productName: productToAdd.name,
        price: productToAdd.price,
        quantity: quantity,
        img: getFullImageUrl(productToAdd.images?.[0] || productToAdd.photo),
      };

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
        const updatedCart = await axios.get(
          'https://pa-gebeya-backend.onrender.com/api/cart', 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCartItems(updatedCart.data.items);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleQuantityChange = (delta) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  const formatSoldCount = (sold) => {
    const soldCount = Number(sold) || 0;
    if (soldCount === 0) return '0 sold';
    if (soldCount < 10) return `${soldCount} sold`;
    return `${Math.floor(soldCount / 10) * 10}+ sold`;
  };

  const renderRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }

    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star">★</span>);
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
            <div 
              className="tiktok-icon" 
              onClick={(e) => handleTikTokClick(product.videoLink, e)}
            >
              <img src={tiktokIcon} alt="TikTok" className="tiktok-img" />
            </div>
          )}

          <div className="main-image-container">
            <img
              src={selectedImage}
              alt={product.name}
              className="main-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/default-product-image.jpg';
              }}
            />
          </div>

          <div className="small-images-container">
            {product.images?.filter(img => img).map((image, index) => {
              const imageUrl = getFullImageUrl(image);
              return imageUrl !== selectedImage && (
                <div
                  key={index}
                  className="small-image"
                  onClick={() => handleSmallImageClick(image)}
                >
                  <img
                    src={imageUrl}
                    alt={`Product view ${index + 1}`}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/default-product-image.jpg';
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="right-section">
          <div className="product-tags">
            {showDiscount ? (
              <span className="discount-tag">{discountPercentage}% OFF</span>
            ) : isRecommended ? (
              <span className="recommended-tag">Recommended</span>
            ) : (
              <span className="best-seller-tag">Best Seller</span>
            )}
          </div>

          <div className="product-header">
            <h1 className="product-title">{product.name}</h1>
          </div>

          <div className="rating-sold-container">
            <div className="stars">{renderRatingStars(product.rating || 0)}</div>
            <span className="rating-number">| {product.rating || 0}</span>
            <span className="sold-count">| {formatSoldCount(product.sold)} Sold</span>
          </div>

          <p className="short-description">{product.shortDescription}</p>
          <p className="full-description">{product.fullDescription}</p>

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
              <button onClick={() => handleQuantityChange(-1)} className="quantity-button">
                -
              </button>
              <span className="quantity-display">{quantity}</span>
              <button onClick={() => handleQuantityChange(1)} className="quantity-button">
                +
              </button>
            </div>
          </div>

          <div className="button-row">
            <button 
              className="add-to-cart" 
              onClick={() => handleAddToCart(product)}
            >
              🛒 Add to Cart
            </button>
            <button className="favorite">❤️</button>
          </div>
        </div>
      </div>

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
                    onClick={(e) => handleTikTokClick(relatedProduct.videoLink, e)}
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
                  {relatedProduct.images?.filter(img => img).map((image, index) => (
                    <div key={index}>
                      <img 
                        src={getFullImageUrl(image)} 
                        alt={`${relatedProduct.name} view ${index + 1}`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/default-product-image.jpg';
                        }}
                      />
                    </div>
                  ))}
                </Carousel>

                <div className="card-content">
                  <div className="card-header">
                    <span className="best-seller-tags">
                      {relatedProduct.category?.name || 'Product'}
                    </span>
                    <span className="product-name">{relatedProduct.name}</span>
                  </div>
                  <p className="short-description">
                    {relatedProduct.shortDescription || 'No description available.'}
                  </p>
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
                    onClick={(e) => handleAddToCart(relatedProduct, e)}
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
