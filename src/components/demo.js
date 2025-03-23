import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../components/CartContext";
import { toast } from "react-toastify";
import axios from "axios";
import "../styles/ProductDetails.css";
import tiktokIcon from "../images/assets/tiktok.png"; // Import TikTok icon
import "react-responsive-carousel/lib/styles/carousel.min.css"; // Import carousel styles
import { Carousel } from "react-responsive-carousel"; // Import Carousel component

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
  const [selectedImage, setSelectedImage] = useState("");

  // Fetch product details from location.state or localStorage
  useEffect(() => {
    if (location.state?.product) {
      const productData = location.state.product;
      setProduct(productData);
      setSelectedImage(productData.images?.[0] || productData.photo); // Set the first image as default
      localStorage.setItem("selectedProduct", JSON.stringify(productData));

      // Set discount-related states
      if (productData.hasDiscount) {
        setHasDiscount(true);
        setDiscountPercentage(productData.discount || 0);
      }
    } else {
      const storedProduct = localStorage.getItem("selectedProduct");
      if (storedProduct) {
        const parsedProduct = JSON.parse(storedProduct);
        setProduct(parsedProduct);
        setSelectedImage(parsedProduct.images?.[0] || parsedProduct.photo); // Set the first image as default

        // Set discount-related states
        if (parsedProduct.hasDiscount) {
          setHasDiscount(true);
          setDiscountPercentage(parsedProduct.discount || 0);
        }
      }
    }
  }, [location.state]);

  // Handle small image click
  const handleSmallImageClick = (image) => {
    setSelectedImage(image);
  };

  // Handle TikTok icon click
  const handleTikTokClick = (url) => {
    window.open(url, "_blank");
  };

  // Fetch related products when the product is set
  useEffect(() => {
    if (product?.category) {
      fetchRelatedProducts();
    } else {
      console.warn("No category available for the product.");
    }
  }, [product]);

  // Fetch related products by category
  const fetchRelatedProducts = async () => {
    if (!product?.category) {
      console.error("No valid category available for the product.");
      return;
    }

    setLoadingRelated(true);

    try {
      const categoryName = product.category;
      const categoryResponse = await axios.get(
        `https://pa-gebeya-backend.onrender.com/api/categories/name/${encodeURIComponent(categoryName)}`
      );

      if (categoryResponse.data && categoryResponse.data.categoryId) {
        const categoryId = categoryResponse.data.categoryId;
        const response = await axios.get(
          `https://pa-gebeya-backend.onrender.com/api/products/category/${categoryId}`
        );

        if (response.status === 200 && Array.isArray(response.data)) {
          const filteredProducts = response.data.filter(
            (p) => p._id !== product._id
          );
          setRelatedProducts(filteredProducts);
        } else {
          throw new Error("Invalid response format or empty data.");
        }
      } else {
        throw new Error("Category not found.");
      }
    } catch (error) {
      console.error("Error fetching related products:", error);
    } finally {
      setLoadingRelated(false);
    }
  };

  // Add product to cart
  const handleAddToCart = async (productToAdd) => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!userId || !token) {
      toast.error("Please log in to add items to the cart");
      navigate("/auth");
      return;
    }

    if (!productToAdd) {
      toast.error("Error: No product data available.");
      return;
    }

    let productId = productToAdd._id;
    if (!productId) {
      console.error("Error: Product ID is undefined");
      toast.error("Error adding item to cart: Product ID missing");
      return;
    }

    const cartItem = {
      userId,
      productId,
      productName: productToAdd.name,
      price: productToAdd.price,
      quantity: quantity,
      img: productToAdd.photo || productToAdd.image,
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
        toast.success(`${productToAdd.name} added to the cart!`);
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

  // Handle quantity change
  const handleQuantityChange = (delta) => {
    setQuantity((prevQuantity) => Math.max(1, prevQuantity + delta));
  };

  // Format sold count
  const formatSoldCount = (sold) => {
    const soldCount = Number(sold) || 0;
    if (soldCount === 0) return "0 sold";
    if (soldCount >= 1 && soldCount <= 10) return `${soldCount} sold`;
    if (soldCount >= 11 && soldCount < 20) return "10+ sold";
    if (soldCount === 20) return "20 sold";
    if (soldCount >= 21 && soldCount < 30) return "20+ sold";
    const base = Math.floor(soldCount / 10) * 10;
    return `${base}+ sold`;
  };

  // Render rating stars
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
    return <p>Loading product details...</p>;
  }

  // Calculate discounted price
  const originalPrice = product.price.toFixed(2);
  const discountedPrice = hasDiscount
    ? (product.price * (1 - discountPercentage / 100)).toFixed(2)
    : originalPrice;

  return (
    <div className="container">
      <div className="product-details">
        <div className="left-section">
          {/* TikTok Icon for Video Link */}
          {product.videoLink && (
            <div
              className="tiktok-icon"
              onClick={() => handleTikTokClick(product.videoLink)}
            >
              <img
                src={tiktokIcon} // Use imported TikTok icon
                alt="TikTok"
                className="tiktok-img"
              />
            </div>
          )}

          {/* Main Image Container */}
          <div className="main-image-container">
            <img src={selectedImage} alt="Main Product" className="main-image" />
          </div>

          {/* Small Images Container */}
          <div className="small-images-container">
            {product.images
              ?.filter((img) => img !== selectedImage) // Exclude the selected image
              .map((image, index) => (
                <div
                  key={index}
                  className="small-image"
                  onClick={() => handleSmallImageClick(image)}
                >
                  <img src={image} alt={`Product ${index}`} />
                </div>
              ))}
          </div>
        </div>

        {/* Right Section (unchanged) */}
        <div className="right-section">
          {/* Discount, Recommended, or Best Seller Tag */}
          {hasDiscount ? (
            <span className="discount-tags" style={{ backgroundColor: "#e74c3c" }}>
              Discount
            </span>
          ) : product.status === "Recommended" ? (
            <span className="recommended-tag" style={{ backgroundColor: "#2ecc71" }}>
              Recommended
            </span>
          ) : (
            <span className="best-seller-tag">Best Seller</span>
          )}

          <div className="product-header">
            <h1 className="product-title" style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
              {product.name}
            </h1>
          </div>

          <div className="rating-sold-container">
            <div className="stars">
              {renderRatingStars(product.rating || 0)}
            </div>
            <span className="rating-number">| {product.rating || 0}</span>
            <span className="sold-count">| {formatSoldCount(product.sold || 0)} Sold</span>
          </div>

          <p className="short-description">{product.shortDescription}</p>
          <p className="full-description">{product.fullDescription}</p>

          {/* Price Container */}
          <div className="price-container">
            {hasDiscount ? (
              <div className="discounted-price-row">
                <span className="calculated-price">{discountedPrice} ETB</span>
                <span className="strikethrough">{originalPrice} ETB</span>
                <span className="discount-percentage" style={{ color: "#e74c3c" }}>
                  {discountPercentage}% OFF
                </span>
              </div>
            ) : (
              <div className="calculated-price">
                <span>Price: </span>
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
                onClick={() => {
                  setProduct(relatedProduct);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                {/* TikTok Icon for Video Link */}
                {relatedProduct.videoLink && (
                  <div
                    className="tiktok-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTikTokClick(relatedProduct.videoLink);
                    }}
                  >
                    <img
                      src={tiktokIcon}
                      alt="TikTok"
                      className="tiktok-img"
                    />
                  </div>
                )}

                {/* Carousel for Related Product Images */}
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
                      <img src={image} alt={`Product ${index}`} />
                    </div>
                  ))}
                </Carousel>

                <div className="card-content">
                  <div className="card-header">
                    <span className="best-seller-tags">{relatedProduct.category} Product</span>
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