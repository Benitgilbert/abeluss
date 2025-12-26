import { useState, useEffect } from 'react';
import {
    FaStar, FaSearch, FaCheck, FaTimes, FaEye, FaReply, FaTrash,
    FaClock, FaCheckCircle, FaTimesCircle, FaFlag,
    FaChevronLeft, FaChevronRight, FaUser
} from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import './AdminReviews.css';

export default function AdminReviews() {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, reported: 0, averageRating: 0 });
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [ratingFilter, setRatingFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedReview, setSelectedReview] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [processing, setProcessing] = useState(false);

    const API_URL = 'http://localhost:5000/api';

    useEffect(() => {
        fetchReviews();
    }, [currentPage, statusFilter, ratingFilter]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const params = new URLSearchParams({
                page: currentPage,
                limit: 15,
                ...(statusFilter !== 'all' && { status: statusFilter }),
                ...(ratingFilter && { rating: ratingFilter })
            });

            const res = await fetch(`${API_URL}/reviews-admin?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.success) {
                setReviews(data.data);
                setStats(data.stats);
                setTotalPages(data.pagination.pages);
            }
        } catch (err) {
            setError('Failed to fetch reviews');
        } finally {
            setLoading(false);
        }
    };

    const viewReviewDetails = async (id) => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/reviews-admin/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.success) {
                setSelectedReview(data.data);
                setShowModal(true);
            }
        } catch (err) {
            setError('Failed to fetch review details');
        }
    };

    const approveReview = async (id) => {
        setProcessing(true);
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/reviews-admin/${id}/approve`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.success) {
                setSuccess('Review approved');
                fetchReviews();
                if (showModal) setShowModal(false);
            }
        } catch (err) {
            setError('Failed to approve');
        } finally {
            setProcessing(false);
        }
    };

    const rejectReview = async (id, reason) => {
        setProcessing(true);
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/reviews-admin/${id}/reject`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason })
            });
            const data = await res.json();

            if (data.success) {
                setSuccess('Review rejected');
                fetchReviews();
                if (showModal) setShowModal(false);
            }
        } catch (err) {
            setError('Failed to reject');
        } finally {
            setProcessing(false);
        }
    };

    const deleteReview = async (id) => {
        if (!window.confirm('Delete this review permanently?')) return;
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/reviews-admin/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.success) {
                setSuccess('Review deleted');
                fetchReviews();
                if (showModal) setShowModal(false);
            }
        } catch (err) {
            setError('Failed to delete');
        }
    };

    const replyToReview = async (id, text) => {
        if (!text) return;
        setProcessing(true);
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/reviews-admin/${id}/reply`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });
            const data = await res.json();

            if (data.success) {
                setSuccess('Reply added');
                setSelectedReview(data.data);
            }
        } catch (err) {
            setError('Failed to reply');
        } finally {
            setProcessing(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <FaStar key={i} className={i < rating ? 'star filled' : 'star'} />
        ));
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { class: 'pending', icon: <FaClock />, text: 'Pending' },
            approved: { class: 'approved', icon: <FaCheckCircle />, text: 'Approved' },
            rejected: { class: 'rejected', icon: <FaTimesCircle />, text: 'Rejected' }
        };
        const badge = badges[status] || badges.pending;
        return (
            <span className={`status-badge ${badge.class}`}>
                {badge.icon} {badge.text}
            </span>
        );
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
        <div className="admin-reviews-layout">
            <Sidebar />
            <div className="admin-reviews-main">
                <Topbar title="Reviews" />
                <main className="admin-reviews-content">
                    {/* Average Rating Display */}
                    <div className="reviews-header">
                        <div className="avg-rating">
                            <span className="avg-value">{stats.averageRating}</span>
                            <FaStar className="avg-star" />
                            <span className="avg-label">Avg Rating</span>
                        </div>
                    </div>

                    {/* Alerts */}
                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    {/* Stats Cards */}
                    <div className="stats-grid">
                        <div className="stat-card total" onClick={() => setStatusFilter('all')}>
                            <span className="stat-value">{stats.total}</span>
                            <span className="stat-label">Total Reviews</span>
                        </div>
                        <div className="stat-card pending" onClick={() => setStatusFilter('pending')}>
                            <span className="stat-value">{stats.pending}</span>
                            <span className="stat-label">Pending</span>
                        </div>
                        <div className="stat-card approved" onClick={() => setStatusFilter('approved')}>
                            <span className="stat-value">{stats.approved}</span>
                            <span className="stat-label">Approved</span>
                        </div>
                        <div className="stat-card reported">
                            <FaFlag className="stat-icon" />
                            <span className="stat-value">{stats.reported}</span>
                            <span className="stat-label">Reported</span>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="reviews-filters">
                        <div className="filter-group">
                            <label>Status:</label>
                            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
                                <option value="all">All</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Rating:</label>
                            <select value={ratingFilter} onChange={(e) => { setRatingFilter(e.target.value); setCurrentPage(1); }}>
                                <option value="">All Ratings</option>
                                <option value="5">5 Stars</option>
                                <option value="4">4 Stars</option>
                                <option value="3">3 Stars</option>
                                <option value="2">2 Stars</option>
                                <option value="1">1 Star</option>
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="reviews-table-wrapper">
                        {loading ? (
                            <div className="loading-state">Loading reviews...</div>
                        ) : reviews.length === 0 ? (
                            <div className="empty-state">
                                <FaStar className="empty-icon" />
                                <h3>No Reviews Found</h3>
                                <p>No reviews match your filters</p>
                            </div>
                        ) : (
                            <table className="reviews-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Customer</th>
                                        <th>Rating</th>
                                        <th>Comment</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reviews.map((review) => (
                                        <tr key={review._id} className={review.reported ? 'reported' : ''}>
                                            <td className="product-cell">
                                                <span className="product-name">{review.product?.name || 'Unknown'}</span>
                                            </td>
                                            <td className="user-cell">
                                                <span>{review.user?.name || 'Anonymous'}</span>
                                            </td>
                                            <td className="rating-cell">
                                                <div className="stars">{renderStars(review.rating)}</div>
                                            </td>
                                            <td className="comment-cell">
                                                <p className="comment-preview">{review.comment.substring(0, 80)}...</p>
                                            </td>
                                            <td>{getStatusBadge(review.status)}</td>
                                            <td className="date-cell">{formatDate(review.createdAt)}</td>
                                            <td className="actions-cell">
                                                <button className="btn-action view" onClick={() => viewReviewDetails(review._id)} title="View">
                                                    <FaEye />
                                                </button>
                                                {review.status !== 'approved' && (
                                                    <button className="btn-action approve" onClick={() => approveReview(review._id)} title="Approve">
                                                        <FaCheck />
                                                    </button>
                                                )}
                                                {review.status !== 'rejected' && (
                                                    <button className="btn-action reject" onClick={() => viewReviewDetails(review._id)} title="Reject">
                                                        <FaTimes />
                                                    </button>
                                                )}
                                                <button className="btn-action delete" onClick={() => deleteReview(review._id)} title="Delete">
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
                            <button className="pagination-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                                <FaChevronLeft />
                            </button>
                            <span className="pagination-info">Page {currentPage} of {totalPages}</span>
                            <button className="pagination-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                                <FaChevronRight />
                            </button>
                        </div>
                    )}

                    {/* Review Detail Modal */}
                    {showModal && selectedReview && (
                        <ReviewModal
                            review={selectedReview}
                            onClose={() => { setShowModal(false); setSelectedReview(null); }}
                            onApprove={approveReview}
                            onReject={rejectReview}
                            onReply={replyToReview}
                            onDelete={deleteReview}
                            processing={processing}
                            renderStars={renderStars}
                            formatDate={formatDate}
                            getStatusBadge={getStatusBadge}
                        />
                    )}
                </main>
            </div>
        </div>
    );
}

// Review Modal
function ReviewModal({ review, onClose, onApprove, onReject, onReply, onDelete, processing, renderStars, formatDate, getStatusBadge }) {
    const [rejectReason, setRejectReason] = useState('');
    const [replyText, setReplyText] = useState('');

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">Review Details</h3>
                    <button className="btn-close" onClick={onClose}><FaTimes /></button>
                </div>
                <div className="modal-body">
                    {/* Rating & Status */}
                    <div className="review-header-row">
                        <div className="rating-display">
                            {renderStars(review.rating)}
                            <span className="rating-text">{review.rating}/5</span>
                        </div>
                        {getStatusBadge(review.status)}
                    </div>

                    {/* Product & User */}
                    <div className="review-meta">
                        <div className="meta-item">
                            <label>Product</label>
                            <span>{review.product?.name}</span>
                        </div>
                        <div className="meta-item">
                            <label>Customer</label>
                            <span>{review.user?.name} ({review.user?.email})</span>
                        </div>
                        <div className="meta-item">
                            <label>Date</label>
                            <span>{formatDate(review.createdAt)}</span>
                        </div>
                    </div>

                    {/* Comment */}
                    <div className="detail-section">
                        <h5>Review Comment</h5>
                        <p className="review-comment">{review.comment}</p>
                    </div>

                    {/* Existing Reply */}
                    {review.reply?.text && (
                        <div className="detail-section reply-section">
                            <h5>Admin Reply</h5>
                            <p className="reply-text">{review.reply.text}</p>
                            <span className="reply-date">{formatDate(review.reply.createdAt)}</span>
                        </div>
                    )}

                    {/* Reply Form */}
                    {!review.reply?.text && (
                        <div className="detail-section">
                            <h5>Add Reply</h5>
                            <textarea
                                className="form-input"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write your reply..."
                                rows={3}
                            />
                            <button
                                className="btn-reply"
                                onClick={() => onReply(review._id, replyText)}
                                disabled={processing || !replyText}
                            >
                                <FaReply /> Send Reply
                            </button>
                        </div>
                    )}

                    {/* Rejection Reason */}
                    {review.status !== 'rejected' && (
                        <div className="detail-section">
                            <h5>Rejection Reason (if rejecting)</h5>
                            <input
                                type="text"
                                className="form-input"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Reason for rejection..."
                            />
                        </div>
                    )}

                    {/* Actions */}
                    <div className="action-buttons">
                        {review.status !== 'approved' && (
                            <button className="btn-approve-lg" onClick={() => onApprove(review._id)} disabled={processing}>
                                <FaCheck /> Approve
                            </button>
                        )}
                        {review.status !== 'rejected' && (
                            <button className="btn-reject-lg" onClick={() => onReject(review._id, rejectReason)} disabled={processing}>
                                <FaTimes /> Reject
                            </button>
                        )}
                        <button className="btn-delete-lg" onClick={() => onDelete(review._id)}>
                            <FaTrash /> Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
