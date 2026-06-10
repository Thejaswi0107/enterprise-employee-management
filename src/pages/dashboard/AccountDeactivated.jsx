import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAuthHeaders } from '../../services/api';
import Toast from '../../components/common/Toast';
import '../../components/styles/AccountStatus.css';

const AccountDeactivated = () => {
  const { user, logout } = useAuth();
  const [accountStatus, setAccountStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const buildAuthHeaders = () => getAuthHeaders();
  const [showReactivationForm, setShowReactivationForm] = useState(false);
  const [reactivationForm, setReactivationForm] = useState({
    reason: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetchAccountStatus();
  }, [user]);

  const fetchAccountStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/reactivation/account-status', {
        headers: buildAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch account status');
      }

      const data = await response.json();
      setAccountStatus(data.account);
    } catch (err) {
      console.error('Error fetching account status:', err);
      setToast({
        type: 'error',
        message: 'Failed to load account status'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReactivationRequest = async (e) => {
    e.preventDefault();

    if (!reactivationForm.reason.trim()) {
      setToast({
        type: 'error',
        message: 'Please provide a reason for reactivation'
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('http://localhost:8000/api/reactivation/request', {
        method: 'POST',
        headers: {
          ...buildAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reactivationForm)
      });

      if (!response.ok) {
        throw new Error('Failed to submit reactivation request');
      }

      setToast({
        type: 'success',
        message: 'Reactivation request submitted successfully'
      });

      setShowReactivationForm(false);
      setReactivationForm({ reason: '' });
      fetchAccountStatus();
    } catch (err) {
      setToast({
        type: 'error',
        message: err.message
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="account-status-container">
        <div className="loading">Loading account information...</div>
      </div>
    );
  }

  const hasPendingRequest = accountStatus?.pending_reactivation_request;

  return (
    <div className="account-status-container">
      <div className="account-deactivated-page">
        <div className="deactivation-banner">
          <div className="banner-icon">⚠️</div>
          <h1>Your Account Has Been Deactivated</h1>
        </div>

        <div className="account-details-card">
          <div className="account-info">
            <div className="info-section">
              <h3>Account Information</h3>
              <div className="info-row">
                <span className="label">Name:</span>
                <span className="value">{accountStatus?.name}</span>
              </div>
              <div className="info-row">
                <span className="label">Email:</span>
                <span className="value">{accountStatus?.email}</span>
              </div>
              <div className="info-row">
                <span className="label">Status:</span>
                <span className="value status-deactivated">Deactivated</span>
              </div>
            </div>

            <div className="info-section">
              <h3>Deactivation Details</h3>
              <div className="info-row">
                <span className="label">Deactivated On:</span>
                <span className="value">
                  {new Date(accountStatus?.deactivated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="info-row">
                <span className="label">Deactivated By:</span>
                <span className="value">{accountStatus?.deactivated_by_email}</span>
              </div>
              {accountStatus?.deactivation_reason && (
                <div className="info-row">
                  <span className="label">Reason:</span>
                  <span className="value">{accountStatus.deactivation_reason}</span>
                </div>
              )}
            </div>

            {hasPendingRequest && (
              <div className="info-section pending-section">
                <h3>Pending Reactivation Request</h3>
                <div className="pending-status">
                  <div className="status-indicator">⏳</div>
                  <div className="status-text">
                    <p>Your reactivation request is pending admin approval</p>
                    <p className="requested-date">
                      Requested: {new Date(hasPendingRequest.requested_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="account-actions">
            <h3>What can you do?</h3>
            <ul className="actions-list">
              <li>You can still log in to check your account status</li>
              <li>Submit a reactivation request for admin review</li>
              <li>Contact your organization administrator for more information</li>
            </ul>

            {!hasPendingRequest ? (
              <button
                className="btn-submit-request"
                onClick={() => setShowReactivationForm(true)}
              >
                Request Reactivation
              </button>
            ) : (
              <button className="btn-pending" disabled>
                Reactivation Request Pending
              </button>
            )}

            <button
              className="btn-logout"
              onClick={() => logout()}
            >
              Logout
            </button>
          </div>
        </div>

        {showReactivationForm && (
          <div className="modal-overlay" onClick={() => setShowReactivationForm(false)}>
            <div className="modal-content reactivation-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Request Account Reactivation</h2>
                <button
                  className="modal-close"
                  onClick={() => setShowReactivationForm(false)}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitReactivationRequest} className="reactivation-form">
                <div className="form-group">
                  <label>Reason for Reactivation Request</label>
                  <textarea
                    value={reactivationForm.reason}
                    onChange={(e) => setReactivationForm({ reason: e.target.value })}
                    placeholder="Please explain why you believe your account should be reactivated..."
                    rows="5"
                    className="form-textarea"
                  />
                  <p className="form-help">
                    Your administrator will review this request and respond accordingly.
                  </p>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowReactivationForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default AccountDeactivated;
