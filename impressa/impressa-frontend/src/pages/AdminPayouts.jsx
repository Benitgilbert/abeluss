import { useState, useEffect } from 'react';
import {
    FaMoneyBillWave, FaSearch, FaCheck, FaTimes, FaEye,
    FaClock, FaSpinner, FaCheckCircle, FaTimesCircle,
    FaChevronLeft, FaChevronRight, FaStore
} from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import './AdminPayouts.css';

export default function AdminPayouts() {
    const [payouts, setPayouts] = useState([]);
    const [stats, setStats] = useState({ pendingCount: 0, pendingAmount: 0 });
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedPayout, setSelectedPayout] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [processing, setProcessing] = useState(false);

    const API_URL = 'http://localhost:5000/api';

    useEffect(() => {
        fetchPayouts();
    }, [currentPage, statusFilter]);

    const fetchPayouts = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const params = new URLSearchParams({
                page: currentPage,
                limit: 15,
                ...(statusFilter !== 'all' && { status: statusFilter })
            });

            const res = await fetch(`${API_URL}/commissions/payouts?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.success) {
                setPayouts(data.data);
                setStats(data.stats);
                setTotalPages(data.pagination.pages);
            }
        } catch (err) {
            setError('Failed to fetch payouts');
        } finally {
            setLoading(false);
        }
    };

    const handleProcess = async (action, transactionId = '', rejectionReason = '') => {
        setProcessing(true);
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/commissions/payouts/${selectedPayout._id}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action, transactionId, rejectionReason })
            });
            const data = await res.json();

            if (data.success) {
                setSuccess(data.message);
                setShowModal(false);
                setSelectedPayout(null);
                fetchPayouts();
            } else {
                setError(data.message || 'Failed to process payout');
            }
        } catch (err) {
            setError('Failed to process payout');
        } finally {
            setProcessing(false);
        }
    };

    const formatCurrency = (amount) => `RWF ${amount?.toLocaleString() || 0}`;

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { class: 'pending', icon: <FaClock />, text: 'Pending' },
            processing: { class: 'processing', icon: <FaSpinner />, text: 'Processing' },
            completed: { class: 'completed', icon: <FaCheckCircle />, text: 'Completed' },
            rejected: { class: 'rejected', icon: <FaTimesCircle />, text: 'Rejected' },
            cancelled: { class: 'cancelled', icon: <FaTimes />, text: 'Cancelled' }
        };
        const badge = badges[status] || badges.pending;
        return (
            <span className={`status-badge ${badge.class}`}>
                {badge.icon} {badge.text}
            </span>
        );
    };

    // Clear alerts
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
        <div className="admin-payouts-layout">
            <Sidebar />
            <div className="admin-payouts-main">
                <Topbar title="Payout Requests" />
                <main className="admin-payouts-content">
                    {/* Header */}
                    <div className="payouts-header">
                        <div className="header-stats">
                            <div className="header-stat">
                                <span className="stat-num">{stats.pendingCount}</span>
                                <span className="stat-text">Pending</span>
                            </div>
                            <div className="header-stat amount">
                                <span className="stat-num">{formatCurrency(stats.pendingAmount)}</span>
                                <span className="stat-text">Total Pending</span>
                            </div>
                        </div>
                    </div>

                    {/* Alerts */}
                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    {/* Filters */}
                    <div className="payouts-filters">
                        <div className="filter-buttons">
                            {['pending', 'processing', 'completed', 'rejected', 'all'].map((status) => (
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
                    <div className="payouts-table-wrapper">
                        {loading ? (
                            <div className="loading-state">Loading payouts...</div>
                        ) : payouts.length === 0 ? (
                            <div className="empty-state">
                                <FaMoneyBillWave className="empty-icon" />
                                <h3>No Payouts Found</h3>
                                <p>No payout requests matching your filter</p>
                            </div>
                        ) : (
                            <table className="payouts-table">
                                <thead>
                                    <tr>
                                        <th>Payout ID</th>
                                        <th>Seller</th>
                                        <th>Amount</th>
                                        <th>Method</th>
                                        <th>Status</th>
                                        <th>Requested</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payouts.map((payout) => (
                                        <tr key={payout._id}>
                                            <td className="id-cell">{payout.payoutId}</td>
                                            <td className="seller-cell">
                                                <div className="seller-info">
                                                    <span className="seller-name">{payout.seller?.storeName || payout.seller?.name}</span>
                                                    <span className="seller-email">{payout.seller?.email}</span>
                                                </div>
                                            </td>
                                            <td className="amount-cell">{formatCurrency(payout.amount)}</td>
                                            <td className="method-cell">
                                                {payout.paymentMethod?.replace('_', ' ').toUpperCase()}
                                            </td>
                                            <td>{getStatusBadge(payout.status)}</td>
                                            <td className="date-cell">{formatDate(payout.createdAt)}</td>
                                            <td className="actions-cell">
                                                <button
                                                    className="btn-action view"
                                                    onClick={() => { setSelectedPayout(payout); setShowModal(true); }}
                                                    title="View Details"
                                                >
                                                    <FaEye />
                                                </button>
                                                {payout.status === 'pending' && (
                                                    <>
                                                        <button
                                                            className="btn-action approve"
                                                            onClick={() => { setSelectedPayout(payout); setShowModal(true); }}
                                                            title="Approve"
                                                        >
                                                            <FaCheck />
                                                        </button>
                                                        <button
                                                            className="btn-action reject"
                                                            onClick={() => { setSelectedPayout(payout); setShowModal(true); }}
                                                            title="Reject"
                                                        >
                                                            <FaTimes />
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

                    {/* Payout Detail Modal */}
                    {showModal && selectedPayout && (
                        <PayoutModal
                            payout={selectedPayout}
                            onClose={() => { setShowModal(false); setSelectedPayout(null); }}
                            onProcess={handleProcess}
                            processing={processing}
                            formatCurrency={formatCurrency}
                            formatDate={formatDate}
                            getStatusBadge={getStatusBadge}
                        />
                    )}
                </main>
            </div>
        </div>
    );
}

// Payout Modal Component
function PayoutModal({ payout, onClose, onProcess, processing, formatCurrency, formatDate, getStatusBadge }) {
    const [transactionId, setTransactionId] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">Payout Details - {payout.payoutId}</h3>
                    <button className="btn-close" onClick={onClose}><FaTimes /></button>
                </div>
                <div className="modal-body">
                    {/* Seller Info */}
                    <div className="detail-section">
                        <h5>Seller Information</h5>
                        <div className="seller-profile">
                            <FaStore className="profile-icon" />
                            <div>
                                <p className="profile-name">{payout.seller?.storeName || payout.seller?.name}</p>
                                <p className="profile-email">{payout.seller?.email}</p>
                                {payout.seller?.storePhone && <p className="profile-phone">{payout.seller.storePhone}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Payout Info */}
                    <div className="detail-section">
                        <h5>Payout Details</h5>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <label>Amount</label>
                                <span className="amount-value">{formatCurrency(payout.amount)}</span>
                            </div>
                            <div className="detail-item">
                                <label>Status</label>
                                {getStatusBadge(payout.status)}
                            </div>
                            <div className="detail-item">
                                <label>Payment Method</label>
                                <span>{payout.paymentMethod?.replace('_', ' ').toUpperCase()}</span>
                            </div>
                            <div className="detail-item">
                                <label>Orders Included</label>
                                <span>{payout.earningsCount} orders</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Details */}
                    {payout.paymentDetails && (
                        <div className="detail-section">
                            <h5>Payment Information</h5>
                            <div className="detail-grid">
                                {payout.paymentDetails.mobileNumber && (
                                    <div className="detail-item">
                                        <label>Mobile Number</label>
                                        <span>{payout.paymentDetails.mobileNumber}</span>
                                    </div>
                                )}
                                {payout.paymentDetails.bankName && (
                                    <>
                                        <div className="detail-item">
                                            <label>Bank</label>
                                            <span>{payout.paymentDetails.bankName}</span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Account</label>
                                            <span>{payout.paymentDetails.accountNumber}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    {payout.status === 'pending' && (
                        <div className="detail-section">
                            <h5>Process Payout</h5>
                            <div className="form-group">
                                <label>Transaction ID (for approval)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    placeholder="Enter transaction reference"
                                />
                            </div>
                            <div className="form-group">
                                <label>Rejection Reason (if rejecting)</label>
                                <textarea
                                    className="form-input"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Reason for rejection..."
                                    rows={2}
                                />
                            </div>
                            <div className="action-buttons">
                                <button
                                    className="btn-approve"
                                    onClick={() => onProcess('complete', transactionId)}
                                    disabled={processing}
                                >
                                    <FaCheck /> {processing ? 'Processing...' : 'Approve & Complete'}
                                </button>
                                <button
                                    className="btn-reject"
                                    onClick={() => onProcess('reject', '', rejectionReason)}
                                    disabled={processing}
                                >
                                    <FaTimes /> Reject
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Completed/Rejected Info */}
                    {(payout.status === 'completed' || payout.status === 'rejected') && (
                        <div className="detail-section">
                            <h5>Processing Info</h5>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>Processed At</label>
                                    <span>{formatDate(payout.processedAt)}</span>
                                </div>
                                {payout.transactionId && (
                                    <div className="detail-item">
                                        <label>Transaction ID</label>
                                        <span>{payout.transactionId}</span>
                                    </div>
                                )}
                                {payout.rejectionReason && (
                                    <div className="detail-item full">
                                        <label>Rejection Reason</label>
                                        <span>{payout.rejectionReason}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
