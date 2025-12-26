import { useState, useEffect } from 'react';
import {
    FaPlus, FaEdit, FaTrash, FaSave, FaTimes,
    FaHandshake, FaLink, FaToggleOn, FaToggleOff,
    FaImage, FaArrowUp, FaArrowDown
} from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import './AdminBrandPartners.css';

export default function AdminBrandPartners() {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPartner, setEditingPartner] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [form, setForm] = useState({
        name: '',
        logo: '',
        websiteUrl: '',
        isActive: true,
    });
    const [logoFile, setLogoFile] = useState(null);

    const API_URL = 'http://localhost:5000/api';

    useEffect(() => {
        fetchPartners();
    }, []);

    const fetchPartners = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/brand-partners`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setPartners(data.data);
            }
        } catch (err) {
            setError('Failed to fetch brand partners');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('authToken');
            const url = editingPartner
                ? `${API_URL}/brand-partners/${editingPartner._id}`
                : `${API_URL}/brand-partners`;

            const formData = new FormData();
            formData.append('name', form.name);
            formData.append('websiteUrl', form.websiteUrl);
            formData.append('isActive', form.isActive);
            if (logoFile) {
                formData.append('logo', logoFile);
            } else if (form.logo) {
                formData.append('logo', form.logo);
            }

            const res = await fetch(url, {
                method: editingPartner ? 'PUT' : 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();

            if (data.success) {
                setSuccess(editingPartner ? 'Brand partner updated!' : 'Brand partner created!');
                fetchPartners();
                closeModal();
            } else {
                setError(data.message || 'Failed to save brand partner');
            }
        } catch (err) {
            setError('Failed to save brand partner');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this brand partner?')) return;

        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/brand-partners/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await res.json();

            if (data.success) {
                setSuccess('Brand partner deleted!');
                fetchPartners();
            } else {
                setError(data.message || 'Failed to delete brand partner');
            }
        } catch (err) {
            setError('Failed to delete brand partner');
        }
    };

    const handleToggle = async (id) => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/brand-partners/${id}/toggle`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await res.json();

            if (data.success) {
                fetchPartners();
            }
        } catch (err) {
            setError('Failed to toggle brand partner');
        }
    };

    const handleMoveUp = async (index) => {
        if (index === 0) return;
        const newPartners = [...partners];
        [newPartners[index - 1], newPartners[index]] = [newPartners[index], newPartners[index - 1]];
        await updateOrder(newPartners);
    };

    const handleMoveDown = async (index) => {
        if (index === partners.length - 1) return;
        const newPartners = [...partners];
        [newPartners[index], newPartners[index + 1]] = [newPartners[index + 1], newPartners[index]];
        await updateOrder(newPartners);
    };

    const updateOrder = async (orderedPartners) => {
        try {
            const token = localStorage.getItem('authToken');
            const partnersData = orderedPartners.map((p, idx) => ({ id: p._id, order: idx }));

            await fetch(`${API_URL}/brand-partners/reorder`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ partners: partnersData })
            });

            fetchPartners();
        } catch (err) {
            setError('Failed to reorder partners');
        }
    };

    const openModal = (partner = null) => {
        if (partner) {
            setEditingPartner(partner);
            setForm({
                name: partner.name || '',
                logo: partner.logo || '',
                websiteUrl: partner.websiteUrl || '',
                isActive: partner.isActive !== false,
            });
            setLogoFile(null);
        } else {
            setEditingPartner(null);
            setForm({
                name: '',
                logo: '',
                websiteUrl: '',
                isActive: true,
            });
            setLogoFile(null);
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingPartner(null);
        setError('');
    };

    if (loading) {
        return (
            <div className="admin-brand-partners-layout">
                <Sidebar />
                <div className="admin-brand-partners-main">
                    <Topbar title="Brand Partners" />
                    <main className="admin-brand-partners-content">
                        <div className="loading-state">Loading brand partners...</div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-brand-partners-layout">
            <Sidebar />
            <div className="admin-brand-partners-main">
                <Topbar title="Brand Partners" />
                <main className="admin-brand-partners-content">
                    {/* Header */}
                    <div className="partners-header">
                        <button className="btn-add-partner" onClick={() => openModal()}>
                            <FaPlus /> Add Partner
                        </button>
                    </div>

                    {/* Alerts */}
                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    {/* Partners Table */}
                    <div className="partners-table-wrapper">
                        {partners.length === 0 ? (
                            <div className="empty-state">
                                <FaHandshake className="empty-icon" />
                                <h3>No Brand Partners Yet</h3>
                                <p>Add your first brand partner to display on the homepage.</p>
                            </div>
                        ) : (
                            <table className="partners-table">
                                <thead>
                                    <tr>
                                        <th>Order</th>
                                        <th>Logo</th>
                                        <th>Name</th>
                                        <th>Website</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {partners.map((partner, index) => (
                                        <tr key={partner._id}>
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
                                                        disabled={index === partners.length - 1}
                                                    >
                                                        <FaArrowDown />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="logo-cell">
                                                {partner.logo ? (
                                                    <img
                                                        src={partner.logo}
                                                        alt={partner.name}
                                                        className="partner-logo-preview"
                                                    />
                                                ) : (
                                                    <div className="partner-logo-placeholder">
                                                        <FaImage />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="name-cell">
                                                <strong>{partner.name}</strong>
                                            </td>
                                            <td className="website-cell">
                                                {partner.websiteUrl ? (
                                                    <a href={partner.websiteUrl} target="_blank" rel="noopener noreferrer">
                                                        <FaLink /> {partner.websiteUrl}
                                                    </a>
                                                ) : (
                                                    <span className="no-link">No link</span>
                                                )}
                                            </td>
                                            <td className="status-cell">
                                                <span className={`status-badge ${partner.isActive ? 'active' : 'inactive'}`}>
                                                    {partner.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="actions-cell">
                                                <button
                                                    className={`btn-toggle ${partner.isActive ? 'active' : ''}`}
                                                    onClick={() => handleToggle(partner._id)}
                                                    title={partner.isActive ? 'Deactivate' : 'Activate'}
                                                >
                                                    {partner.isActive ? <FaToggleOn /> : <FaToggleOff />}
                                                </button>
                                                <button className="btn-icon edit" onClick={() => openModal(partner)}>
                                                    <FaEdit />
                                                </button>
                                                <button className="btn-icon delete" onClick={() => handleDelete(partner._id)}>
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Modal */}
                    {showModal && (
                        <div className="modal-overlay" onClick={closeModal}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h3 className="modal-title">
                                        {editingPartner ? 'Edit Brand Partner' : 'Add Brand Partner'}
                                    </h3>
                                    <button onClick={closeModal} className="btn-close">
                                        <FaTimes />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label className="form-label">Brand Name *</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            placeholder="e.g., TechCorp, StyleHub"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            <FaImage className="label-icon" />
                                            Logo Image
                                        </label>
                                        <input
                                            type="file"
                                            className="form-input"
                                            accept="image/*"
                                            onChange={(e) => {
                                                if (e.target.files[0]) {
                                                    setLogoFile(e.target.files[0]);
                                                    // Create a preview URL
                                                    setForm({ ...form, logo: URL.createObjectURL(e.target.files[0]) });
                                                }
                                            }}
                                        />
                                        {/* Show preview if logo exists (either URL or new file preview) */}
                                        {form.logo && (
                                            <div className="logo-preview-wrapper">
                                                <img src={form.logo} alt="Preview" className="logo-preview" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            <FaLink className="label-icon" />
                                            Website URL
                                        </label>
                                        <input
                                            type="url"
                                            className="form-input"
                                            value={form.websiteUrl}
                                            onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                                            placeholder="https://example.com (optional)"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={form.isActive}
                                                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                            />
                                            Active (visible on homepage)
                                        </label>
                                    </div>

                                    <button type="submit" className="btn-submit">
                                        <FaSave />
                                        {editingPartner ? 'Update Partner' : 'Add Partner'}
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
