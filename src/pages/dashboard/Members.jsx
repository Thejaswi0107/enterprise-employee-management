import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAuthHeaders } from '../../services/api';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import Toast from '../../components/common/Toast';
import '../../components/styles/Members.css';

const Members = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState({
    active_members: [],
    deactivated_members: [],
    total_members: 0,
    active_members_count: 0
  });

  const buildAuthHeaders = () => getAuthHeaders();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [deactivationReason, setDeactivationReason] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [activeTab, setActiveTab] = useState('active');

  // Fetch members after auth state is ready
  useEffect(() => {
    if (!user) return;
    fetchMembers();
  }, [user]);

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
      setMembers({
        active_members: data.members || [],
        deactivated_members: data.deactivated_members_list || [],
        total_members: data.total_members || 0,
        active_members_count: data.active_members || 0
      });
      setError(null);
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

  const handleDeactivateClick = (member) => {
    setSelectedMember(member);
    setDeactivationReason('');
    setShowConfirmModal(true);
  };

  const handleConfirmDeactivate = async () => {
    if (!selectedMember) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/members/deactivate/${selectedMember.email}`,
        {
          method: 'POST',
          headers: {
            ...buildAuthHeaders(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            reason: deactivationReason || null
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to deactivate user');
      }

      setToast({
        type: 'success',
        message: `${selectedMember.name} has been deactivated`
      });

      setShowConfirmModal(false);
      setSelectedMember(null);
      fetchMembers();
    } catch (err) {
      setToast({
        type: 'error',
        message: err.message
      });
    }
  };

  const handleReactivate = async (member) => {
    if (!window.confirm(`Reactivate ${member.name}?`)) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/members/reactivate/${member.email}`,
        {
          method: 'POST',
          headers: buildAuthHeaders()
        }
      );

      if (!response.ok) {
        throw new Error('Failed to reactivate user');
      }

      setToast({
        type: 'success',
        message: `${member.name} has been reactivated`
      });

      fetchMembers();
    } catch (err) {
      setToast({
        type: 'error',
        message: err.message
      });
    }
  };

  if (loading) {
    return <div className="members-container"><p>Loading members...</p></div>;
  }

  const ActiveMembersTab = () => (
    <div className="members-tab">
      <div className="tab-header">
        <h3>Active Members ({members.active_members_count})</h3>
      </div>

      {members.active_members.length === 0 ? (
        <p className="no-data">No active members</p>
      ) : (
        <div className="members-table-wrapper">
          <table className="members-table">
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
              {members.active_members.map((member) => (
                <tr key={member.id}>
                  <td>{member.name}</td>
                  <td>{member.email}</td>
                  <td><span className="role-badge">{member.role}</span></td>
                  <td>{member.department}</td>
                  <td><span className="status-badge active">{member.status}</span></td>
                  <td>{member.joined_date || 'N/A'}</td>
                  <td>
                    <button
                      className="btn-deactivate"
                      onClick={() => handleDeactivateClick(member)}
                      title="Deactivate this user"
                    >
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const DeactivatedMembersTab = () => (
    <div className="members-tab">
      <div className="tab-header">
        <h3>Deactivated Members ({members.deactivated_members.length})</h3>
      </div>

      {members.deactivated_members.length === 0 ? (
        <p className="no-data">No deactivated members</p>
      ) : (
        <div className="members-table-wrapper">
          <table className="members-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Deactivated At</th>
                <th>Reason</th>
                <th>Deactivated By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.deactivated_members.map((member) => (
                <tr key={member.id} className="deactivated-row">
                  <td>{member.name}</td>
                  <td>{member.email}</td>
                  <td><span className="role-badge">{member.role}</span></td>
                  <td>{new Date(member.deactivated_at).toLocaleDateString()}</td>
                  <td>{member.deactivation_reason || 'No reason provided'}</td>
                  <td>{member.deactivated_by_email}</td>
                  <td>
                    <button
                      className="btn-reactivate"
                      onClick={() => handleReactivate(member)}
                      title="Reactivate this user"
                    >
                      Reactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="members-container">
      <div className="members-header">
        <h1>Company Members</h1>
        <p className="members-subtitle">
          Total Members: {members.total_members} | Active: {members.active_members_count} | Deactivated: {members.deactivated_members.length}
        </p>
      </div>

      <div className="members-tabs">
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

      {activeTab === 'active' && <ActiveMembersTab />}
      {activeTab === 'deactivated' && <DeactivatedMembersTab />}

      {showConfirmModal && (
        <ConfirmationModal
          title="Deactivate User"
          message={`Are you sure you want to deactivate ${selectedMember?.name}? They will not be able to access the application but can still login to see their account status.`}
          onConfirm={handleConfirmDeactivate}
          onCancel={() => {
            setShowConfirmModal(false);
            setSelectedMember(null);
          }}
          confirmText="Deactivate"
          cancelText="Cancel"
          isDangerous={true}
        >
          <div className="deactivation-reason-input">
            <label>Reason for Deactivation (Optional):</label>
            <textarea
              value={deactivationReason}
              onChange={(e) => setDeactivationReason(e.target.value)}
              placeholder="Enter reason for deactivation..."
              rows="3"
            />
          </div>
        </ConfirmationModal>
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

export default Members;
