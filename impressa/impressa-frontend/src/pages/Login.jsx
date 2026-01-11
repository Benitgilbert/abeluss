import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "../utils/axiosInstance";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { FaEnvelope, FaLock, FaArrowRight, FaShieldAlt, FaArrowLeft, FaGoogle } from "react-icons/fa";
import TrendingProductsSidebar from "../components/TrendingProductsSidebar";

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
    <div className="min-h-screen flex bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Left Side - Trending Products */}
      <TrendingProductsSidebar />

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white dark:bg-slate-950 relative overflow-hidden">
        {/* Decorative background elements for dark mode */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/5 dark:bg-violet-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/5 dark:bg-indigo-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

        <Link
          to="/"
          className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 dark:text-gray-400 font-bold hover:text-violet-600 dark:hover:text-violet-400 transition-colors group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Home
        </Link>

        <div className="mx-auto w-full max-w-sm lg:w-96 relative z-10">
          <div className="text-center lg:text-left mb-10">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
              {step === "otp" ? "Security Verification" : "Welcome Back"}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              {step === "otp"
                ? "Please enter the OTP sent to your email."
                : "Sign in to access your dashboard."}
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 rounded-r-2xl flex items-start gap-3 animate-head-shake">
              <FaShieldAlt className="text-red-500 mt-1 shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400 font-bold leading-tight">{error}</p>
            </div>
          )}

          {step === "credentials" ? (
            <form className="space-y-6" onSubmit={handleCredentialsSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Email address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-violet-600 transition-colors">
                    <FaEnvelope />
                  </div>
                  <input
                    name="email"
                    type="email"
                    required
                    className="block w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-600/20 focus:border-violet-600 transition-all shadow-inner"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-violet-600 transition-colors">
                    <FaLock />
                  </div>
                  <input
                    name="password"
                    type="password"
                    required
                    className="block w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-600/20 focus:border-violet-600 transition-all shadow-inner"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-violet-600 focus:ring-violet-600 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm font-bold text-gray-900 dark:text-gray-300 cursor-pointer">
                    Remember me
                  </label>
                </div>

                <Link to="/forgot-password" size="sm" className="text-sm font-bold text-violet-600 dark:text-violet-400 hover:text-violet-500 transition-colors">
                  Forgot password?
                </Link>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-4 px-6 bg-violet-600 text-white rounded-2xl font-black text-lg hover:bg-violet-700 transition-all shadow-lg shadow-violet-200 dark:shadow-none active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                  {loading ? "Signing in..." : "Sign in"}
                  {!loading && <FaArrowRight className="group-hover:translate-x-1 transition-transform" />}
                </button>

                <div className="relative my-8 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100 dark:border-slate-800"></div>
                  </div>
                  <div className="relative bg-white dark:bg-slate-950 px-4 inline-block">
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Or continue with</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition-all active:scale-[0.98] shadow-sm"
                >
                  <FaGoogle className="text-red-500 text-lg" />
                  Continue with Google
                </button>
              </div>

              <p className="mt-8 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                Don't have an account?{' '}
                <Link to="/register" className="font-black text-violet-600 dark:text-violet-400 hover:text-violet-500 transition-colors">
                  Create one now
                </Link>
              </p>
            </form>
          ) : (
            <form className="space-y-8" onSubmit={handleOtpSubmit}>
              <div className="text-center">
                <div className="w-20 h-20 bg-violet-50 dark:bg-violet-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-violet-600">
                  <FaShieldAlt className="text-4xl" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">We've sent a verification code to your email.</p>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 block text-center">One-Time Password</label>
                <input
                  name="otp"
                  type="text"
                  required
                  className="block w-full px-4 py-5 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-gray-900 dark:text-white text-center font-mono text-3xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-violet-600/20 focus:border-violet-600 transition-all shadow-inner"
                  placeholder="••••••"
                  value={form.otp}
                  onChange={handleChange}
                  maxLength={6}
                />
              </div>

              <div className="space-y-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 dark:shadow-none active:scale-[0.98] disabled:opacity-70"
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                </button>

                <button
                  type="button"
                  onClick={() => setStep("credentials")}
                  className="w-full text-sm font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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