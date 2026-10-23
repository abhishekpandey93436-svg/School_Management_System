import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllQueries, getAnalytics, updateStatus, addComment } from '../redux/querySlice';
import { StatusBadge, PriorityBadge, Spinner, Alert } from '../components/UIComponents';
import Navbar from '../components/Navbar';
import { CATEGORIES, STATUSES, PRIORITIES } from '../utils/constants';
import { FiLayout, FiList, FiAlertTriangle, FiUsers, FiCheckCircle, FiClock, FiInbox, FiEdit3, FiMessageSquare, FiDownload, FiImage, FiSend, FiMessageCircle, FiRefreshCw } from 'react-icons/fi';
import Tilt from 'react-parallax-tilt';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const NAV = [
    { id: 'dashboard', icon: <FiLayout />, label: 'Dashboard' },
    { id: 'queries', icon: <FiList />, label: 'All Queries' },
    { id: 'urgent', icon: <FiAlertTriangle />, label: 'Urgent' },
    { id: 'normal', icon: <FiClock />, label: 'Normal' },
    { id: 'low', icon: <FiInbox />, label: 'Low' },
];

export default function AdminDashboard() {
    const dispatch = useDispatch();
    const { userInfo } = useSelector(s => s.auth);
    const { queries, analytics, loading, error } = useSelector(s => s.queries);

    const [active, setActive] = useState('dashboard');
    const [expandedId, setExpandedId] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [answerStatus, setAnswerStatus] = useState('Resolved');
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Filters
    const [filterStatus, setFilterStatus] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterBranch, setFilterBranch] = useState('');
    const [filterPriority, setFilterPriority] = useState('');
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        dispatch(getAllQueries());
        dispatch(getAnalytics());
    }, [dispatch]);

    const handleOpenExpand = (q) => {
        if (expandedId === q._id) { setExpandedId(null); return; }
        setExpandedId(q._id);
        setAnswerStatus(q.status);
    };

    const handleComment = (id) => {
        if (!commentText.trim()) return;
        dispatch(addComment({ queryId: id, text: commentText }));
        setCommentText('');
    };

    const handleGeneratePDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text("Help Desk Analytics Report", 14, 22);
        doc.setFontSize(12);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);
        
        autoTable(doc, {
            startY: 40,
            head: [['Total Queries', 'Open', 'In Progress', 'Resolved', 'Urgent Pending']],
            body: [[analytics?.total || 0, analytics?.open || 0, analytics?.inProgress || 0, analytics?.resolved || 0, analytics?.urgent || 0]]
        });

        // Get the Y position of the last table
        const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 60;

        autoTable(doc, {
            startY: finalY + 15,
            head: [['Category', 'Count']],
            body: Object.entries(analytics?.categoryBreakdown || {})
        });

        doc.save("Help_Desk_Report.pdf");
    };

    // Apply filters
    const applyFilters = (list) => {
        return list.filter(q => {
            if (filterStatus && q.status !== filterStatus) return false;
            if (filterCategory && q.category !== filterCategory) return false;
            if (filterPriority && q.priority !== filterPriority) return false;
            if (filterBranch && !q.branch?.toLowerCase().includes(filterBranch.toLowerCase())) return false;
            if (searchText) {
                const s = searchText.toLowerCase();
                if (!q.title?.toLowerCase().includes(s) && !q.description?.toLowerCase().includes(s) && !q.studentId?.name?.toLowerCase().includes(s)) return false;
            }
            return true;
        });
    };

    const urgentList = queries.filter(q => q.priority === 'Urgent' && q.status !== 'Resolved');
    const normalList = queries.filter(q => q.priority === 'Normal' && q.status !== 'Resolved');
    const lowList = queries.filter(q => q.priority === 'Low' && q.status !== 'Resolved');
    
    const displayList = active === 'urgent' ? urgentList : 
                        active === 'normal' ? normalList :
                        active === 'low' ? lowList : applyFilters(queries);

    const clearFilters = () => { setFilterStatus(''); setFilterCategory(''); setFilterBranch(''); setFilterPriority(''); setSearchText(''); };
    const hasFilters = filterStatus || filterCategory || filterBranch || filterPriority || searchText;
    const resolvedPct = analytics ? Math.round((analytics.resolved / (analytics.total || 1)) * 100) : 0;

    return (
        <div className={`app-shell ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
            <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <div className="page-with-sidebar">
                {/* Sidebar */}
                <aside className="sidebar">
                    <div className="sidebar-section-title">Admin Panel</div>
                    {NAV.map(n => (
                        <button key={n.id} className={`sidebar-item ${active === n.id ? 'active' : ''}`} onClick={() => setActive(n.id)} title={isCollapsed ? n.label : undefined}>
                            <span className="sidebar-icon">{n.icon}</span>
                            <span className="sidebar-item-label">{n.label}</span>
                            {n.id === 'urgent' && urgentList.length > 0 && <span className="sidebar-badge">{urgentList.length}</span>}
                            {n.id === 'normal' && normalList.length > 0 && <span className="sidebar-badge" style={{ background: 'var(--warning)', color: '#000' }}>{normalList.length}</span>}
                            {n.id === 'low' && lowList.length > 0 && <span className="sidebar-badge" style={{ background: 'var(--secondary)' }}>{lowList.length}</span>}
                        </button>
                    ))}
                </aside>

                {/* Main */}
                <main className="main-area">

                    {/* ── DASHBOARD VIEW ── */}
                    {active === 'dashboard' && (
                        <div className="fade-in">
                            <div className="page-header" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div><h2>System Overview</h2><p>Real-time analytics and management interface.</p></div>
                                <button className="btn btn-primary" onClick={handleGeneratePDF} style={{ padding: '0.75rem 1.25rem' }}>
                                    <FiDownload /> Export Report
                                </button>
                            </div>

                            {/* Stat Cards */}
                            <div className="stat-grid mb-3">
                                <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} scale={1.02} transitionSpeed={400} className="stat-card">
                                    <div className="stat-icon primary"><FiInbox /></div>
                                    <div><div className="stat-value">{analytics?.total ?? '—'}</div><div className="stat-label">Total Queries</div></div>
                                </Tilt>
                                <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} scale={1.02} transitionSpeed={400} className="stat-card">
                                    <div className="stat-icon warning"><FiClock /></div>
                                    <div><div className="stat-value" style={{ color: 'var(--warning)' }}>{analytics?.open ?? '—'}</div><div className="stat-label">Open</div></div>
                                </Tilt>
                                <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} scale={1.02} transitionSpeed={400} className="stat-card">
                                    <div className="stat-icon success"><FiCheckCircle /></div>
                                    <div><div className="stat-value" style={{ color: 'var(--success)' }}>{analytics?.resolved ?? '—'}</div><div className="stat-label">Resolved</div></div>
                                </Tilt>
                                <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} scale={1.02} transitionSpeed={400} className="stat-card">
                                    <div className="stat-icon accent"><FiAlertTriangle /></div>
                                    <div><div className="stat-value" style={{ color: 'var(--accent)' }}>{analytics?.urgent ?? '—'}</div><div className="stat-label">Urgent Pending</div></div>
                                </Tilt>
                                <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} scale={1.02} transitionSpeed={400} className="stat-card">
                                    <div className="stat-icon" style={{ background: 'rgba(14,165,233,0.15)', color: 'var(--secondary)' }}><FiUsers /></div>
                                    <div><div className="stat-value" style={{ color: 'var(--secondary)' }}>{analytics?.totalStudents ?? '—'}</div><div className="stat-label">Registered Students</div></div>
                                </Tilt>
                            </div>

                            {/* Resolution Rate */}
                            <div className="card mb-3">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                    <h3 style={{ fontSize: '1rem' }}>Resolution Rate</h3>
                                    <span style={{ fontWeight: 800, color: 'var(--success)', fontSize: '1.25rem' }}>{resolvedPct}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${resolvedPct}%`, background: 'linear-gradient(90deg, var(--primary), var(--success))' }} />
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{analytics?.resolved} of {analytics?.total} total queries completely resolved.</p>
                            </div>
                        </div>
                    )}

                    {/* ── QUERIES LIST ── */}
                    {(active === 'queries' || active === 'urgent' || active === 'normal' || active === 'low') && (
                        <div className="fade-in">
                            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <h2>{active === 'urgent' ? 'Urgent Queries' : active === 'normal' ? 'Normal Queries' : active === 'low' ? 'Low Priority Queries' : 'All Queries'}</h2>
                                    <p>{active === 'urgent' ? 'Unresolved urgent student queries needing immediate attention.' : active === 'normal' ? 'Standard priority support issues.' : active === 'low' ? 'General inquiries and low priority tickets.' : 'Manage and respond to all submitted queries.'}</p>
                                </div>
                                <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => { dispatch(getAllQueries()); dispatch(getAnalytics()); }}>
                                    <FiRefreshCw /> Refresh
                                </button>
                            </div>

                            {/* Filter Bar */}
                            {active === 'queries' && (
                                <div className="filter-bar">
                                    <input placeholder="Search by name, title..." value={searchText} onChange={e => setSearchText(e.target.value)} style={{ minWidth: 200, flex: 2 }} />
                                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                                        <option value="">All Statuses</option>
                                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                    <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                                        <option value="">All Categories</option>
                                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                    <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
                                        <option value="">All Priorities</option>
                                        {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                                    </select>
                                    {hasFilters && <button className="btn btn-secondary" onClick={clearFilters}>✕ Clear</button>}
                                </div>
                            )}

                            {loading && <div style={{ textAlign: 'center', padding: '2rem' }}><Spinner light={false} size={28} /></div>}
                            {error && <Alert type="error">{error}</Alert>}

                            {displayList.length === 0 && !loading && (
                                <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                                    <FiInbox size={48} color="var(--text-light)" style={{ marginBottom: '1rem' }} />
                                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No matching queries</h3>
                                    <p style={{ color: 'var(--text-muted)' }}>You're all caught up!</p>
                                </div>
                            )}

                            {displayList.map(q => (
                                <div key={q._id} className="query-card" style={{ borderLeftColor: q.priority === 'Urgent' ? 'var(--accent)' : 'transparent' }}>
                                    <div className="query-card-header">
                                        <div className="query-card-title-row">
                                            <h3 className="query-card-title">{q.title}</h3>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <StatusBadge status={q.status} />
                                                <PriorityBadge priority={q.priority} />
                                            </div>
                                        </div>
                                        <div className="query-meta-grid">
                                            <span className="meta-chip"><FiUsers /> {q.studentId?.name || 'Unknown'} — {q.branch}</span>
                                            <span className="meta-chip">{q.category}</span>
                                            <span className="meta-chip">{new Date(q.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="query-card-body">{q.description}</div>
                                    {q.attachment && (
                                        <a href={q.attachment} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                                            <FiImage /> View Attachment
                                        </a>
                                    )}
                                    
                                    <div className="query-card-footer">
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {STATUSES.map(s => (
                                                <button key={s} className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: '0.75rem', border: `1px solid ${q.status === s ? 'var(--primary)' : 'transparent'}`, background: q.status === s ? 'rgba(79,70,229,0.1)' : 'transparent', color: q.status === s ? 'var(--primary-light)' : 'var(--text-muted)' }} onClick={() => dispatch(updateStatus({ queryId: q._id, status: s }))}>
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                        <button className="btn btn-primary" onClick={() => handleOpenExpand(q)}>
                                            {expandedId === q._id ? 'Close' : <><FiMessageCircle /> Chat</>}
                                        </button>
                                    </div>

                                    {expandedId === q._id && (
                                        <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid var(--border)' }}>
                                            
                                            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Change Status:</span>
                                                <select className="form-control" style={{ width: 'auto', padding: '0.6rem 2.5rem 0.6rem 1rem', display: 'inline-block' }} value={q.status} onChange={e => { dispatch(updateStatus({ queryId: q._id, status: e.target.value })) }}>
                                                    <option value="Open">Open</option>
                                                    <option value="In Progress">In Progress</option>
                                                    <option value="Resolved">Resolved</option>
                                                </select>
                                                
                                                {/* Attachment Preview Viewer */}
                                                {q.attachment && (
                                                    <div style={{ marginLeft: 'auto', padding: '8px 16px', background: 'var(--surface-2)', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <FiImage size={18} color="var(--primary-light)" />
                                                        <a href={`http://localhost:5000${q.attachment}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>View Document</a>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Chat Thread */}
                                            <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '8px', marginBottom: '1.5rem' }}>
                                                {q.comments && q.comments.length > 0 ? q.comments.map((c, idx) => {
                                                    const isMe = c.role === 'Admin';
                                                    return (
                                                        <div key={idx} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%', background: isMe ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))' : 'var(--glass-bg)', padding: '12px 16px', borderRadius: '16px', borderBottomRightRadius: isMe ? 0 : '16px', borderBottomLeftRadius: isMe ? '16px' : 0, border: isMe ? 'none' : '1px solid var(--border)', color: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                                                            <div style={{ fontSize: '0.7rem', opacity: 0.7, marginBottom: 4 }}>
                                                                {c.name} {isMe && <span style={{ background: '#000', padding: '2px 6px', borderRadius: 4, marginLeft: 4 }}>ADMIN</span>} • {new Date(c.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                            </div>
                                                            <div style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{c.text}</div>
                                                        </div>
                                                    )
                                                }) : (
                                                    <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                                                        <FiMessageCircle size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
                                                        <p>No messages yet. Reply below to start the thread.</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Reply Box */}
                                            {q.status !== 'Resolved' && (
                                                <div style={{ display: 'flex', gap: '12px' }}>
                                                    <input type="text" className="form-control" placeholder="Type a response to the student..." value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleComment(q._id); }} />
                                                    <button className="btn btn-primary" onClick={() => handleComment(q._id)}><FiSend /> Reply</button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
