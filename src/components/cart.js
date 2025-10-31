import React, { useEffect, useState } from "react";
import { useCart } from "./CartContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "../styles/cart.css";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const API_BASE_URL = "https://pa-gebeya-backend.onrender.com/api/cart";
const IMAGE_BASE_URL = "https://pa-gebeya-backend.onrender.com";

const Cart = () => {
  const { cartItems, setCartItems, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [removingItem, setRemovingItem] = useState(null);

  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/auth");
        return;
      }
      try {
        setIsLoading(true);
        const response = await axios.get(API_BASE_URL, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setCartItems(response.data.items || []);
      } catch (error) {
        console.error("❌ Error fetching cart:", error.message);
        toast.error("Failed to load cart items");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCart();
  }, [setCartItems, navigate]);

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const orderDetails = cartItems.map((cartItem) => ({
      productId: cartItem.productId?._id,
      product: cartItem.productId?.name || "Unknown Product",
      quantity: cartItem.quantity,
      price: cartItem.productId?.price || 0,
      productImage: cartItem.img
        ? cartItem.img.startsWith("http")
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

    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `https://pa-gebeya-backend.onrender.com/api/cart/${productId}`,
        { quantity: newQuantity },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
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

  const handleRemoveItem = async (productId) => {
    setRemovingItem(productId);
    try {
      await removeFromCart(productId);
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
    } finally {
      setRemovingItem(null);
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((acc, item) => acc + (item.productId?.price || 0) * item.quantity, 0).toFixed(2);
  };

  const getTotalItems = () => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  };

  if (isLoading) {
    return (
      <div className="cart-container">
        <div className="loading-cart">
          <div className="loading-spinner"></div>
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1>Your Shopping Cart</h1>
        <div className="cart-stats">
          <span className="item-count">{getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}</span>
          <span className="shipping-info">🚚 Free shipping on all orders</span>
        </div>
      </div>

      <div className="cart-main">
        <div className="cart-content">
          {cartItems.length === 0 ? (
            <div className="empty-cart-state">
              <div className="empty-cart-icon">🛒</div>
              <h2>Your cart is empty</h2>
              <p>Add some amazing products to get started!</p>
              <button 
                className="continue-shopping-btn"
                onClick={() => navigate('/')}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cartItems.map((cartItem) => {
              if (!cartItem.productId) return null;
              const product = cartItem.productId;

              const imageUrl = cartItem.img
                ? cartItem.img.startsWith("http")
                  ? cartItem.img
                  : `${IMAGE_BASE_URL}${cartItem.img}`
                : product.image
                ? `${IMAGE_BASE_URL}/uploads/${product.image}`
                : "/placeholder.jpg";

              return (
                <div key={product._id} className="cart-item-card">
                  <div className="cart-item-image-container">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="cart-item-image"
                      onError={(e) => (e.target.src = "/placeholder.jpg")}
                    />
                    {product.discount && (
                      <div className="discount-badge">-{product.discount}%</div>
                    )}
                  </div>

                  <div className="cart-item-content">
                    <div className="cart-item-header">
                      <div className="product-info">
                        <h3 className="product-name">{product.name}</h3>
                        <p className="product-category">{product.category?.name || "General"}</p>
                      </div>
                      <button 
                        className={`delete-btn ${removingItem === product._id ? 'removing' : ''}`}
                        onClick={() => handleRemoveItem(product._id)}
                        disabled={removingItem === product._id}
                      >
                        {removingItem === product._id ? '...' : '🗑️'}
                      </button>
                    </div>

                    <div className="cart-item-details">
                      <div className="price-section">
                        <span className="current-price">ETB {Number(product.price).toFixed(2)}</span>
                        {product.originalPrice && (
                          <span className="original-price">ETB {Number(product.originalPrice).toFixed(2)}</span>
                        )}
                      </div>

                      <div className="quantity-section">
                        <div className="quantity-controls">
                          <button 
                            onClick={() => handleUpdateQuantity(product._id, cartItem.quantity, false)}
                            className="quantity-btn"
                          >
                            −
                          </button>
                          <span className="quantity-display">{cartItem.quantity}</span>
                          <button 
                            onClick={() => handleUpdateQuantity(product._id, cartItem.quantity, true)}
                            className="quantity-btn"
                          >
                            +
                          </button>
                        </div>
                        <div className="item-total">
                          ETB {(product.price * cartItem.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="cart-item-actions">
                      <button 
                        className="save-for-later"
                        onClick={() => toast.info("Feature coming soon!")}
                      >
                        💾 Save for later
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-summary">
            <div className="summary-card">
              <h2>Order Summary</h2>
              
              <div className="summary-details">
                <div className="summary-row">
                  <span>Subtotal ({getTotalItems()} items)</span>
                  <span>ETB {getTotalPrice()}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span className="free-shipping">FREE</span>
                </div>
                <div className="summary-row">
                  <span>Tax</span>
                  <span>ETB 0.00</span>
                </div>
                <div className="summary-row discount">
                  <span>Discount</span>
                  <span>- ETB 0.00</span>
                </div>
              </div>

              <div className="total-section">
                <div className="total-row">
                  <span>Total</span>
                  <span className="total-amount">ETB {getTotalPrice()}</span>
                </div>
              </div>

              <button 
                className="checkout-btn"
                onClick={handleCheckout}
              >
                🛒 Proceed to Checkout
              </button>

              <div className="security-badges">
                <div className="security-item">
                  <span className="security-icon">🔒</span>
                  <span>Secure checkout</span>
                </div>
                <div className="security-item">
                  <span className="security-icon">🔄</span>
                  <span>Easy returns</span>
                </div>
              </div>
            </div>

            <div className="promo-section">
              <h3>Have a promo code?</h3>
              <div className="promo-input-group">
                <input 
                  type="text" 
                  placeholder="Enter promo code"
                  className="promo-input"
                />
                <button 
                  className="promo-btn"
                  onClick={() => toast.info("Promo code feature coming soon!")}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="mobile-checkout-bar">
          <div className="mobile-total">
            <span className="total-label">Total:</span>
            <span className="total-amount">ETB {getTotalPrice()}</span>
          </div>
          <button 
            className="mobile-checkout-btn"
            onClick={handleCheckout}
          >
            Checkout ({getTotalItems()})
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;