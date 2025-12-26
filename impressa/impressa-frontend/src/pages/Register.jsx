import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/axiosInstance";
import {
    FaUser, FaEnvelope, FaLock, FaArrowRight, FaArrowLeft, FaStore, FaPhone,
    FaInfoCircle, FaGoogle, FaIdCard, FaBuilding, FaFileUpload, FaFileAlt,
    FaSignature, FaSpinner, FaCheckCircle, FaExclamationTriangle
} from "react-icons/fa";
import TrendingProductsSidebar from "../components/TrendingProductsSidebar";
import "../styles/Register.css";

function Register() {
    const navigate = useNavigate();
    const [isSeller, setIsSeller] = useState(false);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [termsContent, setTermsContent] = useState("");
    const [termsScrolled, setTermsScrolled] = useState(false);
    const termsRef = useRef(null);

    const [formData, setFormData] = useState({
        // Account Info (Step 1)
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        // Store Info (Step 2 - Seller only)
        storeName: "",
        storeDescription: "",
        storePhone: "",
        // RDB Documents (Step 3 - Seller only)
        tinNumber: "",
        businessName: "",
        businessType: "sole_proprietor",
        rdbCertificate: null,
        nationalId: null,
        // Terms (Step 4 - Seller only)
        termsAccepted: false,
        digitalSignature: ""
    });

    const [fileNames, setFileNames] = useState({
        rdbCertificate: "",
        nationalId: ""
    });

    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

    // Fetch Terms & Conditions when seller mode is activated
    useEffect(() => {
        if (isSeller && !termsContent) {
            fetchTerms();
        }
    }, [isSeller]);

    const fetchTerms = async () => {
        try {
            const res = await fetch(`${API_URL}/seller-verification/terms`);
            const data = await res.json();
            if (data.success) {
                setTermsContent(data.data.content);
            }
        } catch (err) {
            console.error("Failed to fetch terms");
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
            setFileNames(prev => ({ ...prev, [name]: files[0].name }));
        }
    };

    const handleTermsScroll = () => {
        if (termsRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = termsRef.current;
            if (scrollTop + clientHeight >= scrollHeight - 50) {
                setTermsScrolled(true);
            }
        }
    };

    const handleSellerToggle = (e) => {
        const checked = e.target.checked;
        setIsSeller(checked);
        if (!checked) {
            setStep(1); // Reset to step 1 if unchecking seller
            setTermsScrolled(false);
        }
    };

    // Validation for each step
    const validateStep = (stepNum) => {
        setError("");

        switch (stepNum) {
            case 1: // Account Info
                if (!formData.name.trim()) {
                    setError("Full name is required");
                    return false;
                }
                if (!formData.email.trim()) {
                    setError("Email is required");
                    return false;
                }
                if (!formData.password) {
                    setError("Password is required");
                    return false;
                }
                if (formData.password.length < 6) {
                    setError("Password must be at least 6 characters");
                    return false;
                }
                if (formData.password !== formData.confirmPassword) {
                    setError("Passwords do not match");
                    return false;
                }
                return true;

            case 2: // Store Info
                if (!formData.storeName.trim()) {
                    setError("Store name is required");
                    return false;
                }
                if (!formData.storePhone.trim()) {
                    setError("Store phone is required");
                    return false;
                }
                return true;

            case 3: // RDB Documents
                if (!formData.tinNumber.trim()) {
                    setError("TIN number is required");
                    return false;
                }
                const tinRegex = /^\d{9}$/;
                if (!tinRegex.test(formData.tinNumber.replace(/\s/g, ""))) {
                    setError("TIN must be exactly 9 digits");
                    return false;
                }
                if (!formData.businessName.trim()) {
                    setError("Registered business name is required");
                    return false;
                }
                if (!formData.rdbCertificate) {
                    setError("RDB certificate is required");
                    return false;
                }
                return true;

            case 4: // Terms & Signature
                if (!termsScrolled) {
                    setError("Please read the entire terms & conditions");
                    return false;
                }
                if (!formData.termsAccepted) {
                    setError("You must accept the terms & conditions");
                    return false;
                }
                if (!formData.digitalSignature.trim()) {
                    setError("Digital signature is required");
                    return false;
                }
                return true;

            default:
                return true;
        }
    };

    const nextStep = () => {
        if (validateStep(step)) {
            setStep(prev => Math.min(prev + 1, 4));
        }
    };

    const prevStep = () => {
        setStep(prev => Math.max(prev - 1, 1));
    };

    const handleGoogleLogin = () => {
        window.location.href = API_URL + "/auth/google";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // For customers, just validate step 1
        if (!isSeller) {
            if (!validateStep(1)) return;
        } else {
            // For sellers, validate step 4
            if (!validateStep(4)) return;
        }

        setLoading(true);
        try {
            if (isSeller) {
                // Step 1: Register the account first
                const registerPayload = {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: "pending_seller" // Pending until RDB approved
                };

                const registerRes = await api.post("/auth/register", registerPayload);
                const { token } = registerRes.data;

                // Store token temporarily
                localStorage.setItem("authToken", token);

                // Step 2: Submit seller verification with RDB documents
                const sellerData = new FormData();
                sellerData.append("storeName", formData.storeName);
                sellerData.append("storeDescription", formData.storeDescription);
                sellerData.append("storePhone", formData.storePhone);
                sellerData.append("tinNumber", formData.tinNumber);
                sellerData.append("businessName", formData.businessName);
                sellerData.append("businessType", formData.businessType);
                sellerData.append("termsAccepted", formData.termsAccepted);
                sellerData.append("digitalSignature", formData.digitalSignature);
                sellerData.append("rdbCertificate", formData.rdbCertificate);
                if (formData.nationalId) {
                    sellerData.append("nationalId", formData.nationalId);
                }

                await api.post("/seller-verification/apply", sellerData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`
                    }
                });

                setSuccess(true);
            } else {
                // Customer registration
                const payload = {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: "customer"
                };

                await api.post("/auth/register", payload);
                alert("Registration successful! Please login.");
                navigate("/login");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    // Success screen for sellers
    if (success) {
        return (
            <div className="register-container">
                <TrendingProductsSidebar />
                <div className="register-form-wrapper">
                    <div className="register-content">
                        <div className="success-card">
                            <FaCheckCircle className="success-icon" />
                            <h2>Application Submitted!</h2>
                            <p>Your seller application has been submitted successfully.</p>
                            <p>Our team will review your RDB documents and you'll receive an email once approved.</p>
                            <div className="success-info">
                                <strong>What happens next?</strong>
                                <ul>
                                    <li>✅ Documents under review (1-3 business days)</li>
                                    <li>📧 Email notification when approved</li>
                                    <li>🏪 Access to your seller dashboard</li>
                                </ul>
                            </div>
                            <button className="btn-submit" onClick={() => navigate("/login")}>
                                Go to Login <FaArrowRight />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Total steps for seller
    const totalSteps = isSeller ? 4 : 1;

    return (
        <div className="register-container">
            <TrendingProductsSidebar />

            <div className="register-form-wrapper">
                <Link to="/" className="register-back-link">
                    <FaArrowLeft /> Back to Home
                </Link>

                <div className="register-content">
                    <div className="register-header">
                        <h2 className="register-title">
                            {isSeller ? (
                                step === 1 ? "Create Account" :
                                    step === 2 ? "Store Information" :
                                        step === 3 ? "RDB Documents" :
                                            "Terms & Conditions"
                            ) : "Create Account"}
                        </h2>
                        {isSeller && step > 1 && (
                            <p className="register-subtitle">Step {step} of 4</p>
                        )}
                    </div>

                    {/* Progress Steps for Seller */}
                    {isSeller && (
                        <div className="progress-steps">
                            <div className={`progress-step ${step >= 1 ? "active" : ""} ${step > 1 ? "completed" : ""}`}>
                                <div className="step-circle">1</div>
                                <span>Account</span>
                            </div>
                            <div className="step-line" />
                            <div className={`progress-step ${step >= 2 ? "active" : ""} ${step > 2 ? "completed" : ""}`}>
                                <div className="step-circle">2</div>
                                <span>Store</span>
                            </div>
                            <div className="step-line" />
                            <div className={`progress-step ${step >= 3 ? "active" : ""} ${step > 3 ? "completed" : ""}`}>
                                <div className="step-circle">3</div>
                                <span>RDB</span>
                            </div>
                            <div className="step-line" />
                            <div className={`progress-step ${step >= 4 ? "active" : ""}`}>
                                <div className="step-circle">4</div>
                                <span>Terms</span>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="register-error">
                            <FaExclamationTriangle />
                            <p className="register-error-text">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Step 1: Account Info */}
                        {step === 1 && (
                            <>
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <div className="input-wrapper">
                                        <div className="input-icon"><FaUser /></div>
                                        <input
                                            name="name"
                                            type="text"
                                            required
                                            className="form-input"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Email Address</label>
                                    <div className="input-wrapper">
                                        <div className="input-icon"><FaEnvelope /></div>
                                        <input
                                            name="email"
                                            type="email"
                                            required
                                            className="form-input"
                                            placeholder="you@example.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Password</label>
                                    <div className="input-wrapper">
                                        <div className="input-icon"><FaLock /></div>
                                        <input
                                            name="password"
                                            type="password"
                                            required
                                            className="form-input"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Confirm Password</label>
                                    <div className="input-wrapper">
                                        <div className="input-icon"><FaLock /></div>
                                        <input
                                            name="confirmPassword"
                                            type="password"
                                            required
                                            className="form-input"
                                            placeholder="••••••••"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="checkbox-wrapper seller-toggle">
                                    <input
                                        type="checkbox"
                                        id="isSeller"
                                        className="form-checkbox"
                                        checked={isSeller}
                                        onChange={handleSellerToggle}
                                    />
                                    <label htmlFor="isSeller" className="checkbox-label">
                                        <FaStore style={{ marginRight: "0.5rem", color: "#f59e0b" }} />
                                        I want to register as a Seller
                                    </label>
                                </div>
                            </>
                        )}

                        {/* Step 2: Store Info (Seller only) */}
                        {isSeller && step === 2 && (
                            <>
                                <div className="form-group">
                                    <label className="form-label">Store Name</label>
                                    <div className="input-wrapper">
                                        <div className="input-icon"><FaStore /></div>
                                        <input
                                            name="storeName"
                                            type="text"
                                            required
                                            className="form-input"
                                            placeholder="My Awesome Shop"
                                            value={formData.storeName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Store Phone</label>
                                    <div className="input-wrapper">
                                        <div className="input-icon">
                                            <FaPhone style={{ transform: "scaleX(-1)" }} />
                                        </div>
                                        <input
                                            name="storePhone"
                                            type="text"
                                            required
                                            className="form-input"
                                            placeholder="+250 7XX XXX XXX"
                                            value={formData.storePhone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Store Description</label>
                                    <div className="input-wrapper">
                                        <div className="input-icon" style={{ alignItems: "flex-start", paddingTop: "0.75rem" }}>
                                            <FaInfoCircle />
                                        </div>
                                        <textarea
                                            name="storeDescription"
                                            rows="3"
                                            className="form-input"
                                            placeholder="Tell us about your store..."
                                            value={formData.storeDescription}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Step 3: RDB Documents (Seller only) */}
                        {isSeller && step === 3 && (
                            <>
                                <p className="step-description">
                                    To sell on Impressa, you need a valid TIN number and RDB certificate issued by the Rwanda Development Board.
                                </p>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">TIN Number *</label>
                                        <div className="input-wrapper">
                                            <div className="input-icon"><FaIdCard /></div>
                                            <input
                                                name="tinNumber"
                                                type="text"
                                                required
                                                className="form-input"
                                                placeholder="9-digit TIN"
                                                maxLength={9}
                                                value={formData.tinNumber}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <small>Your Tax Identification Number from RDB</small>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Business Type *</label>
                                        <select
                                            name="businessType"
                                            className="form-input form-select"
                                            value={formData.businessType}
                                            onChange={handleChange}
                                        >
                                            <option value="sole_proprietor">Sole Proprietor</option>
                                            <option value="company">Company (LTD)</option>
                                            <option value="partnership">Partnership</option>
                                            <option value="cooperative">Cooperative</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Registered Business Name *</label>
                                    <div className="input-wrapper">
                                        <div className="input-icon"><FaBuilding /></div>
                                        <input
                                            name="businessName"
                                            type="text"
                                            required
                                            className="form-input"
                                            placeholder="As registered with RDB"
                                            value={formData.businessName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">RDB Certificate *</label>
                                        <div className="file-upload">
                                            <input
                                                type="file"
                                                id="rdbCertificate"
                                                name="rdbCertificate"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={handleFileChange}
                                            />
                                            <label htmlFor="rdbCertificate" className="file-label">
                                                <FaFileUpload />
                                                <span>{fileNames.rdbCertificate || "Upload certificate"}</span>
                                            </label>
                                        </div>
                                        <small>PDF, JPG, or PNG (max 5MB)</small>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">National ID (Optional)</label>
                                        <div className="file-upload">
                                            <input
                                                type="file"
                                                id="nationalId"
                                                name="nationalId"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={handleFileChange}
                                            />
                                            <label htmlFor="nationalId" className="file-label">
                                                <FaFileUpload />
                                                <span>{fileNames.nationalId || "Upload ID"}</span>
                                            </label>
                                        </div>
                                        <small>Front side of your ID</small>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Step 4: Terms & Signature (Seller only) */}
                        {isSeller && step === 4 && (
                            <>
                                <div className="terms-container" ref={termsRef} onScroll={handleTermsScroll}>
                                    <div
                                        className="terms-content"
                                        dangerouslySetInnerHTML={{
                                            __html: termsContent.replace(/\n/g, "<br/>").replace(/#{1,3}\s/g, "")
                                        }}
                                    />
                                </div>

                                {!termsScrolled && (
                                    <p className="scroll-hint">⬇️ Please scroll to read the entire document</p>
                                )}

                                <div className="form-group checkbox-wrapper">
                                    <input
                                        type="checkbox"
                                        id="termsAccepted"
                                        name="termsAccepted"
                                        className="form-checkbox"
                                        checked={formData.termsAccepted}
                                        onChange={handleChange}
                                        disabled={!termsScrolled}
                                    />
                                    <label htmlFor="termsAccepted" className="checkbox-label">
                                        I have read and agree to the Terms & Conditions
                                    </label>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        <FaSignature style={{ marginRight: "0.5rem" }} />
                                        Digital Signature *
                                    </label>
                                    <input
                                        name="digitalSignature"
                                        type="text"
                                        required
                                        className="form-input signature-input"
                                        placeholder="Type your full legal name"
                                        value={formData.digitalSignature}
                                        onChange={handleChange}
                                    />
                                    <small>By typing your name, you are digitally signing this agreement</small>
                                </div>
                            </>
                        )}

                        {/* Navigation Buttons */}
                        <div className="form-actions">
                            {isSeller && step > 1 && (
                                <button type="button" className="btn-secondary" onClick={prevStep}>
                                    <FaArrowLeft /> Back
                                </button>
                            )}

                            {isSeller && step < 4 ? (
                                <button type="button" className="btn-submit" onClick={nextStep}>
                                    Next <FaArrowRight />
                                </button>
                            ) : (
                                <button type="submit" disabled={loading} className="btn-submit">
                                    {loading ? (
                                        <><FaSpinner className="spinner" /> {isSeller ? "Submitting..." : "Creating Account..."}</>
                                    ) : (
                                        <>{isSeller ? "Submit Application" : "Create Account"} <FaArrowRight /></>
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Google login for customers only on step 1 */}
                        {!isSeller && step === 1 && (
                            <>
                                <div className="auth-separator">
                                    <div className="separator-line"></div>
                                    <div className="separator-text-wrapper">
                                        <span>Or sign up with</span>
                                    </div>
                                </div>

                                <button type="button" onClick={handleGoogleLogin} className="btn-google">
                                    <FaGoogle className="google-icon" />
                                    Continue with Google
                                </button>
                            </>
                        )}

                        <div style={{ marginTop: "1rem", textAlign: "center" }}>
                            <p style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                                Already have an account?{" "}
                                <Link to="/login" style={{ fontWeight: "bold", color: "#4f46e5", textDecoration: "none" }}>
                                    Sign in here
                                </Link>
                            </p>
                            {!isSeller && (
                                <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "1rem" }}>
                                    By registering, you agree to our{" "}
                                    <Link to="/terms" style={{ textDecoration: "underline", color: "#1f2937" }}>Terms of Service</Link> and{" "}
                                    <Link to="/privacy" style={{ textDecoration: "underline", color: "#1f2937" }}>Privacy Policy</Link>.
                                </p>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Register;
