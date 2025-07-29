import React, { useState, useEffect } from 'react';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import '../styles/checkout.css';
import '../styles/deliveryInfo.css';
import successImage from '../images/assets/checked.png';
import { useNavigate } from "react-router-dom";
import jsQR from 'jsqr';

const Checkout = () => {
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const [image, setImage] = useState(null);
  const navigate = useNavigate();
  const [imageName, setImageName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (!storedCart && cartItems.length === 0) {
      navigate("/");
    }
  }, [cartItems, navigate]);

  const handleProceedToDelivery = () => {
    const orderDetails = cartItems.map((cartItem) => ({
      productId: cartItem.productId,
      product: cartItem.title,
      quantity: cartItem.quantity,
      price: cartItem.price,
      productImage: cartItem.image || "/placeholder.jpg",
    }));

    const balance = cartItems
      .reduce((acc, item) => acc + item.price * item.quantity, 0)
      .toFixed(2);

    const newOrderData = { amount: balance, orderDetails };
    localStorage.setItem("orderData", JSON.stringify(newOrderData));
    setCurrentStep(2);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setImageName(file.name);
        setError('');
        scanQRCode(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const scanQRCode = (imageData) => {
    const img = new Image();
    img.src = imageData;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const code = jsQR(imageData.data, img.width, img.height);
      if (code) {
        console.log('QR Code Data:', code.data);
      }
    };
  };

  const handleOrderSubmit = async () => {
    if (!image) {
      setError("Please upload a payment screenshot.");
      return;
    }
    if (!phoneNumber || !address) {
      setError("Please provide both phone number and delivery address.");
      return;
    }
  
    setIsLoading(true);
  
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const fullName = user?.fullName || "Guest User";
    const userId = user?.userId;
  
    if (!userId) {
      setError("User authentication issue. Please log in again.");
      setIsLoading(false);
      return;
    }
  
    const storedOrderData = localStorage.getItem("orderData");
    if (!storedOrderData) {
      setError("Order data missing. Please restart checkout process.");
      setIsLoading(false);
      return;
    }
    
    const orderData = JSON.parse(storedOrderData);
  
    const updatedOrderDetails = orderData.orderDetails.map(item => ({
      productId: item.productId,
      product: item.product,
      quantity: item.quantity,
      price: item.price,
      productImage: item.productImage,
    }));

    const updatedOrderData = {
      ...orderData,
      status: "Pending",
      name: fullName,
      userId: userId,
      phoneNumber,
      deliveryAddress: address,
      orderDetails: updatedOrderDetails,
    };
  
    const formData = new FormData();
    formData.append("userId", updatedOrderData.userId);
    formData.append("name", updatedOrderData.name);
    formData.append("amount", updatedOrderData.amount);
    formData.append("status", updatedOrderData.status);
    formData.append("phoneNumber", updatedOrderData.phoneNumber);
    formData.append("deliveryAddress", updatedOrderData.deliveryAddress);
    formData.append("orderDetails", JSON.stringify(updatedOrderData.orderDetails));
  
    try {
      const paymentBlob = await fetch(image).then(res => res.blob());
      const paymentFile = new File([paymentBlob], imageName || "payment.jpg", { type: paymentBlob.type });
      formData.append("paymentImage", paymentFile);
    } catch (error) {
      setError("Failed to process payment image");
      setIsLoading(false);
      return;
    }
  
    try {
      const response = await fetch("https://pa-gebeya-backend.onrender.com/api/orders", {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit order");
      }
      
      const submittedOrder = await response.json();
      localStorage.setItem("submittedOrder", JSON.stringify(submittedOrder));
      setOrderSubmitted(true);
      setIsLoading(false);
      
      // Clear cart after success
      setTimeout(() => {
        localStorage.removeItem("orderData");
        localStorage.removeItem("cart");
        clearCart();
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Order submission error:", error);
      setError(error.message || "Failed to submit order. Please try again.");
      setIsLoading(false);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="empty-cart-message">
        <p>Your cart is empty.</p>
        <button onClick={() => navigate("/")} className="no-background-btn">
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h1 className="checkout-header">Checkout</h1>

      {currentStep === 1 && (
        <>
          <div className="checkout-items">
            {cartItems.map((item) => (
              <div key={item.uniqueId} className="checkout-item-card">
                {item.image && (
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="checkout-item-image"
                  />
                )}
                <div className="checkout-item-details">
                  <h2>{item.title}</h2>
                  <p>
                    {item.quantity} x ETB {item.price.toFixed(2)}
                  </p>
                  <p>Total: ETB {(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="total-cost">
            <h3>
              Total: ETB {cartItems
                .reduce((acc, item) => acc + item.price * item.quantity, 0)
                .toFixed(2)}
            </h3>
          </div>

          <div className="order-button">
            <button onClick={handleProceedToDelivery} className="no-background-btn">
              Proceed to Delivery Info
            </button>
          </div>
        </>
      )}

      {currentStep === 2 && (
        <div className="delivery-info-container">
          <h2>Delivery Information</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            setCurrentStep(3);
          }}>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="address">Delivery Address</label>
              <textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your delivery address"
                required
                rows={4}
              />
            </div>
            <div className="form-buttons">
              <button type="button" onClick={() => setCurrentStep(1)} className="no-background-btn">
                Back to Cart
              </button>
              <button type="submit" className="no-background-btn">Proceed to Payment</button>
            </div>
          </form>
        </div>
      )}

      {currentStep === 3 && (
        <>
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
                <span className="click-hint">Click to view image clearly</span>
              </div>
            )}
            {error && <p className="error-message">{error}</p>}
          </div>

          <div className="delivery-summary">
            <h3>Delivery Information</h3>
            <p><strong>Phone:</strong> {phoneNumber}</p>
            <p><strong>Address:</strong> {address}</p>
          </div>

          {isModalOpen && (
            <div className="modal-overlay" onClick={closeModal}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <img src={image} alt="Payment Screenshot" className="modal-image" />
                <button className="close-modal" onClick={closeModal}>
                  Close
                </button>
              </div>
            </div>
          )}

          <div className="order-button">
            <button onClick={handleOrderSubmit} className="no-background-btn">
              Complete Order
            </button>
          </div>
        </>
      )}

      {orderSubmitted && (
        <div className="order-success-popup">
          <div className="popup-content">
            <img src={successImage} alt="Success Icon" className="success-icon" />
            <h2>Your order has been submitted successfully!</h2>
            <p>You will be redirected to the home page shortly.</p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="loading-modal">
          <div className="loading-spinner"></div>
          <p>Processing your order...</p>
        </div>
      )}
    </div>
  );
};

export default Checkout;
