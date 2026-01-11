import { useState, useEffect } from 'react';
import {
    FaPlus, FaEdit, FaTrash, FaImage, FaSave, FaTimes,
    FaDesktop, FaCalendarAlt, FaLink, FaToggleOn, FaToggleOff,
    FaArrowUp, FaArrowDown
} from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import './AdminBanners.css';

export default function AdminBanners() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [form, setForm] = useState({
        title: '',
        subtitle: '',
        badge: 'Limited Time Offer',
        buttonText: 'Shop Now',
        buttonLink: '/shop',
        backgroundImage: '',
        gradientFrom: '#8b5cf6',
        gradientTo: '#d946ef',
        startDate: '',
        endDate: '',
        position: 'hero',
        isActive: true,
    });

    const API_URL = 'http://localhost:5000/api';

    const positionOptions = [
        { value: 'hero', label: 'Hero (Top)' },
        { value: 'middle', label: 'Middle Section' },
        { value: 'bottom', label: 'Bottom' },
    ];

    const presetGradients = [
        { from: '#8b5cf6', to: '#d946ef', label: 'Violet → Fuchsia' },
        { from: '#ef4444', to: '#f97316', label: 'Red → Orange' },
        { from: '#3b82f6', to: '#06b6d4', label: 'Blue → Cyan' },
        { from: '#10b981', to: '#14b8a6', label: 'Emerald → Teal' },
        { from: '#f59e0b', to: '#ef4444', label: 'Amber → Red' },
        { from: '#6366f1', to: '#8b5cf6', label: 'Indigo → Violet' },
        { from: '#1f2937', to: '#374151', label: 'Dark Slate' },
        { from: '#ec4899', to: '#8b5cf6', label: 'Pink → Violet' },
    ];

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/banners`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setBanners(data.data);
            }
        } catch (err) {
            setError('Failed to fetch banners');
        } finally {
            setLoading(false);
        }
    };

    const [uploading, setUploading] = useState(false);

    const getStatusInfo = (banner) => {
        if (!banner.isActive) return { status: 'inactive', label: 'Inactive', color: '#6b7280' };

        const now = new Date();
        if (banner.startDate && new Date(banner.startDate) > now) {
            return { status: 'scheduled', label: 'Scheduled', color: '#3b82f6' };
        }
        if (banner.endDate && new Date(banner.endDate) < now) {
            return { status: 'expired', label: 'Expired', color: '#ef4444' };
        }
        return { status: 'active', label: 'Active', color: '#10b981' };
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });
            const data = await res.json();

            if (data.success) {
                // Construct full URL for local development
                const fullUrl = `http://localhost:5000${data.data.url}`;
                setForm({ ...form, backgroundImage: fullUrl });
            } else {
                setError('Failed to upload image');
            }
        } catch (err) {
            setError('Error uploading image');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('authToken');
            const url = editingBanner
                ? `${API_URL}/banners/${editingBanner._id}`
                : `${API_URL}/banners`;

            const res = await fetch(url, {
                method: editingBanner ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...form,
                    startDate: form.startDate || null,
                    endDate: form.endDate || null
                })
            });

            const data = await res.json();

            if (data.success) {
                setSuccess(editingBanner ? 'Banner updated!' : 'Banner created!');
                fetchBanners();
                closeModal();
            } else {
                setError(data.message || 'Failed to save banner');
            }
        } catch (err) {
            setError('Failed to save banner');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this banner?')) return;

        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/banners/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await res.json();

            if (data.success) {
                setSuccess('Banner deleted!');
                fetchBanners();
            } else {
                setError(data.message || 'Failed to delete banner');
            }
        } catch (err) {
            setError('Failed to delete banner');
        }
    };

    const handleToggle = async (id) => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/banners/${id}/toggle`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await res.json();

            if (data.success) {
                fetchBanners();
            }
        } catch (err) {
            setError('Failed to toggle banner');
        }
    };

    const openModal = (banner = null) => {
        if (banner) {
            setEditingBanner(banner);
            setForm({
                title: banner.title || '',
                subtitle: banner.subtitle || '',
                badge: banner.badge || 'Limited Time Offer',
                buttonText: banner.buttonText || 'Shop Now',
                buttonLink: banner.buttonLink || '/shop',
                backgroundImage: banner.backgroundImage || '',
                gradientFrom: banner.gradientFrom || '#8b5cf6',
                gradientTo: banner.gradientTo || '#d946ef',
                startDate: banner.startDate ? new Date(banner.startDate).toISOString().slice(0, 16) : '',
                endDate: banner.endDate ? new Date(banner.endDate).toISOString().slice(0, 16) : '',
                position: banner.position || 'hero',
                isActive: banner.isActive !== false,
            });
        } else {
            setEditingBanner(null);
            setForm({
                title: '',
                subtitle: '',
                badge: 'Limited Time Offer',
                buttonText: 'Shop Now',
                buttonLink: '/shop',
                backgroundImage: '',
                gradientFrom: '#8b5cf6',
                gradientTo: '#d946ef',
                startDate: '',
                endDate: '',
                position: 'hero',
                isActive: true,
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingBanner(null);
        setError('');
    };

    if (loading) {
        return (
            <div className="admin-banners-layout">
                <Sidebar />
                <div className="admin-banners-main">
                    <Topbar title="Banners" />
                    <main className="admin-banners-content">
                        <div className="loading-state">Loading banners...</div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-banners-layout">
            <Sidebar />
            <div className="admin-banners-main">
                <Topbar title="Banners" />
                <main className="admin-banners-content">
                    {/* Header */}
                    <div className="banners-header">
                        <button className="btn-add-banner" onClick={() => openModal()}>
                            <FaPlus /> Create Banner
                        </button>
                    </div>

                    {/* Alerts */}
                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    {/* Banners Grid */}
                    <div className="banners-grid">
                        {banners.length === 0 ? (
                            <div className="empty-state">
                                <FaDesktop className="empty-icon" />
                                <h3>No Banners Yet</h3>
                                <p>Create your first promotional banner to display on the homepage.</p>
                            </div>
                        ) : (
                            banners.map((banner) => {
                                const statusInfo = getStatusInfo(banner);
                                return (
                                    <div key={banner._id} className="banner-card">
                                        {/* Preview */}
                                        <div
                                            className="banner-preview"
                                            style={{
                                                background: banner.backgroundImage
                                                    ? `url(${banner.backgroundImage}) center/cover`
                                                    : `linear-gradient(135deg, ${banner.gradientFrom}, ${banner.gradientTo})`
                                            }}
                                        >
                                            <span
                                                className="status-badge"
                                                style={{ backgroundColor: statusInfo.color }}
                                            >
                                                {statusInfo.label}
                                            </span>
                                            <div className="preview-content">
                                                <span className="preview-badge">{banner.badge}</span>
                                                <h3 className="preview-title">{banner.title}</h3>
                                                {banner.subtitle && (
                                                    <p className="preview-subtitle">{banner.subtitle}</p>
                                                )}
                                                <span className="preview-button">{banner.buttonText}</span>
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="banner-info">
                                            <div className="info-row">
                                                <FaLink className="info-icon" />
                                                <span>{banner.buttonLink}</span>
                                            </div>
                                            {(banner.startDate || banner.endDate) && (
                                                <div className="info-row">
                                                    <FaCalendarAlt className="info-icon" />
                                                    <span>
                                                        {banner.startDate && new Date(banner.startDate).toLocaleDateString()}
                                                        {banner.startDate && banner.endDate && ' - '}
                                                        {banner.endDate && new Date(banner.endDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="info-row">
                                                <span className="position-badge">{banner.position}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="banner-actions">
                                            <button
                                                className={`btn-toggle ${banner.isActive ? 'active' : ''}`}
                                                onClick={() => handleToggle(banner._id)}
                                                title={banner.isActive ? 'Deactivate' : 'Activate'}
                                            >
                                                {banner.isActive ? <FaToggleOn /> : <FaToggleOff />}
                                            </button>
                                            <button className="btn-icon edit" onClick={() => openModal(banner)}>
                                                <FaEdit />
                                            </button>
                                            <button className="btn-icon delete" onClick={() => handleDelete(banner._id)}>
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {showModal && (
                        <div className="modal-overlay">
                            <div className="modal-content modal-large">
                                <div className="modal-header">
                                    <h3 className="modal-title">
                                        {editingBanner ? 'Edit Banner' : 'Create Banner'}
                                    </h3>
                                    <button onClick={closeModal} className="btn-close">&times;</button>
                                </div>

                                <div className="modal-body overflow-y-auto max-h-[70vh]">
                                    {/* Live Preview */}
                                    <div
                                        className="modal-preview mb-6 rounded-xl overflow-hidden"
                                        style={{
                                            height: '240px',
                                            background: form.backgroundImage
                                                ? `url(${form.backgroundImage}) center/cover`
                                                : `linear-gradient(135deg, ${form.gradientFrom}, ${form.gradientTo})`
                                        }}
                                    >
                                        <div className="preview-content p-8 flex flex-col items-center justify-center text-center h-full text-white">
                                            <span className="preview-badge bg-white/20 px-3 py-1 rounded-full text-xs font-medium mb-3 backdrop-blur-sm self-center">
                                                {form.badge || 'Badge'}
                                            </span>
                                            <h3 className="preview-title text-3xl font-bold mb-2">
                                                {form.title || 'Your Title Here'}
                                            </h3>
                                            {form.subtitle && <p className="preview-subtitle text-lg opacity-90 mb-4">{form.subtitle}</p>}
                                            <span className="preview-button px-6 py-2 bg-white text-gray-900 rounded-lg font-bold">
                                                {form.buttonText || 'Button'}
                                            </span>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmit} className="modal-form-grid">
                                        <div className="form-group full-width">
                                            <label className="form-label">Title *</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={form.title}
                                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                                placeholder="Up to 50% Off"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Badge Text</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={form.badge}
                                                onChange={(e) => setForm({ ...form, badge: e.target.value })}
                                                placeholder="Limited Time Offer"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Position</label>
                                            <select
                                                className="form-select"
                                                value={form.position}
                                                onChange={(e) => setForm({ ...form, position: e.target.value })}
                                            >
                                                <option value="hero">Hero (Top)</option>
                                                <option value="middle">Middle Section</option>
                                                <option value="bottom">Bottom Section</option>
                                                <option value="sidebar">Sidebar</option>
                                            </select>
                                        </div>

                                        <div className="form-group full-width">
                                            <label className="form-label">Subtitle</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={form.subtitle}
                                                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                                                placeholder="Don't miss out on our biggest sale..."
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Background Image</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="form-input"
                                                    onChange={handleImageUpload}
                                                    disabled={uploading}
                                                />
                                                {form.backgroundImage && (
                                                    <button
                                                        type="button"
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                                                        onClick={() => setForm({ ...form, backgroundImage: '' })}
                                                        title="Remove Image"
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                )}
                                            </div>
                                            {uploading && <span className="text-xs text-blue-500 mt-1">Uploading...</span>}
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Button Text</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={form.buttonText}
                                                onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                                                placeholder="Shop Now"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Button Link</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={form.buttonLink}
                                                onChange={(e) => setForm({ ...form, buttonLink: e.target.value })}
                                                placeholder="/shop"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Start Date</label>
                                            <input
                                                type="datetime-local"
                                                className="form-input"
                                                value={form.startDate}
                                                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">End Date</label>
                                            <input
                                                type="datetime-local"
                                                className="form-input"
                                                value={form.endDate}
                                                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                                            />
                                        </div>

                                        <div className="form-group full-width">
                                            <label className="form-label">Gradient Colors</label>
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {presetGradients.map((preset, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`w-8 h-8 rounded-full cursor-pointer border-2 ${form.gradientFrom === preset.from && form.gradientTo === preset.to ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:scale-110'}`}
                                                        style={{ background: `linear-gradient(135deg, ${preset.from}, ${preset.to})` }}
                                                        onClick={() => setForm({ ...form, gradientFrom: preset.from, gradientTo: preset.to })}
                                                        title={preset.label}
                                                    />
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="color"
                                                    className="h-8 w-12 rounded cursor-pointer"
                                                    value={form.gradientFrom}
                                                    onChange={(e) => setForm({ ...form, gradientFrom: e.target.value })}
                                                />
                                                <span className="text-gray-400">→</span>
                                                <input
                                                    type="color"
                                                    className="h-8 w-12 rounded cursor-pointer"
                                                    value={form.gradientTo}
                                                    onChange={(e) => setForm({ ...form, gradientTo: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="checkbox-group full-width">
                                            <label className="checkbox-item">
                                                <input
                                                    type="checkbox"
                                                    checked={form.isActive}
                                                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                                />
                                                <span className="checkbox-label">Banner is active</span>
                                            </label>
                                        </div>
                                    </form>
                                </div>

                                <div className="modal-footer">
                                    <button type="button" onClick={closeModal} className="btn-cancel">Cancel</button>
                                    <button type="submit" onClick={handleSubmit} className="btn-submit">
                                        {editingBanner ? 'Update Banner' : 'Create Banner'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                    }
                </main >
            </div >
        </div >
    );
}
