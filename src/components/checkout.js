import React, { useState, useEffect } from 'react';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import '../styles/checkout.css';
import '../styles/deliveryInfo.css';
import successImage from '../images/assets/checked.png';
import cashOnDeliveryImage from '../images/assets/cash.webp'; // Import cash on delivery image
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
  const [paymentMethod, setPaymentMethod] = useState(''); // 'bank' or 'cash'
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

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
        productImage: cartItem.image || "/placeholder.jpg",
        _id: cartItem.uniqueId,
      }));

      const balance = cartItems
        .reduce((acc, item) => acc + item.price * item.quantity, 0)
        .toFixed(2);

      const newOrderData = { amount: balance, orderDetails };
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
      setImage(null); // Clear any uploaded image if switching to cash
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return <p>Your cart is empty.</p>;
  }

  return (
    <div className="checkout-container">
      <h1 className="checkout-header">Checkout</h1>

      {currentStep === 1 && (
        <>
          <div className="checkout-items">
            {cartItems.map((item) => (
              <div key={item.uniqueId} className="checkout-item-card">
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
              Total: ETB
              {cartItems
                .reduce((acc, item) => acc + item.price * item.quantity, 0)
                .toFixed(2)}
            </h3>
          </div>

          <div className="order-button">
            <button onClick={() => { handleProceedToDelivery(); setCurrentStep(2); }} className="no-background-btn">
              Proceed to Delivery Info
            </button>
          </div>
        </>
      )}

      {currentStep === 2 && (
        <>
          <div className="delivery-info-container">
            <h2>Delivery Information</h2>
            <form
              onSubmit={(e) => {
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
              }}
            >
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
                <button type="button" onClick={() => setCurrentStep(1)} className="no-background-btn">
                  Back to Cart
                </button>
                <button type="submit" className="no-background-btn">Proceed to Payment</button>
              </div>
            </form>
          </div>
        </>
      )}

      {currentStep === 3 && (
        <>
          <div className="payment-method-container">
            <h2>Select Payment Method</h2>
            
            {!paymentMethod ? (
              <div className="payment-options">
                <div 
                  className="payment-option-card"
                  onClick={() => handlePaymentMethodSelect('bank')}
                >
                  <h3>Bank Transfer</h3>
                  <p>Upload payment screenshot</p>
                </div>
                <div 
                  className="payment-option-card"
                  onClick={() => handlePaymentMethodSelect('cash')}
                >
                  <h3>Cash On Delivery</h3>
                  <p>Pay when you receive your order</p>
                  <img src={cashOnDeliveryImage} alt="Cash on delivery" className="cash-image" />
                </div>
              </div>
            ) : (
              <div className="selected-payment-method">
                <h3>Selected Payment Method: 
                  <span className="method-name">
                    {paymentMethod === 'bank' ? 'Bank Transfer' : 'Cash On Delivery'}
                  </span>
                </h3>
                <button 
                  onClick={() => setPaymentMethod('')}
                  className="change-method-btn"
                >
                  Change Method
                </button>
              </div>
            )}

            {paymentMethod === 'bank' && (
              <div className="file-upload">
                <label htmlFor="payment-screenshot">Upload Payment Screenshot</label>
                <input
                  type="file"
                  id="payment-screenshot"
                  accept="image/*"
                  onChange={handleImageChange}
                  required={paymentMethod === 'bank'}
                />
                {image && (
                  <div className="image-preview" onClick={openModal}>
                    <img src={image} alt="Payment Screenshot" />
                    <span className="click-hint">Click to view image clearly</span>
                  </div>
                )}
              </div>
            )}

            {paymentMethod === 'cash' && (
              <div className="cash-method-info">
                <img src={cashOnDeliveryImage} alt="Cash on delivery" className="cash-preview-image" />
                <p>You will pay when you receive your order</p>
              </div>
            )}

            {error && <p className="error-message">{error}</p>}

            <div className="order-button">
              <button 
                onClick={handleOrderSubmit} 
                className="no-background-btn"
                disabled={!paymentMethod || (paymentMethod === 'bank' && !image)}
              >
                Complete Order
              </button>
            </div>
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
          </div>
        </div>
      )}

      {isLoading && (
        <div className="loading-modal">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
