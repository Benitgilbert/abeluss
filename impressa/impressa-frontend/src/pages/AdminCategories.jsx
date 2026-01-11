import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaImage, FaPalette, FaSave, FaTimes, FaFolder } from 'react-icons/fa';
import api from '../utils/axiosInstance';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import '../styles/PremiumModal.css';
import './AdminCategories.css';

const colorOptions = [
    { label: 'Violet → Purple', value: 'from-violet-500 to-purple-500' },
    { label: 'Blue → Cyan', value: 'from-blue-500 to-cyan-500' },
    { label: 'Pink → Rose', value: 'from-pink-500 to-rose-500' },
    { label: 'Amber → Orange', value: 'from-amber-500 to-orange-500' },
    { label: 'Green → Emerald', value: 'from-green-500 to-emerald-500' },
    { label: 'Slate → Gray', value: 'from-slate-500 to-gray-600' },
    { label: 'Red → Rose', value: 'from-red-500 to-rose-500' },
    { label: 'Indigo → Blue', value: 'from-indigo-500 to-blue-500' },
    { label: 'Teal → Cyan', value: 'from-teal-500 to-cyan-500' },
    { label: 'Fuchsia → Pink', value: 'from-fuchsia-500 to-pink-500' },
];

export default function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [form, setForm] = useState({
        name: '',
        description: '',
        parent: '',
        image: '',
        color: 'from-violet-500 to-purple-500',
        isActive: true,
    });

    // const API_URL = 'http://localhost:5000/api'; // No longer needed with axiosInstance

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            if (res.data.success) {
                setCategories(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch categories:', err);
            setError('Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const url = editingCategory
                ? `/categories/${editingCategory._id}`
                : `/categories`;

            const res = await api({
                method: editingCategory ? 'put' : 'post',
                url: url,
                data: {
                    ...form,
                    parent: form.parent || null
                }
            });

            if (res.data.success) {
                setSuccess(editingCategory ? 'Category updated!' : 'Category created!');
                fetchCategories();
                closeModal();
            } else {
                setError(res.data.message || 'Failed to save category');
            }
        } catch (err) {
            console.error('Save error:', err);
            setError(err.response?.data?.message || 'Failed to save category');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;

        try {
            const res = await api.delete(`/categories/${id}`);
            if (res.data.success) {
                setSuccess('Category deleted!');
                fetchCategories();
            } else {
                setError(res.data.message || 'Failed to delete category');
            }
        } catch (err) {
            console.error('Delete error:', err);
            setError(err.response?.data?.message || 'Failed to delete category');
        }
    };

    const openModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setForm({
                name: category.name || '',
                description: category.description || '',
                parent: category.parent?._id || category.parent || '',
                image: category.image || '',
                color: category.color || 'from-violet-500 to-purple-500',
                isActive: category.isActive !== false,
            });
        } else {
            setEditingCategory(null);
            setForm({
                name: '',
                description: '',
                parent: '',
                image: '',
                color: 'from-violet-500 to-purple-500',
                isActive: true,
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingCategory(null);
        setError('');
    };

    if (loading) {
        return (
            <div className="admin-categories-layout">
                <Sidebar />
                <div className="admin-categories-main">
                    <Topbar title="Categories" />
                    <main className="admin-categories-content">
                        <div className="loading-state">Loading categories...</div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-categories-layout">
            <Sidebar />
            <div className="admin-categories-main">
                <Topbar title="Categories" />
                <main className="admin-categories-content">
                    {/* Header with Add Button */}
                    <div className="categories-header">
                        <button className="btn-add-category" onClick={() => openModal()}>
                            <FaPlus /> Add Category
                        </button>
                    </div>

                    {/* Alerts */}
                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    {/* Table */}
                    <div className="categories-table-container">
                        <table className="categories-table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Name</th>
                                    <th>Color</th>
                                    <th>Parent</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="empty-state">
                                            No categories yet. Click "Add Category" to create one.
                                        </td>
                                    </tr>
                                ) : (
                                    categories.map((cat) => (
                                        <tr key={cat._id}>
                                            <td>
                                                {cat.image ? (
                                                    <img src={cat.image} alt={cat.name} className="category-preview" />
                                                ) : (
                                                    <div className="category-preview placeholder">
                                                        <FaImage />
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <div className="category-name">{cat.name}</div>
                                                {cat.description && (
                                                    <div className="category-desc">
                                                        {cat.description.substring(0, 50)}{cat.description.length > 50 ? '...' : ''}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <div
                                                    className={`color-preview bg-gradient-to-r ${cat.color || 'from-violet-500 to-purple-500'}`}
                                                />
                                            </td>
                                            <td>
                                                {cat.parent?.name || <span className="text-muted">—</span>}
                                            </td>
                                            <td>
                                                <span className={`status-badge ${cat.isActive ? 'status-active' : 'status-inactive'}`}>
                                                    {cat.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="category-actions">
                                                    <button
                                                        className="btn-icon edit"
                                                        onClick={() => openModal(cat)}
                                                        title="Edit"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        className="btn-icon delete"
                                                        onClick={() => handleDelete(cat._id)}
                                                        title="Delete"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {showModal && (
                        <div className="modal-overlay">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h3 className="modal-title">
                                        {editingCategory ? 'Edit Category' : 'Add New Category'}
                                    </h3>
                                    <button onClick={closeModal} className="btn-close">&times;</button>
                                </div>

                                <form onSubmit={handleSubmit} className="modal-body">
                                    {error && <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg">{error}</div>}

                                    <div className="modal-form-grid">
                                        <div className="form-group">
                                            <label className="form-label">Category Name *</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={form.name}
                                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                                placeholder="e.g., Electronics"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Parent Category</label>
                                            <select
                                                className="form-select"
                                                value={form.parent}
                                                onChange={(e) => setForm({ ...form, parent: e.target.value })}
                                            >
                                                <option value="">None (Top Level)</option>
                                                {categories
                                                    .filter(c => c._id !== editingCategory?._id)
                                                    .map(c => (
                                                        <option key={c._id} value={c._id}>{c.name}</option>
                                                    ))
                                                }
                                            </select>
                                        </div>

                                        <div className="form-group full-width">
                                            <label className="form-label">Description</label>
                                            <textarea
                                                className="form-textarea"
                                                value={form.description}
                                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                                placeholder="Brief description of this category"
                                            />
                                        </div>

                                        <div className="form-group full-width">
                                            <label className="form-label">Image URL</label>
                                            <input
                                                type="url"
                                                className="form-input"
                                                value={form.image}
                                                onChange={(e) => setForm({ ...form, image: e.target.value })}
                                                placeholder="https://example.com/image.jpg"
                                            />
                                            {form.image && (
                                                <div className="mt-2 p-2 bg-white border rounded">
                                                    <img
                                                        src={form.image}
                                                        alt="Preview"
                                                        className="h-20 w-auto object-contain"
                                                        onError={(e) => e.target.style.display = 'none'}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-group full-width">
                                            <label className="form-label">Card Color Gradient</label>
                                            <div className="color-grid">
                                                {colorOptions.map((color) => (
                                                    <div
                                                        key={color.value}
                                                        onClick={() => setForm({ ...form, color: color.value })}
                                                        className={`color-option bg-gradient-to-r ${color.value} ${form.color === color.value ? 'selected' : ''}`}
                                                        title={color.label}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="checkbox-group full-width">
                                            <label className="checkbox-item">
                                                <input
                                                    type="checkbox"
                                                    checked={form.isActive}
                                                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                                />
                                                <span className="checkbox-label">Active (visible to customers)</span>
                                            </label>
                                        </div>
                                    </div>
                                </form>

                                <div className="modal-footer">
                                    <button type="button" onClick={closeModal} className="btn-cancel">Cancel</button>
                                    <button type="submit" onClick={handleSubmit} className="btn-submit">
                                        {editingCategory ? 'Update Category' : 'Create Category'}
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
