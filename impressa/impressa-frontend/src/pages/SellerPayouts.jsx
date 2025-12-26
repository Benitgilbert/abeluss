import { useState, useEffect } from "react";
import { FaMoneyBillWave, FaHistory, FaCheckCircle, FaClock, FaExclamationCircle } from "react-icons/fa";
import api from "../utils/axiosInstance";
import SellerSidebar from "../components/SellerSidebar";
import Header from "../components/Header";
import "./SellerProducts.css"; // Reuse general seller layout styles

const SellerPayouts = () => {
    const [summary, setSummary] = useState(null);
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [requesting, setRequesting] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [earningRes, payoutRes] = await Promise.all([
                api.get("/commissions/my-earnings"),
                api.get("/params/payouts/history") // Verify endpoint, checking payoutController
            ]);

            if (earningRes.data.success) {
                setSummary(earningRes.data.data);
            }
            // If historical payouts endpoint exists
            if (payoutRes.data?.success) {
                setPayouts(payoutRes.data.data);
            }
        } catch (err) {
            console.error("Failed to load payout data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestPayout = async () => {
        if (!window.confirm("Request payout for your available balance?")) return;

        setRequesting(true);
        try {
            const res = await api.post("/payouts/request");
            if (res.data.success) {
                setMessage({ type: 'success', text: 'Payout requested successfully!' });
                fetchData(); // Refresh data
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to request payout' });
        } finally {
            setRequesting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'text-green-600 bg-green-50';
            case 'pending': return 'text-orange-600 bg-orange-50';
            case 'failed': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="seller-layout">
            <SellerSidebar />
            <div className="seller-main-content">
                <Header />
                <div className="seller-page-container">
                    <div className="page-header">
                        <div className="header-title">
                            <h1>Payouts & Earnings</h1>
                            <p>Manage your earnings and withdrawal requests</p>
                        </div>
                        {summary?.availableBalance >= (summary?.minimumPayout || 0) && (
                            <button
                                onClick={handleRequestPayout}
                                disabled={requesting}
                                className="btn-primary"
                                style={{ background: '#2e7d32' }}
                            >
                                <FaMoneyBillWave /> {requesting ? "Processing..." : "Request Payout"}
                            </button>
                        )}
                    </div>

                    {message && (
                        <div className={`alert ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                            style={{ padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                            {message.text}
                        </div>
                    )}

                    {/* Stats Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div className="stat-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                            <div style={{ color: '#666', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FaMoneyBillWave /> Available Balance
                            </div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1a1a1a' }}>
                                RWF {summary?.availableBalance?.toLocaleString() || 0}
                            </div>
                        </div>

                        <div className="stat-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                            <div style={{ color: '#666', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FaClock /> Pending Payouts
                            </div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#f57c00' }}>
                                {summary?.pendingPayouts || 0}
                            </div>
                        </div>

                        <div className="stat-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                            <div style={{ color: '#666', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FaCheckCircle /> Total Withdrawn
                            </div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2e7d32' }}>
                                RWF {summary?.totalPaid?.toLocaleString() || 0}
                            </div>
                        </div>
                    </div>

                    {/* Minimum Payout Info */}
                    {summary?.availableBalance < (summary?.minimumPayout || 0) && (
                        <div style={{ background: '#e3f2fd', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0d47a1' }}>
                            <FaExclamationCircle />
                            Minimum payout amount is RWF {summary?.minimumPayout?.toLocaleString()}. Keep selling to reach the threshold!
                        </div>
                    )}

                    {/* Payout History */}
                    <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: '1.5rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaHistory /> Payout History
                        </h3>

                        {payouts.length === 0 ? (
                            <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>No payout history found.</p>
                        ) : (
                            <table className="products-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Amount</th>
                                        <th>Method</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payouts.map(payout => (
                                        <tr key={payout._id}>
                                            <td>{new Date(payout.createdAt).toLocaleDateString()}</td>
                                            <td>RWF {payout.amount.toLocaleString()}</td>
                                            <td style={{ textTransform: 'capitalize' }}>{payout.method?.replace('_', ' ')}</td>
                                            <td>
                                                <span className={`status-badge ${payout.status}`}
                                                    style={{ textTransform: 'capitalize', display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem' }}>
                                                    {payout.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerPayouts;
