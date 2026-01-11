import { useState } from "react";
import axios from "../utils/axiosInstance"; // ✅ adjust path to match your actual axios config file

function UserCreateForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post("/admin/users", formData); // ✅ baseURL already includes /api
      onSuccess?.();
      setFormData({ name: "", email: "", password: "", role: "customer" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="modal-form-grid">
      <div className="form-group full-width">
        <label className="form-label">Full Name</label>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="form-input"
          placeholder="e.g. John Doe"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Email Address</label>
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          type="email"
          className="form-input"
          placeholder="john@example.com"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Password</label>
        <input
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          type="password"
          className="form-input"
          placeholder="••••••••"
        />
      </div>

      <div className="form-group full-width">
        <label className="form-label">User Role</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="form-select"
        >
          {["customer", "cashier", "inventory", "delivery", "admin"].map(role => (
            <option key={role} value={role}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-500 text-sm rounded-lg full-width">{error}</div>}

      <div className="modal-footer full-width -mx-6 -mb-6 mt-8">
        <button type="button" onClick={onSuccess} className="btn-cancel">Cancel</button>
        <button
          type="submit"
          disabled={loading}
          className="btn-submit"
        >
          {loading ? "Creating..." : "Create User"}
        </button>
      </div>
    </form>
  );
}

export default UserCreateForm;