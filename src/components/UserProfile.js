import React from "react";
import { FaUser, FaEnvelope, FaPhone, FaCamera, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center bg-gray-100 min-h-screen p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 relative">
        <div className="bg-red-600 text-white text-lg font-semibold py-4 px-6 rounded-t-lg text-center">
          User Profile
        </div>
        <div className="flex flex-col items-center mt-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
              <FaUser className="text-gray-600 text-4xl" />
            </div>
            <button className="absolute bottom-0 right-0 bg-red-600 text-white p-2 rounded-full">
              <FaCamera />
            </button>
          </div>
          <h2 className="text-xl font-semibold mt-3">{user?.name || "John Doe"}</h2>
          <p className="text-gray-500 text-sm">Manage your profile information</p>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-100">
            <FaUser className="text-gray-500 mr-2" />
            <input
              type="text"
              className="bg-transparent outline-none flex-1"
              value={user?.name || "John Doe"}
              readOnly
            />
          </div>
          <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-100">
            <FaEnvelope className="text-gray-500 mr-2" />
            <input
              type="email"
              className="bg-transparent outline-none flex-1"
              value={user?.email || "john.doe@example.com"}
              readOnly
            />
          </div>
          <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-100">
            <FaPhone className="text-gray-500 mr-2" />
            <input
              type="text"
              className="bg-transparent outline-none flex-1"
              value={user?.phone || "+1 (555) 123-4567"}
              readOnly
            />
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <button className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700">
            Edit Profile
          </button>
          <button
            className="w-full flex items-center justify-center bg-white border border-red-600 text-red-600 py-2 rounded-lg font-semibold hover:bg-red-100"
            onClick={() => {
              logout();
              navigate("/auth");
            }}
          >
            <FaSignOutAlt className="mr-2" /> Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
