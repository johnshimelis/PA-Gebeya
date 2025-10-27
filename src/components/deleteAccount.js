import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/deleteAccount.css";

const DeleteAccount = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("full"); // 'full' or 'partial'
  const [email, setEmail] = useState("");
  const [confirmedFullDelete, setConfirmedFullDelete] = useState(false);
  const [confirmedPartialDelete, setConfirmedPartialDelete] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'error' or 'success'
  const [loadingFull, setLoadingFull] = useState(false);
  const [loadingPartial, setLoadingPartial] = useState(false);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const simulateRequest = () => new Promise((resolve) => setTimeout(resolve, 5000));

  const handleFullDelete = async () => {
    setMessage("");
    if (!email || !validateEmail(email)) {
      setMessageType("error");
      setMessage("Please enter a valid registered email.");
      return;
    }
    if (!confirmedFullDelete) {
      setMessageType("error");
      setMessage("Please confirm that you want to delete your account.");
      return;
    }

    setLoadingFull(true);
    try {
      await simulateRequest();
      window.location.href = `mailto:support@yourapp.com?subject=Delete%20My%20Account&body=Please delete my account with email: ${email}`;
      setMessageType("success");
      setMessage("Full account deletion request sent! Check your email client.");
    } catch {
      setMessageType("error");
      setMessage("An error occurred. Please try again later.");
    } finally {
      setLoadingFull(false);
    }
  };

  const handlePartialDelete = async () => {
    setMessage("");
    if (!email || !validateEmail(email)) {
      setMessageType("error");
      setMessage("Please enter a valid registered email.");
      return;
    }
    if (!confirmedPartialDelete) {
      setMessageType("error");
      setMessage("Please confirm that you want to request partial data deletion.");
      return;
    }

    setLoadingPartial(true);
    try {
      await simulateRequest();
      window.location.href = `mailto:support@yourapp.com?subject=Request%20Partial%20Data%20Deletion&body=Please delete some or all of my data associated with email: ${email}`;
      setMessageType("success");
      setMessage("Partial data deletion request sent! Check your email client.");
    } catch {
      setMessageType("error");
      setMessage("An error occurred. Please try again later.");
    } finally {
      setLoadingPartial(false);
    }
  };

  return (
    <div className="delete-account-page">
      <h2>Delete Account or Request Data Deletion</h2>

      <div className="tabs">
        <button
          className={activeTab === "full" ? "active-tab" : ""}
          onClick={() => setActiveTab("full")}
        >
          Full Account Deletion
        </button>
        <button
          className={activeTab === "partial" ? "active-tab" : ""}
          onClick={() => setActiveTab("partial")}
        >
          Partial Data Deletion
        </button>
      </div>

      <input
        type="email"
        placeholder="Enter your registered email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {activeTab === "full" && (
        <div className="section">
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
          <button className="delete-btn" onClick={handleFullDelete} disabled={loadingFull}>
            {loadingFull ? "Processing..." : "Delete Account"}
          </button>
        </div>
      )}

      {activeTab === "partial" && (
        <div className="section">
          <p>You can request some or all of your personal data to be deleted without removing your account.</p>
          <div className="confirm-checkbox">
            <input
              type="checkbox"
              id="confirmPartialDelete"
              checked={confirmedPartialDelete}
              onChange={() => setConfirmedPartialDelete(!confirmedPartialDelete)}
            />
            <label htmlFor="confirmPartialDelete">I want to request deletion of some or all of my data</label>
          </div>
          <button className="delete-btn" onClick={handlePartialDelete} disabled={loadingPartial}>
            {loadingPartial ? "Processing..." : "Request Data Deletion"}
          </button>
        </div>
      )}

      {message && (
        <p className={`message ${messageType === "error" ? "error" : "success"}`}>
          {message}
        </p>
      )}

      <button className="back-button" onClick={() => navigate("/")}>
        Cancel
      </button>
    </div>
  );
};

export default DeleteAccount;
