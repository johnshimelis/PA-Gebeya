import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "./CartContext"; // Import Cart Context
import { toast } from "react-toastify"; // Import toast for notifications
import "../styles/ProductDetails.css";

const ProductDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart(); // Use the cart context function

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
useEffect(() => {
  const storedProduct = localStorage.getItem("productDetail");
  if (storedProduct) {
    const parsedProduct = JSON.parse(storedProduct);
    console.log("Stored Product:", parsedProduct); // Debugging
    setProduct(parsedProduct);
  }
}, []);

  useEffect(() => {
    // Retrieve product data from local storage if not in location.state
    const storedProduct = localStorage.getItem("selectedProduct");
    if (location.state?.product) {
      setProduct(location.state.product);
      localStorage.setItem("selectedProduct", JSON.stringify(location.state.product));
    } else if (storedProduct) {
      setProduct(JSON.parse(storedProduct));
    }
  }, [location.state]);

  const handleAddToCart = async () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!userId || !token) {
      toast.error("Please log in to add items to the cart");
      return;
    }

    if (!product) {
      toast.error("Error: No product data available.");
      return;
    }

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("productId", product._id);
    formData.append("productName", product.name);
    formData.append("price", product.price);
    formData.append("quantity", quantity);

    try {
      const response = await fetch("http://localhost:5000/api/cart", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to add item to cart.");
      }

      toast.success("Item added to cart!");
      addToCart(responseData);
      navigate("/cart");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleQuantityChange = (delta) => {
    setQuantity((prevQuantity) => Math.max(1, prevQuantity + delta));
  };

  if (!product) {
    return <p>Loading product details...</p>;
  }

  return (
    <div className="product-details">
      <div className="left-section">
        <div className="main-image-container">
        <img
  className="main-image"
  src={`${product.photo}?t=${new Date().getTime()}`}
  alt={product.name}
/>

<img
  className="small-image"
  src={product.photo || `http://localhost:5000/uploads/${product.image}`}
  alt="Thumbnail"
/>

        </div>
      </div>

      <div className="right-section">
        <h1 className="product-title">{product.name}</h1>
        <p className="short-description">{product.shortDescription}</p>
        <p className="full-description">{product.fullDescription}</p>

        <div className="info-section">
          <div className="price-counter-row">
            <p className="price">{product.price} AED</p>
            <div className="quantity-selector">
              <button onClick={() => handleQuantityChange(-1)}>-</button>
              <span>{quantity}</span>
              <button onClick={() => handleQuantityChange(1)}>+</button>
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
    </div>
  );
};

export default ProductDetails;
