import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAuthHeaders } from '../../services/api';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import Toast from '../../components/common/Toast';
import FormField from '../../components/common/FormField';
import '../../components/styles/Invitations.css';

const Invitations = () => {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  const buildAuthHeaders = () => getAuthHeaders();
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'user'
  });
  const [copiedToken, setCopiedToken] = useState(null);

  // Fetch invitations after auth state is ready
  useEffect(() => {
    if (!user) return;
    fetchInvitations();
  }, [user]);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/invitations/active', {
        headers: buildAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch invitations');
      }

      const data = await response.json();
      setInvitations(data.invitations || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setToast({
        type: 'error',
        message: 'Failed to load invitations'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvitation = async (e) => {
    e.preventDefault();

    if (!inviteForm.email) {
      setToast({
        type: 'error',
        message: 'Please enter an email address'
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/invitations/create', {
        method: 'POST',
        headers: {
          ...buildAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(inviteForm)
      });

      if (!response.ok) {
        throw new Error('Failed to create invitation');
      }

      const data = await response.json();
      const invitationToken = data.invitation_token || data.token;
      const invitationLink = `http://localhost:5174/accept-invitation/${invitationToken}`;
      
      // Auto-copy invitation link to clipboard
      navigator.clipboard.writeText(invitationLink);

      setToast({
        type: 'success',
        message: `Invitation sent to ${inviteForm.email} and link copied to clipboard!`
      });

      setInviteForm({ email: '', role: 'user' });
      setShowInviteModal(false);
      fetchInvitations();
    } catch (err) {
      setToast({
        type: 'error',
        message: err.message
      });
    }
  };

  const handleRevokeInvitation = async () => {
    if (!selectedInvitation) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/invitations/revoke/${selectedInvitation.id}`,
        {
          method: 'POST',
          headers: buildAuthHeaders()
        }
      );

      if (!response.ok) {
        throw new Error('Failed to revoke invitation');
      }

      setToast({
        type: 'success',
        message: `Invitation to ${selectedInvitation.email} has been revoked`
      });

      setShowRevokeModal(false);
      setSelectedInvitation(null);
      fetchInvitations();
    } catch (err) {
      setToast({
        type: 'error',
        message: err.message
      });
    }
  };

  const handleCopyInvitationLink = (invitation) => {
    const invitationLink = `http://localhost:5174/accept-invitation/${invitation.invitation_token}`;
    navigator.clipboard.writeText(invitationLink);
    setCopiedToken(invitation.id);
    setToast({
      type: 'success',
      message: 'Invitation link copied to clipboard'
    });
    setTimeout(() => setCopiedToken(null), 3000);
  };

  if (loading) {
    return <div className="invitations-container"><p>Loading invitations...</p></div>;
  }

  return (
    <div className="invitations-container">
      <div className="invitations-header">
        <h1>Manage Invitations</h1>
        <button
          className="btn-primary"
          onClick={() => setShowInviteModal(true)}
        >
          + Send Invitation
        </button>
      </div>

      <div className="invitations-stats">
        <div className="stat-card">
          <div className="stat-value">{invitations.length}</div>
          <div className="stat-label">Pending Invitations</div>
        </div>
      </div>

      {invitations.length === 0 ? (
        <div className="no-invitations">
          <p>No pending invitations</p>
          <button
            className="btn-primary"
            onClick={() => setShowInviteModal(true)}
          >
            Send Your First Invitation
          </button>
        </div>
      ) : (
        <div className="invitations-list">
          {invitations.map((invitation) => (
            <div key={invitation.id} className="invitation-card">
              <div className="invitation-header">
                <div className="invitation-email">{invitation.email}</div>
                <span className="invitation-status pending">Pending</span>
              </div>

              <div className="invitation-details">
                <div className="detail-row">
                  <span className="detail-label">Role:</span>
                  <span className="detail-value">{invitation.role}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Invited By:</span>
                  <span className="detail-value">{invitation.invited_by_email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Created:</span>
                  <span className="detail-value">
                    {new Date(invitation.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Expires:</span>
                  <span className="detail-value">
                    {new Date(invitation.expires_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="invitation-actions">
                <button
                  className="btn-copy"
                  onClick={() => handleCopyInvitationLink(invitation)}
                >
                  {copiedToken === invitation.id ? '✓ Copied' : 'Copy Link'}
                </button>
                <button
                  className="btn-revoke"
                  onClick={() => {
                    setSelectedInvitation(invitation);
                    setShowRevokeModal(true);
                  }}
                >
                  Revoke
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal-content invitation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Send Invitation</h2>
              <button
                className="modal-close"
                onClick={() => setShowInviteModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInvitation} className="invitation-form">
              <FormField
                label="Email Address"
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                placeholder="Enter email to invite"
                required
              />

              <div className="form-group">
                <label>Role</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="form-select"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowInviteModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRevokeModal && selectedInvitation && (
        <ConfirmationModal
          title="Revoke Invitation"
          message={`Are you sure you want to revoke the invitation sent to ${selectedInvitation.email}? They will no longer be able to accept this invitation.`}
          onConfirm={handleRevokeInvitation}
          onCancel={() => {
            setShowRevokeModal(false);
            setSelectedInvitation(null);
          }}
          confirmText="Revoke"
          cancelText="Cancel"
          isDangerous={true}
        />
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

export default Invitations;
