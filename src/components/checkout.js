import React, { useState, useEffect } from 'react';
import { useCart } from './CartContext'; // Assuming CartContext provides the cart items
import { useAuth } from './AuthContext';  // Import useAuth to access logged-in user info
import '../styles/checkout.css';
import '../styles/deliveryInfo.css';
import successImage from '../images/assets/checked.png';
import jsQR from 'jsqr';




const Checkout = () => {
  const { cartItems } = useCart();
  const { user } = useAuth();  // Access logged-in user from AuthContext
  const [image, setImage] = useState(null);
  const [cart, setCart] = useState([]);

  const [imageName, setImageName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    // Load cart from localStorage
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
        productId: cartItem.productId,  // ✅ Store productId explicitly
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
        setImageName(file.name);  // Store the file name (e.g., payment.png)
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
    if (!image) {
      setError("Please upload a payment screenshot before completing the order.");
      return;
    }
    if (!phoneNumber || !address) {
      setError("Please provide both phone number and delivery address.");
      return;
    }
  
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const fullName = user?.fullName || "Guest User";
    const userId = user?.userId;
  
    if (!userId) {
      console.error("❌ User ID is missing! Cannot proceed.");
      setError("User authentication issue. Please log in again.");
      return;
    }
  
    console.log("✅ User ID:", userId);
  
    const storedOrderData = localStorage.getItem("orderData");
    const orderData = storedOrderData ? JSON.parse(storedOrderData) : {};
  
    // ✅ Retrieve and ensure `productId` is included in order details
    const updatedOrderDetails = (orderData.orderDetails || []).map(item => ({
      productId: item.productId,  // ✅ Ensuring productId is sent
      product: item.product,
      quantity: item.quantity,
      price: item.price,
      productImage: item.productImage,
    }));
  
    console.log("📦 Order Details (with productId):", updatedOrderDetails);
  
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
    formData.append("amount", updatedOrderData.amount || 0);
    formData.append("status", updatedOrderData.status);
    formData.append("phoneNumber", updatedOrderData.phoneNumber);
    formData.append("deliveryAddress", updatedOrderData.deliveryAddress);
    formData.append("orderDetails", JSON.stringify(updatedOrderData.orderDetails || []));
  
    const paymentBlob = await fetch(image).then(res => res.blob());
    const paymentFile = new File([paymentBlob], imageName || "payment.jpg", { type: paymentBlob.type });
    formData.append("paymentImage", paymentFile);
  
    if (updatedOrderData.orderDetails) {
      await Promise.all(updatedOrderData.orderDetails.map(async (item, index) => {
        if (item.productImage && item.productImage !== "null") {
          const productBlob = await fetch(item.productImage).then(res => res.blob());
          const productFile = new File([productBlob], `product-${index}.jpg`, { type: productBlob.type });
          formData.append("productImages", productFile);
        }
      }));
    }
  
    try {
      console.log("🚀 Sending order data to backend...");
      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error("Failed to submit order");
      }
  
      const result = await response.json();
      console.log("✅ Order submitted successfully:", result);
  
      localStorage.removeItem("orderData");
      localStorage.removeItem("cart");
  
      if (setCart) {
        setCart([]);
      }
  
      console.log(`🛒 Sending DELETE request to backend to clear cart for user ID: ${userId}...`);
      const deleteCartURL = `http://localhost:5000/api/cart/user/${userId}`;
      const userToken = user?.token || localStorage.getItem("token");
  
      if (!userToken) {
        console.error("❌ Token is missing. Please log in again.");
        setError("Authentication token is missing. Please log in again.");
        return;
      }
  
      const cartDeleteResponse = await fetch(deleteCartURL, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${userToken}`,
        },
      });
  
      if (!cartDeleteResponse.ok) {
        const cartDeleteError = await cartDeleteResponse.json();
        throw new Error(`Failed to clear cart: ${cartDeleteError.error || "Unknown error"}`);
      }
  
      console.log("✅ Cart cleared successfully from backend!");
      setOrderSubmitted(true);
      setTimeout(() => {
        setOrderSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error("❌ Error submitting order:", error);
      setError(error.message || "Failed to submit order. Please try again.");
    }
  };
  


  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
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
                    {item.quantity} x ${item.price}
                  </p>
                  <p>Total: ${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="total-cost">
            <h3>
              Total: $ 
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
                console.log("📦 Updated Order Data with Delivery Info:", updatedOrderData);

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
            <button onClick={handleOrderSubmit} className="no-background-btn">Complete Order</button>
          </div>
        </>
      )}

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
