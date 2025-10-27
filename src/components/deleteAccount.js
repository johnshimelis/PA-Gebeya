import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/deleteAccount.css"; // optional, for styling

const DeleteAccount = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [confirmedFullDelete, setConfirmedFullDelete] = useState(false);
  const [confirmedPartialDelete, setConfirmedPartialDelete] = useState(false);
  const [message, setMessage] = useState("");

  // Function to handle full account deletion
  const handleFullDelete = async () => {
    if (!email) {
      setMessage("Please enter your registered email.");
      return;
    }
    if (!confirmedFullDelete) {
      setMessage("Please confirm that you want to delete your account.");
      return;
    }

    try {
      // Backend API call example:
      // await fetch("https://your-backend.com/api/delete-account", {...});

      // If no backend, fallback to email
      window.location.href = `mailto:support@yourapp.com?subject=Delete%20My%20Account&body=Please delete my account with email: ${email}`;

      setMessage("Full account deletion request sent! Check your email client.");
    } catch (error) {
      console.error(error);
      setMessage("An error occurred. Please try again later.");
    }
  };

  // Function to handle partial data deletion
  const handlePartialDelete = async () => {
    if (!email) {
      setMessage("Please enter your registered email.");
      return;
    }
    if (!confirmedPartialDelete) {
      setMessage("Please confirm that you want to request partial data deletion.");
      return;
    }

    try {
      // Backend API call example:
      // await fetch("https://your-backend.com/api/delete-user-data", {...});

      // If no backend, fallback to email
      window.location.href = `mailto:support@yourapp.com?subject=Request%20Partial%20Data%20Deletion&body=Please delete some or all of my data associated with email: ${email}`;

      setMessage("Partial data deletion request sent! Check your email client.");
    } catch (error) {
      console.error(error);
      setMessage("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="delete-account-page">
      <h2>Delete Account or Request Data Deletion</h2>

      <p>
        You can delete your account permanently, or request that some or all of your data be deleted without deleting your account.
      </p>

      <input
        type="email"
        placeholder="Enter your registered email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {/* Full account deletion section */}
      <div className="section">
        <h3>Full Account Deletion</h3>
        <p>This will permanently remove all your data, orders, messages, and cannot be undone.</p>
        <div className="confirm-checkbox">
          <input
            type="checkbox"
            id="confirmFullDelete"
            checked={confirmedFullDelete}
            onChange={() => setConfirmedFullDelete(!confirmedFullDelete)}
          />
          <label htmlFor="confirmFullDelete">I understand and want to delete my account</label>
        </div>
        <button onClick={handleFullDelete}>Delete Account</button>
      </div>

      <hr />

      {/* Partial data deletion section */}
      <div className="section">
        <h3>Request Partial Data Deletion</h3>
        <p>
          You can request some or all of your personal data to be deleted without removing your account. 
          This gives you more control over your data.
        </p>
        <div className="confirm-checkbox">
          <input
            type="checkbox"
            id="confirmPartialDelete"
            checked={confirmedPartialDelete}
            onChange={() => setConfirmedPartialDelete(!confirmedPartialDelete)}
          />
          <label htmlFor="confirmPartialDelete">I want to request deletion of some or all of my data</label>
        </div>
        <button onClick={handlePartialDelete}>Request Data Deletion</button>
      </div>

      {message && <p className="message">{message}</p>}

      <button className="back-button" onClick={() => navigate("/")}>
        Cancel
      </button>
    </div>
  );
};

export default DeleteAccount;
