import { useState, useEffect } from 'react';
import {
    FaStore, FaSearch, FaCheck, FaTimes, FaEye, FaTrash,
    FaUsers, FaUserCheck, FaClock, FaUserTimes,
    FaChevronLeft, FaChevronRight, FaBox, FaChartLine,
    FaIdCard, FaBuilding, FaFileAlt, FaDownload, FaPhone,
    FaEnvelope, FaUser, FaCheckCircle, FaExclamationCircle,
    FaCalendarAlt
} from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../utils/axiosInstance';
import './AdminSellers.css';

export default function AdminSellers() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sellers, setSellers] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, active: 0, rejected: 0, pendingVerification: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalTab, setModalTab] = useState('info'); // 'info', 'documents', 'performance'
    const [rejectionReason, setRejectionReason] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchSellers();
    }, [currentPage, statusFilter]);

    const fetchSellers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage,
                limit: 15,
                ...(statusFilter !== 'all' && { status: statusFilter }),
                ...(searchTerm && { search: searchTerm })
            });

            const res = await api.get(`/sellers?${params}`);
            const data = res.data;

            if (data.success) {
                setSellers(data.data);
                setStats(data.stats || { total: 0, pending: 0, active: 0, rejected: 0 });
                setTotalPages(data.pagination?.pages || 1);
            } else {
                setError(data.message || 'Failed to fetch sellers');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to fetch sellers');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchSellers();
    };

    const updateSellerStatus = async (id, status, reason = '') => {
        setProcessing(true);
        try {
            const res = await api.put(`/sellers/${id}/status`, { status, reason });
            const data = res.data;

            if (data.success) {
                setSuccess(data.message || `Seller ${status === 'active' ? 'approved' : 'rejected'}`);
                setShowModal(false);
                setRejectionReason('');
                fetchSellers();
            } else {
                setError(data.message || 'Failed to update status');
            }
        } catch (err) {
            setError('Failed to update seller status');
        } finally {
            setProcessing(false);
        }
    };

    const verifyDocuments = async (id, action, reason = '') => {
        if (action === 'reject' && !reason.trim()) {
            setError('Please provide a rejection reason');
            return;
        }
        setProcessing(true);
        try {
            const res = await api.put(`/seller-verification/${id}/verify`, { action, rejectionReason: reason });
            const data = res.data;

            if (data.success) {
                setSuccess(data.message);
                setShowModal(false);
                setRejectionReason('');
                fetchSellers();
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to verify documents');
        } finally {
            setProcessing(false);
        }
    };

    const viewSellerDetails = async (id) => {
        try {
            const res = await api.get(`/sellers/${id}`);
            const data = res.data;

            if (data.success) {
                setSelectedSeller(data.data);
                setModalTab('info');
                setShowModal(true);
                setRejectionReason('');
            }
        } catch (err) {
            setError('Failed to fetch seller details');
        }
    };

    const deleteSeller = async (id) => {
        if (!window.confirm('Delete this seller permanently? This cannot be undone.')) return;

        try {
            const res = await api.delete(`/sellers/${id}`);
            const data = res.data;

            if (data.success) {
                setSuccess('Seller deleted');
                fetchSellers();
            } else {
                setError(data.message || 'Failed to delete');
            }
        } catch (err) {
            setError('Failed to delete seller');
        }
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        const badgeStyles = {
            pending: {
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.6rem',
                borderRadius: '6px',
                fontSize: '0.7rem',
                fontWeight: 700,
                backgroundColor: '#fffbeb',
                color: '#d97706',
                border: '1px solid #fcd34d'
            },
            active: {
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.6rem',
                borderRadius: '6px',
                fontSize: '0.7rem',
                fontWeight: 700,
                backgroundColor: '#f0fdf4',
                color: '#16a34a',
                border: '1px solid #86efac'
            },
            rejected: {
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.6rem',
                borderRadius: '6px',
                fontSize: '0.7rem',
                fontWeight: 700,
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fecaca'
            }
        };

        const badges = {
            pending: { icon: <FaClock />, text: 'Pending' },
            active: { icon: <FaUserCheck />, text: 'Active' },
            rejected: { icon: <FaUserTimes />, text: 'Rejected' }
        };

        const badge = badges[status] || badges.pending;
        const style = badgeStyles[status] || badgeStyles.pending;

        return (
            <span style={style}>
                {badge.icon} {badge.text}
            </span>
        );
    };

    const getDocStatusBadge = (status) => {
        const badges = {
            not_submitted: { class: 'not-submitted', text: 'Not Submitted' },
            pending_review: { class: 'pending', text: 'Pending Review' },
            approved: { class: 'approved', text: 'Verified' },
            rejected: { class: 'rejected', text: 'Rejected' }
        };
        const badge = badges[status] || badges.not_submitted;
        return <span className={`doc-badge ${badge.class}`}>{badge.text}</span>;
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
        <div className="admin-sellers-layout">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="admin-sellers-main">
                <Topbar onMenuClick={() => setSidebarOpen(true)} title="Seller Management" />
                <main className="admin-sellers-content">
                    {/* Alerts */}
                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    {/* Stats Cards */}
                    <div className="stats-grid">
                        <div className="stat-card total" onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}>
                            <div className="stat-icon"><FaUsers /></div>
                            <div className="stat-info">
                                <span className="stat-value">{stats.total}</span>
                                <span className="stat-label">Total Sellers</span>
                            </div>
                        </div>
                        <div className="stat-card pending" onClick={() => { setStatusFilter('pending'); setCurrentPage(1); }}>
                            <div className="stat-icon"><FaClock /></div>
                            <div className="stat-info">
                                <span className="stat-value">{stats.pending}</span>
                                <span className="stat-label">Pending Approval</span>
                            </div>
                        </div>
                        <div className="stat-card active" onClick={() => { setStatusFilter('active'); setCurrentPage(1); }}>
                            <div className="stat-icon"><FaUserCheck /></div>
                            <div className="stat-info">
                                <span className="stat-value">{stats.active}</span>
                                <span className="stat-label">Active</span>
                            </div>
                        </div>
                        <div className="stat-card rejected" onClick={() => { setStatusFilter('rejected'); setCurrentPage(1); }}>
                            <div className="stat-icon"><FaUserTimes /></div>
                            <div className="stat-info">
                                <span className="stat-value">{stats.rejected}</span>
                                <span className="stat-label">Rejected</span>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="sellers-filters">
                        <form className="search-box" onSubmit={handleSearch}>
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search by name, email, store, or TIN..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </form>
                        <div className="filter-buttons">
                            {['all', 'pending', 'active', 'rejected'].map((status) => (
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
                    <div className="sellers-table-wrapper">
                        {loading ? (
                            <div className="loading-state">Loading sellers...</div>
                        ) : sellers.length === 0 ? (
                            <div className="empty-state">
                                <FaStore className="empty-icon" />
                                <h3>No Sellers Found</h3>
                                <p>{searchTerm ? 'No matches for your search' : 'No sellers registered yet'}</p>
                            </div>
                        ) : (
                            <table className="sellers-table">
                                <thead>
                                    <tr>
                                        <th>Seller</th>
                                        <th>Store / Business</th>
                                        <th>TIN</th>
                                        <th>Documents</th>
                                        <th>Status</th>
                                        <th>Joined</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sellers.map((seller) => (
                                        <tr key={seller._id}>
                                            <td className="seller-cell">
                                                <div className="seller-cell-content">
                                                    <div className="seller-avatar">
                                                        {seller.storeLogo ? (
                                                            <img src={seller.storeLogo} alt={seller.storeName} />
                                                        ) : (
                                                            <span className="avatar-initials">
                                                                {seller.storeName
                                                                    ? seller.storeName.substring(0, 2).toUpperCase()
                                                                    : seller.name.substring(0, 2).toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="seller-info">
                                                        <span className="seller-name" title={seller.name}>{seller.name}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="store-cell">
                                                <div>{seller.storeName || <span className="no-store">Not set</span>}</div>
                                                {seller.rdbVerification?.businessName && (
                                                    <small className="business-name">{seller.rdbVerification.businessName}</small>
                                                )}
                                            </td>
                                            <td className="tin-cell">
                                                {seller.rdbVerification?.tinNumber || <span className="no-tin">—</span>}
                                            </td>
                                            <td>
                                                {getDocStatusBadge(seller.rdbVerification?.documentStatus || 'not_submitted')}
                                            </td>
                                            <td>{getStatusBadge(seller.sellerStatus)}</td>
                                            <td className="date-cell">{formatDate(seller.createdAt)}</td>
                                            <td className="actions-cell">
                                                <button
                                                    className="btn-action view"
                                                    onClick={() => viewSellerDetails(seller._id)}
                                                    title="View Details"
                                                >
                                                    <FaEye />
                                                </button>
                                                {seller.sellerStatus === 'pending' && (
                                                    <>
                                                        <button
                                                            className="btn-action approve"
                                                            onClick={() => updateSellerStatus(seller._id, 'active')}
                                                            title="Approve"
                                                        >
                                                            <FaCheck />
                                                        </button>
                                                        <button
                                                            className="btn-action reject"
                                                            onClick={() => updateSellerStatus(seller._id, 'rejected')}
                                                            title="Reject"
                                                        >
                                                            <FaTimes />
                                                        </button>
                                                    </>
                                                )}
                                                {seller.sellerStatus === 'active' && (
                                                    <button
                                                        className="btn-action reject"
                                                        onClick={() => updateSellerStatus(seller._id, 'rejected')}
                                                        title="Suspend"
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                )}
                                                {seller.sellerStatus === 'rejected' && (
                                                    <button
                                                        className="btn-action approve"
                                                        onClick={() => updateSellerStatus(seller._id, 'active')}
                                                        title="Reactivate"
                                                    >
                                                        <FaCheck />
                                                    </button>
                                                )}
                                                <button
                                                    className="btn-action delete"
                                                    onClick={() => deleteSeller(seller._id)}
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
                                <FaChevronLeft /> Prev
                            </button>
                            <span className="pagination-info">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                className="pagination-btn"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next <FaChevronRight />
                            </button>
                        </div>
                    )}

                    {/* Unified Seller Details Modal */}
                    {showModal && selectedSeller && (
                        <div className="modal-overlay" onClick={() => setShowModal(false)}>
                            <div className="modal-content seller-modal" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h3 className="modal-title">Seller Details</h3>
                                    <button className="btn-close" onClick={() => setShowModal(false)}>
                                        <FaTimes />
                                    </button>
                                </div>

                                {/* Modal Tabs */}
                                <div className="modal-tabs">
                                    <button
                                        className={`modal-tab ${modalTab === 'info' ? 'active' : ''}`}
                                        onClick={() => setModalTab('info')}
                                    >
                                        <FaUser /> Profile
                                    </button>
                                    <button
                                        className={`modal-tab ${modalTab === 'documents' ? 'active' : ''}`}
                                        onClick={() => setModalTab('documents')}
                                    >
                                        <FaFileAlt /> RDB Documents
                                    </button>
                                    <button
                                        className={`modal-tab ${modalTab === 'performance' ? 'active' : ''}`}
                                        onClick={() => setModalTab('performance')}
                                    >
                                        <FaChartLine /> Performance
                                    </button>
                                </div>

                                <div className="modal-body">
                                    {/* Profile Tab */}
                                    {modalTab === 'info' && (
                                        <>
                                            <div className="seller-profile-card">
                                                <div className="profile-avatar">
                                                    {selectedSeller.storeLogo ? (
                                                        <img src={selectedSeller.storeLogo} alt={selectedSeller.storeName} />
                                                    ) : (
                                                        <FaUser />
                                                    )}
                                                </div>
                                                <div className="profile-details">
                                                    <div className="profile-header">
                                                        <h4>{selectedSeller.name}</h4>
                                                        {getStatusBadge(selectedSeller.sellerStatus)}
                                                    </div>
                                                    <p className="seller-id">{selectedSeller._id}</p>
                                                    <p className="seller-email">
                                                        <FaEnvelope /> {selectedSeller.email}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="info-columns">
                                                <div className="info-column">
                                                    <h5><FaStore /> Store Information</h5>
                                                    <div className="info-row">
                                                        <span className="info-label">Store Name</span>
                                                        <span className="info-value">{selectedSeller.storeName || 'Not set'}</span>
                                                    </div>
                                                    <div className="info-row">
                                                        <span className="info-label">Phone Number</span>
                                                        <span className="info-value">{selectedSeller.storePhone || 'Not set'}</span>
                                                    </div>
                                                </div>
                                                <div className="info-column">
                                                    <h5><FaClock /> Account Details</h5>
                                                    <div className="info-row">
                                                        <span className="info-label">Joined</span>
                                                        <span className="info-value"><FaCalendarAlt /> {formatDate(selectedSeller.createdAt)}</span>
                                                    </div>
                                                    <div className="info-row">
                                                        <span className="info-label">Approval</span>
                                                        <span className={`info-value ${!selectedSeller.approvedAt ? 'not-approved' : ''}`}>
                                                            {selectedSeller.approvedAt ? formatDate(selectedSeller.approvedAt) : 'Not approved'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Documents Tab */}
                                    {modalTab === 'documents' && (
                                        <>
                                            <div className="detail-section">
                                                <h5>RDB Business Information</h5>
                                                <div className="detail-grid">
                                                    <div className="detail-item">
                                                        <label><FaIdCard /> TIN Number</label>
                                                        <span className="tin-highlight">
                                                            {selectedSeller.rdbVerification?.tinNumber || 'Not provided'}
                                                        </span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <label><FaBuilding /> Business Name</label>
                                                        <span>{selectedSeller.rdbVerification?.businessName || 'Not provided'}</span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <label>Business Type</label>
                                                        <span>{selectedSeller.rdbVerification?.businessType?.replace(/_/g, ' ').toUpperCase() || 'N/A'}</span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <label>Verification Status</label>
                                                        {getDocStatusBadge(selectedSeller.rdbVerification?.documentStatus || 'not_submitted')}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="detail-section">
                                                <h5>Uploaded Documents</h5>
                                                <div className="documents-grid">
                                                    {selectedSeller.rdbVerification?.rdbCertificate ? (
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
                                                    ) : (
                                                        <div className="document-card missing">
                                                            <FaExclamationCircle className="doc-icon" />
                                                            <span>RDB Certificate Not Uploaded</span>
                                                        </div>
                                                    )}
                                                    {selectedSeller.rdbVerification?.nationalId ? (
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
                                                    ) : (
                                                        <div className="document-card missing">
                                                            <FaExclamationCircle className="doc-icon" />
                                                            <span>National ID Not Uploaded</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Terms Acceptance */}
                                            {selectedSeller.termsAcceptance?.accepted && (
                                                <div className="detail-section">
                                                    <h5>Terms & Conditions</h5>
                                                    <div className="terms-box">
                                                        <FaCheckCircle className="terms-check" />
                                                        <div>
                                                            <p><strong>Accepted:</strong> {formatDate(selectedSeller.termsAcceptance.acceptedAt)}</p>
                                                            <p><strong>Digital Signature:</strong> {selectedSeller.termsAcceptance.digitalSignature}</p>
                                                            <p><strong>Version:</strong> {selectedSeller.termsAcceptance.version}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Rejection Reason Input */}
                                            {selectedSeller.rdbVerification?.documentStatus === 'pending_review' && (
                                                <div className="detail-section">
                                                    <h5>Rejection Reason (if rejecting)</h5>
                                                    <textarea
                                                        className="rejection-input"
                                                        value={rejectionReason}
                                                        onChange={(e) => setRejectionReason(e.target.value)}
                                                        placeholder="Enter reason for rejection..."
                                                        rows={3}
                                                    />
                                                </div>
                                            )}

                                            {/* Previous Rejection */}
                                            {selectedSeller.rdbVerification?.rejectionReason && (
                                                <div className="detail-section">
                                                    <h5>Previous Rejection Reason</h5>
                                                    <div className="rejection-note">
                                                        {selectedSeller.rdbVerification.rejectionReason}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Document Verification Actions */}
                                            {selectedSeller.rdbVerification?.documentStatus === 'pending_review' && (
                                                <div className="verification-actions">
                                                    <button
                                                        className="btn-approve-lg"
                                                        onClick={() => verifyDocuments(selectedSeller._id, 'approve')}
                                                        disabled={processing}
                                                    >
                                                        <FaCheck /> {processing ? 'Processing...' : 'Approve Documents'}
                                                    </button>
                                                    <button
                                                        className="btn-reject-lg"
                                                        onClick={() => verifyDocuments(selectedSeller._id, 'reject', rejectionReason)}
                                                        disabled={processing}
                                                    >
                                                        <FaTimes /> Reject Documents
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Performance Tab */}
                                    {modalTab === 'performance' && (
                                        <>
                                            {selectedSeller.stats ? (
                                                <div className="detail-section">
                                                    <h5>Performance Metrics</h5>
                                                    <div className="stats-row">
                                                        <div className="mini-stat">
                                                            <FaBox />
                                                            <span>{selectedSeller.stats.productCount || 0}</span>
                                                            <label>Products</label>
                                                        </div>
                                                        <div className="mini-stat">
                                                            <FaChartLine />
                                                            <span>{selectedSeller.stats.totalOrders || 0}</span>
                                                            <label>Orders</label>
                                                        </div>
                                                        <div className="mini-stat revenue">
                                                            <span>RWF {(selectedSeller.stats.totalRevenue || 0).toLocaleString()}</span>
                                                            <label>Revenue</label>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="empty-state">
                                                    <FaChartLine className="empty-icon" />
                                                    <h3>No Performance Data</h3>
                                                    <p>This seller hasn't completed any orders yet</p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Modal Footer */}
                                <div className="modal-footer">
                                    <button className="btn-cancel" onClick={() => setShowModal(false)}>
                                        Cancel
                                    </button>
                                    <button className="btn-save" onClick={() => setShowModal(false)}>
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
