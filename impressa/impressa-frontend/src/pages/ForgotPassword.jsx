import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaKey, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import TrendingProductsSidebar from "../components/TrendingProductsSidebar";

function ForgotPassword() {
  const [step, setStep] = useState("request");
  const [form, setForm] = useState({ email: "", token: "", newPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await axios.post("http://localhost:5000/api/auth/request-password-reset", {
        email: form.email,
      });
      setStep("confirm");
      setSuccess("Reset code sent! Please check your email.");
    } catch (err) {
      console.error("Request failed:", err);
      setError("Failed to send reset code. Please check your email.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await axios.post("http://localhost:5000/api/auth/confirm-password-reset", {
        email: form.email,
        token: form.token,
        newPassword: form.newPassword,
      });
      alert("Password reset successful! Please login.");
      navigate("/login");
    } catch (err) {
      console.error("Reset failed:", err);
      setError("Invalid code or password reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Left Side - Trending Products */}
      <TrendingProductsSidebar />

      {/* Right Side - Form */}
      <div className="auth-form-wrapper">
        <Link to="/" className="auth-back-link">
          <FaArrowLeft /> Back to Home
        </Link>

        <div className="auth-content">
          <div className="auth-header">
            <h2 className="auth-title">
              {step === "request" ? "Reset Password" : "Set New Password"}
            </h2>
            <p className="auth-subtitle">
              {step === "request"
                ? "Enter your email to receive a reset code."
                : "Enter the code sent to your email and your new password."}
            </p>
          </div>

          {error && (
            <div className="auth-error">
              <div className="auth-error-content">
                <div className="auth-error-icon">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="auth-error-text">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="auth-success">
              <div className="auth-success-content">
                <div className="auth-success-icon">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="auth-success-text">{success}</p>
                </div>
              </div>
            </div>
          )}

          {step === "request" ? (
            <form className="form-space" onSubmit={handleRequest}>
              <div className="form-group">
                <label className="form-label">Email address</label>
                <div className="input-wrapper">
                  <div className="input-icon">
                    <FaEnvelope />
                  </div>
                  <input
                    name="email"
                    type="email"
                    required
                    className="form-input"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-submit"
                >
                  {loading ? "Sending..." : "Send Reset Code"}
                  {!loading && <FaArrowRight />}
                </button>
              </div>

              <div className="text-center">
                <Link to="/login" className="forgot-link" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <FaArrowLeft style={{ fontSize: '0.75rem' }} /> Back to Login
                </Link>
              </div>
            </form>
          ) : (
            <form className="form-space" onSubmit={handleConfirm}>
              <div className="form-group">
                <label className="form-label">Reset Code</label>
                <div className="input-wrapper">
                  <div className="input-icon">
                    <FaKey />
                  </div>
                  <input
                    name="token"
                    type="text"
                    required
                    className="form-input"
                    placeholder="Enter code"
                    value={form.token}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="input-wrapper">
                  <div className="input-icon">
                    <FaLock />
                  </div>
                  <input
                    name="newPassword"
                    type="password"
                    required
                    className="form-input"
                    placeholder="New password"
                    value={form.newPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-submit btn-verify"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                  {!loading && <FaArrowRight />}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep("request")}
                  className="forgot-link"
                >
                  Resend Code
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;