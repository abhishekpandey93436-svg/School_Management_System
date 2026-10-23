import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/authSlice';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiLogOut, FiSettings } from 'react-icons/fi';
import { RiGraduationCapLine } from 'react-icons/ri';
import EditProfileModal from './EditProfileModal';

export default function Navbar({ isCollapsed, setIsCollapsed }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userInfo } = useSelector(s => s.auth);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);

    const handleLogout = () => { dispatch(logout()); navigate('/'); };
    const initial = userInfo?.name?.charAt(0).toUpperCase() || '?';

    return (
        <nav className="navbar">
            <div className="brand-wrapper">
                {userInfo && (
                    <button className="sidebar-toggle" onClick={() => setIsCollapsed(!isCollapsed)}>
                        {isCollapsed ? <FiMenu size={20} /> : <FiX size={20} />}
                    </button>
                )}
                <span className="navbar-brand">
                    <div className="brand-icon-wrapper">
                        <RiGraduationCapLine />
                    </div>
                    Help Desk {userInfo?.role === 'Admin' && <span style={{ fontSize: '0.65rem', background: 'rgba(79,70,229,0.2)', color: 'var(--primary-light)', padding: '3px 8px', borderRadius: 999, fontWeight: 800, marginLeft: 8 }}>ADMIN</span>}
                </span>
            </div>

            <div className="navbar-right">
                {userInfo && (
                    <div className="profile-dropdown-wrapper">
                        <div className="profile-pill" onClick={() => setDropdownOpen(!dropdownOpen)}>
                            <div className="user-avatar">{initial}</div>
                            <div>
                                <div className="user-pill-name">{userInfo.name.split(' ')[0]}</div>
                                <div className="user-pill-meta">{userInfo.role}</div>
                            </div>
                        </div>

                        <AnimatePresence>
                            {dropdownOpen && (
                                <motion.div 
                                    className="profile-menu"
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <div style={{ padding: '0.5rem 0.85rem' }}>
                                        <div style={{ fontWeight: 600, color: 'var(--text)' }}>{userInfo.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{userInfo.email}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: 4 }}>{userInfo.branch}</div>
                                    </div>
                                    <div className="profile-menu-divider" />
                                    
                                    <div className="profile-menu-item" onClick={() => { setDropdownOpen(false); setEditModalOpen(true); }}>
                                        <FiSettings size={16} /> Edit Profile
                                    </div>
                                    <div className="profile-menu-divider" />
                                    <div className="profile-menu-item menu-danger" onClick={handleLogout}>
                                        <FiLogOut size={16} /> Logout
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        
                        <EditProfileModal open={editModalOpen} onClose={() => setEditModalOpen(false)} />
                    </div>
                )}
            </div>
        </nav>
    );
}
