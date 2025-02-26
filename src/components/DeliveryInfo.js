// DeliveryInfo.js
import React, { useState } from 'react';
import '../styles/deliveryInfo.css'; // Import the corresponding CSS file

const DeliveryInfo = ({ onSubmit }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Perform validation if needed
    if (phoneNumber && address) {
      onSubmit({ phoneNumber, address });
    } else {
      alert('Please fill in both fields.');
    }
  };

  return (
    <div className="delivery-info-container">
      <h2>Delivery Information</h2>
      <form onSubmit={handleSubmit}>
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
          ></textarea>
        </div>
        <button type="submit" className="submit-button">Proceed to Payment</button>
      </form>
    </div>
  );
};

export default DeliveryInfo;
