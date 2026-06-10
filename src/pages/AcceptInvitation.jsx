import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Toast from '../components/common/Toast';
import '../pages/auth/Auth.css';

const AcceptInvitation = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    verifyInvitation();
  }, [token]);

  const verifyInvitation = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/invitations/verify/${token}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Invalid or expired invitation');
      }

      const data = await response.json();
      setInvitation(data.invitation);
      setFormData(prev => ({
        ...prev,
        email: data.invitation.email
      }));
      setError(null);
    } catch (err) {
      setError(err.message);
      setToast({
        type: 'error',
        message: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.password || !formData.confirmPassword) {
      setToast({
        type: 'error',
        message: 'Please fill in all fields'
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setToast({
        type: 'error',
        message: 'Passwords do not match'
      });
      return;
    }

    if (formData.password.length < 6) {
      setToast({
        type: 'error',
        message: 'Password must be at least 6 characters'
      });
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/invitations/accept/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          password: formData.password
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to accept invitation');
      }

      const data = await response.json();
      setToast({
        type: 'success',
        message: 'Account created successfully! Redirecting to login...'
      });

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setToast({
        type: 'error',
        message: err.message
      });
    }
  };

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <h1>Loading Invitation...</h1>
          <p>Please wait while we verify your invitation.</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <h1>Invalid Invitation</h1>
          <p>{error || 'This invitation is invalid or has expired.'}</p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Accept Invitation</h1>
        <p>You've been invited to join the Enterprise Employee Management System</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={formData.email}
            disabled
            placeholder="Email address"
            style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
          />

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            required
          />

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter password"
            required
          />

          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm password"
            required
          />

          <button type="submit">
            Create Account & Accept Invitation
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <a href="/login">Login here</a>
          </p>
        </div>
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

export default AcceptInvitation;
