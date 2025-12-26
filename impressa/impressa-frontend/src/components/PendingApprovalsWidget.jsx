import { useEffect, useState } from "react";
import api from "../utils/axiosInstance";
import { FaUserPlus, FaCheck, FaTimes, FaEye } from "react-icons/fa";
import { Link } from "react-router-dom";
import "../styles/AdminLayout.css";

function PendingApprovalsWidget() {
    const [approvals, setApprovals] = useState([]);
    const [stats, setStats] = useState({ pending: 0, total: 0, active: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get("/dashboard/analytics");
                setApprovals(res.data.pendingSellerApprovals || []);
                setStats(res.data.sellerStats || { pending: 0, total: 0, active: 0 });
            } catch (err) {
                console.error("Failed to fetch pending approvals:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="card">
                <h3 className="card-title">Pending Approvals</h3>
                <div className="skeleton skeleton-card"></div>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="table-header" style={{ padding: 0, marginBottom: '1rem', border: 'none' }}>
                <h3 className="table-title">
                    <FaUserPlus style={{ marginRight: '0.5rem', color: 'var(--warning)' }} />
                    Pending Seller Approvals
                </h3>
                {stats.pending > 0 && (
                    <span className="badge badge-warning">
                        {stats.pending} pending
                    </span>
                )}
            </div>

            {/* Quick Stats */}
            <div className="seller-quick-stats">
                <div className="quick-stat">
                    <span className="quick-stat-value">{stats.total}</span>
                    <span className="quick-stat-label">Total</span>
                </div>
                <div className="quick-stat">
                    <span className="quick-stat-value text-success">{stats.active}</span>
                    <span className="quick-stat-label">Active</span>
                </div>
                <div className="quick-stat">
                    <span className="quick-stat-value text-warning">{stats.pending}</span>
                    <span className="quick-stat-label">Pending</span>
                </div>
            </div>

            {approvals.length === 0 ? (
                <div className="empty-state" style={{ padding: '1.5rem' }}>
                    <FaCheck className="empty-state-icon" style={{ color: 'var(--success)' }} />
                    <p className="empty-state-title">All caught up!</p>
                    <p className="empty-state-text">No pending approvals</p>
                </div>
            ) : (
                <>
                    <div className="approvals-list">
                        {approvals.map((seller) => (
                            <div key={seller._id} className="approval-item">
                                <div className="approval-info">
                                    <span className="approval-name">{seller.name}</span>
                                    <span className="approval-store">{seller.storeName || 'No store name'}</span>
                                </div>
                                <div className="approval-meta">
                                    <span className="approval-date">{formatDate(seller.createdAt)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                        <Link to="/admin/sellers" className="btn btn-sm btn-secondary">
                            <FaEye style={{ marginRight: '0.25rem' }} /> View All
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}

export default PendingApprovalsWidget;
