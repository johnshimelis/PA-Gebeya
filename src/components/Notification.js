import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Notification.css';
import { FaTimes } from 'react-icons/fa'; // Import close icon

const Notification = () => {
  const [notifications, setNotifications] = useState([]);

  // Fetch notifications on component mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");

        // Make sure token exists before making the API call
        if (!token) {
          console.error("No token found, user might not be authenticated.");
          return;
        }

        const response = await axios.get('http://localhost:5000/api/users/notifications', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setNotifications(response.data.notifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, []);

  // Function to remove a notification
  const removeNotification = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`http://localhost:5000/api/users/notifications/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Remove notification from UI
      setNotifications(notifications.filter(notification => notification._id !== id));
    } catch (error) {
      console.error("Error removing notification:", error);
    }
  };

  return (
    <div className="notification-container">
      <div className="notification-card">
        <h2 className="notification-title">Notifications</h2>
        <div className="notification-list">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div key={notification._id} className="notification-item">
                <p className="notification-message">{notification.message}</p>
                <FaTimes className="notification-close" onClick={() => removeNotification(notification._id)} />
              </div>
            ))
          ) : (
            <p className="no-notifications">No notifications found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notification;
