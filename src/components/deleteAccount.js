import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/deleteAccount.css"; // optional, for styling

const DeleteAccount = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [message, setMessage] = useState("");

  const handleDelete = async () => {
    if (!email) {
      setMessage("Please enter your registered email.");
      return;
    }

    if (!confirmed) {
      setMessage("Please confirm that you want to delete your account.");
      return;
    }

    try {
      // If you have a backend endpoint:
      // const response = await fetch("https://your-backend.com/api/delete-account", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email })
      // });
      // const data = await response.json();
      // setMessage(data.message);

      // If no backend, use mailto link
      window.location.href = `mailto:support@yourapp.com?subject=Delete%20My%20Account&body=Please delete my account with email: ${email}`;

      setMessage("Request sent! Please check your email client.");
    } catch (error) {
      console.error(error);
      setMessage("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="delete-account-page">
      <h2>Delete Account</h2>
      <p>
        Deleting your account will permanently remove all your personal data, orders, messages, and other related information. 
        This action cannot be undone.
      </p>

      <input
        type="email"
        placeholder="Enter your registered email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <div className="confirm-checkbox">
        <input
          type="checkbox"
          id="confirmDelete"
          checked={confirmed}
          onChange={() => setConfirmed(!confirmed)}
        />
        <label htmlFor="confirmDelete">I understand and want to delete my account</label>
      </div>

      <button onClick={handleDelete}>Delete Account</button>

      {message && <p className="message">{message}</p>}

      <button className="back-button" onClick={() => navigate("/")}>
        Cancel
      </button>
    </div>
  );
};

export default DeleteAccount;
