import { useState, useEffect } from 'react';
import {
    FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaClock, FaBox,
    FaSave, FaTimes, FaFire, FaPercent, FaEye
} from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import './AdminFlashSales.css';

export default function AdminFlashSales() {
    const [flashSales, setFlashSales] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingSale, setEditingSale] = useState(null);
    const [selectedSale, setSelectedSale] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [form, setForm] = useState({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        bannerColor: 'from-red-500 to-orange-500',
        isActive: true,
    });

    const [productForm, setProductForm] = useState({
        productId: '',
        flashSalePrice: '',
        stockLimit: ''
    });

    const API_URL = 'http://localhost:5000/api';

    const colorOptions = [
        { label: 'Red → Orange', value: 'from-red-500 to-orange-500' },
        { label: 'Purple → Pink', value: 'from-purple-500 to-pink-500' },
        { label: 'Blue → Cyan', value: 'from-blue-500 to-cyan-500' },
        { label: 'Green → Teal', value: 'from-green-500 to-teal-500' },
        { label: 'Yellow → Red', value: 'from-yellow-500 to-red-500' },
        { label: 'Indigo → Purple', value: 'from-indigo-500 to-purple-500' },
    ];

    useEffect(() => {
        fetchFlashSales();
        fetchProducts();
    }, []);

    const fetchFlashSales = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/flash-sales`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setFlashSales(data.data);
            }
        } catch (err) {
            setError('Failed to fetch flash sales');
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${API_URL}/products`);
            const data = await res.json();
            const productList = Array.isArray(data) ? data : (data.products || data.data || []);
            setProducts(productList);
        } catch (err) {
            console.error('Failed to fetch products');
        }
    };

    const getSaleStatus = (sale) => {
        const now = new Date();
        const start = new Date(sale.startDate);
        const end = new Date(sale.endDate);

        if (!sale.isActive) return { status: 'inactive', label: 'Inactive', color: '#6b7280' };
        if (now < start) return { status: 'upcoming', label: 'Upcoming', color: '#3b82f6' };
        if (now > end) return { status: 'ended', label: 'Ended', color: '#ef4444' };
        return { status: 'active', label: 'Active', color: '#10b981' };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('authToken');
            const url = editingSale
                ? `${API_URL}/flash-sales/${editingSale._id}`
                : `${API_URL}/flash-sales`;

            const res = await fetch(url, {
                method: editingSale ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(form)
            });

            const data = await res.json();

            if (data.success) {
                setSuccess(editingSale ? 'Flash sale updated!' : 'Flash sale created!');
                fetchFlashSales();
                closeModal();
            } else {
                setError(data.message || 'Failed to save flash sale');
            }
        } catch (err) {
            setError('Failed to save flash sale');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this flash sale?')) return;

        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/flash-sales/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await res.json();

            if (data.success) {
                setSuccess('Flash sale deleted!');
                fetchFlashSales();
            } else {
                setError(data.message || 'Failed to delete flash sale');
            }
        } catch (err) {
            setError('Failed to delete flash sale');
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!selectedSale) return;

        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/flash-sales/${selectedSale._id}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    productId: productForm.productId,
                    flashSalePrice: Number(productForm.flashSalePrice),
                    stockLimit: productForm.stockLimit ? Number(productForm.stockLimit) : null
                })
            });

            const data = await res.json();

            if (data.success) {
                setSuccess('Product added to flash sale!');
                fetchFlashSales();
                setShowProductModal(false);
                setProductForm({ productId: '', flashSalePrice: '', stockLimit: '' });
            } else {
                setError(data.message || 'Failed to add product');
            }
        } catch (err) {
            setError('Failed to add product');
        }
    };

    const handleRemoveProduct = async (saleId, productId) => {
        if (!window.confirm('Remove this product from the flash sale?')) return;

        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/flash-sales/${saleId}/products/${productId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await res.json();

            if (data.success) {
                setSuccess('Product removed!');
                fetchFlashSales();
            } else {
                setError(data.message || 'Failed to remove product');
            }
        } catch (err) {
            setError('Failed to remove product');
        }
    };

    const openModal = (sale = null) => {
        if (sale) {
            setEditingSale(sale);
            setForm({
                name: sale.name || '',
                description: sale.description || '',
                startDate: sale.startDate ? new Date(sale.startDate).toISOString().slice(0, 16) : '',
                endDate: sale.endDate ? new Date(sale.endDate).toISOString().slice(0, 16) : '',
                bannerColor: sale.bannerColor || 'from-red-500 to-orange-500',
                isActive: sale.isActive !== false,
            });
        } else {
            setEditingSale(null);
            const now = new Date();
            const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            setForm({
                name: '',
                description: '',
                startDate: now.toISOString().slice(0, 16),
                endDate: tomorrow.toISOString().slice(0, 16),
                bannerColor: 'from-red-500 to-orange-500',
                isActive: true,
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingSale(null);
        setError('');
    };

    const openProductModal = (sale) => {
        setSelectedSale(sale);
        setProductForm({ productId: '', flashSalePrice: '', stockLimit: '' });
        setShowProductModal(true);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="admin-flash-sales-layout">
                <Sidebar />
                <div className="admin-flash-sales-main">
                    <Topbar title="Flash Sales" />
                    <main className="admin-flash-sales-content">
                        <div className="loading-state">Loading flash sales...</div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-flash-sales-layout">
            <Sidebar />
            <div className="admin-flash-sales-main">
                <Topbar title="Flash Sales" />
                <main className="admin-flash-sales-content">
                    {/* Header */}
                    <div className="flash-sales-header">
                        <button className="btn-add-sale" onClick={() => openModal()}>
                            <FaPlus /> Create Flash Sale
                        </button>
                    </div>

                    {/* Alerts */}
                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    {/* Flash Sales List */}
                    <div className="flash-sales-grid">
                        {flashSales.length === 0 ? (
                            <div className="empty-state">
                                <FaFire className="empty-icon" />
                                <h3>No Flash Sales Yet</h3>
                                <p>Create your first flash sale to offer limited-time discounts.</p>
                            </div>
                        ) : (
                            flashSales.map((sale) => {
                                const statusInfo = getSaleStatus(sale);
                                return (
                                    <div key={sale._id} className="flash-sale-card">
                                        <div className={`sale-banner bg-gradient-to-r ${sale.bannerColor || 'from-red-500 to-orange-500'}`}>
                                            <span
                                                className="status-badge"
                                                style={{ backgroundColor: statusInfo.color }}
                                            >
                                                {statusInfo.label}
                                            </span>
                                            <h3 className="sale-name">{sale.name}</h3>
                                        </div>

                                        <div className="sale-body">
                                            <div className="sale-dates">
                                                <div className="date-row">
                                                    <FaCalendarAlt />
                                                    <span>Start: {formatDate(sale.startDate)}</span>
                                                </div>
                                                <div className="date-row">
                                                    <FaClock />
                                                    <span>End: {formatDate(sale.endDate)}</span>
                                                </div>
                                            </div>

                                            <div className="products-section">
                                                <div className="products-header">
                                                    <span><FaBox /> {sale.products?.length || 0} Products</span>
                                                    <button
                                                        className="btn-add-product"
                                                        onClick={() => openProductModal(sale)}
                                                    >
                                                        <FaPlus /> Add
                                                    </button>
                                                </div>

                                                {sale.products && sale.products.length > 0 ? (
                                                    <div className="products-list">
                                                        {sale.products.slice(0, 3).map((sp) => (
                                                            <div key={sp._id} className="product-item">
                                                                <span className="product-name">
                                                                    {sp.product?.name || 'Unknown Product'}
                                                                </span>
                                                                <span className="product-price">
                                                                    {sp.flashSalePrice?.toLocaleString()} Rwf
                                                                </span>
                                                                <button
                                                                    className="btn-remove-product"
                                                                    onClick={() => handleRemoveProduct(sale._id, sp.product?._id)}
                                                                >
                                                                    <FaTimes />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        {sale.products.length > 3 && (
                                                            <div className="more-products">
                                                                +{sale.products.length - 3} more
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="no-products">No products added yet</p>
                                                )}
                                            </div>

                                            <div className="sale-actions">
                                                <button className="btn-icon edit" onClick={() => openModal(sale)}>
                                                    <FaEdit /> Edit
                                                </button>
                                                <button className="btn-icon delete" onClick={() => handleDelete(sale._id)}>
                                                    <FaTrash /> Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Create/Edit Modal */}
                    {showModal && (
                        <div className="modal-overlay" onClick={closeModal}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h3 className="modal-title">
                                        {editingSale ? 'Edit Flash Sale' : 'Create Flash Sale'}
                                    </h3>
                                    <button onClick={closeModal} className="btn-close">
                                        <FaTimes />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label className="form-label">Sale Name *</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            placeholder="e.g., Christmas Flash Sale"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Description</label>
                                        <textarea
                                            className="form-input form-textarea"
                                            value={form.description}
                                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                                            placeholder="Sale description"
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Start Date *</label>
                                            <input
                                                type="datetime-local"
                                                className="form-input"
                                                value={form.startDate}
                                                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">End Date *</label>
                                            <input
                                                type="datetime-local"
                                                className="form-input"
                                                value={form.endDate}
                                                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Banner Color</label>
                                        <div className="color-grid">
                                            {colorOptions.map((color) => (
                                                <div
                                                    key={color.value}
                                                    onClick={() => setForm({ ...form, bannerColor: color.value })}
                                                    className={`color-option bg-gradient-to-r ${color.value} ${form.bannerColor === color.value ? 'selected' : ''}`}
                                                    title={color.label}
                                                />
                                            ))}
                                        </div>
                                    </div>

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

                                    <button type="submit" className="btn-submit">
                                        <FaSave />
                                        {editingSale ? 'Update Flash Sale' : 'Create Flash Sale'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Add Product Modal */}
                    {showProductModal && (
                        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
                            <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h3 className="modal-title">Add Product to Sale</h3>
                                    <button onClick={() => setShowProductModal(false)} className="btn-close">
                                        <FaTimes />
                                    </button>
                                </div>

                                <form onSubmit={handleAddProduct}>
                                    <div className="form-group">
                                        <label className="form-label">Select Product *</label>
                                        <select
                                            className="form-select"
                                            value={productForm.productId}
                                            onChange={(e) => setProductForm({ ...productForm, productId: e.target.value })}
                                            required
                                        >
                                            <option value="">Choose a product</option>
                                            {products.map((p) => (
                                                <option key={p._id} value={p._id}>
                                                    {p.name} ({p.price?.toLocaleString()} Rwf)
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Flash Sale Price (Rwf) *</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={productForm.flashSalePrice}
                                            onChange={(e) => setProductForm({ ...productForm, flashSalePrice: e.target.value })}
                                            placeholder="Discounted price"
                                            required
                                            min="0"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Stock Limit (Optional)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={productForm.stockLimit}
                                            onChange={(e) => setProductForm({ ...productForm, stockLimit: e.target.value })}
                                            placeholder="Leave empty for unlimited"
                                            min="1"
                                        />
                                    </div>

                                    <button type="submit" className="btn-submit">
                                        <FaPlus /> Add Product
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
