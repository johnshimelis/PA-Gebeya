import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../components/CartContext";
import { toast } from "react-toastify";
import axios from "axios";
import "../styles/ProductDetails.css";

const ProductDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart, cartItems, setCartItems } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState(0);

  useEffect(() => {
    const storedProduct = localStorage.getItem("productDetail");
    if (storedProduct) {
      const parsedProduct = JSON.parse(storedProduct);
      console.log("Stored Product:", parsedProduct); // Debugging
      setProduct(parsedProduct);

      // Check for hasDiscount and discount in the product data
      if (parsedProduct.hasDiscount) {
        setHasDiscount(true);
        setDiscountPercentage(parsedProduct.discount || 0);
      }
    }
  }, []);

  useEffect(() => {
    const storedProduct = localStorage.getItem("selectedProduct");
    if (location.state?.product) {
      setProduct(location.state.product);
      localStorage.setItem("selectedProduct", JSON.stringify(location.state.product));
    } else if (storedProduct) {
      const parsedProduct = JSON.parse(storedProduct);
      setProduct(parsedProduct);

      // Check for hasDiscount and discount in the product data
      if (parsedProduct.hasDiscount) {
        setHasDiscount(true);
        setDiscountPercentage(parsedProduct.discount || 0);
      }
    }
  }, [location.state]);
  const handleAddToCart = async () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
  
    if (!userId || !token) {
      toast.error("Please log in to add items to the cart");
      return;
    }
  
    // Check if there is a product in localStorage
    const storedProduct = localStorage.getItem("selectedProduct"); // Use the correct key
    let productToAdd = null;
  
    if (storedProduct) {
      try {
        const parsedProduct = JSON.parse(storedProduct);
        // Validate the product structure
        if (parsedProduct && parsedProduct._id) {
          productToAdd = parsedProduct;
        } else {
          console.warn("Invalid product data in localStorage");
        }
      } catch (error) {
        console.error("Error parsing product from localStorage:", error);
      }
    }
  
    // Fallback to the Stored Product in the state if localStorage data is invalid or missing
    if (!productToAdd) {
      productToAdd = product; // Use the product from the state
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
  
    // Handle the image URL
    let imageUrl = null;
  
    if (storedProduct) {
      // If the product is from localStorage, use the `photo` field if available
      if (productToAdd.photo) {
        imageUrl = productToAdd.photo;
        console.log("Image URL from localStorage (photo):", imageUrl);
      } else if (productToAdd.image) {
        // Check if the `image` field already contains the base URL
        if (productToAdd.image.startsWith("http")) {
          imageUrl = productToAdd.image; // Use as-is
        } else {
          // Append the base URL to the `image` field
          imageUrl = `http://pa-gebeya-backend.onrender.com/uploads/${productToAdd.image}`;
        }
        console.log("Image URL from localStorage (image):", imageUrl);
      }
    } else {
      // If the product is from the Stored Product, use the `image` field and construct the URL
      if (productToAdd.image) {
        if (productToAdd.image.startsWith("http")) {
          imageUrl = productToAdd.image; // Use as-is
        } else {
          imageUrl = `http://pa-gebeya-backend.onrender.com/uploads/${productToAdd.image}`;
        }
        console.log("Image URL from Stored Product:", imageUrl);
      }
    }
  
    // If no valid image URL is found, use a default placeholder image
    if (!imageUrl) {
      console.warn("No image URL available for the product");
      imageUrl = "http://pa-gebeya-backend.onrender.com/uploads/default.jpg"; // Default placeholder image
    }
  
    const cartItem = {
      userId,
      productId,
      productName: productToAdd.name,
      price: productToAdd.price,
      quantity: quantity,
      img: imageUrl, // Use the correct image URL
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

  const handleQuantityChange = (delta) => {
    setQuantity((prevQuantity) => Math.max(1, prevQuantity + delta));
  };

  const formatSoldCount = (sold) => {
    if (sold < 10) {
      return sold; // Display as is for numbers less than 10
    } else if (sold >= 11 && sold < 20) {
      return "10+"; // Display as 10+ for numbers between 11 and 19
    } else if (sold >= 21 && sold < 30) {
      return "20+"; // Display as 20+ for numbers between 21 and 29
    } else {
      // For numbers like 20, 30, 40, etc., display as is
      // For numbers like 31-39, display as 30+, and so on
      const base = Math.floor(sold / 10) * 10;
      if (sold % 10 === 0) {
        return base; // Display as is for multiples of 10
      } else {
        return `${base}+`; // Display as 30+, 40+, etc.
      }
    }
  };

  if (!product) {
    return <p>Loading product details...</p>;
  }

  const getImageUrl = (imagePath) => {
    if (imagePath.startsWith("http")) {
      return imagePath;
    } else {
      return `https://pa-gebeya-backend.onrender.com/uploads/${imagePath}`;
    }
  };

  // Calculate discounted price if hasDiscount is true
  const originalPrice = product.price;
  const discountedPrice = hasDiscount
    ? (originalPrice * (1 - discountPercentage / 100)).toFixed(2)
    : originalPrice;

  return (
    <div className="product-details">
      <div className="left-section">
        <div
          className="main-image-container"
          style={{ "--small-image-url": `url(${getImageUrl(product.photo || product.image)})` }}
        >
          <img
            className="main-image"
            src={getImageUrl(product.photo || product.image)}
            alt={product.name}
          />
        </div>
      </div>

      <div className="right-section">
        {/* Discount or Best Seller Tag */}
        {hasDiscount ? (
          <span className="discount-tags" style={{ backgroundColor: "#e74c3c" }}>
            Discount
          </span>
        ) : (
          <span className="best-seller-tag">Best Seller</span>
        )}

        <div className="product-header">
          <h1 className="product-title">{product.name}</h1>
        </div>

        <div className="rating-sold-container">
          <div className="stars">
            {Array.from({ length: 5 }, (_, index) => (
              <span
                key={index}
                className={`star ${index < (product.rating || 5) ? "filled" : ""}`}
              >
                ★
              </span>
            ))}
            <span className="rating-number">5</span>
            <span className="sold-count">| {formatSoldCount(product.sold || 0)} Sold</span>
          </div>
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
          <button className="add-to-cart" onClick={handleAddToCart}>
            🛒 Add to Cart
          </button>
          <button className="favorite">❤️</button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;