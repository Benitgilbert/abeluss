import { useState, useEffect } from 'react';
import {
    FaExclamationTriangle, FaSearch, FaEye, FaTimes, FaCheck,
    FaClock, FaUserSlash, FaBan, FaChartLine, FaShoppingCart,
    FaExclamationCircle, FaCheckCircle
} from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import '../styles/AdminLayout.css';
import './AdminViolations.css';

export default function AdminViolations() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [violations, setViolations] = useState([]);
    const [stats, setStats] = useState({ total: 0, active: 0, warning: 0, review: 0, suspension: 0 });
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedViolation, setSelectedViolation] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const API_URL = 'http://localhost:5000/api';

    // Mock data - replace with actual API call
    useEffect(() => {
        fetchViolations();
    }, [currentPage, statusFilter, typeFilter]);

    const fetchViolations = async () => {
        setLoading(true);
        try {
            // TODO: Replace with actual API endpoint when backend is ready
            // const token = localStorage.getItem('authToken');
            // const res = await fetch(`${API_URL}/violations?page=${currentPage}&status=${statusFilter}&type=${typeFilter}`, {
            //     headers: { Authorization: `Bearer ${token}` }
            // });
            // const data = await res.json();

            // Mock data for now
            const mockViolations = [
                {
                    _id: '1',
                    seller: {
                        _id: 's1',
                        name: 'Demo Seller',
                        email: 'seller@demo.com',
                        storeName: 'Demo Store'
                    },
                    type: 'high_cancellation_rate',
                    severity: 'high',
                    status: 'active',
                    penaltyPoints: 5,
                    metrics: { currentValue: 25, threshold: 20 },
                    description: 'Cancellation rate (25%) exceeds threshold (20%)',
                    createdAt: new Date().toISOString()
                },
                {
                    _id: '2',
                    seller: {
                        _id: 's2',
                        name: 'Another Store',
                        email: 'another@demo.com',
                        storeName: 'Another Shop'
                    },
                    type: 'slow_fulfillment',
                    severity: 'medium',
                    status: 'warning',
                    penaltyPoints: 3,
                    metrics: { currentValue: 80, threshold: 72 },
                    description: 'Average fulfillment time (80h) exceeds threshold (72h)',
                    createdAt: new Date(Date.now() - 86400000).toISOString()
                }
            ];

            setViolations(mockViolations);
            setStats({
                total: 2,
                active: 1,
                warning: 1,
                review: 0,
                suspension: 0
            });
            setTotalPages(1);
        } catch (err) {
            setError('Failed to fetch violations');
        } finally {
            setLoading(false);
        }
    };

    const handleDismiss = async (id) => {
        if (!window.confirm('Dismiss this violation? This will remove penalty points from the seller.')) return;

        try {
            // TODO: API call
            setSuccess('Violation dismissed');
            fetchViolations();
        } catch (err) {
            setError('Failed to dismiss violation');
        }
    };

    const handleEscalate = async (id) => {
        if (!window.confirm('Escalate this violation? This may lead to seller suspension.')) return;

        try {
            // TODO: API call
            setSuccess('Violation escalated');
            fetchViolations();
        } catch (err) {
            setError('Failed to escalate violation');
        }
    };

    const getTypeBadge = (type) => {
        const types = {
            high_cancellation_rate: { icon: <FaBan />, label: 'High Cancellations', color: 'red' },
            slow_fulfillment: { icon: <FaClock />, label: 'Slow Fulfillment', color: 'orange' },
            low_rating: { icon: <FaChartLine />, label: 'Low Rating', color: 'yellow' },
            policy_violation: { icon: <FaExclamationTriangle />, label: 'Policy Violation', color: 'purple' }
        };
        const badge = types[type] || types.policy_violation;
        return (
            <span className={`type-badge ${badge.color}`}>
                {badge.icon} {badge.label}
            </span>
        );
    };

    const getSeverityBadge = (severity) => {
        const badges = {
            low: { class: 'low', text: 'Low' },
            medium: { class: 'medium', text: 'Medium' },
            high: { class: 'high', text: 'High' },
            critical: { class: 'critical', text: 'Critical' }
        };
        const badge = badges[severity] || badges.medium;
        return <span className={`severity-badge ${badge.class}`}>{badge.text}</span>;
    };

    const getStatusBadge = (status) => {
        const badges = {
            active: { class: 'active', icon: <FaExclamationCircle />, text: 'Active' },
            warning: { class: 'warning', icon: <FaExclamationTriangle />, text: 'Warning Issued' },
            review: { class: 'review', icon: <FaClock />, text: 'Under Review' },
            suspension: { class: 'suspension', icon: <FaUserSlash />, text: 'Suspension' },
            dismissed: { class: 'dismissed', icon: <FaCheckCircle />, text: 'Dismissed' }
        };
        const badge = badges[status] || badges.active;
        return (
            <span className={`status-badge ${badge.class}`}>
                {badge.icon} {badge.text}
            </span>
        );
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

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
        <div className="admin-layout">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="admin-main">
                <Topbar onMenuClick={() => setSidebarOpen(true)} title="Seller Violations" />
                <main className="admin-content">
                    {/* Alerts */}
                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    {/* Stats Cards */}
                    <div className="violations-stats">
                        <div className="vstat-card" onClick={() => setStatusFilter('all')}>
                            <span className="vstat-value">{stats.total}</span>
                            <span className="vstat-label">Total Violations</span>
                        </div>
                        <div className="vstat-card active" onClick={() => setStatusFilter('active')}>
                            <FaExclamationCircle />
                            <span className="vstat-value">{stats.active}</span>
                            <span className="vstat-label">Active</span>
                        </div>
                        <div className="vstat-card warning" onClick={() => setStatusFilter('warning')}>
                            <FaExclamationTriangle />
                            <span className="vstat-value">{stats.warning}</span>
                            <span className="vstat-label">Warnings</span>
                        </div>
                        <div className="vstat-card suspension" onClick={() => setStatusFilter('suspension')}>
                            <FaUserSlash />
                            <span className="vstat-value">{stats.suspension}</span>
                            <span className="vstat-label">Suspensions</span>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="violations-filters">
                        <select
                            value={typeFilter}
                            onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="all">All Types</option>
                            <option value="high_cancellation_rate">High Cancellations</option>
                            <option value="slow_fulfillment">Slow Fulfillment</option>
                            <option value="low_rating">Low Rating</option>
                            <option value="policy_violation">Policy Violation</option>
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="warning">Warning Issued</option>
                            <option value="suspension">Suspension</option>
                            <option value="dismissed">Dismissed</option>
                        </select>
                    </div>

                    {/* Table */}
                    <div className="table-container">
                        {loading ? (
                            <div className="loading-state">Loading violations...</div>
                        ) : violations.length === 0 ? (
                            <div className="empty-state">
                                <FaCheckCircle className="empty-icon" style={{ color: '#10b981' }} />
                                <h3>No Violations Found</h3>
                                <p>All sellers are in good standing</p>
                            </div>
                        ) : (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Seller</th>
                                        <th>Violation Type</th>
                                        <th>Severity</th>
                                        <th>Points</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {violations.map((violation) => (
                                        <tr key={violation._id}>
                                            <td>
                                                <div className="seller-cell">
                                                    <span className="seller-name">{violation.seller?.storeName || violation.seller?.name}</span>
                                                    <span className="seller-email">{violation.seller?.email}</span>
                                                </div>
                                            </td>
                                            <td>{getTypeBadge(violation.type)}</td>
                                            <td>{getSeverityBadge(violation.severity)}</td>
                                            <td className="points-cell">
                                                <span className="penalty-points">-{violation.penaltyPoints}</span>
                                            </td>
                                            <td>{getStatusBadge(violation.status)}</td>
                                            <td className="date-cell">{formatDate(violation.createdAt)}</td>
                                            <td className="actions-cell">
                                                <button
                                                    className="btn-action view"
                                                    onClick={() => { setSelectedViolation(violation); setShowModal(true); }}
                                                    title="View Details"
                                                >
                                                    <FaEye />
                                                </button>
                                                {violation.status !== 'dismissed' && (
                                                    <>
                                                        <button
                                                            className="btn-action approve"
                                                            onClick={() => handleDismiss(violation._id)}
                                                            title="Dismiss"
                                                        >
                                                            <FaCheck />
                                                        </button>
                                                        <button
                                                            className="btn-action delete"
                                                            onClick={() => handleEscalate(violation._id)}
                                                            title="Escalate"
                                                        >
                                                            <FaExclamationTriangle />
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Modal */}
                    {showModal && selectedViolation && (
                        <div className="modal-overlay" onClick={() => setShowModal(false)}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h3>Violation Details</h3>
                                    <button className="btn-close" onClick={() => setShowModal(false)}>
                                        <FaTimes />
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <div className="violation-detail">
                                        <label>Seller</label>
                                        <p>{selectedViolation.seller?.storeName} ({selectedViolation.seller?.email})</p>
                                    </div>
                                    <div className="violation-detail">
                                        <label>Type</label>
                                        {getTypeBadge(selectedViolation.type)}
                                    </div>
                                    <div className="violation-detail">
                                        <label>Description</label>
                                        <p>{selectedViolation.description}</p>
                                    </div>
                                    <div className="violation-detail">
                                        <label>Metrics</label>
                                        <p>Current: {selectedViolation.metrics?.currentValue} | Threshold: {selectedViolation.metrics?.threshold}</p>
                                    </div>
                                    <div className="violation-detail">
                                        <label>Penalty Points</label>
                                        <p className="penalty-points-lg">-{selectedViolation.penaltyPoints} points</p>
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
