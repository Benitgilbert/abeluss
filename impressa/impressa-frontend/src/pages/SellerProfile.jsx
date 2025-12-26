import { useState, useEffect } from "react";
import { FaSave, FaStore, FaCamera, FaEnvelope, FaPhone, FaUser } from "react-icons/fa";
import api from "../utils/axiosInstance";
import SellerSidebar from "../components/SellerSidebar";
import Header from "../components/Header";
import { useToast } from "../context/ToastContext";
import "./SellerProducts.css"; // Reuse existing styles

const SellerProfile = () => {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        storeName: "",
        storeDescription: "",
        storePhone: "",
        profileImage: null,
        storeLogo: null
    });
    const [previews, setPreviews] = useState({
        profileImage: null,
        storeLogo: null
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get("/auth/profile");
            setUser(res.data);
            setFormData({
                name: res.data.name || "",
                email: res.data.email || "",
                storeName: res.data.storeName || "",
                storeDescription: res.data.storeDescription || "",
                storePhone: res.data.storePhone || "",
                profileImage: null,
                storeLogo: null
            });
            setPreviews({
                profileImage: res.data.profileImage,
                storeLogo: res.data.storeLogo
            });
        } catch (err) {
            console.error("Failed to load profile", err);
            addToast("Failed to load profile data", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            const file = files[0];
            setFormData(prev => ({ ...prev, [name]: file }));
            setPreviews(prev => ({ ...prev, [name]: URL.createObjectURL(file) }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("email", formData.email);
            data.append("storeName", formData.storeName);
            data.append("storeDescription", formData.storeDescription);
            data.append("storePhone", formData.storePhone);

            if (formData.profileImage) data.append("profileImage", formData.profileImage);
            if (formData.storeLogo) data.append("storeLogo", formData.storeLogo);

            const res = await api.put("/auth/profile", data, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            setUser(res.data);
            addToast("Profile updated successfully!", "success");
        } catch (err) {
            console.error("Failed to update profile", err);
            addToast(err.response?.data?.message || "Failed to update profile", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="seller-layout">
                <SellerSidebar />
                <div className="seller-main-content">
                    <Header />
                    <div className="loading-container">Loading profile...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="seller-layout">
            <SellerSidebar />
            <div className="seller-main-content">
                <Header />
                <div className="seller-page-container">
                    <div className="page-header">
                        <div className="header-title">
                            <h1>My Store Profile</h1>
                            <p>Manage your account and store information</p>
                        </div>
                    </div>

                    <div className="add-product-container" style={{ maxWidth: '900px' }}>
                        <form onSubmit={handleSubmit} className="product-form">

                            {/* Personal Info Section */}
                            <div className="form-section">
                                <h3><FaUser style={{ marginRight: '0.5rem' }} /> Personal Information</h3>
                                <div className="form-row">
                                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div className="image-upload-circle" style={{
                                            width: '120px', height: '120px', borderRadius: '50%',
                                            overflow: 'hidden', border: '2px solid #eee', marginBottom: '1rem',
                                            position: 'relative'
                                        }}>
                                            <img src={previews.profileImage || "https://via.placeholder.com/150"} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <label htmlFor="profileImage" style={{
                                                position: 'absolute', bottom: 0, left: 0, right: 0,
                                                background: 'rgba(0,0,0,0.6)', color: 'white',
                                                textAlign: 'center', padding: '0.25rem', cursor: 'pointer', fontSize: '0.8rem'
                                            }}>
                                                <FaCamera /> Edit
                                            </label>
                                            <input type="file" id="profileImage" name="profileImage" accept="image/*" onChange={handleFileChange} hidden />
                                        </div>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div className="form-group">
                                            <label>Full Name</label>
                                            <div className="input-icon-wrapper">
                                                <FaUser className="input-icon" />
                                                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Email Address</label>
                                            <div className="input-icon-wrapper">
                                                <FaEnvelope className="input-icon" />
                                                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Store Info Section */}
                            <div className="form-section">
                                <h3><FaStore style={{ marginRight: '0.5rem' }} /> Store Details</h3>
                                <div className="form-row">
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Store Name</label>
                                        <input type="text" name="storeName" value={formData.storeName} onChange={handleChange} placeholder="My Awesome Store" />
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Store Phone</label>
                                        <div className="input-icon-wrapper">
                                            <FaPhone className="input-icon" />
                                            <input type="text" name="storePhone" value={formData.storePhone} onChange={handleChange} placeholder="+250 7..." />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Store Description</label>
                                    <textarea name="storeDescription" value={formData.storeDescription} onChange={handleChange} rows="4" placeholder="Tell customers about your store..."></textarea>
                                </div>

                                <div className="form-group">
                                    <label>Store Logo</label>
                                    <div className="image-upload-box" style={{ padding: '1rem' }}>
                                        <input type="file" id="storeLogo" name="storeLogo" accept="image/*" onChange={handleFileChange} hidden />
                                        <label htmlFor="storeLogo" className="upload-label" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            {previews.storeLogo ? (
                                                <img src={previews.storeLogo} alt="Logo Preview" style={{ width: '80px', height: '80px', objectFit: 'contain', border: '1px solid #ddd', borderRadius: '8px' }} />
                                            ) : (
                                                <div style={{ width: '80px', height: '80px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', color: '#999' }}>
                                                    <FaStore size={24} />
                                                </div>
                                            )}
                                            <div>
                                                <span style={{ display: 'block', fontWeight: '500', color: '#1a1a1a' }}>Upload Store Logo</span>
                                                <span style={{ fontSize: '0.85rem', color: '#666' }}>Recommended size: 500x500px</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn-primary" disabled={saving}>
                                    <FaSave /> {saving ? "Saving Changes..." : "Save Profile"}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerProfile;
