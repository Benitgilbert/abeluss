import { useState, useEffect } from 'react';
import {
    FaFileAlt, FaSearch, FaCheck, FaTimes, FaEye,
    FaClock, FaCheckCircle, FaTimesCircle, FaBuilding,
    FaIdCard, FaPhone, FaEnvelope, FaDownload, FaUser
} from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import '../styles/AdminLayout.css';
import './AdminSellerVerification.css';

export default function AdminSellerVerification() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sellers, setSellers] = useState([]);
    const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('pending_review');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const API_URL = 'http://localhost:5000/api';

    useEffect(() => {
        fetchSellers();
    }, [currentPage, statusFilter]);

    const fetchSellers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const params = new URLSearchParams({
                page: currentPage,
                limit: 15,
                status: statusFilter
            });

            const res = await fetch(`${API_URL}/seller-verification/pending?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.success) {
                setSellers(data.data);
                setStats(data.stats);
                setTotalPages(data.pagination.pages);
            }
        } catch (err) {
            setError('Failed to fetch sellers');
        } finally {
            setLoading(false);
        }
    };

    const viewSellerDetails = async (id) => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/seller-verification/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.success) {
                setSelectedSeller(data.data);
                setShowModal(true);
                setRejectionReason('');
            }
        } catch (err) {
            setError('Failed to fetch seller details');
        }
    };

    const handleVerify = async (action) => {
        if (action === 'reject' && !rejectionReason.trim()) {
            setError('Please provide a rejection reason');
            return;
        }

        setProcessing(true);
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/seller-verification/${selectedSeller._id}/verify`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action,
                    rejectionReason: action === 'reject' ? rejectionReason : undefined
                })
            });
            const data = await res.json();

            if (data.success) {
                setSuccess(data.message);
                setShowModal(false);
                setSelectedSeller(null);
                fetchSellers();
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to process verification');
        } finally {
            setProcessing(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending_review: { class: 'pending', icon: <FaClock />, text: 'Pending Review' },
            approved: { class: 'approved', icon: <FaCheckCircle />, text: 'Verified' },
            rejected: { class: 'rejected', icon: <FaTimesCircle />, text: 'Rejected' },
            not_submitted: { class: 'not-submitted', icon: <FaFileAlt />, text: 'Not Submitted' }
        };
        const badge = badges[status] || badges.pending_review;
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
        <div className="admin-layout">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="admin-main">
                <Topbar onMenuClick={() => setSidebarOpen(true)} title="Seller Verification" />
                <main className="admin-content">


                    {/* Alerts */}
                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    {/* Stats Cards */}
                    <div className="stats-row">
                        <div
                            className={`stat-card-mini ${statusFilter === 'pending_review' ? 'active' : ''}`}
                            onClick={() => { setStatusFilter('pending_review'); setCurrentPage(1); }}
                        >
                            <FaClock className="stat-icon pending" />
                            <div>
                                <span className="stat-value">{stats.pending}</span>
                                <span className="stat-label">Pending Review</span>
                            </div>
                        </div>
                        <div
                            className={`stat-card-mini ${statusFilter === 'approved' ? 'active' : ''}`}
                            onClick={() => { setStatusFilter('approved'); setCurrentPage(1); }}
                        >
                            <FaCheckCircle className="stat-icon approved" />
                            <div>
                                <span className="stat-value">{stats.approved}</span>
                                <span className="stat-label">Verified</span>
                            </div>
                        </div>
                        <div
                            className={`stat-card-mini ${statusFilter === 'rejected' ? 'active' : ''}`}
                            onClick={() => { setStatusFilter('rejected'); setCurrentPage(1); }}
                        >
                            <FaTimesCircle className="stat-icon rejected" />
                            <div>
                                <span className="stat-value">{stats.rejected}</span>
                                <span className="stat-label">Rejected</span>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="table-container">
                        {loading ? (
                            <div className="loading-state">Loading sellers...</div>
                        ) : sellers.length === 0 ? (
                            <div className="empty-state">
                                <FaFileAlt className="empty-icon" />
                                <h3>No Sellers to Review</h3>
                                <p>No sellers matching your filter</p>
                            </div>
                        ) : (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Seller</th>
                                        <th>Business Name</th>
                                        <th>TIN Number</th>
                                        <th>Store Name</th>
                                        <th>Status</th>
                                        <th>Applied</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sellers.map((seller) => (
                                        <tr key={seller._id}>
                                            <td>
                                                <div className="seller-info-cell">
                                                    <FaUser className="seller-avatar" />
                                                    <div>
                                                        <span className="seller-name">{seller.name}</span>
                                                        <span className="seller-email">{seller.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{seller.rdbVerification?.businessName || 'N/A'}</td>
                                            <td className="tin-cell">{seller.rdbVerification?.tinNumber || 'N/A'}</td>
                                            <td>{seller.storeName || 'N/A'}</td>
                                            <td>{getStatusBadge(seller.rdbVerification?.documentStatus)}</td>
                                            <td>{formatDate(seller.createdAt)}</td>
                                            <td className="actions-cell">
                                                <button
                                                    className="btn-action view"
                                                    onClick={() => viewSellerDetails(seller._id)}
                                                    title="Review Documents"
                                                >
                                                    <FaEye />
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
                                Previous
                            </button>
                            <span className="pagination-info">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                className="pagination-btn"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    )}

                    {/* Verification Modal */}
                    {showModal && selectedSeller && (
                        <div className="modal-overlay" onClick={() => setShowModal(false)}>
                            <div className="modal-content verification-modal" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h3 className="modal-title">Seller Verification Review</h3>
                                    <button className="btn-close" onClick={() => setShowModal(false)}>
                                        <FaTimes />
                                    </button>
                                </div>
                                <div className="modal-body">
                                    {/* Seller Info */}
                                    <div className="verification-section">
                                        <h4>Personal Information</h4>
                                        <div className="info-grid">
                                            <div className="info-item">
                                                <FaUser className="info-icon" />
                                                <div>
                                                    <span className="info-label">Full Name</span>
                                                    <span className="info-value">{selectedSeller.name}</span>
                                                </div>
                                            </div>
                                            <div className="info-item">
                                                <FaEnvelope className="info-icon" />
                                                <div>
                                                    <span className="info-label">Email</span>
                                                    <span className="info-value">{selectedSeller.email}</span>
                                                </div>
                                            </div>
                                            <div className="info-item">
                                                <FaPhone className="info-icon" />
                                                <div>
                                                    <span className="info-label">Phone</span>
                                                    <span className="info-value">{selectedSeller.storePhone || 'Not provided'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Business Info */}
                                    <div className="verification-section">
                                        <h4>Business Information (RDB)</h4>
                                        <div className="info-grid">
                                            <div className="info-item">
                                                <FaBuilding className="info-icon" />
                                                <div>
                                                    <span className="info-label">Business Name</span>
                                                    <span className="info-value">{selectedSeller.rdbVerification?.businessName}</span>
                                                </div>
                                            </div>
                                            <div className="info-item">
                                                <FaIdCard className="info-icon" />
                                                <div>
                                                    <span className="info-label">TIN Number</span>
                                                    <span className="info-value tin-highlight">{selectedSeller.rdbVerification?.tinNumber}</span>
                                                </div>
                                            </div>
                                            <div className="info-item">
                                                <FaFileAlt className="info-icon" />
                                                <div>
                                                    <span className="info-label">Business Type</span>
                                                    <span className="info-value">
                                                        {selectedSeller.rdbVerification?.businessType?.replace(/_/g, ' ').toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Documents */}
                                    <div className="verification-section">
                                        <h4>Uploaded Documents</h4>
                                        <div className="documents-grid">
                                            {selectedSeller.rdbVerification?.rdbCertificate && (
                                                <a
                                                    href={`http://localhost:5000${selectedSeller.rdbVerification.rdbCertificate}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="document-card"
                                                >
                                                    <FaFileAlt className="doc-icon" />
                                                    <span>RDB Certificate</span>
                                                    <FaDownload className="download-icon" />
                                                </a>
                                            )}
                                            {selectedSeller.rdbVerification?.nationalId && (
                                                <a
                                                    href={`http://localhost:5000${selectedSeller.rdbVerification.nationalId}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="document-card"
                                                >
                                                    <FaIdCard className="doc-icon" />
                                                    <span>National ID</span>
                                                    <FaDownload className="download-icon" />
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {/* Terms Acceptance */}
                                    <div className="verification-section">
                                        <h4>Terms & Conditions</h4>
                                        <div className="terms-info">
                                            <p>
                                                <strong>Accepted:</strong> {selectedSeller.termsAcceptance?.accepted ? 'Yes' : 'No'}
                                            </p>
                                            <p>
                                                <strong>Digital Signature:</strong> {selectedSeller.termsAcceptance?.digitalSignature}
                                            </p>
                                            <p>
                                                <strong>Date:</strong> {selectedSeller.termsAcceptance?.acceptedAt
                                                    ? formatDate(selectedSeller.termsAcceptance.acceptedAt)
                                                    : 'N/A'}
                                            </p>
                                            <p>
                                                <strong>Version:</strong> {selectedSeller.termsAcceptance?.version || 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Rejection Reason */}
                                    {selectedSeller.rdbVerification?.documentStatus === 'pending_review' && (
                                        <div className="verification-section">
                                            <h4>Rejection Reason (if rejecting)</h4>
                                            <textarea
                                                className="form-input"
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                placeholder="Explain why documents are being rejected..."
                                                rows={3}
                                            />
                                        </div>
                                    )}

                                    {/* Previous Rejection */}
                                    {selectedSeller.rdbVerification?.rejectionReason && (
                                        <div className="verification-section">
                                            <h4>Previous Rejection Reason</h4>
                                            <div className="rejection-note">
                                                {selectedSeller.rdbVerification.rejectionReason}
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    {selectedSeller.rdbVerification?.documentStatus === 'pending_review' && (
                                        <div className="verification-actions">
                                            <button
                                                className="btn-approve-lg"
                                                onClick={() => handleVerify('approve')}
                                                disabled={processing}
                                            >
                                                <FaCheck /> {processing ? 'Processing...' : 'Approve Seller'}
                                            </button>
                                            <button
                                                className="btn-reject-lg"
                                                onClick={() => handleVerify('reject')}
                                                disabled={processing}
                                            >
                                                <FaTimes /> Reject Application
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
