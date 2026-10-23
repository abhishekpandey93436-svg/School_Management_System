import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createQuery, getMyQueries, resetCreateSuccess, addComment } from '../redux/querySlice';
import { StatusBadge, PriorityBadge, Spinner, Alert } from '../components/UIComponents';
import Navbar from '../components/Navbar';
import { CATEGORIES, PRIORITIES } from '../utils/constants';
import { FiLayout, FiList, FiPlusSquare, FiInbox, FiClock, FiCheckCircle, FiChevronDown, FiChevronUp, FiAlertCircle, FiType, FiTag, FiFlag, FiAlignLeft, FiSend, FiX, FiUploadCloud, FiImage, FiMessageCircle, FiRefreshCw } from 'react-icons/fi';
import Tilt from 'react-parallax-tilt';

const NAV = [
    { id: 'dashboard', icon: <FiLayout />, label: 'Dashboard' },
    { id: 'queries', icon: <FiList />, label: 'My Queries' },
    { id: 'new', icon: <FiPlusSquare />, label: 'New Query' },
];

export default function StudentDashboard() {
    const dispatch = useDispatch();
    const { userInfo } = useSelector(s => s.auth);
    const { myQueries, loading, error, createSuccess } = useSelector(s => s.queries);

    const [active, setActive] = useState('dashboard');
    const [expandedId, setExpandedId] = useState(null);
    const [filterStatus, setFilterStatus] = useState('');
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', category: 'Academics', priority: 'Normal', attachment: null });
    const [commentText, setCommentText] = useState('');

    useEffect(() => { dispatch(getMyQueries()); }, [dispatch]);
    useEffect(() => { if (createSuccess) { setActive('queries'); dispatch(resetCreateSuccess()); } }, [createSuccess, dispatch]);

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleSubmit = (e) => {
        e.preventDefault();
        const fd = new FormData();
        fd.append('title', form.title);
        fd.append('description', form.description);
        fd.append('category', form.category);
        fd.append('priority', form.priority);
        if (form.attachment) fd.append('attachment', form.attachment);

        dispatch(createQuery(fd));
        setForm({ title: '', description: '', category: 'Academics', priority: 'Normal', attachment: null });
    };

    const handleComment = (qId) => {
        if (!commentText.trim()) return;
        dispatch(addComment({ queryId: qId, text: commentText }));
        setCommentText('');
    };

    const filtered = filterStatus ? myQueries.filter(q => q.status === filterStatus) : myQueries;
    const stats = {
        total: myQueries.length,
        open: myQueries.filter(q => q.status === 'Open').length,
        inProgress: myQueries.filter(q => q.status === 'In-Progress').length,
        resolved: myQueries.filter(q => q.status === 'Resolved').length,
    };

    return (
        <div className={`app-shell ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
            <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <div className="page-with-sidebar">
                {/* Sidebar */}
                <aside className="sidebar">
                    <div className="sidebar-section-title">Navigation</div>
                    {NAV.map(n => (
                        <button key={n.id} className={`sidebar-item ${active === n.id ? 'active' : ''}`} onClick={() => setActive(n.id)} title={isCollapsed ? n.label : undefined}>
                            <span className="sidebar-icon">{n.icon}</span>
                            <span className="sidebar-item-label">{n.label}</span>
                            {n.id === 'queries' && stats.open > 0 && <span className="sidebar-badge">{stats.open}</span>}
                        </button>
                    ))}
                </aside>

                {/* Main Content */}
                <main className="main-area">

                    {/* ── DASHBOARD ── */}
                    {active === 'dashboard' && (
                        <div className="fade-in">
                            <div className="page-header">
                                <h2>Welcome back, {userInfo?.name?.split(' ')[0]}!</h2>
                                <p>Here's a summary of your queries and activity.</p>
                            </div>
                            <div className="stat-grid mb-3">
                                <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} scale={1.02} transitionSpeed={400} className="stat-card">
                                    <div className="stat-icon primary"><FiInbox /></div>
                                    <div><div className="stat-value">{stats.total}</div><div className="stat-label">Total Queries</div></div>
                                </Tilt>
                                <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} scale={1.02} transitionSpeed={400} className="stat-card">
                                    <div className="stat-icon warning"><FiAlertCircle /></div>
                                    <div><div className="stat-value" style={{ color: 'var(--warning)' }}>{stats.open}</div><div className="stat-label">Open</div></div>
                                </Tilt>
                                <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} scale={1.02} transitionSpeed={400} className="stat-card">
                                    <div className="stat-icon info"><FiClock /></div>
                                    <div><div className="stat-value" style={{ color: 'var(--info)' }}>{stats.inProgress}</div><div className="stat-label">In Progress</div></div>
                                </Tilt>
                                <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} scale={1.02} transitionSpeed={400} className="stat-card">
                                    <div className="stat-icon success"><FiCheckCircle /></div>
                                    <div><div className="stat-value" style={{ color: 'var(--success)' }}>{stats.resolved}</div><div className="stat-label">Resolved</div></div>
                                </Tilt>
                            </div>

                            {/* Recent queries preview */}
                            <div className="card">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <h3 style={{ fontSize: '1.05rem' }}>Recent Queries</h3>
                                    <button className="btn btn-ghost text-sm" onClick={() => setActive('queries')}>View all →</button>
                                </div>
                                {myQueries.slice(0,3).map(q => (
                                    <div key={q._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 0', borderBottom: '1px solid var(--border)' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{q.title}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{q.category} • {new Date(q.createdAt).toLocaleDateString()}</div>
                                        </div>
                                        <StatusBadge status={q.status} />
                                    </div>
                                ))}
                                {myQueries.length === 0 && <div className="empty-state" style={{ padding: '2rem' }}><FiInbox size={40} color="var(--text-light)" /><p style={{ marginTop: '1rem' }}>No queries yet. <button className="btn btn-ghost" style={{ color: 'var(--primary-light)', display: 'inline', padding: 0 }} onClick={() => setActive('new')}>Raise your first one →</button></p></div>}
                            </div>
                        </div>
                    )}

                    {/* ── QUERIES LIST ── */}
                    {active === 'queries' && (
                        <div className="fade-in">
                            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <h2>My Queries</h2>
                                    <p>Track the status of all your support requests.</p>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => dispatch(getMyQueries())}>
                                        <FiRefreshCw /> Refresh
                                    </button>
                                    <button className="btn btn-primary" onClick={() => setActive('new')}>
                                        <FiPlusSquare /> New Query
                                    </button>
                                </div>
                            </div>

                            <div className="filter-bar">
                                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                                    <option value="">All Statuses</option>
                                    <option value="Open">Open</option>
                                    <option value="In-Progress">In Progress</option>
                                    <option value="Resolved">Resolved</option>
                                </select>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', alignSelf: 'center' }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
                            </div>

                            {loading && <div style={{ textAlign: 'center', padding: '2rem' }}><Spinner light={false} size={28} /></div>}
                            {error && <Alert type="error">{error}</Alert>}

                            {filtered.length === 0 && !loading && (
                                <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                                    <FiInbox size={48} color="var(--text-light)" style={{ marginBottom: '1rem' }} />
                                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No queries found</h3>
                                    <p style={{ color: 'var(--text-muted)' }}>Try changing the filter, or raise a new query.</p>
                                </div>
                            )}

                            {filtered.map(q => (
                                <div key={q._id} className="query-card">
                                    <div className="query-card-header">
                                        <div className="query-card-title-row">
                                            <h3 className="query-card-title">{q.title}</h3>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                                <StatusBadge status={q.status} />
                                                <PriorityBadge priority={q.priority} />
                                            </div>
                                        </div>
                                        <div className="query-meta-grid">
                                            <span className="meta-chip">{q.category}</span>
                                            <span className="meta-chip">{new Date(q.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        </div>
                                    </div>

                                    <div className="query-card-body">{q.description}</div>

                                    <div className="query-card-footer">
                                        <button className="btn btn-ghost text-sm" style={{ alignSelf: 'flex-start' }} onClick={() => setExpandedId(expandedId === q._id ? null : q._id)}>
                                            {expandedId === q._id ? <><FiChevronUp /> Hide Response</> : <><FiChevronDown /> View Response</>}
                                        </button>
                                    </div>

                                    {expandedId === q._id && (
                                        <div style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid var(--border)' }}>
                                            
                                            {/* Attachment Preview Viewer */}
                                            {q.attachment && (
                                                <div style={{ marginBottom: '1.5rem', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <FiImage size={24} color="var(--primary-light)" />
                                                    <div>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Attached Document</div>
                                                        <a href={`http://localhost:5000${q.attachment}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>View Attachment →</a>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Chat Thread */}
                                            <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '8px' }}>
                                                {q.comments && q.comments.length > 0 ? q.comments.map((c, idx) => {
                                                    const isMe = c.user === userInfo?._id;
                                                    return (
                                                        <div key={idx} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%', background: isMe ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))' : 'var(--surface-2)', padding: '12px 16px', borderRadius: '16px', borderBottomRightRadius: isMe ? 0 : '16px', borderBottomLeftRadius: isMe ? '16px' : 0, border: isMe ? 'none' : '1px solid var(--border)', color: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                                                            <div style={{ fontSize: '0.7rem', opacity: 0.7, marginBottom: 4 }}>
                                                                {c.name} {c.role === 'Admin' && <span style={{ background: '#000', padding: '2px 6px', borderRadius: 4, marginLeft: 4 }}>ADMIN</span>} • {new Date(c.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                            </div>
                                                            <div style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{c.text}</div>
                                                        </div>
                                                    )
                                                }) : (
                                                    <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                                                        <FiMessageCircle size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
                                                        <p>No messages yet. Send a follow-up or wait for an admin.</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Reply Box */}
                                            {q.status !== 'Resolved' && (
                                                <div style={{ display: 'flex', gap: '12px', marginTop: '1.5rem' }}>
                                                    <input type="text" className="form-control" placeholder="Type a reply..." value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') handleComment(q._id) }} />
                                                    <button className="btn btn-primary" onClick={() => handleComment(q._id)}><FiSend /></button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── NEW QUERY ── */}
                    {active === 'new' && (
                        <div className="fade-in">
                            <div className="page-header">
                                <h2>Raise a New Query</h2>
                                <p>Describe your issue clearly. An admin will respond shortly.</p>
                            </div>
                            <div className="card" style={{ maxWidth: 700 }}>
                                <form onSubmit={handleSubmit}>
                                    {error && <Alert type="error">{error}</Alert>}
                                    <div className="form-group">
                                        <label className="form-label">Query Title*</label>
                                        <div style={{ position: 'relative' }}>
                                            <FiType style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                            <input type="text" className="form-control" style={{ paddingLeft: '2.5rem' }} placeholder="Brief summary of your issue" value={form.title} onChange={e => set('title', e.target.value)} required />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Category*</label>
                                            <div style={{ position: 'relative' }}>
                                                <FiTag style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                                <select className="form-control" style={{ paddingLeft: '2.5rem', appearance: 'none' }} value={form.category} onChange={e => set('category', e.target.value)}>
                                                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                                </select>
                                                <FiChevronDown style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Priority</label>
                                            <div style={{ position: 'relative' }}>
                                                <FiFlag style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                                <select className="form-control" style={{ paddingLeft: '2.5rem', appearance: 'none' }} value={form.priority} onChange={e => set('priority', e.target.value)}>
                                                    {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                                                </select>
                                                <FiChevronDown style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Detailed Description*</label>
                                        <div style={{ position: 'relative' }}>
                                            <FiAlignLeft style={{ position: 'absolute', left: 14, top: '1.25rem', color: 'var(--text-muted)' }} />
                                            <textarea className="form-control" rows="6" style={{ paddingLeft: '2.5rem', resize: 'vertical' }} placeholder="Describe your issue in detail. Include relevant dates, subject names, etc." value={form.description} onChange={e => set('description', e.target.value)} required />
                                        </div>
                                    </div>
                                    
                                    <div className="form-group">
                                        <label className="form-label">Attach Screenshot (Optional)</label>
                                        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', border: '2px dashed var(--border)', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', cursor: 'pointer', transition: 'all 0.2s', borderHover: 'var(--primary)' }}>
                                            <FiUploadCloud size={36} color={form.attachment ? 'var(--success)' : 'var(--text-muted)'} style={{ marginBottom: '12px' }} />
                                            <span style={{ fontSize: '0.9rem', color: form.attachment ? 'var(--success)' : 'var(--text)' }}>
                                                {form.attachment ? form.attachment.name : 'Click or drag Image/PDF to upload'}
                                            </span>
                                            <input type="file" style={{ display: 'none' }} accept="image/*,.pdf" onChange={e => set('attachment', e.target.files[0])} />
                                        </label>
                                    </div>

                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                        <button type="button" className="btn btn-secondary" onClick={() => setActive('queries')}><FiX /> Cancel</button>
                                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                                            {loading ? <><Spinner /> Submitting...</> : <><FiSend /> Submit Query</>}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
