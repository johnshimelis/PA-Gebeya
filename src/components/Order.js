import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import '../styles/Order.css';

const Order = () => {
  const [orders, setOrders] = useState([]);
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate(); // Initialize the navigate hook

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token || !userId) {
          console.error("No token or userId found, user might not be authenticated.");
          setOrders([]);
          return;
        }

        const response = await axios.get(`https://pa-gebeya-backend.onrender.com/api/users/orders/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const fetchedOrders = await Promise.all(response.data.orders.map(async (order) => {
          try {
            const orderResponse = await axios.get(`https://pa-gebeya-backend.onrender.com/api/orders/${order.orderId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            return { ...order, status: orderResponse.data.status };
          } catch (error) {
            console.error(`Error fetching status for order ${order.orderId}:`, error);
            return order;
          }
        }));

        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, [userId]);

  const handleDelete = async (orderId) => {
    if (!orderId) {
      console.error("Invalid order ID");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.delete(`https://pa-gebeya-backend.onrender.com/api/users/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders((prevOrders) => prevOrders.filter((order) => order.orderId !== orderId));
    } catch (error) {
      console.error("Error deleting order:", error.response?.data || error.message);
    }
  };

  const handleViewDetails = async (orderId) => {
    if (!orderId) {
      console.error("Invalid order ID");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        console.error("No token or userId found, user might not be authenticated.");
        return;
      }

      const response = await axios.get(`https://pa-gebeya-backend.onrender.com/api/orders/${orderId}/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const orderDetails = response.data.order;
      localStorage.setItem('orderDetails', JSON.stringify(orderDetails));

      // Redirect to the ViewDetail page after storing the order details in localStorage
      navigate('/view-detail');
    } catch (error) {
      console.error("Error retrieving order details:", error.response?.data || error.message);
    }
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'delivered':
      case 'approved':
        return 'status-green';
      case 'un-paid':
      case 'cancelled':
        return 'status-red';
      case 'processing':
        return 'status-gray';
      default:
        return 'status-yellow';
    }
  };

  return (
    <div className="order-container">
      <div className="order-card">
        <h2 className="order-title">Orders</h2>

        {orders.length > 0 ? (
          <div className="order-table">
            <div className="order-row order-header">
              <span className="column-header">Order ID</span>
              <span className="column-header">Total Amount</span>
              <span className="column-header">Date</span>
              <span className="column-header">Status & Action</span>
            </div>

            {orders.map((order) => (
              <div key={order._id} className="order-row">
                <span className="bold-text">{order.orderId}</span>
                <span className="bold-text">${order.total.toFixed(2)}</span>
                <span className="bold-text">{new Date(order.date).toLocaleDateString()}</span>
              
                <div className="order-status-action">
                  <span className={`order-status ${getStatusClass(order.status)}`}>{order.status}</span>
              
                  <button
                    id="order-button"
                    className="order-button"
                    onClick={() => handleViewDetails(order.orderId)} // Navigate to ViewDetail page
                  >
                    View Details
                  </button>
                  <button 
                    className="delete-button" 
                    onClick={() => handleDelete(order.orderId)}
                  >
                    ❌
                  </button>
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
