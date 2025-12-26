import { useState, useEffect } from 'react';
import {
    FaTicketAlt, FaSearch, FaEye, FaReply, FaTrash,
    FaClock, FaCheckCircle, FaSpinner, FaExclamationTriangle,
    FaChevronLeft, FaChevronRight, FaTimes, FaUser
} from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import './AdminTickets.css';

export default function AdminTickets() {
    const [tickets, setTickets] = useState([]);
    const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, waiting: 0, resolved: 0 });
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('open');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [processing, setProcessing] = useState(false);

    const API_URL = 'http://localhost:5000/api';

    useEffect(() => {
        fetchTickets();
    }, [currentPage, statusFilter]);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const params = new URLSearchParams({
                page: currentPage,
                limit: 15,
                ...(statusFilter !== 'all' && { status: statusFilter })
            });

            const res = await fetch(`${API_URL}/tickets/admin?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.success) {
                setTickets(data.data);
                setStats(data.stats);
                setTotalPages(data.pagination.pages);
            }
        } catch (err) {
            setError('Failed to fetch tickets');
        } finally {
            setLoading(false);
        }
    };

    const viewTicketDetails = async (id) => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/tickets/admin/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.success) {
                setSelectedTicket(data.data);
                setShowModal(true);
            }
        } catch (err) {
            setError('Failed to fetch details');
        }
    };

    const sendReply = async () => {
        if (!replyText.trim()) return;
        setProcessing(true);
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/tickets/admin/${selectedTicket._id}/message`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: replyText })
            });
            const data = await res.json();

            if (data.success) {
                setSelectedTicket(data.data);
                setReplyText('');
                setSuccess('Reply sent');
            }
        } catch (err) {
            setError('Failed to send reply');
        } finally {
            setProcessing(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/tickets/admin/${id}/status`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });
            const data = await res.json();

            if (data.success) {
                setSuccess(`Ticket ${status.replace('_', ' ')}`);
                fetchTickets();
                if (showModal && selectedTicket?._id === id) {
                    setSelectedTicket({ ...selectedTicket, status });
                }
            }
        } catch (err) {
            setError('Failed to update status');
        }
    };

    const deleteTicket = async (id) => {
        if (!window.confirm('Delete this ticket?')) return;
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/tickets/admin/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.success) {
                setSuccess('Ticket deleted');
                fetchTickets();
                if (showModal) setShowModal(false);
            }
        } catch (err) {
            setError('Failed to delete');
        }
    };

    const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const getStatusBadge = (status) => {
        const badges = {
            open: { class: 'open', icon: <FaClock />, text: 'Open' },
            in_progress: { class: 'progress', icon: <FaSpinner />, text: 'In Progress' },
            waiting: { class: 'waiting', icon: <FaExclamationTriangle />, text: 'Waiting' },
            resolved: { class: 'resolved', icon: <FaCheckCircle />, text: 'Resolved' },
            closed: { class: 'closed', icon: <FaCheckCircle />, text: 'Closed' }
        };
        const badge = badges[status] || badges.open;
        return <span className={`status-badge ${badge.class}`}>{badge.icon} {badge.text}</span>;
    };

    const getPriorityBadge = (priority) => {
        const colors = { urgent: '#dc2626', high: '#f59e0b', medium: '#3b82f6', low: '#6b7280' };
        return <span className="priority-badge" style={{ background: colors[priority] || colors.medium }}>{priority}</span>;
    };

    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(() => { setError(''); setSuccess(''); }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error, success]);

    return (
        <div className="admin-tickets-layout">
            <Sidebar />
            <div className="admin-tickets-main">
                <Topbar title="Support Tickets" />
                <main className="admin-tickets-content">
                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    {/* Stats */}
                    <div className="stats-grid">
                        <div className="stat-card total" onClick={() => setStatusFilter('all')}><span className="stat-value">{stats.total}</span><span className="stat-label">Total</span></div>
                        <div className="stat-card open" onClick={() => setStatusFilter('open')}><span className="stat-value">{stats.open}</span><span className="stat-label">Open</span></div>
                        <div className="stat-card progress" onClick={() => setStatusFilter('in_progress')}><span className="stat-value">{stats.inProgress}</span><span className="stat-label">In Progress</span></div>
                        <div className="stat-card waiting" onClick={() => setStatusFilter('waiting')}><span className="stat-value">{stats.waiting}</span><span className="stat-label">Waiting</span></div>
                        <div className="stat-card resolved" onClick={() => setStatusFilter('resolved')}><span className="stat-value">{stats.resolved}</span><span className="stat-label">Resolved</span></div>
                    </div>

                    {/* Filter Buttons */}
                    <div className="tickets-filters">
                        {['open', 'in_progress', 'waiting', 'resolved', 'all'].map(s => (
                            <button key={s} className={`filter-btn ${statusFilter === s ? 'active' : ''}`} onClick={() => { setStatusFilter(s); setCurrentPage(1); }}>
                                {s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </button>
                        ))}
                    </div>

                    {/* Table */}
                    <div className="tickets-table-wrapper">
                        {loading ? <div className="loading-state">Loading...</div> : tickets.length === 0 ? (
                            <div className="empty-state"><FaTicketAlt className="empty-icon" /><h3>No Tickets</h3></div>
                        ) : (
                            <table className="tickets-table">
                                <thead>
                                    <tr>
                                        <th>Ticket ID</th>
                                        <th>Subject</th>
                                        <th>From</th>
                                        <th>Category</th>
                                        <th>Priority</th>
                                        <th>Status</th>
                                        <th>Created</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tickets.map(ticket => (
                                        <tr key={ticket._id}>
                                            <td className="id-cell">{ticket.ticketId}</td>
                                            <td className="subject-cell">{ticket.subject.substring(0, 40)}...</td>
                                            <td className="from-cell">{ticket.createdBy?.name || 'Unknown'}</td>
                                            <td className="category-cell">{ticket.category}</td>
                                            <td>{getPriorityBadge(ticket.priority)}</td>
                                            <td>{getStatusBadge(ticket.status)}</td>
                                            <td className="date-cell">{formatDate(ticket.createdAt)}</td>
                                            <td className="actions-cell">
                                                <button className="btn-action view" onClick={() => viewTicketDetails(ticket._id)}><FaEye /></button>
                                                <button className="btn-action delete" onClick={() => deleteTicket(ticket._id)}><FaTrash /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button className="pagination-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><FaChevronLeft /></button>
                            <span>Page {currentPage} of {totalPages}</span>
                            <button className="pagination-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><FaChevronRight /></button>
                        </div>
                    )}

                    {/* Ticket Modal */}
                    {showModal && selectedTicket && (
                        <div className="modal-overlay" onClick={() => setShowModal(false)}>
                            <div className="modal-content large" onClick={e => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h3>{selectedTicket.ticketId} - {selectedTicket.subject}</h3>
                                    <button className="btn-close" onClick={() => setShowModal(false)}><FaTimes /></button>
                                </div>
                                <div className="modal-body">
                                    {/* Ticket Info */}
                                    <div className="ticket-meta">
                                        <div className="meta-item"><label>From</label><span>{selectedTicket.createdBy?.name} ({selectedTicket.createdByRole})</span></div>
                                        <div className="meta-item"><label>Category</label><span>{selectedTicket.category}</span></div>
                                        <div className="meta-item"><label>Priority</label>{getPriorityBadge(selectedTicket.priority)}</div>
                                        <div className="meta-item"><label>Status</label>{getStatusBadge(selectedTicket.status)}</div>
                                    </div>

                                    {/* Messages */}
                                    <div className="messages-section">
                                        <h5>Conversation</h5>
                                        <div className="messages-list">
                                            {selectedTicket.messages?.map((msg, i) => (
                                                <div key={i} className={`message ${msg.senderRole}`}>
                                                    <div className="message-header">
                                                        <FaUser /> <span>{msg.sender?.name || 'Unknown'}</span>
                                                        <span className="message-role">{msg.senderRole}</span>
                                                        <span className="message-time">{formatDate(msg.createdAt)}</span>
                                                    </div>
                                                    <p className="message-text">{msg.message}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Reply */}
                                    {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' && (
                                        <div className="reply-section">
                                            <h5>Reply</h5>
                                            <textarea className="form-input" value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Type your reply..." rows={3} />
                                            <button className="btn-send" onClick={sendReply} disabled={processing || !replyText.trim()}>
                                                <FaReply /> {processing ? 'Sending...' : 'Send Reply'}
                                            </button>
                                        </div>
                                    )}

                                    {/* Status Actions */}
                                    <div className="status-actions">
                                        <h5>Update Status</h5>
                                        <div className="status-buttons">
                                            {['in_progress', 'waiting', 'resolved', 'closed'].map(s => (
                                                <button key={s} className={`status-btn ${s}`} onClick={() => updateStatus(selectedTicket._id, s)} disabled={selectedTicket.status === s}>
                                                    {s.replace('_', ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
