import React, { useState, useEffect } from 'react';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import '../styles/checkout.css';
import '../styles/deliveryInfo.css';
import successImage from '../images/assets/checked.png';
import cashOnDeliveryImage from '../images/assets/cash.webp';
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
  const [paymentMethod, setPaymentMethod] = useState('');
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  // Calculate total
  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2);

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
        productImage: cartItem.image || "/placeholder.jpg",
        _id: cartItem.uniqueId,
      }));

      const newOrderData = { amount: totalAmount, orderDetails };
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
      } else {
        console.log('No QR Code found');
      }
    };
  };

  const handleOrderSubmit = async () => {
    // Validation checks
    if (!phoneNumber || !address) {
      setError("Please provide both phone number and delivery address.");
      return;
    }
    
    if (paymentMethod === 'bank' && !image) {
      setError("Please upload a payment screenshot for bank transfer.");
      return;
    }

    setIsLoading(true);

    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const fullName = user?.fullName || "Guest User";
    const userId = user?.userId;

    if (!userId) {
      console.error("❌ User ID is missing! Cannot proceed.");
      setError("User authentication issue. Please log in again.");
      setIsLoading(false);
      return;
    }

    console.log("✅ User ID:", userId);

    const storedOrderData = localStorage.getItem("orderData");
    const orderData = storedOrderData ? JSON.parse(storedOrderData) : {};

    const updatedOrderDetails = (orderData.orderDetails || []).map(item => ({
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
      paymentMethod: paymentMethod === 'bank' ? 'Bank Transfer' : 'Cash On Delivery',
      orderDetails: updatedOrderDetails,
    };

    const formData = new FormData();
    formData.append("userId", updatedOrderData.userId);
    formData.append("name", updatedOrderData.name);
    formData.append("amount", updatedOrderData.amount || 0);
    formData.append("status", updatedOrderData.status);
    formData.append("phoneNumber", updatedOrderData.phoneNumber);
    formData.append("deliveryAddress", updatedOrderData.deliveryAddress);
    formData.append("paymentMethod", updatedOrderData.paymentMethod);
    formData.append("orderDetails", JSON.stringify(updatedOrderData.orderDetails || []));

    // Only add payment image if method is bank transfer
    if (paymentMethod === 'bank' && image) {
      const paymentBlob = await fetch(image).then(res => res.blob());
      const paymentFile = new File([paymentBlob], imageName || "payment.jpg", { type: paymentBlob.type });
      formData.append("paymentImage", paymentFile);
    } else {
      formData.append("paymentImage", "Cash On Delivery");
    }

    try {
      console.log("🚀 Sending order data to backend...");
      const response = await fetch("https://pa-gebeya-backend.onrender.com/api/orders", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to submit order");
      }

      const submittedOrder = await response.json();
      console.log("✅ Order submitted successfully:", submittedOrder);
      localStorage.setItem("submittedOrder", JSON.stringify(submittedOrder));

      // Send notification
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("❌ No authentication token found. User may not be logged in.");
        return;
      }

      const orderId = submittedOrder?.id || "MissingOrderId";
      await fetch("https://pa-gebeya-backend.onrender.com/api/users/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: submittedOrder.userId,
          orderId: orderId,
          message: `Hello ${submittedOrder.name}, your <a href="/view-detail" class="order-link">order</a> is submitted successfully and pending. Please wait for approval.`,
          date: new Date().toISOString(),
        }),
      });

      // Save order in UserOrders
      await fetch("https://pa-gebeya-backend.onrender.com/api/users/orders/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: orderId,
          userId: submittedOrder.userId,
          date: new Date().toISOString(),
          status: "Pending",
          total: submittedOrder.amount || 0,
        }),
      });

      setOrderSubmitted(true);
      setIsLoading(false);

      setTimeout(() => {
        const deleteCartURL = `https://pa-gebeya-backend.onrender.com/api/cart/user/${userId}`;
        const userToken = user?.token || localStorage.getItem("token");

        fetch(deleteCartURL, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${userToken}`,
          },
        })
          .then(() => {
            localStorage.removeItem("orderData");
            localStorage.removeItem("cart");
            if (setCart) setCart([]);
            if (clearCart) clearCart();
            setOrderSubmitted(false);
            navigate("/");
          })
          .catch(error => {
            console.error("❌ Error clearing cart:", error);
            setError(error.message || "Failed to clear cart. Please try again.");
          });
      }, 2000);
    } catch (error) {
      console.error("❌ Error submitting order:", error);
      setError(error.message || "Failed to submit order. Please try again.");
      setIsLoading(false);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);
    setShowPaymentOptions(false);
    if (method === 'cash') {
      setImage(null);
    }
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="checkout-container">
        <div className="empty-cart-message">
          <h2>Your cart is empty</h2>
          <p>Add some items to your cart to proceed with checkout</p>
          <button onClick={() => navigate('/')} className="no-background-btn">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      {/* Progress Steps */}
      <div className="checkout-progress">
        <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>
          <div className="step-number">1</div>
          <span className="step-label">Order Review</span>
        </div>
        <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>
          <div className="step-number">2</div>
          <span className="step-label">Delivery Info</span>
        </div>
        <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <span className="step-label">Payment</span>
        </div>
      </div>

      <h1 className="checkout-header">Checkout</h1>

      {/* Step 1: Order Review */}
      {currentStep === 1 && (
        <div className="checkout-step">
          <div className="step-content">
            <h2>Order Summary</h2>
            
            <div className="checkout-items">
              {cartItems.map((item) => (
                <div key={item.uniqueId} className="checkout-item-card">
                  <div className="item-image">
                    <img 
                      src={item.image || '/placeholder.jpg'} 
                      alt={item.title}
                      onError={(e) => {
                        e.target.src = '/placeholder.jpg';
                      }}
                    />
                  </div>
                  <div className="checkout-item-details">
                    <h3>{item.title}</h3>
                    <div className="item-meta">
                      <span className="item-quantity">Qty: {item.quantity}</span>
                      <span className="item-price">ETB {item.price}</span>
                    </div>
                    <p className="item-total">Total: ETB {(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="order-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>ETB {totalAmount}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>FREE</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>ETB {totalAmount}</span>
              </div>
            </div>

            <div className="step-actions">
              <button 
                onClick={handleProceedToDelivery} 
                className="btn-primary"
              >
                Proceed to Delivery
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Delivery Information */}
      {currentStep === 2 && (
        <div className="checkout-step">
          <div className="step-content">
            <h2>Delivery Information</h2>
            
            <form className="delivery-form" onSubmit={(e) => {
              e.preventDefault();
              const storedOrderData = localStorage.getItem("orderData");
              const orderData = storedOrderData ? JSON.parse(storedOrderData) : {};

              const updatedOrderData = {
                ...orderData,
                phoneNumber,
                address,
              };

              localStorage.setItem("orderData", JSON.stringify(updatedOrderData));
              setCurrentStep(3);
            }}>
              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                  required
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="address">Delivery Address *</label>
                <textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your complete delivery address"
                  required
                  className="form-textarea"
                  rows="4"
                />
              </div>

              <div className="step-actions">
                <button 
                  type="button" 
                  onClick={() => goToStep(1)}
                  className="btn-secondary"
                >
                  Back to Cart
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={!phoneNumber || !address}
                >
                  Proceed to Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Step 3: Payment */}
      {currentStep === 3 && (
        <div className="checkout-step">
          <div className="step-content">
            <h2>Payment Method</h2>
            
            {!paymentMethod ? (
              <div className="payment-options-grid">
                <div 
                  className={`payment-option ${paymentMethod === 'bank' ? 'selected' : ''}`}
                  onClick={() => handlePaymentMethodSelect('bank')}
                >
                  <div className="payment-icon">🏦</div>
                  <div className="payment-info">
                    <h3>Bank Transfer</h3>
                    <p>Upload payment screenshot after transfer</p>
                  </div>
                </div>
                
                <div 
                  className={`payment-option ${paymentMethod === 'cash' ? 'selected' : ''}`}
                  onClick={() => handlePaymentMethodSelect('cash')}
                >
                  <div className="payment-icon">💵</div>
                  <div className="payment-info">
                    <h3>Cash On Delivery</h3>
                    <p>Pay when you receive your order</p>
                  </div>
                  <img src={cashOnDeliveryImage} alt="Cash on delivery" className="cash-image" />
                </div>
              </div>
            ) : (
              <div className="selected-payment-method">
                <div className="selected-method-header">
                  <h3>Selected Payment Method</h3>
                  <button 
                    onClick={() => setPaymentMethod('')}
                    className="change-method-btn"
                  >
                    Change
                  </button>
                </div>
                <div className="method-details">
                  <span className="method-name">
                    {paymentMethod === 'bank' ? '🏦 Bank Transfer' : '💵 Cash On Delivery'}
                  </span>
                </div>
              </div>
            )}

            {paymentMethod === 'bank' && (
              <div className="file-upload-section">
                <h4>Upload Payment Screenshot</h4>
                <div className="file-upload-area">
                  <input
                    type="file"
                    id="payment-screenshot"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input"
                  />
                  <label htmlFor="payment-screenshot" className="file-upload-label">
                    <div className="upload-icon">📁</div>
                    <span>Choose File</span>
                    {imageName && <span className="file-name">{imageName}</span>}
                  </label>
                </div>
                {image && (
                  <div className="image-preview" onClick={openModal}>
                    <img src={image} alt="Payment Screenshot" />
                    <span className="click-hint">Click to view full image</span>
                  </div>
                )}
              </div>
            )}

            {paymentMethod === 'cash' && (
              <div className="cash-method-info">
                <div className="cash-info-card">
                  <img src={cashOnDeliveryImage} alt="Cash on delivery" className="cash-preview-image" />
                  <div className="cash-info-text">
                    <h4>Cash On Delivery</h4>
                    <p>You will pay the exact amount when you receive your order</p>
                    <p className="cash-note">Our delivery agent will collect the payment upon delivery</p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="error-message">
                <span>⚠️</span>
                {error}
              </div>
            )}

            <div className="order-summary-final">
              <h4>Order Summary</h4>
              <div className="summary-row">
                <span>Items ({cartItems.length}):</span>
                <span>ETB {totalAmount}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>FREE</span>
              </div>
              <div className="summary-row total">
                <span>Total Amount:</span>
                <span>ETB {totalAmount}</span>
              </div>
            </div>

            <div className="step-actions">
              <button 
                type="button"
                onClick={() => goToStep(2)}
                className="btn-secondary"
              >
                Back
              </button>
              <button 
                onClick={handleOrderSubmit} 
                className="btn-primary"
                disabled={!paymentMethod || (paymentMethod === 'bank' && !image) || !phoneNumber || !address}
              >
                {isLoading ? 'Processing...' : 'Complete Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeModal}>
              ×
            </button>
            <img src={image} alt="Payment Screenshot" className="modal-image" />
          </div>
        </div>
      )}

      {/* Order Success Popup */}
      {orderSubmitted && (
        <div className="order-success-popup">
          <div className="popup-content">
            <img src={successImage} alt="Success Icon" className="success-icon" />
            <h2>Order Submitted Successfully!</h2>
            <p>Your order has been received and is being processed</p>
            <div className="loading-bar">
              <div className="loading-progress"></div>
            </div>
            <p className="redirect-text">Redirecting to homepage...</p>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p>Processing your order...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;