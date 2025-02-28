import React, { useEffect } from "react";
import { useCart } from "./CartContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/cart.css";

const API_BASE_URL = "http://localhost:5000/api/cart"; // Backend API URL
const IMAGE_BASE_URL = "http://localhost:5000"; // Base URL for images


const Cart = () => {
  const { cartItems, setCartItems, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();
  

  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/auth");  // Redirect to login if no token
        return;
      }
      try {
        const response = await axios.get(API_BASE_URL, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setCartItems(response.data.items || []);
      } catch (error) {
        console.error("❌ Error fetching cart:", error);
      }
    };
    fetchCart();
  }, [setCartItems, navigate]);
  const handleCheckout = () => {
    const orderDetails = cartItems.map((cartItem) => ({
      productId: cartItem.productId._id, // ✅ Include productId
      product: cartItem.productId.name,
      quantity: cartItem.quantity,
      price: cartItem.productId.price,
      productImage: cartItem.img
        ? `${IMAGE_BASE_URL}${cartItem.img}`
        : cartItem.productId.image
        ? `${IMAGE_BASE_URL}/uploads/${cartItem.productId.image}`
        : "/placeholder.jpg",
    }));

    const balance = cartItems.reduce(
      (acc, item) => acc + item.productId.price * item.quantity,
      0
    ).toFixed(2);

    const orderData = {
      amount: balance,
      orderDetails,
    };



  
    // Store in localStorage
    localStorage.setItem("orderData", JSON.stringify(orderData));
  
    // Log to console
    console.log("🛒 Order Data Saved:", orderData);
  
    // Navigate to checkout
    navigate("/checkout");
  };
  
  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/${productId}`,
        { quantity: newQuantity },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      setCartItems((prevCart) =>
        prevCart.map((item) =>
          item.productId._id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error("❌ Error updating quantity:", error);
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
            const imageUrl = cartItem.img
              ? `${IMAGE_BASE_URL}${cartItem.img}`
              : product.image
              ? `${IMAGE_BASE_URL}/uploads/${product.image}`
              : "/placeholder.jpg"; // Fallback image

            return (
              <div key={product._id} className="cart-item">
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="cart-item-image"
                  onError={(e) => (e.target.src = "/placeholder.jpg")} // Handle broken images
                />
                <div className="cart-item-details">
                  <div className="cart-item-header">
                    <div>
                      <h2>{product.name}</h2>
                      <p className="quantity-text">
                        {cartItem.quantity} item(s) — <strong>The Price Of One:</strong> ${Number(product.price).toFixed(2)}
                      </p>
                    </div>
                    <button className="delete-icon" onClick={() => removeFromCart(product._id)}>
                      🗑️
                    </button>
                  </div>

                  <div className="cart-bottom-section">
                    <div className="quantity-controls">
                      <button onClick={() => handleUpdateQuantity(product._id, cartItem.quantity - 1)}>-</button>
                      <span>{cartItem.quantity}</span>
                      <button onClick={() => handleUpdateQuantity(product._id, cartItem.quantity + 1)}>+</button>
                    </div>
                    <p className="item-price">${(product.price * cartItem.quantity).toFixed(2)}</p>
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
                  $ {cartItems.reduce((acc, item) => acc + item.productId.price * item.quantity, 0).toFixed(2)}
                </span>
              </p>
              <p><strong>Shipping Discount</strong> <span>$0.00</span></p>
              <p><strong>Shipping & Handling</strong> <span>$0.00</span></p>
              <p><strong>Tax (Calculated at checkout)</strong> <span>$0.00</span></p>
            </div>
            <div className="balance">
              <p>
                <strong>Balance</strong>
                <span>
                  $ {cartItems.reduce((acc, item) => acc + item.productId.price * item.quantity, 0).toFixed(2)}
                </span>
              </p>
            </div>
            <button className="checkout-button"  onClick={handleCheckout}>Checkout</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
