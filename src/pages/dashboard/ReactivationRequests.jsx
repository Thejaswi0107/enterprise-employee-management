import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAuthHeaders } from '../../services/api';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import Toast from '../../components/common/Toast';
import '../../components/styles/ReactivationRequests.css';

const ReactivationRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);

  const buildAuthHeaders = () => getAuthHeaders();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  // Fetch reactivation requests after auth state is ready
  useEffect(() => {
    if (!user) return;
    fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/reactivation/pending', {
        headers: buildAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reactivation requests');
      }

      const data = await response.json();
      setRequests(data.requests || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setToast({
        type: 'error',
        message: 'Failed to load reactivation requests'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClick = (request) => {
    setSelectedRequest(request);
    setResponseText('');
    setShowApprovalModal(true);
  };

  const handleRejectClick = (request) => {
    setSelectedRequest(request);
    setResponseText('');
    setShowRejectionModal(true);
  };

  const handleApproveRequest = async () => {
    if (!selectedRequest) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/reactivation/approve/${selectedRequest.id}`,
        {
          method: 'POST',
          headers: {
            ...buildAuthHeaders(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            response: responseText || null
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to approve reactivation request');
      }

      setToast({
        type: 'success',
        message: `Reactivation request for ${selectedRequest.user_name} has been approved`
      });

      setShowApprovalModal(false);
      setSelectedRequest(null);
      setResponseText('');
      fetchRequests();
    } catch (err) {
      setToast({
        type: 'error',
        message: err.message
      });
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest) return;

    if (!responseText.trim()) {
      setToast({
        type: 'error',
        message: 'Please provide a reason for rejection'
      });
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/reactivation/reject/${selectedRequest.id}`,
        {
          method: 'POST',
          headers: {
            ...buildAuthHeaders(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            response: responseText
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to reject reactivation request');
      }

      setToast({
        type: 'success',
        message: `Reactivation request for ${selectedRequest.user_name} has been rejected`
      });

      setShowRejectionModal(false);
      setSelectedRequest(null);
      setResponseText('');
      fetchRequests();
    } catch (err) {
      setToast({
        type: 'error',
        message: err.message
      });
    }
  };

  if (loading) {
    return (
      <div className="reactivation-requests-container">
        <p>Loading reactivation requests...</p>
      </div>
    );
  }

  return (
    <div className="reactivation-requests-container">
      <div className="requests-header">
        <h1>Reactivation Requests</h1>
        <p className="requests-subtitle">
          Review and manage account reactivation requests from deactivated users
        </p>
      </div>

      <div className="requests-tabs">
        <button
          className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending ({requests.length})
        </button>
      </div>

      {activeTab === 'pending' && (
        <div className="requests-content">
          {requests.length === 0 ? (
            <div className="no-requests">
              <p>No pending reactivation requests</p>
            </div>
          ) : (
            <div className="requests-list">
              {requests.map((request) => (
                <div key={request.id} className="request-card">
                  <div className="request-header">
                    <div className="request-user">
                      <h3>{request.user_name}</h3>
                      <p>{request.user_email}</p>
                    </div>
                    <span className="request-status pending">Pending</span>
                  </div>

                  <div className="request-details">
                    <div className="detail-section">
                      <h4>Deactivation Information</h4>
                      <div className="detail-row">
                        <span className="label">Deactivated By:</span>
                        <span className="value">{request.deactivated_by_email}</span>
                      </div>
                    </div>

                    <div className="detail-section">
                      <h4>Request Details</h4>
                      <div className="detail-row">
                        <span className="label">Requested On:</span>
                        <span className="value">
                          {new Date(request.requested_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Reason:</span>
                        <span className="value reason-text">{request.reason}</span>
                      </div>
                    </div>
                  </div>

                  <div className="request-actions">
                    <button
                      className="btn-approve"
                      onClick={() => handleApproveClick(request)}
                      title="Approve reactivation"
                    >
                      ✓ Approve
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => handleRejectClick(request)}
                      title="Reject reactivation"
                    >
                      ✕ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showApprovalModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowApprovalModal(false)}>
          <div className="modal-content approval-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Approve Reactivation Request</h2>
              <button
                className="modal-close"
                onClick={() => setShowApprovalModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p className="request-summary">
                Approve reactivation request from <strong>{selectedRequest.user_name}</strong>?
              </p>

              <div className="form-group">
                <label>Admin Response (Optional)</label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Enter a message to send to the user (optional)..."
                  rows="3"
                  className="form-textarea"
                />
              </div>

              <div className="approval-info">
                <p>Upon approval:</p>
                <ul>
                  <li>User account will be reactivated</li>
                  <li>User will regain access to all features</li>
                  <li>User will receive a notification</li>
                </ul>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowApprovalModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-approve"
                onClick={handleApproveRequest}
              >
                Approve Reactivation
              </button>
            </div>
          </div>
        </div>
      )}

      {showRejectionModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowRejectionModal(false)}>
          <div className="modal-content rejection-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reject Reactivation Request</h2>
              <button
                className="modal-close"
                onClick={() => setShowRejectionModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p className="request-summary">
                Reject reactivation request from <strong>{selectedRequest.user_name}</strong>?
              </p>

              <div className="form-group">
                <label>Reason for Rejection *</label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Enter reason for rejection (required)..."
                  rows="3"
                  className="form-textarea"
                  required
                />
              </div>

              <div className="rejection-info">
                <p>Upon rejection:</p>
                <ul>
                  <li>User account will remain deactivated</li>
                  <li>User will receive your rejection message</li>
                  <li>User can submit another request later</li>
                </ul>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowRejectionModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-reject"
                onClick={handleRejectRequest}
              >
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}

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

export default ReactivationRequests;
