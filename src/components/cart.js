import React, { useEffect } from "react";
import { useCart } from "./CartContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "../styles/cart.css";
import { Carousel } from "react-responsive-carousel"; // Import Carousel component
import "react-responsive-carousel/lib/styles/carousel.min.css"; // Import carousel styles

const API_BASE_URL = "https://pa-gebeya-backend.onrender.com/api/cart"; // Backend API URL
const IMAGE_BASE_URL = "https://pa-gebeya-backend.onrender.com"; // Base URL for images

const Cart = () => {
  const { cartItems, setCartItems, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/auth"); // Redirect to login if no token
        return;
      }
      try {
        const response = await axios.get(API_BASE_URL, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setCartItems(response.data.items || []);
      } catch (error) {
        console.error("❌ Error fetching cart:", error.message);
      }
    };
    fetchCart();
  }, [setCartItems, navigate]);

  const handleCheckout = () => {
    const orderDetails = cartItems.map((cartItem) => ({
      productId: cartItem.productId?._id, // ✅ Ensure productId exists
      product: cartItem.productId?.name || "Unknown Product",
      quantity: cartItem.quantity,
      price: cartItem.productId?.price || 0,
      productImage: cartItem.img
        ? cartItem.img.startsWith("http") // Check if img already has a full URL
          ? cartItem.img
          : `${IMAGE_BASE_URL}${cartItem.img}`
        : cartItem.productId?.image
        ? `${IMAGE_BASE_URL}/uploads/${cartItem.productId.image}`
        : "/placeholder.jpg",
    }));

    const balance = cartItems
      .reduce((acc, item) => acc + (item.productId?.price || 0) * item.quantity, 0)
      .toFixed(2);

    const orderData = { amount: balance, orderDetails };

    localStorage.setItem("orderData", JSON.stringify(orderData));
    console.log("🛒 Order Data Saved:", orderData);
    navigate("/checkout");
  };

  const handleUpdateQuantity = async (productId, currentQuantity, increment) => {
    const newQuantity = increment ? currentQuantity + 1 : currentQuantity - 1;

    // Prevent negative quantity
    if (newQuantity <= 0) return;

    try {
      const token = localStorage.getItem("token");

      // Send the new quantity to the backend
      const response = await axios.put(
        `https://pa-gebeya-backend.onrender.com/api/cart/${productId}`,
        { quantity: newQuantity },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        // Update the frontend state for cart items
        setCartItems((prevCart) =>
          prevCart.map((item) =>
            item.productId._id === productId ? { ...item, quantity: newQuantity } : item
          )
        );

        toast.success(`Quantity updated to ${newQuantity}`);
      } else {
        throw new Error("Failed to update quantity in the backend");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity");
    }
  };

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1>Your Cart</h1>
        <p className="shipping-info">{cartItems.length} item(s) ship at checkout</p>
      </div>

      <div className="cart-main">
        <div className="cart-content">
          {cartItems.length === 0 && <p className="empty-cart">Your cart is currently empty.</p>}

          {cartItems.map((cartItem) => {
            if (!cartItem.productId) return null; // Ensure productId exists
            const product = cartItem.productId;

            // Construct the image URL
            const imageUrl = cartItem.img
              ? cartItem.img.startsWith("http") // Check if img already has a full URL
                ? cartItem.img
                : `${IMAGE_BASE_URL}${cartItem.img}`
              : product.image
              ? `${IMAGE_BASE_URL}/uploads/${product.image}`
              : "/placeholder.jpg"; // Fallback image

            return (
              <div key={product._id} className="cart-item">
                {/* Display the product image */}
                <div className="cart-item-image-container">
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="cart-item-image"
                    onError={(e) => (e.target.src = "/placeholder.jpg")} // Handle broken images
                  />
                </div>

                <div className="cart-item-details">
                  <div className="cart-item-header">
                    <div>
                      <h2>{product.name}</h2>
                      <p className="quantity-text">
                        {cartItem.quantity} item(s) — <strong>The Price Of One:</strong> ETB {Number(product.price).toFixed(2)}
                      </p>
                    </div>
                    <button className="delete-icon" onClick={() => removeFromCart(product._id)}>
                      🗑️
                    </button>
                  </div>

                  <div className="cart-bottom-section">
                    <div className="quantity-controls">
                      <button onClick={() => handleUpdateQuantity(product._id, cartItem.quantity, false)}>-</button>
                      <span>{cartItem.quantity}</span>
                      <button onClick={() => handleUpdateQuantity(product._id, cartItem.quantity, true)}>+</button>
                    </div>
                    <p className="item-price">ETB {(product.price * cartItem.quantity).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {cartItems.length > 0 && (
          <div className="summary">
            <h2>Orders</h2>
            <div className="summary-details">
              <p>
                <strong>Subtotal ({cartItems.length} items)</strong>
                <span>
                  ETB {cartItems.reduce((acc, item) => acc + item.productId.price * item.quantity, 0).toFixed(2)}
                </span>
              </p>
              <p><strong>Shipping Discount</strong> <span>ETB 0.00</span></p>
              <p><strong>Shipping & Handling</strong> <span>ETB 0.00</span></p>
              <p><strong>Tax (Calculated at checkout)</strong> <span>ETB 0.00</span></p>
            </div>
            <div className="balance">
              <p>
                <strong>Balance</strong>
                <span>
                  ETB {cartItems.reduce((acc, item) => acc + item.productId.price * item.quantity, 0).toFixed(2)}
                </span>
              </p>
            </div>
            <button className="checkout-button" onClick={handleCheckout}>Checkout</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;