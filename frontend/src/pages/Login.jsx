import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { loginUser, registerUser, sendOTP, clearError, resetOtp } from '../redux/authSlice';
import { BRANCHES } from '../utils/constants';
import { FiMail, FiLock, FiUser, FiBriefcase, FiChevronRight, FiShield, FiAlertCircle } from 'react-icons/fi';
import { RiGraduationCapLine } from 'react-icons/ri';

const ROLE_OPTIONS = [
    { value: 'Student', label: 'Student', desc: 'Raise queries', icon: <RiGraduationCapLine /> },
    { value: 'Admin', label: 'Admin', desc: 'Manage system', icon: <FiShield /> },
];

export default function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, userInfo, otpSent, otpLoading, otpError } = useSelector(s => s.auth);

    const [tab, setTab] = useState('login'); 
    const [role, setRole] = useState('Student');
    const [step, setStep] = useState(1); 

    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', branch: '', otp: '' });
    const [localError, setLocalError] = useState('');

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    useEffect(() => {
        if (userInfo) navigate(userInfo.role === 'Admin' ? '/admin-dashboard' : '/student-dashboard');
    }, [userInfo, navigate]);

    useEffect(() => { dispatch(clearError()); setLocalError(''); }, [tab, dispatch]);
    useEffect(() => { if (otpSent && step === 1) setStep(2); }, [otpSent, step]);

    const handleSendOTP = (e) => {
        e.preventDefault();
        setLocalError('');
        if (!form.email.includes('@')) return setLocalError('Please enter a valid email.');
        dispatch(sendOTP(form.email));
    };

    const handleRegister = (e) => {
        e.preventDefault();
        setLocalError('');
        if (form.password !== form.confirmPassword) return setLocalError('Passwords do not match.');
        if (form.password.length < 6) return setLocalError('Password must be at least 6 characters.');
        if (!form.branch && role === 'Student') return setLocalError('Please select your branch.');
        dispatch(registerUser({ ...form, role }));
    };

    const handleLogin = (e) => {
        e.preventDefault();
        dispatch(loginUser({ email: form.email, password: form.password }));
    };

    const errMsg = localError || error || otpError;

    return (
        <div className="auth-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            
            <motion.div 
                className="auth-split-container"
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                {/* Visual Panel (Left) */}
                <div className="auth-graphic-panel">
                    <div className="graphic-3d-element"></div>
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        style={{ zIndex: 1 }}
                    >
                        <div style={{ display: 'inline-flex', background: '#fff', padding: '8px', borderRadius: '50%', marginBottom: '2rem', border: '2px solid rgba(255,255,255,0.4)', boxShadow: '0 15px 35px rgba(0,0,0,0.5)' }}>
                            <img src="/SATI_Vidisha.jpg" alt="SATI Vidisha Logo" style={{ height: '140px', width: '140px', objectFit: 'contain' }} />
                        </div>
                        <h1 style={{ color: '#fff', fontSize: '2.5rem', marginBottom: '1rem', letterSpacing: '-0.03em' }}>
                            Student Support,<br/>Redefined.
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', maxWidth: '300px', lineHeight: 1.6 }}>
                            A high-end, intelligent query resolution portal built exclusively for modern campus networks.
                        </p>
                    </motion.div>
                </div>

                {/* Form Panel (Right) */}
                <div className="auth-form-panel">
                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '2rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--border)' }}>
                        <button 
                            style={{ paddingBottom: '1rem', fontSize: '1rem', fontWeight: 600, color: tab === 'login' ? 'var(--primary-light)' : 'var(--text-muted)', borderBottom: tab === 'login' ? '2px solid var(--primary-light)' : '2px solid transparent', transition: 'all 0.2s' }}
                            onClick={() => { setTab('login'); setStep(1); dispatch(resetOtp()); }}
                        >
                            Sign In
                        </button>
                        <button 
                            style={{ paddingBottom: '1rem', fontSize: '1rem', fontWeight: 600, color: tab === 'register' ? 'var(--primary-light)' : 'var(--text-muted)', borderBottom: tab === 'register' ? '2px solid var(--primary-light)' : '2px solid transparent', transition: 'all 0.2s' }}
                            onClick={() => { setTab('register'); setStep(1); dispatch(resetOtp()); }}
                        >
                            Create Account
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={tab + step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25 }}
                        >
                            {errMsg && (
                                <div className="alert alert-error">
                                    <FiAlertCircle size={18} /> <span>{errMsg}</span>
                                </div>
                            )}

                            {/* SIGN IN */}
                            {tab === 'login' && (
                                <form onSubmit={handleLogin}>
                                    <div className="form-group">
                                        <label className="form-label">Email Address</label>
                                        <div style={{ position: 'relative' }}>
                                            <FiMail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                            <input type="email" className="form-control" style={{ paddingLeft: '2.5rem' }} placeholder="your.email@college.edu" value={form.email} onChange={e => set('email', e.target.value)} required />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Password</label>
                                        <div style={{ position: 'relative' }}>
                                            <FiLock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                            <input type="password" className="form-control" style={{ paddingLeft: '2.5rem' }} placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} required />
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', marginTop: '1rem', fontSize: '1rem' }} disabled={loading}>
                                        {loading ? 'Authenticating...' : 'Sign In'} <FiChevronRight />
                                    </button>
                                </form>
                            )}

                            {/* REGISTER */}
                            {tab === 'register' && (
                                <>
                                    {step === 1 && (
                                        <form onSubmit={handleSendOTP}>
                                            <div className="role-toggle">
                                                {ROLE_OPTIONS.map(r => (
                                                    <div key={r.value} className={`role-btn ${role === r.value ? 'active' : ''}`} onClick={() => setRole(r.value)}>
                                                        <div className="role-btn-title">{r.icon} {r.label}</div>
                                                        <div className="role-btn-desc">{r.desc}</div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="form-group" style={{ marginTop: '2rem' }}>
                                                <label className="form-label">Email Address</label>
                                                <div style={{ position: 'relative' }}>
                                                    <FiMail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                                    <input type="email" className="form-control" style={{ paddingLeft: '2.5rem' }} placeholder="your.email@college.edu" value={form.email} onChange={e => set('email', e.target.value)} required />
                                                </div>
                                                <p className="form-label" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>A 6-digit OTP will be sent to verify your identity.</p>
                                            </div>

                                            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', marginTop: '1rem' }} disabled={otpLoading}>
                                                {otpLoading ? 'Sending...' : 'Send Verification OTP'} <FiChevronRight />
                                            </button>
                                        </form>
                                    )}

                                    {step === 2 && (
                                        <form onSubmit={handleRegister}>
                                            <div className="alert alert-success" style={{ padding: '0.75rem' }}>
                                                OTP sent to <strong>{form.email}</strong>
                                            </div>

                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label className="form-label">Full Name</label>
                                                    <div style={{ position: 'relative' }}>
                                                        <FiUser style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                                        <input type="text" className="form-control" style={{ paddingLeft: '2.5rem' }} placeholder="John Doe" value={form.name} onChange={e => set('name', e.target.value)} required />
                                                    </div>
                                                </div>
                                                {role === 'Student' && (
                                                    <div className="form-group">
                                                        <label className="form-label">Branch</label>
                                                        <div style={{ position: 'relative' }}>
                                                            <FiBriefcase style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                                            <select className="form-control" style={{ paddingLeft: '2.5rem' }} value={form.branch} onChange={e => set('branch', e.target.value)} required>
                                                                <option value="">Select branch...</option>
                                                                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label className="form-label">Password</label>
                                                    <input type="password" className="form-control" placeholder="Min. 6 characters" value={form.password} onChange={e => set('password', e.target.value)} required />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Confirm</label>
                                                    <input type="password" className="form-control" placeholder="Re-type password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} required />
                                                </div>
                                            </div>

                                            <div className="form-group" style={{ marginTop: '0.5rem' }}>
                                                <label className="form-label" style={{ textAlign: 'center' }}>Email OTP</label>
                                                <input type="text" className="form-control otp-input" placeholder="------" maxLength={6} value={form.otp} onChange={e => set('otp', e.target.value.replace(/\D/g, ''))} required />
                                            </div>

                                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                                <button type="button" className="btn btn-secondary" onClick={() => { setStep(1); dispatch(resetOtp()); }}>Back</button>
                                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                                                    {loading ? 'Finalizing...' : 'Complete Registration'}
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
