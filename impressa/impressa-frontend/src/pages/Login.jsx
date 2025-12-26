import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "../utils/axiosInstance";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { FaEnvelope, FaLock, FaArrowRight, FaShieldAlt, FaArrowLeft, FaGoogle } from "react-icons/fa";
import TrendingProductsSidebar from "../components/TrendingProductsSidebar";
import "../styles/Auth.css";

function Login() {
  const [step, setStep] = useState("credentials"); // 'credentials' or 'otp'
  const [form, setForm] = useState({ email: "", password: "", otp: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { mergeCart } = useCart();
  const { login } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGoogleLogin = () => {
    window.location.href = (process.env.REACT_APP_API_URL || "http://localhost:5000/api") + "/auth/google";
  };

  const handleCredentialsSubmit = async (e) => {
    // ... logic remains same ...
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      const { accessToken, refreshToken, user } = res.data;

      if (user.role === "admin") {
        await axios.post("/auth/admin/login-step1", {
          email: form.email,
          password: form.password,
        });
        setStep("otp");
      } else {
        login(accessToken, refreshToken, user);
        await mergeCart();

        // Smart redirection
        const from = location.state?.from?.pathname;
        if (from) {
          navigate(from, { replace: true });
        } else if (user.role === "seller") {
          navigate("/seller/dashboard");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("/auth/admin/login-step2", {
        email: form.email,
        otp: form.otp,
      });
      const { token, refreshToken, user } = res.data;
      login(token, refreshToken, user);
      await mergeCart();

      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === "admin") navigate("/admin");
      else if (user.role === "seller") navigate("/seller/dashboard");
      else navigate("/dashboard");
    } catch (err) {
      setError("Invalid or expired OTP");
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
              {step === "otp" ? "Security Verification" : "Welcome Back"}
            </h2>
            <p className="auth-subtitle">
              {step === "otp"
                ? "Please enter the OTP sent to your email."
                : "Sign in to access your dashboard."}
            </p>
          </div>

          {error && (
            <div className="auth-error">
              <div className="auth-error-content">
                <div className="flex-shrink-0">
                  <svg className="auth-error-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="auth-error-text">{error}</p>
                </div>
              </div>
            </div>
          )}

          {step === "credentials" ? (
            <form className="form-space" onSubmit={handleCredentialsSubmit}>
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

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <div className="input-icon">
                    <FaLock />
                  </div>
                  <input
                    name="password"
                    type="password"
                    required
                    className="form-input"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-actions">
                <div className="checkbox-wrapper">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="form-checkbox"
                  />
                  <label htmlFor="remember-me" className="checkbox-label">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link to="/forgot-password" className="forgot-link">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-submit"
                >
                  {loading ? "Signing in..." : "Sign in"}
                  {!loading && <FaArrowRight />}
                </button>

                <div className="auth-separator">
                  <div className="separator-line"></div>
                  <div className="separator-text-wrapper">
                    <span>Or continue with</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="btn-google"
                >
                  <FaGoogle className="google-icon" />
                  Continue with Google
                </button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/register" className="forgot-link" style={{ fontWeight: 'bold' }}>
                    Create one now
                  </Link>
                </p>
              </div>
            </form>
          ) : (
            <form className="form-space" onSubmit={handleOtpSubmit}>
              <div className="text-center mb-6">
                <div className="otp-icon-wrapper">
                  <FaShieldAlt className="text-3xl" />
                </div>
                <p className="text-sm text-gray-500">We've sent a verification code to your email.</p>
              </div>

              <div>
                <label className="form-label">One-Time Password</label>
                <input
                  name="otp"
                  type="text"
                  required
                  className="form-input otp-input"
                  placeholder="••••••"
                  value={form.otp}
                  onChange={handleChange}
                  maxLength={6}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-submit btn-verify"
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep("credentials")}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Back to login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;