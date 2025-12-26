import { FaBell, FaCheck, FaBox, FaDollarSign, FaStar, FaTicketAlt, FaUser, FaBars, FaMoon, FaSun } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import api from "../utils/axiosInstance";
import RoleSwitcher from "./RoleSwitcher";
import "../styles/AdminLayout.css";

function Topbar({ onMenuClick, title }) {
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    api.get("/auth/me").then(res => setUser(res.data)).catch(err => console.error(err));
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications?limit=10");
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read');
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read');
    }
  };

  const getIcon = (type) => {
    const iconStyle = { fontSize: '0.875rem' };
    if (type?.includes('order')) return <FaBox style={{ ...iconStyle, color: 'var(--primary)' }} />;
    if (type?.includes('payment') || type?.includes('payout')) return <FaDollarSign style={{ ...iconStyle, color: 'var(--success)' }} />;
    if (type?.includes('review')) return <FaStar style={{ ...iconStyle, color: 'var(--warning)' }} />;
    if (type?.includes('ticket')) return <FaTicketAlt style={{ ...iconStyle, color: 'var(--info)' }} />;
    return <FaUser style={{ ...iconStyle, color: 'var(--text-muted)' }} />;
  };

  const getIconBg = (type) => {
    if (type?.includes('order')) return 'var(--primary-light)';
    if (type?.includes('payment') || type?.includes('payout')) return 'var(--success-light)';
    if (type?.includes('review')) return 'var(--warning-light)';
    if (type?.includes('ticket')) return 'var(--info-light)';
    return 'var(--bg-tertiary)';
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="admin-topbar">
      {/* Mobile Menu Button */}
      <button className="mobile-menu-btn" onClick={onMenuClick}>
        <FaBars />
      </button>

      {/* Page Title */}
      {title && (
        <h3 className="topbar-title">{title}</h3>
      )}

      <div className="topbar-actions">
        {/* Theme Toggle */}
        <button
          className="action-btn"
          onClick={toggleTheme}
          style={{ marginRight: '8px' }}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <FaMoon style={{ fontSize: '1.2rem' }} /> : <FaSun style={{ fontSize: '1.2rem', color: '#f59e0b' }} />}
        </button>

        {/* Role Switcher for Admin */}
        <RoleSwitcher user={user} />

        <div className="notification-wrapper" ref={dropdownRef}>
          <button className="action-btn" onClick={() => setShowDropdown(!showDropdown)}>
            <FaBell style={{ fontSize: '1.125rem' }} />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>

          {showDropdown && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h4>Notifications</h4>
                {unreadCount > 0 && (
                  <button className="btn btn-sm btn-secondary" onClick={markAllRead}>
                    <FaCheck style={{ fontSize: '0.625rem' }} /> Mark all
                  </button>
                )}
              </div>
              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div className="empty-state" style={{ padding: '2rem' }}>
                    <FaBell className="empty-state-icon" />
                    <p className="empty-state-title">No notifications</p>
                    <p className="empty-state-text">You're all caught up!</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n._id}
                      className={`notification-item ${!n.isRead ? 'unread' : ''}`}
                      onClick={() => !n.isRead && markAsRead(n._id)}
                    >
                      <div
                        className="notification-icon"
                        style={{ background: getIconBg(n.type) }}
                      >
                        {getIcon(n.type)}
                      </div>
                      <div className="notification-content">
                        <p className="notification-title">{n.title}</p>
                        <p className="notification-message">{n.message?.substring(0, 60)}...</p>
                        <span className="notification-time">{formatTime(n.createdAt)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="notification-footer">
                <a href="/admin/notifications">View all notifications</a>
              </div>
            </div>
          )}
        </div>

        <div className="user-profile">
          <div className="user-info">
            <p className="user-name">{user?.name || 'Admin'}</p>
            <p className="user-role">{user?.role?.toUpperCase() || 'ADMIN'}</p>
          </div>
          <div className="user-avatar">
            {user?.profileImage ? (
              <img src={`http://localhost:5000${user.profileImage}`} alt="Profile" />
            ) : (
              <span>{user?.name?.charAt(0).toUpperCase() || 'A'}</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;