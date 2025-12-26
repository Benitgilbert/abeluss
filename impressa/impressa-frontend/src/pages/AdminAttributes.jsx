import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import axios from "../utils/axiosInstance";
import { FaTrash, FaEdit, FaPlus } from "react-icons/fa";
import "./AdminAttributes.css";

function AdminAttributes() {
    const [attributes, setAttributes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        type: "select",
        values: [],
    });
    const [newValue, setNewValue] = useState("");
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchAttributes();
    }, []);

    const fetchAttributes = async () => {
        try {
            const { data } = await axios.get("/attributes");
            setAttributes(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching attributes:", error);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure? This will remove this attribute from all products.")) {
            try {
                await axios.delete(`/attributes/${id}`);
                fetchAttributes();
            } catch (error) {
                console.error("Error deleting attribute:", error);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`/attributes/${editingId}`, formData);
            } else {
                await axios.post("/attributes", formData);
            }
            setShowModal(false);
            setFormData({ name: "", type: "select", values: [] });
            setEditingId(null);
            fetchAttributes();
        } catch (error) {
            console.error("Error saving attribute:", error);
            alert("Failed to save attribute");
        }
    };

    const handleEdit = (attribute) => {
        setEditingId(attribute._id);
        setFormData({
            name: attribute.name,
            type: attribute.type,
            values: attribute.values,
        });
        setShowModal(true);
    };

    const addValue = () => {
        if (!newValue.trim()) return;
        const slug = newValue.toLowerCase().replace(/ /g, "-");
        setFormData({
            ...formData,
            values: [...formData.values, { name: newValue, slug, value: newValue }],
        });
        setNewValue("");
    };

    const removeValue = (index) => {
        const newValues = [...formData.values];
        newValues.splice(index, 1);
        setFormData({ ...formData, values: newValues });
    };

    return (
        <div className="admin-attributes-layout">
            <Sidebar />
            <div className="admin-attributes-main">
                <Topbar title="Attributes" />
                <main className="admin-attributes-content">
                    <div className="attributes-header">
                        <button
                            onClick={() => {
                                setEditingId(null);
                                setFormData({ name: "", type: "select", values: [] });
                                setShowModal(true);
                            }}
                            className="btn-add-attribute"
                        >
                            <FaPlus /> Add Attribute
                        </button>
                    </div>

                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <div className="attributes-table-container">
                            <table className="attributes-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Type</th>
                                        <th>Terms</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attributes.map((attr) => (
                                        <tr key={attr._id}>
                                            <td className="font-medium">{attr.name}</td>
                                            <td className="text-gray-500">{attr.type}</td>
                                            <td className="text-gray-500">
                                                {attr.values.map((v) => v.name).join(", ")}
                                            </td>
                                            <td>
                                                <div className="attributes-actions">
                                                    <button
                                                        onClick={() => handleEdit(attr)}
                                                        className="btn-icon edit"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(attr._id)}
                                                        className="btn-icon delete"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {attributes.length === 0 && (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                                                No attributes found. Create one to get started.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </div>

            {/* Add Attribute Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 className="modal-title">{editingId ? "Edit Attribute" : "Add New Attribute"}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="form-input"
                                    placeholder="e.g. Size, Color"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Type</label>
                                <select
                                    className="form-select"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="select">Select (Dropdown)</option>
                                    <option value="color">Color</option>
                                    <option value="label">Label</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Terms (Values)</label>
                                <div className="term-input-group">
                                    <input
                                        type="text"
                                        className="form-input"
                                        style={{ flex: 1 }}
                                        placeholder="Add term (e.g. Small)"
                                        value={newValue}
                                        onChange={(e) => setNewValue(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addValue())}
                                    />
                                    <button
                                        type="button"
                                        onClick={addValue}
                                        className="btn-add-term"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="terms-list">
                                    {formData.values.map((val, idx) => (
                                        <span key={idx} className="term-badge">
                                            {val.name}
                                            <button type="button" onClick={() => removeValue(idx)} className="term-remove">×</button>
                                        </span>
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
                                    {editingId ? "Update Attribute" : "Create Attribute"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminAttributes;
