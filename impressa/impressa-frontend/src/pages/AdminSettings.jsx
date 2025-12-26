import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../utils/axiosInstance";
import { FaUser, FaEnvelope, FaLock, FaCamera, FaSave, FaSpinner } from "react-icons/fa";
import "./AdminSettings.css";

function AdminSettings() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profileForm, setProfileForm] = useState({ name: "", email: "", password: "", profileImage: null });
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await api.get("/auth/me");
            setUser(response.data);
            setProfileForm({
                name: response.data.name,
                email: response.data.email,
                password: "",
                profileImage: null
            });
            setLoading(false);
        } catch (error) {
            console.error("Error fetching profile:", error);
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileForm({ ...profileForm, profileImage: file });
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const updateProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append("name", profileForm.name);
            formData.append("email", profileForm.email);
            if (profileForm.password) formData.append("password", profileForm.password);
            if (profileForm.profileImage) formData.append("profileImage", profileForm.profileImage);

            await api.put("/auth/me", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            alert("Profile updated successfully!");
            fetchData();
        } catch (error) {
            console.error("Update failed:", error);
            alert("Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
        </div>
    );

    return (
        <div className="settings-layout">
            <Sidebar />
            <div className="settings-main">
                <Topbar title="Account Settings" />
                <main className="settings-content">


                    <div className="settings-grid">
                        {/* Profile Card */}
                        <div className="profile-card-container">
                            <div className="profile-card">
                                <div className="profile-banner"></div>
                                <div className="profile-avatar-wrapper">
                                    <div className="profile-avatar">
                                        {previewImage ? (
                                            <img src={previewImage} alt="Preview" />
                                        ) : user?.profileImage ? (
                                            <img src={`http://localhost:5000${user.profileImage}`} alt={user.name} />
                                        ) : (
                                            <div className="profile-avatar-placeholder">
                                                {user?.name?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <label className="btn-upload-avatar">
                                        <FaCamera />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                    </label>
                                </div>
                                <h2 className="profile-name">{user?.name}</h2>
                                <p className="profile-role">{user?.role.toUpperCase()}</p>
                                <div className="profile-badges">
                                    <span className="badge badge-active">Active</span>
                                    <span className="badge badge-verified">Verified</span>
                                </div>
                            </div>
                        </div>

                        {/* Settings Form */}
                        <div className="settings-form-container">
                            <div className="settings-card">
                                <h3 className="settings-card-title">Profile Details</h3>
                                <form onSubmit={updateProfile} className="settings-form">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Full Name</label>
                                            <div className="input-wrapper">
                                                <div className="input-icon">
                                                    <FaUser />
                                                </div>
                                                <input
                                                    type="text"
                                                    className="settings-input"
                                                    value={profileForm.name}
                                                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Email Address</label>
                                            <div className="input-wrapper">
                                                <div className="input-icon">
                                                    <FaEnvelope />
                                                </div>
                                                <input
                                                    type="email"
                                                    className="settings-input"
                                                    value={profileForm.email}
                                                    onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            New Password <span className="form-group-note">(Leave blank to keep current)</span>
                                        </label>
                                        <div className="input-wrapper">
                                            <div className="input-icon">
                                                <FaLock />
                                            </div>
                                            <input
                                                type="password"
                                                className="settings-input"
                                                placeholder="••••••••"
                                                value={profileForm.password}
                                                onChange={e => setProfileForm({ ...profileForm, password: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-actions">
                                        <button
                                            type="button"
                                            onClick={() => fetchData()}
                                            className="btn-cancel"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="btn-save"
                                        >
                                            {saving ? (
                                                <>
                                                    <FaSpinner className="animate-spin" /> Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <FaSave /> Save Changes
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default AdminSettings;
