/**
 * Signup Page Component
 * Premium dark mode registration interface
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import './SignupPage.css';

function SignupPage() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        role: 'student',
        full_name: '',
        email: '',
        phone: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Basic validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            // Call register API
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (!response.ok) {
                setError(result.message || 'Registration failed on server side');
                return;
            }

            if (result.success) {
                const loginResult = await login(formData.username, formData.password);
                if (!loginResult.success) {
                    setError('Account created, but automatic sign in failed. Please use the login link below.');
                    return;
                }

                navigate('/');
            } else {
                setError(result.message || 'Registration failed. Please try again.');
            }
        } catch (err) {
            console.error('Signup error', err);
            setError('Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-page">
            <div className="signup-background">
                <div className="gradient-glow top-left"></div>
                <div className="gradient-glow bottom-right"></div>
            </div>

            <div className="signup-container">
                <div className="signup-header">
                    <div className="logo-box">
                        <svg viewBox="0 0 24 24" className="logo-svg">
                            <path fill="currentColor" d="M18 11V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v5a4 4 0 0 0-4 4v3h2v2h2v-2h8v2h2v-2h2v-3a4 4 0 0 0-4-4M8 6h8v5H8V6m-2 9a2 2 0 1 1 2 2a2 2 0 0 1-2-2m10 2a2 2 0 1 1 2-2a2 2 0 0 1-2 2" />
                        </svg>
                    </div>
                    <h1 className="signup-title">Join College Bus Tracker</h1>
                    <p className="signup-subtitle">Create your account for real-time tracking</p>
                </div>

                <div className="signup-card">
                    <form onSubmit={handleSubmit} className="signup-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <div className="input-wrapper">
                                    <span className="input-icon">👤</span>
                                    <input
                                        type="text"
                                        name="full_name"
                                        className="form-input"
                                        placeholder="Enter your full name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <div className="input-wrapper">
                                    <span className="input-icon">📧</span>
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-input"
                                        placeholder="your.email@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <div className="input-wrapper">
                                <span className="input-icon">
                                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                </span>
                                <input
                                    type="text"
                                    name="username"
                                    className="form-input"
                                    placeholder="Choose a username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Role</label>
                                <div className="input-wrapper">
                                    <span className="input-icon">🎓</span>
                                    <select name="role" className="form-select" value={formData.role} onChange={handleChange} required>
                                        <option value="student">Student</option>
                                        <option value="driver">Driver</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone</label>
                                <div className="input-wrapper">
                                    <span className="input-icon">📱</span>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="form-input"
                                        placeholder="Optional phone number"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <div className="input-wrapper">
                                    <span className="input-icon">
                                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                    </span>
                                    <input
                                        type="password"
                                        name="password"
                                        className="form-input"
                                        placeholder="Create a strong password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Confirm Password</label>
                                <div className="input-wrapper">
                                    <span className="input-icon">🔒</span>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        className="form-input"
                                        placeholder="Confirm your password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <button
                            type="submit"
                            className="signup-submit-btn"
                            disabled={loading}
                        >
                            {loading ? "Creating Account..." : "Create Account & Login"}
                        </button>
                    </form>

                    <div className="signup-footer">
                        <p>
                            Already have an account? <Link to="/login" className="login-link">Login here</Link>
                        </p>
                    </div>
                </div>

                <div className="signup-footer-main">
                    <p>Secure • Real-time • Professional</p>
                </div>
            </div>
        </div>
    );
}

export default SignupPage;
