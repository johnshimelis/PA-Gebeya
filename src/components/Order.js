import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Order.css';

const Order = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No token found, user might not be authenticated.");
          return;
        }

        const response = await axios.get('http://localhost:5000/api/users/orders', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrders(response.data.orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="order-container">
      <div className="order-card">
        <h2 className="order-title">Orders</h2>

        {orders.length > 0 ? (
          <div className="order-table">
            {/* Table Header */}
            <div className="order-row order-header">
              <span className="column-header">Order ID</span>
              <span className="column-header">Total Amount</span>
              <span className="column-header">Date</span>
              <span className="column-header">Status & Action</span>
            </div>

            {/* Table Rows */}
            {orders.map((order) => (
              <div key={order._id} className="order-row">
                <span className="bold-text">{order._id}</span>
                <span className="bold-text">${order.total.toFixed(2)}</span>
                <span className="bold-text">{new Date(order.date).toLocaleDateString()}</span>
                
                {/* Status and View Details in the Same Line */}
                <div className="order-status-action">
                  <span className={`order-status ${order.status.toLowerCase()}`}>{order.status}</span>
                  <button className="order-button">View Details</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-orders">No orders found.</p>
        )}
      </div>
    </div>
  );
};

export default Order;
