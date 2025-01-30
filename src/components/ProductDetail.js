import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "./CartContext"; // Updated import
import "../styles/ProductDetails.css";

const ProductDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart(); // Use the custom hook

  const product = location.state?.product || {};
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addToCart({ ...product, quantity });
    navigate("/cart");
  };

  const handleQuantityChange = (delta) => {
    setQuantity((prevQuantity) => Math.max(1, prevQuantity + delta));
  };

  return (
    <div className="product-details">
      <div className="left-section">
        <div className="main-image-container">
          <img className="main-image" src={product.img} alt={product.title} />
          <img className="small-image" src={product.img} alt="Thumbnail" />
        </div>
        <div className="thumbnail-container">
          {product.images?.map((img, index) => (
            <img key={index} className="thumbnail" src={img} alt={`Thumbnail ${index}`} />
          ))}
        </div>
      </div>

      <div className="right-section">
        <h1 className="product-title">{product.title}</h1>
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
