import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAuthHeaders } from '../../services/api';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import Toast from '../../components/common/Toast';
import '../../components/styles/Invitations.css';

const InvitationsAndMembers = () => {
  const { user } = useAuth();
  
  // Invitations State
  const [invitations, setInvitations] = useState([]);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'user'
  });
  
  // Members State
  const [members, setMembers] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [deactivationReason, setDeactivationReason] = useState('');
  
  // General State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const [copiedToken, setCopiedToken] = useState(null);

  const buildAuthHeaders = () => getAuthHeaders();

  // Fetch both invitations and members
  useEffect(() => {
    if (!user) return;
    fetchInvitations();
    fetchMembers();
  }, [user]);

  const fetchInvitations = async () => {
    try {
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
    }
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/members/all', {
        headers: buildAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch members');
      }

      const data = await response.json();
      // Combine active and deactivated members into a single array
      const allMembers = [...(data.members || []), ...(data.deactivated_members_list || [])];
      setMembers(allMembers);
    } catch (err) {
      setError(err.message);
      setToast({
        type: 'error',
        message: 'Failed to load members'
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
      const invitationLink = `http://localhost:5175/accept-invitation/${invitationToken}`;
      
      // Auto-copy invitation link to clipboard
      navigator.clipboard.writeText(invitationLink);

      setToast({
        type: 'success',
        message: `Invitation sent to ${inviteForm.email} and link copied to clipboard!`
      });

      setInviteForm({ email: '', role: 'user' });
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
    const invitationLink = `http://localhost:5175/accept-invitation/${invitation.invitation_token}`;
    navigator.clipboard.writeText(invitationLink);
    setCopiedToken(invitation.id);
    setToast({
      type: 'success',
      message: 'Invitation link copied to clipboard'
    });
    setTimeout(() => setCopiedToken(null), 3000);
  };

  const handleDeactivateMember = async () => {
    if (!selectedMember) return;

    try {
      const response = await fetch(`http://localhost:8000/api/members/deactivate/${encodeURIComponent(selectedMember.email)}`, {
        method: 'POST',
        headers: {
          ...buildAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: deactivationReason
        })
      });

      if (!response.ok) {
        throw new Error('Failed to deactivate member');
      }

      setToast({
        type: 'success',
        message: `${selectedMember.name} has been deactivated`
      });

      setShowDeactivateModal(false);
      setSelectedMember(null);
      setDeactivationReason('');
      fetchMembers();
    } catch (err) {
      setToast({
        type: 'error',
        message: err.message
      });
    }
  };

  const activeMembers = members.filter(m => m.is_account_active);
  const deactivatedMembers = members.filter(m => !m.is_account_active);
  const displayMembers = activeTab === 'active' ? activeMembers : deactivatedMembers;

  if (loading) {
    return <div className="invitations-container"><p>Loading...</p></div>;
  }

  return (
    <div className="invitations-container">
      {/* INVITATIONS SECTION */}
      <div className="section">
        <h2>Invitations</h2>

        {/* Inline Form */}
        <form onSubmit={handleCreateInvitation} className="inline-invite-form">
          <input
            type="email"
            value={inviteForm.email}
            onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
            placeholder="Enter email address"
            required
          />

          <select
            value={inviteForm.role}
            onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
            className="role-select"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <button type="submit" className="btn-primary">
            Send Invitation
          </button>
        </form>

        {/* Pending Invitations */}
        {invitations.length === 0 ? (
          <div className="no-invitations">
            <p>No pending invitations</p>
          </div>
        ) : (
          <div className="invitations-list">
            <div className="invitations-stat">
              <span>Pending: {invitations.length}</span>
            </div>
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
      </div>

      {/* MEMBERS SECTION */}
      <div className="section">
        <h2>Company Members</h2>

        <div className="members-stats">
          <p>Total Members: {members.length} | Active: {activeMembers.length} | Deactivated: {deactivatedMembers.length}</p>
        </div>

        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Active Members
          </button>
          <button
            className={`tab-button ${activeTab === 'deactivated' ? 'active' : ''}`}
            onClick={() => setActiveTab('deactivated')}
          >
            Deactivated Members
          </button>
        </div>

        {displayMembers.length === 0 ? (
          <div className="no-members">
            <p>No {activeTab} members</p>
          </div>
        ) : (
          <div className="members-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Joined Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayMembers.map((member) => (
                  <tr key={member.id}>
                    <td>{member.name}</td>
                    <td>{member.email}</td>
                    <td>{member.role}</td>
                    <td>{member.department || 'N/A'}</td>
                    <td>{member.status || 'Active'}</td>
                    <td>{new Date(member.created_at).toLocaleDateString()}</td>
                    <td>
                      {activeTab === 'active' && (
                        <button
                          className="btn-deactivate"
                          onClick={() => {
                            setSelectedMember(member);
                            setShowDeactivateModal(true);
                          }}
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showRevokeModal && selectedInvitation && (
        <ConfirmationModal
          title="Revoke Invitation"
          message={`Are you sure you want to revoke the invitation sent to ${selectedInvitation.email}?`}
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

      {showDeactivateModal && selectedMember && (
        <div className="modal-overlay" onClick={() => setShowDeactivateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Deactivate User</h3>
              <button
                className="modal-close"
                onClick={() => setShowDeactivateModal(false)}
              >
                ✕
              </button>
            </div>
            <p>Are you sure you want to deactivate {selectedMember.name}? They will not be able to access the application.</p>
            <div className="form-group">
              <label>Reason for Deactivation (Optional):</label>
              <textarea
                value={deactivationReason}
                onChange={(e) => setDeactivationReason(e.target.value)}
                placeholder="Enter reason for deactivation..."
                rows="3"
              />
            </div>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowDeactivateModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={handleDeactivateMember}
              >
                Deactivate
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

export default InvitationsAndMembers;
