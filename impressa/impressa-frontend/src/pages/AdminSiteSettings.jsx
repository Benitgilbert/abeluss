import { useState, useEffect } from 'react';
import {
    FaSave, FaTimes, FaPlus, FaTrash, FaEdit, FaCog,
    FaTruck, FaShieldAlt, FaUndo, FaHeadset, FaStar, FaHeart, FaCheck, FaClock,
    FaToggleOn, FaToggleOff, FaArrowUp, FaArrowDown, FaRedo,
    FaEnvelope, FaPhone, FaMapMarkerAlt, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn
} from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import './AdminSiteSettings.css';

const iconOptions = [
    { value: 'truck', label: 'Truck (Shipping)', icon: <FaTruck /> },
    { value: 'shield', label: 'Shield (Security)', icon: <FaShieldAlt /> },
    { value: 'undo', label: 'Undo (Returns)', icon: <FaUndo /> },
    { value: 'headset', label: 'Headset (Support)', icon: <FaHeadset /> },
    { value: 'clock', label: 'Clock (Time)', icon: <FaClock /> },
    { value: 'star', label: 'Star (Quality)', icon: <FaStar /> },
    { value: 'check', label: 'Check (Verified)', icon: <FaCheck /> },
    { value: 'heart', label: 'Heart (Care)', icon: <FaHeart /> }
];

export default function AdminSiteSettings() {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingBadge, setEditingBadge] = useState(null);
    const [editingIndex, setEditingIndex] = useState(-1);

    const [badgeForm, setBadgeForm] = useState({
        icon: 'truck',
        title: '',
        description: '',
        isActive: true
    });

    // Footer settings form
    const [footerForm, setFooterForm] = useState({
        footerTagline: '',
        contactEmail: '',
        contactPhone: '',
        contactAddress: '',
        socialLinks: {
            facebook: '',
            twitter: '',
            instagram: '',
            linkedin: ''
        }
    });

    const API_URL = 'http://localhost:5000/api';

    useEffect(() => {
        fetchSettings();
    }, []);

    useEffect(() => {
        if (settings) {
            setFooterForm({
                footerTagline: settings.footerTagline || '',
                contactEmail: settings.contactEmail || '',
                contactPhone: settings.contactPhone || '',
                contactAddress: settings.contactAddress || '',
                socialLinks: settings.socialLinks || { facebook: '', twitter: '', instagram: '', linkedin: '' }
            });
        }
    }, [settings]);

    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/site-settings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setSettings(data.data);
            }
        } catch (err) {
            setError('Failed to fetch settings');
        } finally {
            setLoading(false);
        }
    };

    const saveTrustBadges = async (badges) => {
        setSaving(true);
        setError('');
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/site-settings/trust-badges`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ trustBadges: badges })
            });
            const data = await res.json();
            if (data.success) {
                setSuccess('Trust badges saved!');
                fetchSettings();
            } else {
                setError(data.message || 'Failed to save');
            }
        } catch (err) {
            setError('Failed to save trust badges');
        } finally {
            setSaving(false);
        }
    };

    const saveFooterSettings = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/site-settings/footer`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(footerForm)
            });
            const data = await res.json();
            if (data.success) {
                setSuccess('Footer settings saved!');
                fetchSettings();
            } else {
                setError(data.message || 'Failed to save footer settings');
            }
        } catch (err) {
            setError('Failed to save footer settings');
        } finally {
            setSaving(false);
        }
    };

    const handleAddBadge = () => {
        setEditingBadge(null);
        setEditingIndex(-1);
        setBadgeForm({ icon: 'truck', title: '', description: '', isActive: true });
        setShowModal(true);
    };

    const handleEditBadge = (badge, index) => {
        setEditingBadge(badge);
        setEditingIndex(index);
        setBadgeForm({
            icon: badge.icon,
            title: badge.title,
            description: badge.description,
            isActive: badge.isActive
        });
        setShowModal(true);
    };

    const handleSaveBadge = (e) => {
        e.preventDefault();
        const updatedBadges = [...(settings?.trustBadges || [])];

        if (editingIndex >= 0) {
            updatedBadges[editingIndex] = { ...updatedBadges[editingIndex], ...badgeForm };
        } else {
            updatedBadges.push({ ...badgeForm, order: updatedBadges.length });
        }

        saveTrustBadges(updatedBadges);
        setShowModal(false);
    };

    const handleDeleteBadge = (index) => {
        if (!window.confirm('Delete this trust badge?')) return;
        const updatedBadges = settings.trustBadges.filter((_, i) => i !== index);
        saveTrustBadges(updatedBadges);
    };

    const handleToggleBadge = (index) => {
        const updatedBadges = [...settings.trustBadges];
        updatedBadges[index].isActive = !updatedBadges[index].isActive;
        saveTrustBadges(updatedBadges);
    };

    const handleMoveUp = (index) => {
        if (index === 0) return;
        const updatedBadges = [...settings.trustBadges];
        [updatedBadges[index - 1], updatedBadges[index]] = [updatedBadges[index], updatedBadges[index - 1]];
        saveTrustBadges(updatedBadges);
    };

    const handleMoveDown = (index) => {
        if (index === settings.trustBadges.length - 1) return;
        const updatedBadges = [...settings.trustBadges];
        [updatedBadges[index], updatedBadges[index + 1]] = [updatedBadges[index + 1], updatedBadges[index]];
        saveTrustBadges(updatedBadges);
    };

    const handleResetDefaults = async () => {
        if (!window.confirm('Reset trust badges to defaults? This will remove all custom badges.')) return;
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/site-settings/trust-badges/reset`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setSuccess('Trust badges reset to defaults!');
                fetchSettings();
            }
        } catch (err) {
            setError('Failed to reset');
        }
    };

    const getIconComponent = (iconName) => {
        const iconMap = {
            truck: <FaTruck />,
            shield: <FaShieldAlt />,
            undo: <FaUndo />,
            headset: <FaHeadset />,
            clock: <FaClock />,
            star: <FaStar />,
            check: <FaCheck />,
            heart: <FaHeart />
        };
        return iconMap[iconName] || <FaShieldAlt />;
    };

    if (loading) {
        return (
            <div className="admin-site-settings-layout">
                <Sidebar />
                <div className="admin-site-settings-main">
                    <Topbar />
                    <main className="admin-site-settings-content">
                        <div className="loading-state">Loading settings...</div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-site-settings-layout">
            <Sidebar />
            <div className="admin-site-settings-main">
                <Topbar title="Site Settings" />
                <main className="admin-site-settings-content">


                    {/* Alerts */}
                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    {/* Trust Badges Section */}
                    <div className="settings-section">
                        <div className="section-header">
                            <h3 className="section-title">Trust Badges</h3>
                            <p className="section-desc">These badges appear on the homepage to build customer trust</p>
                            <div className="section-actions">
                                <button className="btn-secondary" onClick={handleResetDefaults}>
                                    <FaRedo /> Reset Defaults
                                </button>
                                <button className="btn-primary" onClick={handleAddBadge}>
                                    <FaPlus /> Add Badge
                                </button>
                            </div>
                        </div>

                        <div className="badges-table-wrapper">
                            {settings?.trustBadges?.length === 0 ? (
                                <div className="empty-state">
                                    <FaShieldAlt className="empty-icon" />
                                    <h3>No Trust Badges</h3>
                                    <p>Add trust badges to display on the homepage.</p>
                                </div>
                            ) : (
                                <table className="badges-table">
                                    <thead>
                                        <tr>
                                            <th>Order</th>
                                            <th>Icon</th>
                                            <th>Title</th>
                                            <th>Description</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {settings?.trustBadges?.map((badge, index) => (
                                            <tr key={index}>
                                                <td className="order-cell">
                                                    <div className="order-buttons">
                                                        <button
                                                            className="btn-order"
                                                            onClick={() => handleMoveUp(index)}
                                                            disabled={index === 0}
                                                        >
                                                            <FaArrowUp />
                                                        </button>
                                                        <button
                                                            className="btn-order"
                                                            onClick={() => handleMoveDown(index)}
                                                            disabled={index === settings.trustBadges.length - 1}
                                                        >
                                                            <FaArrowDown />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="icon-cell">
                                                    <div className="badge-icon-preview">
                                                        {getIconComponent(badge.icon)}
                                                    </div>
                                                </td>
                                                <td className="title-cell">
                                                    <strong>{badge.title}</strong>
                                                </td>
                                                <td className="desc-cell">{badge.description}</td>
                                                <td className="status-cell">
                                                    <span className={`status-badge ${badge.isActive ? 'active' : 'inactive'}`}>
                                                        {badge.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="actions-cell">
                                                    <button
                                                        className={`btn-toggle ${badge.isActive ? 'active' : ''}`}
                                                        onClick={() => handleToggleBadge(index)}
                                                    >
                                                        {badge.isActive ? <FaToggleOn /> : <FaToggleOff />}
                                                    </button>
                                                    <button className="btn-icon edit" onClick={() => handleEditBadge(badge, index)}>
                                                        <FaEdit />
                                                    </button>
                                                    <button className="btn-icon delete" onClick={() => handleDeleteBadge(index)}>
                                                        <FaTrash />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Footer Settings Section */}
                    <div className="settings-section">
                        <div className="section-header">
                            <h3 className="section-title">Footer Settings</h3>
                            <p className="section-desc">Configure footer contact information and social media links</p>
                        </div>

                        <form onSubmit={saveFooterSettings} className="footer-settings-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">
                                        <FaEnvelope className="label-icon" /> Contact Email
                                    </label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={footerForm.contactEmail}
                                        onChange={(e) => setFooterForm({ ...footerForm, contactEmail: e.target.value })}
                                        placeholder="support@yoursite.com"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        <FaPhone className="label-icon" /> Contact Phone
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={footerForm.contactPhone}
                                        onChange={(e) => setFooterForm({ ...footerForm, contactPhone: e.target.value })}
                                        placeholder="1-800-EXAMPLE"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <FaMapMarkerAlt className="label-icon" /> Address
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={footerForm.contactAddress}
                                    onChange={(e) => setFooterForm({ ...footerForm, contactAddress: e.target.value })}
                                    placeholder="123 Commerce St, City, State 12345"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Footer Tagline</label>
                                <textarea
                                    className="form-input form-textarea"
                                    value={footerForm.footerTagline}
                                    onChange={(e) => setFooterForm({ ...footerForm, footerTagline: e.target.value })}
                                    placeholder="Your premium destination for quality products..."
                                    rows={3}
                                />
                            </div>

                            <div className="social-links-section">
                                <label className="form-label">Social Media Links</label>
                                <div className="social-links-grid">
                                    <div className="social-input-group">
                                        <FaFacebookF className="social-icon facebook" />
                                        <input
                                            type="url"
                                            className="form-input"
                                            value={footerForm.socialLinks.facebook}
                                            onChange={(e) => setFooterForm({
                                                ...footerForm,
                                                socialLinks: { ...footerForm.socialLinks, facebook: e.target.value }
                                            })}
                                            placeholder="https://facebook.com/yourpage"
                                        />
                                    </div>
                                    <div className="social-input-group">
                                        <FaTwitter className="social-icon twitter" />
                                        <input
                                            type="url"
                                            className="form-input"
                                            value={footerForm.socialLinks.twitter}
                                            onChange={(e) => setFooterForm({
                                                ...footerForm,
                                                socialLinks: { ...footerForm.socialLinks, twitter: e.target.value }
                                            })}
                                            placeholder="https://twitter.com/yourhandle"
                                        />
                                    </div>
                                    <div className="social-input-group">
                                        <FaInstagram className="social-icon instagram" />
                                        <input
                                            type="url"
                                            className="form-input"
                                            value={footerForm.socialLinks.instagram}
                                            onChange={(e) => setFooterForm({
                                                ...footerForm,
                                                socialLinks: { ...footerForm.socialLinks, instagram: e.target.value }
                                            })}
                                            placeholder="https://instagram.com/yourhandle"
                                        />
                                    </div>
                                    <div className="social-input-group">
                                        <FaLinkedinIn className="social-icon linkedin" />
                                        <input
                                            type="url"
                                            className="form-input"
                                            value={footerForm.socialLinks.linkedin}
                                            onChange={(e) => setFooterForm({
                                                ...footerForm,
                                                socialLinks: { ...footerForm.socialLinks, linkedin: e.target.value }
                                            })}
                                            placeholder="https://linkedin.com/company/yourcompany"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="btn-save-footer" disabled={saving}>
                                <FaSave /> {saving ? 'Saving...' : 'Save Footer Settings'}
                            </button>
                        </form>
                    </div>

                    {/* Modal */}
                    {showModal && (
                        <div className="modal-overlay" onClick={() => setShowModal(false)}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h3 className="modal-title">
                                        {editingIndex >= 0 ? 'Edit Trust Badge' : 'Add Trust Badge'}
                                    </h3>
                                    <button onClick={() => setShowModal(false)} className="btn-close">
                                        <FaTimes />
                                    </button>
                                </div>

                                <form onSubmit={handleSaveBadge}>
                                    <div className="form-group">
                                        <label className="form-label">Icon</label>
                                        <div className="icon-selector">
                                            {iconOptions.map((opt) => (
                                                <div
                                                    key={opt.value}
                                                    className={`icon-option ${badgeForm.icon === opt.value ? 'selected' : ''}`}
                                                    onClick={() => setBadgeForm({ ...badgeForm, icon: opt.value })}
                                                    title={opt.label}
                                                >
                                                    {opt.icon}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Title *</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={badgeForm.title}
                                            onChange={(e) => setBadgeForm({ ...badgeForm, title: e.target.value })}
                                            placeholder="e.g., Free Shipping"
                                            required
                                            maxLength={50}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Description *</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={badgeForm.description}
                                            onChange={(e) => setBadgeForm({ ...badgeForm, description: e.target.value })}
                                            placeholder="e.g., On orders over 50,000 Rwf"
                                            required
                                            maxLength={100}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={badgeForm.isActive}
                                                onChange={(e) => setBadgeForm({ ...badgeForm, isActive: e.target.checked })}
                                            />
                                            Active (visible on homepage)
                                        </label>
                                    </div>

                                    <button type="submit" className="btn-submit" disabled={saving}>
                                        <FaSave />
                                        {editingIndex >= 0 ? 'Update Badge' : 'Add Badge'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

