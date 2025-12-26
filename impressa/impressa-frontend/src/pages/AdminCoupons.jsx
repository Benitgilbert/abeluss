import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../utils/axiosInstance";
import { FaTrash, FaEdit, FaPlus } from "react-icons/fa";
import "./AdminCoupons.css";

function AdminCoupons() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        code: "",
        type: "fixed",
        value: "",
        minSpend: "",
        usageLimit: "",
        expiresAt: "",
        isActive: true
    });
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const { data } = await api.get("/coupons");
            setCoupons(data.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching coupons:", error);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this coupon?")) {
            try {
                await api.delete(`/coupons/${id}`);
                fetchCoupons();
            } catch (error) {
                console.error("Error deleting coupon:", error);
            }
        }
    };

    const handleEdit = (coupon) => {
        setFormData({
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            minSpend: coupon.minSpend || "",
            usageLimit: coupon.usageLimit || "",
            expiresAt: coupon.expiresAt ? coupon.expiresAt.split('T')[0] : "",
            isActive: coupon.isActive
        });
        setIsEdit(true);
        setEditId(coupon._id);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                value: Number(formData.value),
                minSpend: formData.minSpend ? Number(formData.minSpend) : 0,
                usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
            };

            if (isEdit) {
                await api.put(`/coupons/${editId}`, payload);
            } else {
                await api.post("/coupons", payload);
            }
            setShowModal(false);
            setFormData({
                code: "",
                type: "fixed",
                value: "",
                minSpend: "",
                usageLimit: "",
                expiresAt: "",
                isActive: true
            });
            setIsEdit(false);
            setEditId(null);
            fetchCoupons();
        } catch (error) {
            console.error("Error saving coupon:", error);
            alert(error.response?.data?.message || "Failed to save coupon");
        }
    };

    return (
        <div className="admin-coupons-layout">
            <Sidebar />
            <div className="admin-coupons-main">
                <Topbar title="Coupons" />
                <main className="admin-coupons-content">
                    <div className="coupons-header">
                        <button
                            onClick={() => {
                                setFormData({
                                    code: "",
                                    type: "fixed",
                                    value: "",
                                    minSpend: "",
                                    usageLimit: "",
                                    expiresAt: "",
                                    isActive: true
                                });
                                setIsEdit(false);
                                setShowModal(true);
                            }}
                            className="btn-add-coupon"
                        >
                            <FaPlus /> Add Coupon
                        </button>
                    </div>

                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <div className="coupons-table-container">
                            <table className="coupons-table">
                                <thead>
                                    <tr>
                                        <th>Code</th>
                                        <th>Type</th>
                                        <th>Value</th>
                                        <th>Usage</th>
                                        <th>Expiry</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {coupons.map((coupon) => (
                                        <tr key={coupon._id}>
                                            <td className="coupon-code">{coupon.code}</td>
                                            <td className="coupon-type">{coupon.type.replace('_', ' ')}</td>
                                            <td className="font-medium">
                                                {coupon.type === 'percentage' ? `${coupon.value}%` : coupon.value}
                                            </td>
                                            <td className="text-gray-500">
                                                {coupon.usageCount} / {coupon.usageLimit || '∞'}
                                            </td>
                                            <td className="text-gray-500">
                                                {new Date(coupon.expiresAt).toLocaleDateString()}
                                            </td>
                                            <td>
                                                <span className={`status-badge ${coupon.isActive ? 'status-active' : 'status-inactive'}`}>
                                                    {coupon.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="coupons-actions">
                                                    <button
                                                        onClick={() => handleEdit(coupon)}
                                                        className="btn-icon edit"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(coupon._id)}
                                                        className="btn-icon delete"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {coupons.length === 0 && (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                                                No coupons found. Create one to get started.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </div>

            {/* Add/Edit Coupon Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 className="modal-title">{isEdit ? 'Edit Coupon' : 'Create Coupon'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group span-full">
                                    <label className="form-label">Code</label>
                                    <input
                                        type="text"
                                        required
                                        className="form-input uppercase"
                                        placeholder="e.g. SUMMER2024"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Type</label>
                                    <select
                                        className="form-select"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="fixed">Fixed Amount</option>
                                        <option value="percentage">Percentage</option>
                                        <option value="free_shipping">Free Shipping</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Value</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        className="form-input"
                                        placeholder="0.00"
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Min Spend</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="form-input"
                                        placeholder="Optional"
                                        value={formData.minSpend}
                                        onChange={(e) => setFormData({ ...formData, minSpend: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Usage Limit</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="form-input"
                                        placeholder="Optional"
                                        value={formData.usageLimit}
                                        onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Expires At</label>
                                    <input
                                        type="date"
                                        required
                                        className="form-input"
                                        value={formData.expiresAt}
                                        onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                    />
                                </div>
                                <div className="form-group checkbox-wrapper">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        />
                                        Coupon is active
                                    </label>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="btn-cancel"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-save"
                                >
                                    {isEdit ? 'Save Changes' : 'Create Coupon'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminCoupons;
