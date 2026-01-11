import { useState, useEffect } from 'react';
import {
    FaEnvelope, FaSearch, FaTrash, FaDownload, FaUsers,
    FaUserCheck, FaUserTimes, FaChevronLeft, FaChevronRight,
    FaPaperPlane, FaTimes, FaEye
} from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { NEWSLETTER_TEMPLATES } from '../data/newsletterTemplates';
import './AdminSubscribers.css';

export default function AdminSubscribers() {
    const [subscribers, setSubscribers] = useState([]);
    const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [recipientType, setRecipientType] = useState('subscribers');
    const [recipientId, setRecipientId] = useState('');
    const [emailSubject, setEmailSubject] = useState('');
    const [emailMessage, setEmailMessage] = useState('');
    const [sending, setSending] = useState(false);

    // Dynamic Template State
    const [activeTemplateKey, setActiveTemplateKey] = useState(null);
    const [templateValues, setTemplateValues] = useState({});
    const [showPreview, setShowPreview] = useState(false);

    const API_URL = 'http://localhost:5000/api';

    useEffect(() => {
        fetchSubscribers();
    }, [currentPage, statusFilter]);

    const fetchSubscribers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const params = new URLSearchParams({
                page: currentPage,
                limit: 20,
                ...(statusFilter !== 'all' && { status: statusFilter })
            });

            const res = await fetch(`${API_URL}/newsletter/subscribers?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.success) {
                setSubscribers(data.data);
                setStats(data.stats);
                setTotalPages(data.pagination.pages);
            } else {
                setError(data.message || 'Failed to fetch subscribers');
            }
        } catch (err) {
            setError('Failed to fetch subscribers');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this subscriber permanently?')) return;

        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/newsletter/subscribers/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.success) {
                setSuccess('Subscriber removed');
                fetchSubscribers();
            } else {
                setError(data.message || 'Failed to delete');
            }
        } catch (err) {
            setError('Failed to delete subscriber');
        }
    };

    const handleExport = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/newsletter/export`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'subscribers.csv';
                a.click();
                window.URL.revokeObjectURL(url);
                setSuccess('Export downloaded!');
            }
        } catch (err) {
            setError('Failed to export');
        }
    };

    const handleTemplateSelect = (key) => {
        const template = NEWSLETTER_TEMPLATES[key];
        setActiveTemplateKey(key);
        setTemplateValues({}); // Reset values
        setEmailSubject(template.subject);
        // HTML will be updated by useEffect
    };

    // Auto-update HTML when values change
    useEffect(() => {
        if (activeTemplateKey && NEWSLETTER_TEMPLATES[activeTemplateKey]) {
            const template = NEWSLETTER_TEMPLATES[activeTemplateKey];
            if (typeof template.html === 'function') {
                setEmailMessage(template.html(templateValues));
            } else {
                setEmailMessage(template.html);
            }
        }
    }, [activeTemplateKey, templateValues]);

    const handleInputChange = (name, value) => {
        setTemplateValues(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSendNewsletter = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/newsletter/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    subject: emailSubject,
                    message: emailMessage,
                    recipientType,
                    recipientId: recipientType === 'specific' ? recipientId : undefined
                })
            });
            const data = await res.json();

            if (data.success) {
                setSuccess(data.message);
                setShowModal(false);
                setEmailSubject('');
                setEmailMessage('');
                setRecipientType('subscribers');
                setRecipientId('');
            } else {
                setError(data.message || 'Failed to send newsletter');
            }
        } catch (err) {
            setError('Failed to send newsletter');
        } finally {
            setSending(false);
        }
    };

    const filteredSubscribers = subscribers.filter(sub =>
        sub.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Clear alerts after 3 seconds
    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(() => {
                setError('');
                setSuccess('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error, success]);

    return (
        <div className="admin-subscribers-layout">
            <Sidebar />
            <div className="admin-subscribers-main">
                <Topbar title="Newsletter Subscribers" />
                <main className="admin-subscribers-content">
                    {/* Header */}
                    <div className="subscribers-header">
                        <button className="btn-export" onClick={handleExport}>
                            <FaDownload /> Export CSV
                        </button>
                        <button className="btn-send-newsletter" onClick={() => setShowModal(true)}>
                            <FaPaperPlane /> Send Newsletter
                        </button>
                    </div>

                    {/* Alerts */}
                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    {/* Stats Cards */}
                    <div className="stats-grid">
                        <div className="stat-card total">
                            <div className="stat-icon"><FaUsers /></div>
                            <div className="stat-info">
                                <span className="stat-value">{stats.total}</span>
                                <span className="stat-label">Total Subscribers</span>
                            </div>
                        </div>
                        <div className="stat-card active">
                            <div className="stat-icon"><FaUserCheck /></div>
                            <div className="stat-info">
                                <span className="stat-value">{stats.active}</span>
                                <span className="stat-label">Active</span>
                            </div>
                        </div>
                        <div className="stat-card inactive">
                            <div className="stat-icon"><FaUserTimes /></div>
                            <div className="stat-info">
                                <span className="stat-value">{stats.inactive}</span>
                                <span className="stat-label">Unsubscribed</span>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="subscribers-filters">
                        <div className="search-box">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search by email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>
                        <div className="filter-buttons">
                            {['all', 'active', 'inactive'].map((status) => (
                                <button
                                    key={status}
                                    className={`filter-btn ${statusFilter === status ? 'active' : ''}`}
                                    onClick={() => {
                                        setStatusFilter(status);
                                        setCurrentPage(1);
                                    }}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="subscribers-table-wrapper">
                        {loading ? (
                            <div className="loading-state">Loading subscribers...</div>
                        ) : filteredSubscribers.length === 0 ? (
                            <div className="empty-state">
                                <FaEnvelope className="empty-icon" />
                                <h3>No Subscribers Found</h3>
                                <p>{searchTerm ? 'No matches for your search' : 'No one has subscribed yet'}</p>
                            </div>
                        ) : (
                            <table className="subscribers-table">
                                <thead>
                                    <tr>
                                        <th>Email</th>
                                        <th>Status</th>
                                        <th>Source</th>
                                        <th>Subscribed</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSubscribers.map((sub) => (
                                        <tr key={sub._id}>
                                            <td className="email-cell">
                                                <FaEnvelope className="email-icon" />
                                                {sub.email}
                                            </td>
                                            <td>
                                                <span className={`status-badge ${sub.isActive ? 'active' : 'inactive'}`}>
                                                    {sub.isActive ? 'Active' : 'Unsubscribed'}
                                                </span>
                                            </td>
                                            <td className="source-cell">{sub.source || 'homepage'}</td>
                                            <td className="date-cell">{formatDate(sub.subscribedAt)}</td>
                                            <td className="actions-cell">
                                                <button
                                                    className="btn-icon delete"
                                                    onClick={() => handleDelete(sub._id)}
                                                    title="Delete"
                                                >
                                                    <FaTrash />
                                                </button>
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
                            <button
                                className="pagination-btn"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                <FaChevronLeft />
                            </button>
                            <span className="pagination-info">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                className="pagination-btn"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                <FaChevronRight />
                            </button>
                        </div>
                    )}
                </main>
            </div>

            {/* Newsletter Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">Send Newsletter</h3>
                            <button className="btn-close" onClick={() => setShowModal(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={handleSendNewsletter}>
                            <div className="form-group">
                                <label className="form-label">Recipient</label>
                                <select
                                    className="form-input"
                                    value={recipientType}
                                    onChange={(e) => setRecipientType(e.target.value)}
                                >
                                    <option value="subscribers">All Subscribers (Newsletter List)</option>
                                    <option value="customers">All Registered Customers</option>
                                    <option value="sellers">All Sellers</option>
                                    <option value="specific">Specific User (by ID)</option>
                                </select>
                            </div>

                            {recipientType === 'specific' && (
                                <div className="form-group">
                                    <label className="form-label">User ID</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={recipientId}
                                        onChange={(e) => setRecipientId(e.target.value)}
                                        placeholder="Enter User ID"
                                        required={recipientType === 'specific'}
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Select Template</label>
                                <div className="template-buttons">
                                    {Object.entries(NEWSLETTER_TEMPLATES).map(([key, template]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            className={`btn-template ${activeTemplateKey === key ? 'active-template' : ''}`}
                                            onClick={() => handleTemplateSelect(key)}
                                            style={{
                                                border: activeTemplateKey === key ? '2px solid #6366f1' : '1px solid #e5e7eb',
                                                backgroundColor: activeTemplateKey === key ? '#e0e7ff' : 'white'
                                            }}
                                        >
                                            {template.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Dynamic Fields */}
                            {activeTemplateKey && NEWSLETTER_TEMPLATES[activeTemplateKey].fields && (
                                <div className="dynamic-fields-container" style={{
                                    backgroundColor: '#f8fafc',
                                    padding: '15px',
                                    borderRadius: '8px',
                                    marginBottom: '20px',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <h4 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#64748b' }}>Template Fields</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        {NEWSLETTER_TEMPLATES[activeTemplateKey].fields.map((field) => (
                                            <div key={field.name} style={{ gridColumn: field.type === 'textarea' ? 'span 2' : 'span 1' }}>
                                                <label className="form-label" style={{ fontSize: '12px' }}>{field.label}</label>
                                                {field.type === 'textarea' ? (
                                                    <textarea
                                                        className="form-input"
                                                        placeholder={field.placeholder}
                                                        value={templateValues[field.name] || ''}
                                                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                                                        rows="3"
                                                        style={{ width: '100%', fontSize: '13px' }}
                                                    />
                                                ) : (
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        placeholder={field.placeholder}
                                                        value={templateValues[field.name] || ''}
                                                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                                                        style={{ width: '100%', fontSize: '13px' }}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Subject</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={emailSubject}
                                    onChange={(e) => setEmailSubject(e.target.value)}
                                    placeholder="Newsletter Subject"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <label className="form-label">Generated HTML</label>
                                    <button
                                        type="button"
                                        onClick={() => setShowPreview(true)}
                                        style={{ color: '#6366f1', fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                                    >
                                        <FaEye /> Preview Email
                                    </button>
                                </div>
                                <textarea
                                    className="form-textarea"
                                    value={emailMessage}
                                    onChange={(e) => setEmailMessage(e.target.value)}
                                    placeholder="HTML content"
                                    required
                                    rows="5"
                                    style={{ fontFamily: 'monospace', fontSize: '12px' }}
                                />
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => setShowModal(false)}
                                    disabled={sending}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-send"
                                    disabled={sending}
                                >
                                    {sending ? 'Sending...' : (
                                        <>
                                            <FaPaperPlane /> Send Newsletter
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {showPreview && (
                <div className="modal-overlay" style={{ zIndex: 2000 }}>
                    <div className="modal-content" style={{ maxWidth: '800px', width: '90%' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">Email Preview</h3>
                            <button className="btn-close" onClick={() => setShowPreview(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="preview-container" style={{
                            padding: '20px',
                            backgroundColor: '#f3f4f6',
                            borderRadius: '8px',
                            maxHeight: '70vh',
                            overflowY: 'auto'
                        }}>
                            <div
                                dangerouslySetInnerHTML={{ __html: emailMessage }}
                                style={{ backgroundColor: 'white' }}
                            />
                        </div>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setShowPreview(false)}>
                                Close Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
