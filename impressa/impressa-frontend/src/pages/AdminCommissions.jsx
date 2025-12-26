import { useState, useEffect } from 'react';
import {
    FaPercent, FaSave, FaDollarSign, FaCalendarAlt,
    FaUsers, FaMoneyBillWave, FaCog, FaChartLine
} from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import './AdminCommissions.css';

export default function AdminCommissions() {
    const [settings, setSettings] = useState({
        defaultRate: 10,
        minimumPayoutAmount: 10000,
        payoutSchedule: 'manual',
        payoutMethods: ['mobile_money', 'bank_transfer']
    });
    const [dashboard, setDashboard] = useState({
        platformEarnings: 0,
        pendingPayouts: { amount: 0, count: 0 },
        completedPayouts: { amount: 0, count: 0 },
        activeSellers: 0
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const API_URL = 'http://localhost:5000/api';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');

            // Fetch settings
            const settingsRes = await fetch(`${API_URL}/commissions/settings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const settingsData = await settingsRes.json();
            if (settingsData.success) {
                setSettings(settingsData.data);
            }

            // Fetch dashboard
            const dashRes = await fetch(`${API_URL}/commissions/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const dashData = await dashRes.json();
            if (dashData.success) {
                setDashboard(dashData.data);
            }
        } catch (err) {
            setError('Failed to load commission data');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/commissions/settings`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            });
            const data = await res.json();
            if (data.success) {
                setSuccess('Settings saved successfully');
            } else {
                setError(data.message || 'Failed to save settings');
            }
        } catch (err) {
            setError('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    // Clear alerts after 3 seconds
    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(() => {
                setError('');
                setSuccess('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error, success]);

    const formatCurrency = (amount) => {
        return `RWF ${amount?.toLocaleString() || 0}`;
    };

    if (loading) {
        return (
            <div className="admin-commissions-layout">
                <Sidebar />
                <div className="admin-commissions-main">
                    <Topbar title="Commissions" />
                    <main className="admin-commissions-content">
                        <div className="loading-state">Loading commission data...</div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-commissions-layout">
            <Sidebar />
            <div className="admin-commissions-main">
                <Topbar title="Commissions" />
                <main className="admin-commissions-content">
                    {/* Alerts */}
                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    {/* Dashboard Stats */}
                    <div className="stats-grid">
                        <div className="stat-card earnings">
                            <div className="stat-icon"><FaChartLine /></div>
                            <div className="stat-info">
                                <span className="stat-value">{formatCurrency(dashboard.platformEarnings)}</span>
                                <span className="stat-label">Platform Earnings</span>
                            </div>
                        </div>
                        <div className="stat-card pending">
                            <div className="stat-icon"><FaDollarSign /></div>
                            <div className="stat-info">
                                <span className="stat-value">{formatCurrency(dashboard.pendingPayouts.amount)}</span>
                                <span className="stat-label">Pending Payouts ({dashboard.pendingPayouts.count})</span>
                            </div>
                        </div>
                        <div className="stat-card completed">
                            <div className="stat-icon"><FaMoneyBillWave /></div>
                            <div className="stat-info">
                                <span className="stat-value">{formatCurrency(dashboard.completedPayouts.amount)}</span>
                                <span className="stat-label">Completed Payouts ({dashboard.completedPayouts.count})</span>
                            </div>
                        </div>
                        <div className="stat-card sellers">
                            <div className="stat-icon"><FaUsers /></div>
                            <div className="stat-info">
                                <span className="stat-value">{dashboard.activeSellers}</span>
                                <span className="stat-label">Active Sellers</span>
                            </div>
                        </div>
                    </div>

                    {/* Settings Form */}
                    <div className="settings-card">
                        <div className="card-header">
                            <h3><FaCog /> Commission Configuration</h3>
                        </div>
                        <form onSubmit={handleSaveSettings} className="settings-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Online Commission Rate (%)</label>
                                    <div className="input-with-icon">
                                        <FaPercent className="input-icon" />
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.5"
                                            value={settings.defaultRate}
                                            onChange={(e) => setSettings({ ...settings, defaultRate: parseFloat(e.target.value) })}
                                            className="form-input"
                                        />
                                    </div>
                                    <small>Commission for Online Orders</small>
                                </div>

                                <div className="form-group">
                                    <label>POS Commission Rate (%)</label>
                                    <div className="input-with-icon">
                                        <FaPercent className="input-icon" />
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.5"
                                            value={settings.posRate ?? 5}
                                            onChange={(e) => setSettings({ ...settings, posRate: parseFloat(e.target.value) })}
                                            className="form-input"
                                        />
                                    </div>
                                    <small>Commission for Seller POS Sales</small>
                                </div>

                                <div className="form-group">
                                    <label>Minimum Payout Amount (RWF)</label>
                                    <div className="input-with-icon">
                                        <FaDollarSign className="input-icon" />
                                        <input
                                            type="number"
                                            min="0"
                                            step="1000"
                                            value={settings.minimumPayoutAmount}
                                            onChange={(e) => setSettings({ ...settings, minimumPayoutAmount: parseInt(e.target.value) })}
                                            className="form-input"
                                        />
                                    </div>
                                    <small>Sellers must earn at least this amount to request payout</small>
                                </div>

                                <div className="form-group">
                                    <label>Payout Schedule</label>
                                    <div className="input-with-icon">
                                        <FaCalendarAlt className="input-icon" />
                                        <select
                                            value={settings.payoutSchedule}
                                            onChange={(e) => setSettings({ ...settings, payoutSchedule: e.target.value })}
                                            className="form-input"
                                        >
                                            <option value="manual">Manual (On Request)</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="biweekly">Bi-weekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Payout Methods</label>
                                    <div className="checkbox-group">
                                        {['mobile_money', 'bank_transfer', 'paypal'].map((method) => (
                                            <label key={method} className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.payoutMethods?.includes(method)}
                                                    onChange={(e) => {
                                                        const methods = settings.payoutMethods || [];
                                                        if (e.target.checked) {
                                                            setSettings({ ...settings, payoutMethods: [...methods, method] });
                                                        } else {
                                                            setSettings({ ...settings, payoutMethods: methods.filter(m => m !== method) });
                                                        }
                                                    }}
                                                />
                                                <span>{method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="btn-save" disabled={saving}>
                                <FaSave /> {saving ? 'Saving...' : 'Save Settings'}
                            </button>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
}
