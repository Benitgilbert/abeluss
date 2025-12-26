import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../utils/axiosInstance";
import { FaTrash, FaEdit, FaPlus, FaTruck } from "react-icons/fa";
import "./AdminShipping.css";

function AdminShipping() {
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        regions: [{ country: "Rwanda", city: "" }],
        methods: []
    });
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        fetchZones();
    }, []);

    const fetchZones = async () => {
        try {
            const { data } = await api.get("/shipping");
            setZones(data.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching zones:", error);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this zone?")) {
            try {
                await api.delete(`/shipping/${id}`);
                fetchZones();
            } catch (error) {
                console.error("Error deleting zone:", error);
            }
        }
    };

    const handleEdit = (zone) => {
        setFormData({
            name: zone.name,
            regions: zone.regions.length ? zone.regions : [{ country: "Rwanda", city: "" }],
            methods: zone.methods
        });
        setIsEdit(true);
        setEditId(zone._id);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await api.put(`/shipping/${editId}`, formData);
            } else {
                await api.post("/shipping", formData);
            }
            setShowModal(false);
            resetForm();
            fetchZones();
        } catch (error) {
            console.error("Error saving zone:", error);
            alert("Failed to save zone");
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            regions: [{ country: "Rwanda", city: "" }],
            methods: []
        });
        setIsEdit(false);
        setEditId(null);
    };

    const addMethod = () => {
        setFormData({
            ...formData,
            methods: [...formData.methods, { name: "Standard Shipping", type: "flat_rate", cost: 0, isActive: true }]
        });
    };

    const updateMethod = (index, field, value) => {
        const newMethods = [...formData.methods];
        newMethods[index][field] = value;
        setFormData({ ...formData, methods: newMethods });
    };

    const removeMethod = (index) => {
        const newMethods = formData.methods.filter((_, i) => i !== index);
        setFormData({ ...formData, methods: newMethods });
    };

    return (
        <div className="shipping-layout">
            <Sidebar />
            <div className="shipping-main">
                <Topbar title="Shipping Zones" />
                <main className="shipping-content">
                    <div className="shipping-header-row">

                        <button
                            onClick={() => {
                                resetForm();
                                setShowModal(true);
                            }}
                            className="btn-add-zone"
                        >
                            <FaPlus /> Add Zone
                        </button>
                    </div>

                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <div className="zones-grid">
                            {zones.map((zone) => (
                                <div key={zone._id} className="zone-card">
                                    <div className="zone-header">
                                        <div className="zone-info">
                                            <h3>
                                                <FaTruck className="zone-icon" />
                                                {zone.name}
                                            </h3>
                                            <p className="zone-regions">
                                                Regions: {zone.regions.map(r => r.city || r.country).join(", ")}
                                            </p>
                                        </div>
                                        <div className="zone-actions">
                                            <button onClick={() => handleEdit(zone)} className="btn-icon edit">
                                                <FaEdit />
                                            </button>
                                            <button onClick={() => handleDelete(zone._id)} className="btn-icon delete">
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="methods-container">
                                        <h4 className="methods-title">Shipping Methods</h4>
                                        <div>
                                            {zone.methods.map((method, idx) => (
                                                <div key={idx} className="method-item">
                                                    <span>{method.name} ({method.type.replace("_", " ")})</span>
                                                    <span className="method-cost">{method.cost} RWF</span>
                                                </div>
                                            ))}
                                            {zone.methods.length === 0 && <p className="no-methods">No methods defined</p>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {zones.length === 0 && (
                                <div className="empty-zones">
                                    <p>No shipping zones found.</p>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* Add/Edit Zone Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 className="modal-title">{isEdit ? 'Edit Zone' : 'Create Zone'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Zone Name</label>
                                <input
                                    type="text"
                                    required
                                    className="form-input"
                                    placeholder="e.g. Kigali Metro"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Regions</label>
                                {formData.regions.map((region, idx) => (
                                    <div key={idx} className="region-row">
                                        <input
                                            type="text"
                                            placeholder="Country"
                                            className="form-input"
                                            value={region.country}
                                            onChange={(e) => {
                                                const newRegions = [...formData.regions];
                                                newRegions[idx].country = e.target.value;
                                                setFormData({ ...formData, regions: newRegions });
                                            }}
                                        />
                                        <input
                                            type="text"
                                            placeholder="City (Optional)"
                                            className="form-input"
                                            value={region.city}
                                            onChange={(e) => {
                                                const newRegions = [...formData.regions];
                                                newRegions[idx].city = e.target.value;
                                                setFormData({ ...formData, regions: newRegions });
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="form-group">
                                <div className="methods-header">
                                    <label className="form-label">Shipping Methods</label>
                                    <button type="button" onClick={addMethod} className="btn-add-text">+ Add Method</button>
                                </div>
                                <div>
                                    {formData.methods.map((method, idx) => (
                                        <div key={idx} className="method-form-item">
                                            <button
                                                type="button"
                                                onClick={() => removeMethod(idx)}
                                                className="btn-remove-method"
                                            >
                                                <FaTrash size={12} />
                                            </button>
                                            <div className="method-grid">
                                                <div>
                                                    <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>Name</label>
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        style={{ padding: '0.4rem', fontSize: '0.8rem' }}
                                                        value={method.name}
                                                        onChange={(e) => updateMethod(idx, "name", e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>Type</label>
                                                    <select
                                                        className="form-input"
                                                        style={{ padding: '0.4rem', fontSize: '0.8rem' }}
                                                        value={method.type}
                                                        onChange={(e) => updateMethod(idx, "type", e.target.value)}
                                                    >
                                                        <option value="flat_rate">Flat Rate</option>
                                                        <option value="free_shipping">Free Shipping</option>
                                                        <option value="local_pickup">Local Pickup</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>Cost</label>
                                                    <input
                                                        type="number"
                                                        className="form-input"
                                                        style={{ padding: '0.4rem', fontSize: '0.8rem' }}
                                                        value={method.cost}
                                                        onChange={(e) => updateMethod(idx, "cost", e.target.value)}
                                                    />
                                                </div>
                                                {method.type === "free_shipping" && (
                                                    <div>
                                                        <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>Min Order</label>
                                                        <input
                                                            type="number"
                                                            className="form-input"
                                                            style={{ padding: '0.4rem', fontSize: '0.8rem' }}
                                                            value={method.minOrderAmount}
                                                            onChange={(e) => updateMethod(idx, "minOrderAmount", e.target.value)}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
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
                                    {isEdit ? 'Save Changes' : 'Create Zone'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminShipping;
