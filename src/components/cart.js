import React from "react";
import { useCart } from "./CartContext"; // Import Cart Context
import "../styles/cart.css";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity } = useCart();

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1>Your Cart</h1>
        <p className="shipping-info">{cartItems.length} item(s) ship at checkout</p>
      </div>

      {/* Flexbox container for cart-content and summary */}
      <div className="cart-main">
      <div className="cart-content">
  {/* If cart is empty */}
  {cartItems.length === 0 && <p className="empty-cart">Your cart is currently empty.</p>}

  {/* Render each product as an independent card */}
  {cartItems.map((cartItem) => (
    <div key={cartItem.uniqueId} className="cart-item">
      <img src={cartItem.img} alt={cartItem.title} className="cart-item-image" />
      <div className="cart-item-details">
        <div className="cart-item-header">
          <div>
            <h2>{cartItem.title}</h2>
            <p className="quantity-text">
  {cartItem.quantity} item(s) — <strong>The Price Of One:</strong> ${Number(cartItem.price).toFixed(2)}
</p>

<p className="item-price">${(Number(cartItem.price) * cartItem.quantity).toFixed(2)}</p>

          </div>
          <button
            className="delete-icon"
            onClick={() => removeFromCart(cartItem.uniqueId)}
          >
            🗑️
          </button>
        </div>

        {/* Bottom Section: Counter and Price */}
        <div className="cart-bottom-section">
          <div className="quantity-controls">
            <button onClick={() => updateQuantity(cartItem.uniqueId, cartItem.quantity - 1)}>-</button>
            <span>{cartItem.quantity}</span>
            <button onClick={() => updateQuantity(cartItem.uniqueId, cartItem.quantity + 1)}>+</button>
          </div>
          <p className="item-price">${(cartItem.price * cartItem.quantity).toFixed(2)}</p>
        </div>
      </div>
    </div>
  ))}
</div>


        {/* Summary Section */}
        {cartItems.length > 0 && (
          <div className="summary">
            <h2>Summary</h2>
            <div className="summary-details">
              <p>
                <strong>Subtotal ({cartItems.length} items)</strong>
                <span>
                  $ {cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}
                </span>
              </p>
              <p>
                <strong>Shipping Discount</strong> <span>$0.00</span>
              </p>
              <p>
                <strong>Shipping & Handling</strong> <span>$0.00</span>
              </p>
              <p>
                <strong>Tax (Calculated at checkout)</strong> <span>$0.00</span>
              </p>
            </div>
            <div className="balance">
              <p>
                <strong>Balance</strong>
                <span>
                  $ {cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}
                </span>
              </p>
            </div>
            <button className="checkout-button">Checkout</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
