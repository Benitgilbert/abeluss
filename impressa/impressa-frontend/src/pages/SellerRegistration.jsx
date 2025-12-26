import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaStore, FaIdCard, FaBuilding, FaFileUpload, FaPhone,
    FaUser, FaCheckCircle, FaArrowLeft, FaArrowRight,
    FaFileAlt, FaSignature, FaSpinner, FaExclamationTriangle
} from 'react-icons/fa';
import Header from '../components/Header';
import './SellerRegistration.css';

export default function SellerRegistration() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [termsContent, setTermsContent] = useState('');
    const [termsScrolled, setTermsScrolled] = useState(false);
    const termsRef = useRef(null);

    const [formData, setFormData] = useState({
        storeName: '',
        storeDescription: '',
        storePhone: '',
        tinNumber: '',
        businessName: '',
        businessType: 'sole_proprietor',
        rdbCertificate: null,
        nationalId: null,
        termsAccepted: false,
        digitalSignature: ''
    });

    const [fileNames, setFileNames] = useState({
        rdbCertificate: '',
        nationalId: ''
    });

    const API_URL = 'http://localhost:5000/api';

    useEffect(() => {
        fetchTerms();
    }, []);

    const fetchTerms = async () => {
        try {
            const res = await fetch(`${API_URL}/seller-verification/terms`);
            const data = await res.json();
            if (data.success) {
                setTermsContent(data.data.content);
            }
        } catch (err) {
            console.error('Failed to fetch terms');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
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

    const validateStep = (stepNum) => {
        setError('');
        switch (stepNum) {
            case 1:
                if (!formData.storeName.trim()) {
                    setError('Store name is required');
                    return false;
                }
                if (!formData.storePhone.trim()) {
                    setError('Phone number is required');
                    return false;
                }
                return true;
            case 2:
                if (!formData.tinNumber.trim()) {
                    setError('TIN number is required');
                    return false;
                }
                const tinRegex = /^\d{9}$/;
                if (!tinRegex.test(formData.tinNumber.replace(/\s/g, ''))) {
                    setError('TIN must be exactly 9 digits');
                    return false;
                }
                if (!formData.businessName.trim()) {
                    setError('Registered business name is required');
                    return false;
                }
                if (!formData.rdbCertificate) {
                    setError('RDB certificate is required');
                    return false;
                }
                return true;
            case 3:
                if (!termsScrolled) {
                    setError('Please read the entire terms & conditions');
                    return false;
                }
                if (!formData.termsAccepted) {
                    setError('You must accept the terms & conditions');
                    return false;
                }
                if (!formData.digitalSignature.trim()) {
                    setError('Digital signature (your full legal name) is required');
                    return false;
                }
                return true;
            default:
                return true;
        }
    };

    const nextStep = () => {
        if (validateStep(step)) {
            setStep(prev => Math.min(prev + 1, 3));
        }
    };

    const prevStep = () => {
        setStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep(3)) return;

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                navigate('/login?redirect=/become-seller');
                return;
            }

            const submitData = new FormData();
            submitData.append('storeName', formData.storeName);
            submitData.append('storeDescription', formData.storeDescription);
            submitData.append('storePhone', formData.storePhone);
            submitData.append('tinNumber', formData.tinNumber);
            submitData.append('businessName', formData.businessName);
            submitData.append('businessType', formData.businessType);
            submitData.append('termsAccepted', formData.termsAccepted);
            submitData.append('digitalSignature', formData.digitalSignature);
            submitData.append('rdbCertificate', formData.rdbCertificate);
            if (formData.nationalId) {
                submitData.append('nationalId', formData.nationalId);
            }

            const res = await fetch(`${API_URL}/seller-verification/apply`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: submitData
            });

            const data = await res.json();

            if (data.success) {
                setSuccess(true);
            } else {
                setError(data.message || 'Application failed');
            }
        } catch (err) {
            setError('Failed to submit application. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <>
                <Header />
                <div className="seller-reg-container">
                    <div className="success-card">
                        <FaCheckCircle className="success-icon" />
                        <h2>Application Submitted!</h2>
                        <p>Your seller application has been submitted successfully.</p>
                        <p>Our team will review your documents and you'll receive an email once your account is approved.</p>
                        <div className="success-info">
                            <strong>What happens next?</strong>
                            <ul>
                                <li>✅ Documents under review (1-3 business days)</li>
                                <li>📧 Email notification when approved</li>
                                <li>🏪 Access to your seller dashboard</li>
                            </ul>
                        </div>
                        <button className="btn-primary" onClick={() => navigate('/dashboard')}>
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="seller-reg-container">
                <div className="seller-reg-card">
                    <div className="reg-header">
                        <FaStore className="header-icon" />
                        <h1>Become a Seller</h1>
                        <p>Join Impressa marketplace and start selling your products</p>
                    </div>

                    {/* Progress Steps */}
                    <div className="progress-steps">
                        <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                            <div className="step-circle">1</div>
                            <span>Store Info</span>
                        </div>
                        <div className="step-line" />
                        <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                            <div className="step-circle">2</div>
                            <span>RDB Documents</span>
                        </div>
                        <div className="step-line" />
                        <div className={`step ${step >= 3 ? 'active' : ''}`}>
                            <div className="step-circle">3</div>
                            <span>Terms & Sign</span>
                        </div>
                    </div>

                    {error && (
                        <div className="error-alert">
                            <FaExclamationTriangle /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Step 1: Store Information */}
                        {step === 1 && (
                            <div className="form-step">
                                <h3><FaStore /> Store Information</h3>

                                <div className="form-group">
                                    <label>Store Name *</label>
                                    <input
                                        type="text"
                                        name="storeName"
                                        value={formData.storeName}
                                        onChange={handleChange}
                                        placeholder="Enter your store name"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Store Phone *</label>
                                    <div className="input-with-icon">
                                        <FaPhone />
                                        <input
                                            type="tel"
                                            name="storePhone"
                                            value={formData.storePhone}
                                            onChange={handleChange}
                                            placeholder="+250 7XX XXX XXX"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Store Description</label>
                                    <textarea
                                        name="storeDescription"
                                        value={formData.storeDescription}
                                        onChange={handleChange}
                                        placeholder="Describe what you sell..."
                                        rows={4}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 2: RDB Documents */}
                        {step === 2 && (
                            <div className="form-step">
                                <h3><FaIdCard /> RDB Business Documents</h3>
                                <p className="step-description">
                                    To sell on Impressa, you need a valid TIN number and RDB certificate issued by the Rwanda Development Board.
                                </p>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>TIN Number *</label>
                                        <div className="input-with-icon">
                                            <FaIdCard />
                                            <input
                                                type="text"
                                                name="tinNumber"
                                                value={formData.tinNumber}
                                                onChange={handleChange}
                                                placeholder="9-digit TIN"
                                                maxLength={9}
                                            />
                                        </div>
                                        <small>Your Tax Identification Number from RDB</small>
                                    </div>

                                    <div className="form-group">
                                        <label>Business Type *</label>
                                        <select
                                            name="businessType"
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
                                    <label>Registered Business Name *</label>
                                    <div className="input-with-icon">
                                        <FaBuilding />
                                        <input
                                            type="text"
                                            name="businessName"
                                            value={formData.businessName}
                                            onChange={handleChange}
                                            placeholder="As registered with RDB"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>RDB Certificate *</label>
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
                                                <span>{fileNames.rdbCertificate || 'Upload certificate'}</span>
                                            </label>
                                        </div>
                                        <small>PDF, JPG, or PNG (max 5MB)</small>
                                    </div>

                                    <div className="form-group">
                                        <label>National ID (Optional)</label>
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
                                                <span>{fileNames.nationalId || 'Upload ID'}</span>
                                            </label>
                                        </div>
                                        <small>Front side of your ID</small>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Terms & Signature */}
                        {step === 3 && (
                            <div className="form-step">
                                <h3><FaFileAlt /> Terms & Conditions</h3>

                                <div
                                    className="terms-container"
                                    ref={termsRef}
                                    onScroll={handleTermsScroll}
                                >
                                    <div className="terms-content" dangerouslySetInnerHTML={{
                                        __html: termsContent.replace(/\n/g, '<br/>').replace(/#{1,3}\s/g, '')
                                    }} />
                                </div>

                                {!termsScrolled && (
                                    <p className="scroll-hint">
                                        ⬇️ Please scroll to read the entire document
                                    </p>
                                )}

                                <div className="form-group checkbox-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="termsAccepted"
                                            checked={formData.termsAccepted}
                                            onChange={handleChange}
                                            disabled={!termsScrolled}
                                        />
                                        <span>I have read and agree to the Terms & Conditions</span>
                                    </label>
                                </div>

                                <div className="form-group">
                                    <label><FaSignature /> Digital Signature *</label>
                                    <input
                                        type="text"
                                        name="digitalSignature"
                                        value={formData.digitalSignature}
                                        onChange={handleChange}
                                        placeholder="Type your full legal name"
                                        className="signature-input"
                                    />
                                    <small>By typing your name, you are digitally signing this agreement</small>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="form-actions">
                            {step > 1 && (
                                <button type="button" className="btn-secondary" onClick={prevStep}>
                                    <FaArrowLeft /> Back
                                </button>
                            )}

                            {step < 3 ? (
                                <button type="button" className="btn-primary" onClick={nextStep}>
                                    Next <FaArrowRight />
                                </button>
                            ) : (
                                <button type="submit" className="btn-submit" disabled={loading}>
                                    {loading ? (
                                        <><FaSpinner className="spinner" /> Submitting...</>
                                    ) : (
                                        <><FaCheckCircle /> Submit Application</>
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
