import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../utils/axiosInstance";
import { FaTrash, FaEdit, FaPlus, FaCloudDownloadAlt } from "react-icons/fa";
import "./AdminTax.css";

function AdminTax() {
    const [rates, setRates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        country: "*",
        city: "*",
        rate: 0,
        priority: 1,
        shipping: true
    });
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        fetchRates();
    }, []);

    const fetchRates = async () => {
        try {
            const { data } = await api.get("/taxes");
            setRates(data.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching rates:", error);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this tax rate?")) {
            try {
                await api.delete(`/taxes/${id}`);
                fetchRates();
            } catch (error) {
                console.error("Error deleting rate:", error);
            }
        }
    };

    const handleFetchLiveRates = async () => {
        setFetching(true);
        try {
            const { data } = await api.post("/taxes/fetch");
            alert(data.message || "Rates fetched successfully");
            fetchRates();
        } catch (error) {
            console.error("Error fetching live rates:", error);
            alert("Failed to fetch live rates");
        } finally {
            setFetching(false);
        }
    };

    const handleEdit = (rate) => {
        setFormData({
            name: rate.name,
            country: rate.country,
            city: rate.city,
            rate: rate.rate,
            priority: rate.priority,
            shipping: rate.shipping
        });
        setIsEdit(true);
        setEditId(rate._id);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await api.put(`/taxes/${editId}`, formData);
            } else {
                await api.post("/taxes", formData);
            }
            setShowModal(false);
            resetForm();
            fetchRates();
        } catch (error) {
            console.error("Error saving rate:", error);
            alert("Failed to save tax rate");
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            country: "*",
            city: "*",
            rate: 0,
            priority: 1,
            shipping: true
        });
        setIsEdit(false);
        setEditId(null);
    };

    return (
        <div className="tax-layout">
            <Sidebar />
            <div className="tax-main">
                <Topbar title="Tax Rates" />
                <main className="tax-content">
                    <div className="tax-header-row">
                        <div className="tax-actions">
                            <button
                                onClick={handleFetchLiveRates}
                                disabled={fetching}
                                className="btn-fetch-rates"
                            >
                                <FaCloudDownloadAlt /> {fetching ? "Fetching..." : "Fetch Live Rates"}
                            </button>
                            <button
                                onClick={() => {
                                    resetForm();
                                    setShowModal(true);
                                }}
                                className="btn-add-rate"
                            >
                                <FaPlus /> Add Rate
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <p className="state-loading">Loading...</p>
                    ) : (
                        <div className="tax-table-container">
                            <table className="tax-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Country</th>
                                        <th>City</th>
                                        <th>Rate %</th>
                                        <th>Priority</th>
                                        <th>Shipping</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rates.map((rate) => (
                                        <tr key={rate._id}>
                                            <td className="cell-name">{rate.name}</td>
                                            <td className="cell-meta">{rate.country}</td>
                                            <td className="cell-meta">{rate.city}</td>
                                            <td className="cell-rate">{rate.rate}%</td>
                                            <td className="cell-meta">{rate.priority}</td>
                                            <td>
                                                <span className="cell-badge">
                                                    {rate.shipping ? "Yes" : "No"}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleEdit(rate)} className="btn-icon edit">
                                                        <FaEdit />
                                                    </button>
                                                    <button onClick={() => handleDelete(rate._id)} className="btn-icon delete">
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {rates.length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="state-empty">
                                                No tax rates defined.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </div>

            {/* Add/Edit Rate Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 className="modal-title">{isEdit ? 'Edit Tax Rate' : 'Add Tax Rate'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Tax Name</label>
                                <input
                                    type="text"
                                    required
                                    className="form-input"
                                    placeholder="e.g. VAT"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="form-row">
                                <div>
                                    <label className="form-label">Country Code</label>
                                    <input
                                        type="text"
                                        required
                                        className="form-input"
                                        placeholder="*"
                                        value={formData.country}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">City</label>
                                    <input
                                        type="text"
                                        required
                                        className="form-input"
                                        placeholder="*"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div>
                                    <label className="form-label">Rate (%)</label>
                                    <input
                                        type="number"
                                        required
                                        step="0.01"
                                        className="form-input"
                                        value={formData.rate}
                                        onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Priority</label>
                                    <input
                                        type="number"
                                        required
                                        className="form-input"
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={formData.shipping}
                                        onChange={(e) => setFormData({ ...formData, shipping: e.target.checked })}
                                    />
                                    <span>Apply to shipping</span>
                                </label>
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
                                    {isEdit ? 'Save Changes' : 'Add Rate'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminTax;
