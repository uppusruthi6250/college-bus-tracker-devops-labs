/**
 * Login Page Component
 * Premium dark mode login interface
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import './LoginPage.css';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(username, password);

        if (!result.success) {
            setError(result.message);
            setLoading(false);
        }
    };

    const demoAccounts = [
        { username: 'student1', password: 'password123', role: 'Student' },
        { username: 'driver1', password: 'password123', role: 'Driver' },
        { username: 'admin', password: 'password123', role: 'Admin' }
    ];

    const fillDemo = (account) => {
        setUsername(account.username);
        setPassword(account.password);
        setError('');
    };

    return (
        <div className="login-page">
            <div className="login-background">
                <div className="gradient-glow top-left"></div>
                <div className="gradient-glow bottom-right"></div>
            </div>

            <div className="login-container">
                <div className="login-header">
                    <div className="logo-box">
                        <svg viewBox="0 0 24 24" className="logo-svg">
                            <path fill="currentColor" d="M18 11V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v5a4 4 0 0 0-4 4v3h2v2h2v-2h8v2h2v-2h2v-3a4 4 0 0 0-4-4M8 6h8v5H8V6m-2 9a2 2 0 1 1 2 2a2 2 0 0 1-2-2m10 2a2 2 0 1 1 2-2a2 2 0 0 1-2 2" />
                        </svg>
                    </div>
                    <h1 className="login-title">College Bus Tracker</h1>
                    <p className="login-subtitle">Real-time Attendance & Tracking System</p>
                </div>

                <div className="login-card">
                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <div className="input-wrapper">
                                <span className="input-icon">
                                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                </span>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="label-row">
                                <label className="form-label">Password</label>
                                <a href="#" className="forgot-link">Forgot password?</a>
                            </div>
                            <div className="input-wrapper">
                                <span className="input-icon">
                                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                </span>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <button
                            type="submit"
                            className="login-submit-btn"
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login to Dashboard"}
                        </button>
                    </form>

                    <Link to="/signup" className="signup-btn-promo">
                            <strong>New User?</strong> Sign Up - 30 Seconds
                        </Link>
                    <div className="divider">
                        <span className="divider-text">OR ACCESS DEMO</span>
                    </div>

                    <div className="demo-grid">
                        <button className="demo-card" onClick={() => fillDemo(demoAccounts[0])}>
                            <span className="demo-icon">🎓</span>
                            <span className="demo-label">STUDENT</span>
                        </button>
                        <button className="demo-card" onClick={() => fillDemo(demoAccounts[1])}>
                            <span className="demo-icon">🚌</span>
                            <span className="demo-label">DRIVER</span>
                        </button>
                        <button className="demo-card" onClick={() => fillDemo(demoAccounts[2])}>
                            <span className="demo-icon">🛠️</span>
                            <span className="demo-label">ADMIN</span>
                        </button>
                    </div>
                </div>

                <div className="login-footer">
                    <p className="footer-main">Built with ❤️ for College Students</p>
                    <p className="footer-sub">REAL-TIME GPS • ATTENDANCE LOCK • NOTIFICATIONS</p>
                    <p className="signup-prompt">New user? <Link to="/signup" style={{color: '#667eea', textDecoration: 'none', fontWeight: '600'}}>Create an account</Link></p>
                </div>
            </div>


            {/* Floating map icon bottom right */}
            <div className="floating-map-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
            </div>
        </div>
    );
}

export default LoginPage;
