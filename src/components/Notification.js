import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Notification.css";
import { FaTimes } from "react-icons/fa";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");

        if (!token || !userId) {
          console.error("No token or userId found, user might not be authenticated.");
          return;
        }

        const response = await axios.get(`https://pa-gebeya-backend.onrender.com/api/users/notifications/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // ✅ Filter only notifications that have a valid orderId
        const validNotifications = response.data.notifications.filter(
          (notification) => notification.orderId
        );

        setNotifications(validNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, []);

  const removeNotification = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`https://pa-gebeya-backend.onrender.com/api/users/notifications/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications(notifications.filter((notification) => notification._id !== id));
    } catch (error) {
      console.error("Error removing notification:", error);
    }
  };

  const handleNotificationClick = async (notification) => {
    console.log("🔍 Retrieving order details for orderId:", notification.orderId);

    if (!notification.orderId || !notification.userId) {
      console.error("❌ orderId or userId is missing in the notification.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("❌ No authentication token found. User may not be logged in.");
        return;
      }

      // ✅ Fetch order details using orderId and userId from the notification
      const response = await axios.get(`https://pa-gebeya-backend.onrender.com/api/orders/${notification.orderId}/${notification.userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const orderData = response.data;
      console.log("✅ Order details retrieved successfully:", orderData);

      // ✅ Store order data for the view-detail page
      localStorage.setItem("selectedOrder", JSON.stringify(orderData));

      // ✅ Redirect user to view-detail page with orderId in URL
      window.location.href = `/view-detail?orderId=${notification.orderId}`;

    } catch (error) {
      console.error("❌ Error retrieving order details:", error);
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="notification-container">
      <div className="notification-card">
        <h2 className="notification-title">Notifications</h2>
        <div className="notification-list">
          {notifications.map((notification) => (
            <div key={notification._id} className="notification-item">
              <p
                className="notification-message"
                dangerouslySetInnerHTML={{ __html: notification.message }}
                onClick={() => handleNotificationClick(notification)}
              />
              <FaTimes className="notification-close" onClick={() => removeNotification(notification._id)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notification;
