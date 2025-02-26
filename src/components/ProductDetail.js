import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "./CartContext"; // Import Cart Context
import { toast } from "react-toastify"; // Import toast for notifications
import "../styles/ProductDetails.css";

const ProductDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart(); // Use the cart context function

  const product = location.state?.product || {};
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = async () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    console.log("Retrieved userId:", userId);
    console.log("Retrieved Token:", token);
    console.log("Product Data:", product); // Debugging log

    if (!userId || !token) {
      toast.error("Please log in to add items to the cart");
      return;
    }

    let productId = product._id || product.id;
    if (!productId) {
      console.error("Error: Product ID is undefined");
      toast.error("Error adding item to cart: Product ID missing");
      return;
    }
    if (typeof productId === "number") {
      productId = `67b91997c5d356b58cffb65f`;
    }

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("productId", String(productId));
    formData.append("productName", product.title || product.name || "Unnamed Product");
    formData.append("price", product.price);
    formData.append("quantity", quantity);

    if (product.file instanceof File && product.file.size > 0) {
      formData.append("image", product.file);
      console.log("✅ Image sent as file:", product.file);
    } else if (typeof product.img === "string" && product.img.trim() !== "") {
      try {
        const response = await fetch(product.img);
        const blob = await response.blob();
        if (blob.size > 0) {
          const file = new File([blob], "product_image.jpg", { type: blob.type });
          formData.append("image", file);
          console.log("✅ Image sent as downloaded file:", file);
        } else {
          console.warn("⚠️ Downloaded image is empty, skipping upload.");
        }
      } catch (error) {
        console.error("❌ Error converting image URL to file:", error);
      }
    } else {
      console.warn("⚠️ No valid image provided. Skipping image upload.");
    }

    console.log("🔹 Final Request Payload:");
    for (const [key, value] of formData.entries()) {
      console.log(`   ${key}:`, value);
    }

    try {
      const response = await fetch("http://localhost:5000/api/cart", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const responseData = await response.json();
      console.log("🔹 Server Response:", responseData);

      if (!response.ok) {
        console.error("❌ Server Response Error:", responseData);
        throw new Error(`Failed to add item: ${responseData.error}`);
      }

      toast.success("Item added to cart!");
      addToCart(responseData);
      navigate("/cart");
    } catch (error) {
      console.error("❌ Error adding to cart:", error);
      toast.error(error.message);
    }
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
