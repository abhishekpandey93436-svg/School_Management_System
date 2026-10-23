import { STATUS_BADGE_CLS, PRIORITY_BADGE_CLS, STATUS_COLORS } from '../utils/constants';
import { FiCheckCircle, FiClock, FiAlertCircle, FiArrowRight, FiArrowDown, FiZap } from 'react-icons/fi';

export function StatusBadge({ status }) {
    const icons = {
        'Open': <FiAlertCircle size={12} />,
        'In-Progress': <FiClock size={12} />,
        'Resolved': <FiCheckCircle size={12} />
    };
    return (
        <span className={`badge ${STATUS_BADGE_CLS[status] || ''}`}>
            {icons[status] || ''} {status}
        </span>
    );
}

export function PriorityBadge({ priority }) {
    const icons = { 
        Low: <FiArrowDown size={12} />, 
        Normal: <FiArrowRight size={12} />, 
        Urgent: <FiZap size={12} /> 
    };
    return (
        <span className={`badge ${PRIORITY_BADGE_CLS[priority] || ''}`}>
            {icons[priority] || ''} {priority}
        </span>
    );
}

export function StatusDot({ status }) {
    return <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[status] || '#94a3b8', display: 'inline-block', marginRight: 4 }}></span>;
}

export function Spinner({ size = 16, light = true }) {
    return (
        <span style={{
            display: 'inline-block', width: size, height: size,
            border: `2px solid ${light ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)'}`,
            borderTopColor: light ? '#fff' : 'var(--primary)',
            borderRadius: '50%', animation: 'spin 0.7s linear infinite'
        }} />
    );
}

export function Alert({ type = 'info', children }) {
    return <div className={`alert alert-${type}`}>{children}</div>;
}
