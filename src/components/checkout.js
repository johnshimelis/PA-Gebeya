import React, { useState } from "react";
import { useCart } from "./CartContext"; // Assuming CartContext is providing the cart items
import '../styles/checkout.css';
import successImage from "../images/assets/checked.png";

const Checkout = () => {
  const { cartItems } = useCart();
  const [image, setImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false); // New state for order confirmation
  const [error, setError] = useState(""); // State to track error messages

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setError(""); // Clear any existing error once the file is uploaded
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOrderSubmit = () => {
    if (!image) {
      setError("Please upload a payment screenshot before completing the order.");
      return; // Prevent submitting if no image is uploaded
    }
    setOrderSubmitted(true); // Show order submitted confirmation
    setTimeout(() => {
      setOrderSubmitted(false); // Hide the confirmation after a few seconds
    }, 3000);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Check if cartItems is defined and not empty
  if (!cartItems || cartItems.length === 0) {
    return <p>Your cart is empty.</p>;
  }

  return (
    <div className="checkout-container">
      <h1 className="checkout-header">Checkout</h1>

      <div className="checkout-items">
        {cartItems.map((item) => (
          <div key={item.uniqueId} className="checkout-item-card">
            <div className="checkout-item-details">
              <h2>{item.title}</h2>
              <p>{item.quantity} x ${item.price}</p>
              <p>Total: ${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="total-cost">
        <h3>Total: ${cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}</h3>
      </div>

      <div className="file-upload">
        <label htmlFor="payment-screenshot">Upload Payment Screenshot</label>
        <input
          type="file"
          id="payment-screenshot"
          accept="image/*"
          onChange={handleImageChange}
          required
        />
        {image && (
          <div className="image-preview" onClick={openModal}>
            <img src={image} alt="Payment Screenshot" />
            <span className="click-hint">Click to view image clearly</span> {/* Hint to click on image */}
          </div>
        )}
        {error && <p className="error-message">{error}</p>} {/* Display error if no file is uploaded */}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={image} alt="Payment Screenshot" className="modal-image" />
            <button className="close-modal" onClick={closeModal}>Close</button>
          </div>
        </div>
      )}

      <div className="order-button">
        <button onClick={handleOrderSubmit}>Complete Order</button>
      </div>

      {/* Success Message Popup */}
      {orderSubmitted && (
        <div className="order-success-popup">
          <div className="popup-content">
            <img src={successImage} alt="Success Icon" className="success-icon" />
            <h2>Your order has been submitted successfully!</h2>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
