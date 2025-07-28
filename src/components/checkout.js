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
  const [cart, setCart] = useState([]);
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
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  const handleProceedToDelivery = () => {
    const storedOrderData = localStorage.getItem("orderData");
    const orderData = storedOrderData ? JSON.parse(storedOrderData) : null;

    if (orderData) {
      console.log("✅ Keeping Existing Order Data:", orderData);
    } else {
      const orderDetails = cartItems.map((cartItem) => ({
        productId: cartItem.productId,
        product: cartItem.title,
        quantity: cartItem.quantity,
        price: cartItem.price,
        productImage: cartItem.image || null,
        _id: cartItem.uniqueId,
      }));

      const balance = cartItems
        .reduce((acc, item) => acc + item.price * item.quantity, 0)
        .toFixed(2);

      const newOrderData = { 
        amount: balance, 
        orderDetails 
      };

      localStorage.setItem("orderData", JSON.stringify(newOrderData));
      console.log("🛒 New Order Data Saved:", newOrderData);
    }

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
      setError("Please upload a payment screenshot before completing the order.");
      return;
    }
    if (!phoneNumber || !address) {
      setError("Please provide both phone number and delivery address.");
      return;
    }

    setIsLoading(true);
    setError('');

    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const userId = user?.userId;

    if (!userId) {
      setError("User authentication issue. Please log in again.");
      setIsLoading(false);
      return;
    }

    // Prepare FormData for the order
    const formData = new FormData();
    
    // Add basic order information
    formData.append("userId", userId);
    formData.append("name", user?.fullName || "Guest");
    formData.append("phoneNumber", phoneNumber);
    formData.append("deliveryAddress", address);
    formData.append("status", "Pending");

    // Calculate total amount
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    formData.append("amount", totalAmount.toString());

    // Add payment image
    const paymentBlob = await fetch(image).then(res => res.blob());
    const paymentFile = new File([paymentBlob], `payment-${Date.now()}.jpg`, { type: 'image/jpeg' });
    formData.append("paymentImage", paymentFile);

    // Process each cart item to include product images
    const orderDetails = cartItems.map(item => {
      return {
        productId: item.productId,
        product: item.title,
        quantity: item.quantity,
        price: item.price,
        productImage: item.image || null
      };
    });
    formData.append("orderDetails", JSON.stringify(orderDetails));

    // Add product images if available
    for (const item of cartItems) {
      if (item.image && item.image.startsWith('http')) {
        try {
          const response = await fetch(item.image);
          const blob = await response.blob();
          const file = new File(
            [blob], 
            `product-${item.productId || Date.now()}.jpg`, 
            { type: blob.type }
          );
          formData.append("productImages", file);
        } catch (error) {
          console.error("Error processing product image:", error);
        }
      }
    }

    try {
      // Submit order to backend
      const response = await fetch("https://pa-gebeya-backend.onrender.com/api/orders", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit order");
      }

      const result = await response.json();
      console.log("Order submission successful:", result);

      // Send notification
      const token = localStorage.getItem("token");
      if (token) {
        await fetch("https://pa-gebeya-backend.onrender.com/api/users/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: userId,
            orderId: result.id,
            message: `Hello ${user?.fullName}, your order #${result.id} is submitted successfully and pending.`,
            date: new Date().toISOString(),
          }),
        });
      }

      // Save to user orders
      if (token) {
        await fetch("https://pa-gebeya-backend.onrender.com/api/users/orders/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            orderId: result.id,
            userId: userId,
            date: new Date().toISOString(),
            status: "Pending",
            total: totalAmount,
          }),
        });
      }

      // Clear cart and local storage
      localStorage.removeItem("cart");
      localStorage.removeItem("orderData");
      if (clearCart) clearCart();

      // Show success message
      setOrderSubmitted(true);
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      console.error("Order submission failed:", error);
      setError(error.message || "Failed to submit order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="empty-cart-message">
        <p>Your cart is empty.</p>
        <button onClick={() => navigate("/")} className="back-to-shop-btn">
          Back to Shop
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
                    {item.quantity} x ETB {item.price}
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
            <button 
              onClick={handleProceedToDelivery} 
              className="no-background-btn"
            >
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
              />
            </div>
            <div className="form-buttons">
              <button 
                type="button" 
                onClick={() => setCurrentStep(1)} 
                className="no-background-btn"
              >
                Back to Cart
              </button>
              <button 
                type="submit" 
                className="no-background-btn"
              >
                Proceed to Payment
              </button>
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

          <div className="order-button">
            <button 
              onClick={handleOrderSubmit} 
              className="no-background-btn"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Complete Order"}
            </button>
          </div>
        </>
      )}

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

      {orderSubmitted && (
        <div className="order-success-popup">
          <div className="popup-content">
            <img src={successImage} alt="Success Icon" className="success-icon" />
            <h2>Your order has been submitted successfully!</h2>
            <p>You will be redirected to the home page shortly...</p>
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
