import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../utils/axiosInstance";
import { FaCheck, FaCheckDouble, FaTrash, FaBell, FaInfoCircle, FaBox, FaMoneyBillWave, FaticketAlt } from "react-icons/fa";
import "./AdminNotifications.css";

const AdminNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // all, unread

    useEffect(() => {
        fetchNotifications();
    }, [filter]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/notifications?unreadOnly=${filter === 'unread'}`);
            if (res.data.success) {
                setNotifications(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.put("/notifications/mark-all-read");
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this notification?")) return;
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (error) {
            console.error("Failed to delete notification:", error);
        }
    };

    const handleClearAll = async () => {
        if (!window.confirm("Clear ALL your notifications? This cannot be undone.")) return;
        try {
            await api.delete("/notifications");
            setNotifications([]);
        } catch (error) {
            console.error("Failed to clear notifications:", error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'order_placed':
            case 'order_status': return <FaBox className="notif-icon-img text-blue-500" />;
            case 'payout_processed':
            case 'payout_rejected': return <FaMoneyBillWave className="notif-icon-img text-green-500" />;
            case 'product_approved': return <FaCheckDouble className="notif-icon-img text-purple-500" />;
            default: return <FaInfoCircle className="notif-icon-img text-gray-400" />;
        }
    };

    return (
        <div className="admin-layout">
            <Sidebar />
            <div className="admin-main">
                <Topbar title="Notifications" />
                <div className="admin-content">
                    <div className="notifications-container">
                        <div className="notifications-header">
                            <div className="flex gap-4">
                                <button
                                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                                    onClick={() => setFilter('all')}
                                >
                                    All
                                </button>
                                <button
                                    className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
                                    onClick={() => setFilter('unread')}
                                >
                                    Unread Only
                                </button>
                            </div>
                            <div className="actions flex gap-2">
                                <button onClick={handleMarkAllAsRead} className="btn-secondary text-sm">
                                    <FaCheckDouble /> Mark All Read
                                </button>
                                <button onClick={handleClearAll} className="btn-danger text-sm">
                                    <FaTrash /> Clear All
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="loading-state">Loading notifications...</div>
                        ) : notifications.length === 0 ? (
                            <div className="empty-state">
                                <FaBell className="empty-icon text-gray-300 text-4xl mb-2" />
                                <p className="text-gray-500">No notifications found</p>
                            </div>
                        ) : (
                            <div className="notifications-list">
                                {notifications.map(n => (
                                    <div key={n._id} className={`notification-item ${!n.isRead ? 'unread' : ''}`}>
                                        <div className="notif-icon">
                                            {getIcon(n.type)}
                                        </div>
                                        <div className="notif-content">
                                            <div className="notif-top">
                                                <h4 className="notif-title">{n.title}</h4>
                                                <span className="notif-date">{new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <p className="notif-message">{n.message}</p>
                                        </div>
                                        <div className="notif-actions">
                                            {!n.isRead && (
                                                <button onClick={() => handleMarkAsRead(n._id)} className="btn-icon" title="Mark as read">
                                                    <FaCheck />
                                                </button>
                                            )}
                                            <button onClick={() => handleDelete(n._id)} className="btn-icon delete" title="Delete">
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminNotifications;
