import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../components/CartContext";
import { toast } from "react-toastify";
import axios from "axios";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // Import carousel styles
import { Carousel } from "react-responsive-carousel"; // Import Carousel component
import "../styles/ProductDetails.css";

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

  // Fetch product details from location.state or localStorage
  useEffect(() => {
    if (location.state?.product) {
      const productData = location.state.product;
      setProduct(productData);
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

        // Set discount-related states
        if (parsedProduct.hasDiscount) {
          setHasDiscount(true);
          setDiscountPercentage(parsedProduct.discount || 0);
        }
      }
    }
  }, [location.state]);

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
      console.log("Category Name:", categoryName);

      const categoryResponse = await axios.get(
        `https://pa-gebeya-backend.onrender.com/api/categories/name/${encodeURIComponent(categoryName)}`
      );

      if (categoryResponse.data && categoryResponse.data.categoryId) {
        const categoryId = categoryResponse.data.categoryId;
        console.log("Fetched Category ID:", categoryId);

        const response = await axios.get(
          `https://pa-gebeya-backend.onrender.com/api/products/category/${categoryId}`
        );

        console.log("API Response for Products by Category ID:", response);
        console.log("Products Fetched:", response.data);

        if (response.status === 200 && Array.isArray(response.data)) {
          if (response.data.length === 0) {
            console.warn("No products found under this category.");
            setRelatedProducts([]);
            return;
          }

          const filteredProducts = response.data.filter(
            (p) => p._id !== product._id
          );

          console.log("Filtered Products:", filteredProducts);
          setRelatedProducts(filteredProducts);
        } else {
          throw new Error("Invalid response format or empty data.");
        }
      } else {
        throw new Error("Category not found.");
      }
    } catch (error) {
      console.error("Error fetching related products:", error);

      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error setting up request:", error.message);
      }
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
      img: productToAdd.photo || productToAdd.image, // Use the `photo` field for the image URL
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

    if (soldCount === 0) {
      return "0 sold";
    } else if (soldCount >= 1 && soldCount <= 10) {
      return `${soldCount} sold`;
    } else if (soldCount >= 11 && soldCount < 20) {
      return "10+ sold";
    } else if (soldCount === 20) {
      return "20 sold";
    } else if (soldCount >= 21 && soldCount < 30) {
      return "20+ sold";
    } else {
      const base = Math.floor(soldCount / 10) * 10;
      return `${base}+ sold`;
    }
  };

  // Render rating stars
  const renderRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">&#9733;</span>); // Full star
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">&#9733;</span>); // Half star
    }

    // Fill the remaining stars with empty stars
    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star">&#9733;</span>); // Empty star
    }

    return stars;
  };

  if (!product) {
    return <p>Loading product details...</p>;
  }

  // Calculate discounted price if hasDiscount is true
  const originalPrice = product.price.toFixed(2); // Format to 2 decimal places
  const discountedPrice = hasDiscount
    ? (product.price * (1 - discountPercentage / 100)).toFixed(2) // Format to 2 decimal places
    : originalPrice;

  return (
    <div className="container">
      <div className="product-details">
        <div className="left-section">
          {/* TikTok Icon for Video Link */}
          {product.videoLink && (
            <div className="tiktok-icon">
              <img
                src="../images/assets/babys.png"
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
            {product.images && product.images.length > 0 ? (
              product.images.map((image, index) => (
                <div key={index} className="carousel-image-container">
                  <img src={image} alt={`Product ${index}`} className="carousel-image" />
                </div>
              ))
            ) : (
              <div className="carousel-image-container">
                <img src={product.photo} alt={product.name} className="carousel-image" />
              </div>
            )}
          </Carousel>
        </div>

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
              {renderRatingStars(product.rating || 0)} {/* Default to 0 if rating is undefined */}
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
                <div className="card-img">
                  {/* Use the `photo` field for the image URL */}
                  <img src={relatedProduct.photo || relatedProduct.image} alt={relatedProduct.name} />
                </div>
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