import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCamera } from 'react-icons/fa'; // Import camera icon
import '../styles/Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setProfileImage(parsedUser.profileImage || '');
    }
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        const updatedUser = { ...user, profileImage: reader.result };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) return <div className="loading">Loading...</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2 className="profile-title">My Profile</h2>

        {/* Profile Image Section */}
        <div className="profile-image-container">
          <div className="profile-image-wrapper">
            <img
              src={profileImage || 'https://via.placeholder.com/150'}
              alt="Profile"
              className="profile-image"
            />
            <label htmlFor="file-input" className="camera-icon">
              <FaCamera size={20} />
            </label>
            <input
              id="file-input"
              type="file"
              accept="image/*"
              className="profile-image-upload"
              onChange={handleImageChange}
            />
          </div>
        </div>

        {/* Profile Details */}
        <div className="profile-details">
          <div>
            <label className="profile-label">Full Name</label>
            <p>{user.fullName}</p>
          </div>
          <div>
            <label className="profile-label">Email</label>
            <p>{user.email}</p>
          </div>
          <div>
            <label className="profile-label">Phone</label>
            <p>{user.phoneNumber}</p>
          </div>
          <div>
            <label className="profile-label">Address</label>
            <p>{user.address}</p>
          </div>
          <div className="profile-button-container">
            <button onClick={() => navigate('/settings')} className="profile-button">
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
