import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaImage, FaPalette, FaSave, FaTimes, FaFolder } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
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

    const API_URL = 'http://localhost:5000/api';

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/categories`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setCategories(data.data);
            }
        } catch (err) {
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
            const token = localStorage.getItem('authToken');
            const url = editingCategory
                ? `${API_URL}/categories/${editingCategory._id}`
                : `${API_URL}/categories`;

            const res = await fetch(url, {
                method: editingCategory ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...form,
                    parent: form.parent || null
                })
            });

            const data = await res.json();

            if (data.success) {
                setSuccess(editingCategory ? 'Category updated!' : 'Category created!');
                fetchCategories();
                closeModal();
            } else {
                setError(data.message || 'Failed to save category');
            }
        } catch (err) {
            setError('Failed to save category');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;

        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/categories/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await res.json();

            if (data.success) {
                setSuccess('Category deleted!');
                fetchCategories();
            } else {
                setError(data.message || 'Failed to delete category');
            }
        } catch (err) {
            setError('Failed to delete category');
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

                    {/* Modal */}
                    {showModal && (
                        <div className="modal-overlay" onClick={closeModal}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h3 className="modal-title">
                                        {editingCategory ? 'Edit Category' : 'Add New Category'}
                                    </h3>
                                    <button onClick={closeModal} className="btn-close">
                                        <FaTimes />
                                    </button>
                                </div>

                                {error && <div className="alert alert-error">{error}</div>}

                                <form onSubmit={handleSubmit}>
                                    {/* Name */}
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

                                    {/* Description */}
                                    <div className="form-group">
                                        <label className="form-label">Description</label>
                                        <textarea
                                            className="form-input form-textarea"
                                            value={form.description}
                                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                                            placeholder="Brief description of this category"
                                        />
                                    </div>

                                    {/* Parent Category */}
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

                                    {/* Image URL */}
                                    <div className="form-group">
                                        <label className="form-label">
                                            <FaImage className="label-icon" />
                                            Image URL
                                        </label>
                                        <input
                                            type="url"
                                            className="form-input"
                                            value={form.image}
                                            onChange={(e) => setForm({ ...form, image: e.target.value })}
                                            placeholder="https://example.com/image.jpg"
                                        />
                                        {form.image && (
                                            <div className="image-preview-container">
                                                <img
                                                    src={form.image}
                                                    alt="Preview"
                                                    className="image-preview"
                                                    onError={(e) => e.target.style.display = 'none'}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Color Selection */}
                                    <div className="form-group">
                                        <label className="form-label">
                                            <FaPalette className="label-icon" />
                                            Card Color Gradient
                                        </label>
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

                                    {/* Active Status */}
                                    <div className="form-group">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={form.isActive}
                                                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                            />
                                            Active (visible to customers)
                                        </label>
                                    </div>

                                    {/* Submit */}
                                    <button type="submit" className="btn-submit">
                                        <FaSave />
                                        {editingCategory ? 'Update Category' : 'Create Category'}
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
