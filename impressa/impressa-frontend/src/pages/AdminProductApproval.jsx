import { useState, useEffect } from 'react';
import {
    FaClipboardCheck, FaSearch, FaCheck, FaTimes, FaEye,
    FaClock, FaCheckCircle, FaTimesCircle, FaImage,
    FaChevronLeft, FaChevronRight, FaStore
} from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import './AdminProductApproval.css';

export default function AdminProductApproval() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [showBulkRejectModal, setShowBulkRejectModal] = useState(false);
    const [bulkRejectReason, setBulkRejectReason] = useState('');

    const API_URL = 'http://localhost:5000/api';

    useEffect(() => {
        fetchProducts();
    }, [currentPage, statusFilter]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const params = new URLSearchParams({
                page: currentPage,
                limit: 15,
                status: statusFilter,
                ...(searchTerm && { search: searchTerm })
            });

            const res = await fetch(`${API_URL}/product-approval?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.success) {
                setProducts(data.data);
                setStats(data.stats);
                setTotalPages(data.pagination.pages);
            }
        } catch (err) {
            setError('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchProducts();
    };

    const viewProductDetails = async (id) => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/product-approval/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.success) {
                setSelectedProduct(data.data);
                setShowModal(true);
            }
        } catch (err) {
            setError('Failed to fetch product details');
        }
    };

    const approveProduct = async (id, note = '') => {
        setProcessing(true);
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/product-approval/${id}/approve`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ note })
            });
            const data = await res.json();

            if (data.success) {
                setSuccess('Product approved!');
                setShowModal(false);
                setSelectedProduct(null);
                fetchProducts();
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to approve product');
        } finally {
            setProcessing(false);
        }
    };

    const rejectProduct = async (id, reason) => {
        if (!reason) {
            setError('Please provide a rejection reason');
            return;
        }
        setProcessing(true);
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/product-approval/${id}/reject`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason })
            });
            const data = await res.json();

            if (data.success) {
                setSuccess('Product rejected');
                setShowModal(false);
                setSelectedProduct(null);
                fetchProducts();
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to reject product');
        } finally {
            setProcessing(false);
        }
    };

    const bulkApprove = async () => {
        if (!selectedIds.length) return;
        if (!window.confirm(`Approve ${selectedIds.length} products?`)) return;

        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/product-approval/bulk-approve`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productIds: selectedIds })
            });
            const data = await res.json();

            if (data.success) {
                setSuccess(data.message);
                setSelectedIds([]);
                fetchProducts();
            }
        } catch (err) {
            setError('Failed to bulk approve');
        }
    };

    const bulkReject = async () => {
        if (!selectedIds.length) return;
        if (!bulkRejectReason.trim()) {
            setError('Please provide a rejection reason');
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/product-approval/bulk-reject`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productIds: selectedIds, reason: bulkRejectReason })
            });
            const data = await res.json();

            if (data.success) {
                setSuccess(data.message);
                setSelectedIds([]);
                setShowBulkRejectModal(false);
                setBulkRejectReason('');
                fetchProducts();
            }
        } catch (err) {
            setError('Failed to bulk reject');
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === products.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(products.map(p => p._id));
        }
    };

    const formatCurrency = (amount) => `RWF ${amount?.toLocaleString() || 0}`;

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        let normalizedStatus = 'pending';
        // Treat undefined/null/empty as 'pending' explicitly
        if (!status) {
            normalizedStatus = 'pending';
        } else if (['pending', 'approved', 'rejected'].includes(status)) {
            normalizedStatus = status;
        }

        const badges = {
            pending: { icon: <FaClock />, text: 'Pending', bg: '#fef3c7', color: '#b45309' },
            approved: { icon: <FaCheckCircle />, text: 'Approved', bg: '#dcfce7', color: '#16a34a' },
            rejected: { icon: <FaTimesCircle />, text: 'Rejected', bg: '#fee2e2', color: '#dc2626' }
        };

        const config = badges[normalizedStatus];

        // Using a basic div with stronger inline styles to force visibility
        return (
            <div className="status-badge-container">
                <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    backgroundColor: config.bg,
                    color: config.color,
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    border: '1px solid currentColor'
                }}>
                    {config.icon} {config.text}
                </span>
            </div>
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
        <div className="admin-approval-layout">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="admin-approval-main">
                <Topbar onMenuClick={() => setSidebarOpen(true)} title="Product Approval" />
                <main className="admin-approval-content">
                    {/* Bulk Actions */}
                    {selectedIds.length > 0 && statusFilter === 'pending' && (
                        <div className="bulk-actions">
                            <button className="btn-bulk-approve" onClick={bulkApprove}>
                                <FaCheck /> Approve ({selectedIds.length})
                            </button>
                            <button className="btn-bulk-reject" onClick={() => setShowBulkRejectModal(true)}>
                                <FaTimes /> Reject ({selectedIds.length})
                            </button>
                        </div>
                    )}

                    {/* Alerts */}
                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    {/* Stats Cards */}
                    <div className="stats-grid">
                        <div className="stat-card pending" onClick={() => { setStatusFilter('pending'); setCurrentPage(1); }}>
                            <FaClock className="stat-icon" />
                            <div className="stat-info">
                                <span className="stat-value">{stats.pending}</span>
                                <span className="stat-label">Pending Review</span>
                            </div>
                        </div>
                        <div className="stat-card approved" onClick={() => { setStatusFilter('approved'); setCurrentPage(1); }}>
                            <FaCheckCircle className="stat-icon" />
                            <div className="stat-info">
                                <span className="stat-value">{stats.approved}</span>
                                <span className="stat-label">Approved</span>
                            </div>
                        </div>
                        <div className="stat-card rejected" onClick={() => { setStatusFilter('rejected'); setCurrentPage(1); }}>
                            <FaTimesCircle className="stat-icon" />
                            <div className="stat-info">
                                <span className="stat-value">{stats.rejected}</span>
                                <span className="stat-label">Rejected</span>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="approval-filters">
                        <form className="search-box" onSubmit={handleSearch}>
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </form>
                        <div className="filter-buttons">
                            {['pending', 'approved', 'rejected', 'all'].map((status) => (
                                <button
                                    key={status}
                                    className={`filter-btn ${statusFilter === status ? 'active' : ''}`}
                                    onClick={() => {
                                        setStatusFilter(status);
                                        setCurrentPage(1);
                                        setSelectedIds([]);
                                    }}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="approval-table-wrapper">
                        {loading ? (
                            <div className="loading-state">Loading products...</div>
                        ) : products.length === 0 ? (
                            <div className="empty-state">
                                <FaClipboardCheck className="empty-icon" />
                                <h3>No Products to Review</h3>
                                <p>No products matching your filter</p>
                            </div>
                        ) : (
                            <table className="approval-table">
                                <thead>
                                    <tr>
                                        {(statusFilter === 'pending' || statusFilter === 'all') && (
                                            <th className="checkbox-col">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.length === products.length && products.length > 0}
                                                    onChange={toggleSelectAll}
                                                />
                                            </th>
                                        )}
                                        <th>Product</th>
                                        <th>Price</th>
                                        <th>Stock</th>
                                        <th>Status</th>
                                        <th>Submitted</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product._id}>
                                            {(statusFilter === 'pending' || statusFilter === 'all') && (
                                                <td className="checkbox-col">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(product._id)}
                                                        onChange={() => toggleSelect(product._id)}
                                                    />
                                                </td>
                                            )}
                                            <td className="product-cell">
                                                <div className="product-thumb">
                                                    {product.image ? (
                                                        <img src={product.image} alt={product.name} />
                                                    ) : (
                                                        <FaImage />
                                                    )}
                                                </div>
                                                <div className="product-info">
                                                    <span className="product-name">{product.name}</span>
                                                    <span className="product-sku">SKU: {product.sku || 'N/A'}</span>
                                                    <span className="product-seller text-xs text-gray-500">
                                                        {product.seller?.storeName || product.seller?.name || 'Unknown Seller'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="price-cell">{formatCurrency(product.price)}</td>
                                            <td className="stock-cell">{product.stock}</td>
                                            <td>{getStatusBadge(product.approvalStatus)}</td>
                                            <td className="date-cell">{formatDate(product.createdAt)}</td>
                                            <td className="actions-cell">
                                                <button
                                                    className="btn-action view"
                                                    onClick={() => viewProductDetails(product._id)}
                                                    title="Review"
                                                >
                                                    <FaEye />
                                                </button>
                                                {(product.approvalStatus === 'pending' || !product.approvalStatus) && (
                                                    <>
                                                        <button
                                                            className="btn-action approve"
                                                            onClick={() => approveProduct(product._id)}
                                                            title="Approve"
                                                        >
                                                            <FaCheck />
                                                        </button>
                                                        <button
                                                            className="btn-action reject"
                                                            onClick={() => viewProductDetails(product._id)}
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

                    {/* Product Review Modal */}
                    {showModal && selectedProduct && (
                        <ProductReviewModal
                            product={selectedProduct}
                            onClose={() => { setShowModal(false); setSelectedProduct(null); }}
                            onApprove={approveProduct}
                            onReject={rejectProduct}
                            processing={processing}
                            formatCurrency={formatCurrency}
                            getStatusBadge={getStatusBadge}
                        />
                    )}

                    {/* Bulk Reject Modal */}
                    {showBulkRejectModal && (
                        <div className="modal-overlay" onClick={() => setShowBulkRejectModal(false)}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h3 className="modal-title">Reject {selectedIds.length} Products</h3>
                                    <button className="btn-close" onClick={() => setShowBulkRejectModal(false)}>
                                        <FaTimes />
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
                                        This reason will be applied to all selected products.
                                    </p>
                                    <textarea
                                        className="form-input"
                                        value={bulkRejectReason}
                                        onChange={(e) => setBulkRejectReason(e.target.value)}
                                        placeholder="Enter rejection reason (required)..."
                                        rows={4}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div className="modal-footer">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setShowBulkRejectModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="btn-reject-lg"
                                        onClick={bulkReject}
                                        disabled={!bulkRejectReason.trim()}
                                    >
                                        <FaTimes /> Reject All
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

// Product Review Modal
function ProductReviewModal({ product, onClose, onApprove, onReject, processing, formatCurrency, getStatusBadge }) {
    const [rejectionReason, setRejectionReason] = useState('');

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">Review Product</h3>
                    <button className="btn-close" onClick={onClose}><FaTimes /></button>
                </div>
                <div className="modal-body">
                    {/* Product Overview */}
                    <div className="product-overview">
                        <div className="product-image-large">
                            {product.image ? (
                                <img src={product.image} alt={product.name} />
                            ) : (
                                <div className="no-image"><FaImage /></div>
                            )}
                        </div>
                        <div className="product-details">
                            <h4>{product.name}</h4>
                            <p className="product-price">{formatCurrency(product.price)}</p>
                            <div className="detail-row">
                                <span>Stock:</span> <span>{product.stock}</span>
                            </div>
                            <div className="detail-row">
                                <span>SKU:</span> <span>{product.sku || 'N/A'}</span>
                            </div>
                            <div className="detail-row">
                                <span>Status:</span> {getStatusBadge(product.approvalStatus)}
                            </div>
                        </div>
                    </div>

                    {/* Seller Info */}
                    <div className="detail-section">
                        <h5>Seller Information</h5>
                        <div className="seller-info-box">
                            <FaStore className="seller-icon" />
                            <div>
                                <p className="seller-name">{product.seller?.storeName || product.seller?.name}</p>
                                <p className="seller-email">{product.seller?.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {product.description && (
                        <div className="detail-section">
                            <h5>Description</h5>
                            <p className="product-description">{product.description}</p>
                        </div>
                    )}

                    {/* Rejection Reason */}
                    {product.approvalStatus === 'pending' && (
                        <div className="detail-section">
                            <h5>Rejection Reason (if rejecting)</h5>
                            <textarea
                                className="form-input"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Explain why this product is being rejected..."
                                rows={3}
                            />
                        </div>
                    )}

                    {/* Existing Note */}
                    {product.approvalNote && (
                        <div className="detail-section">
                            <h5>Admin Note</h5>
                            <p className="approval-note">{product.approvalNote}</p>
                        </div>
                    )}

                    {/* Actions */}
                    {product.approvalStatus === 'pending' && (
                        <div className="action-buttons">
                            <button
                                className="btn-approve-lg"
                                onClick={() => onApprove(product._id)}
                                disabled={processing}
                            >
                                <FaCheck /> {processing ? 'Processing...' : 'Approve Product'}
                            </button>
                            <button
                                className="btn-reject-lg"
                                onClick={() => onReject(product._id, rejectionReason)}
                                disabled={processing}
                            >
                                <FaTimes /> Reject Product
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
