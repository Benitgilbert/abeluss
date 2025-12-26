import { useState, useEffect } from 'react';
import {
    FaEnvelope, FaSearch, FaTrash, FaDownload, FaUsers,
    FaUserCheck, FaUserTimes, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
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
        </div>
    );
}
