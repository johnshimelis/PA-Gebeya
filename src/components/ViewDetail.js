import React, { useEffect, useState } from 'react';
import '../styles/ViewDetail.css';

const ViewDetail = () => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Manage modal state
  const [modalImage, setModalImage] = useState(''); // Store image URL for fullscreen view

  useEffect(() => {
    const order = localStorage.getItem('orderDetails');
    if (order) {
      setOrderDetails(JSON.parse(order));
    }
  }, []);

  if (!orderDetails) {
    return <p>Loading...</p>;
  }

  // Open modal when the image is clicked
  const openModal = (image) => {
    setModalImage(image);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setModalImage('');
  };

  return (
    <div className="view-detail-container">
      <div className="view-detail-card">
        {/* Header Section */}
        <div className="view-detail-header">
          <h2 className="view-detail-title">Order Details</h2>
          <div className={`view-detail-status ${orderDetails.status.toLowerCase()}`}>
            {orderDetails.status}
          </div>
        </div>

        {/* Layout: Left for Order Details, Right for Products */}
        <div className="view-detail-body">
          {/* Left Side - Order Information */}
          <div className="order-info">
            <div className="view-detail-item">
              <strong>Order ID:</strong> {orderDetails.id}
            </div>
            <div className="view-detail-item">
              <strong>Name:</strong> {orderDetails.name}
            </div>
            <div className="view-detail-item">
              <strong>Amount:</strong> ${orderDetails.amount.toFixed(2)}
            </div>
            <div className="view-detail-item">
              <strong>Phone Number:</strong> {orderDetails.phoneNumber}
            </div>
            <div className="view-detail-item">
              <strong>Delivery Address:</strong> {orderDetails.deliveryAddress}
            </div>

            {/* Payment Image Section */}
            <div className="payment-image-section">
              <div className="payment-image-header">
                <strong>Payment Image</strong>
              </div>
              {/* Use the paymentImage URL directly */}
              <img
                src={orderDetails.paymentImage} // No need to prepend baseURL
                alt="Payment"
                className="payment-image"
                onClick={() => openModal(orderDetails.paymentImage)} // Open modal on image click
              />
            </div>
          </div>

          {/* Right Side - Order Products */}
          <div className="order-products">
            <h3 className="order-details-title">Products in Your Order</h3>
            {orderDetails.orderDetails.map((product, index) => (
              <div key={index} className="order-detail-item">
                <div className="product-image-container">
                  {/* Use the productImage URL directly */}
                  <img
                    src={product.productImage} // No need to prepend baseURL
                    alt={product.product}
                    className="product-image"
                    onClick={() => openModal(product.productImage)} // Open modal on image click
                  />
                </div>
                <div className="product-info">
                  <div className="product-name">{product.product}</div>
                  <div className="product-quantity">Quantity: {product.quantity}</div>
                  <div className="product-price">Price: ${product.price.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Section */}
        <div className="view-detail-footer">
          <p><strong>Order Placed:</strong> {new Date(orderDetails.createdAt).toLocaleString()}</p>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={modalImage} alt="Fullscreen Payment" className="modal-image" />
            <button className="close-modal" onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewDetail;