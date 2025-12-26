import { useState, useEffect } from 'react';
import {
    FaChartLine, FaFileAlt, FaDownload, FaStore, FaCalendarAlt,
    FaArrowUp, FaArrowDown, FaShoppingCart, FaStar, FaDollarSign,
    FaCheckCircle, FaTimes
} from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import '../styles/AdminLayout.css';
import './AdminSellerReports.css';

export default function AdminSellerReports() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [selectedReport, setSelectedReport] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState('');

    const API_URL = 'http://localhost:5000/api';

    useEffect(() => {
        fetchReports();
    }, [selectedMonth]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            // TODO: Replace with actual API endpoint
            // const token = localStorage.getItem('authToken');
            // const res = await fetch(`${API_URL}/seller-reports?month=${selectedMonth}`, {
            //     headers: { Authorization: `Bearer ${token}` }
            // });
            // const data = await res.json();

            // Mock data
            const mockReports = [
                {
                    _id: '1',
                    seller: { name: 'Premium Store', email: 'premium@demo.com', storeName: 'Premium Store' },
                    period: { month: 12, year: 2024 },
                    metrics: {
                        totalOrders: 156,
                        completedOrders: 148,
                        cancelledOrders: 8,
                        totalRevenue: 2450000,
                        averageOrderValue: 15705,
                        averageRating: 4.8,
                        responseTime: 2.3,
                        fulfillmentTime: 24,
                        returnRate: 2.1
                    },
                    trends: { revenue: 15, orders: 12, rating: 0.2 },
                    performanceScore: 92,
                    status: 'excellent'
                },
                {
                    _id: '2',
                    seller: { name: 'Basic Shop', email: 'basic@demo.com', storeName: 'Basic Shop' },
                    period: { month: 12, year: 2024 },
                    metrics: {
                        totalOrders: 45,
                        completedOrders: 38,
                        cancelledOrders: 7,
                        totalRevenue: 675000,
                        averageOrderValue: 15000,
                        averageRating: 3.9,
                        responseTime: 8.5,
                        fulfillmentTime: 48,
                        returnRate: 5.2
                    },
                    trends: { revenue: -5, orders: -8, rating: -0.3 },
                    performanceScore: 68,
                    status: 'needs_improvement'
                }
            ];

            setReports(mockReports);
        } catch (err) {
            setError('Failed to fetch reports');
        } finally {
            setLoading(false);
        }
    };

    const getScoreBadge = (score) => {
        let color = 'red';
        if (score >= 90) color = 'green';
        else if (score >= 70) color = 'yellow';
        else if (score >= 50) color = 'orange';

        return (
            <div className={`score-badge ${color}`}>
                <span className="score-value">{score}</span>
                <span className="score-label">/ 100</span>
            </div>
        );
    };

    const getStatusBadge = (status) => {
        const badges = {
            excellent: { class: 'excellent', text: 'Excellent' },
            good: { class: 'good', text: 'Good' },
            needs_improvement: { class: 'needs-improvement', text: 'Needs Improvement' },
            poor: { class: 'poor', text: 'Poor' }
        };
        const badge = badges[status] || badges.good;
        return <span className={`perf-badge ${badge.class}`}>{badge.text}</span>;
    };

    const getTrendIcon = (value) => {
        if (value > 0) return <span className="trend-up"><FaArrowUp /> +{value}%</span>;
        if (value < 0) return <span className="trend-down"><FaArrowDown /> {value}%</span>;
        return <span className="trend-neutral">—</span>;
    };

    const formatCurrency = (amount) => {
        return `RWF ${amount.toLocaleString()}`;
    };

    const exportReport = (report) => {
        // TODO: Implement export functionality
        const content = `
Seller Performance Report
=========================
Seller: ${report.seller.storeName}
Period: ${report.period.month}/${report.period.year}
Performance Score: ${report.performanceScore}/100

Metrics:
- Total Orders: ${report.metrics.totalOrders}
- Completed Orders: ${report.metrics.completedOrders}
- Total Revenue: RWF ${report.metrics.totalRevenue.toLocaleString()}
- Average Rating: ${report.metrics.averageRating}/5
- Avg Response Time: ${report.metrics.responseTime}h
- Avg Fulfillment Time: ${report.metrics.fulfillmentTime}h
- Return Rate: ${report.metrics.returnRate}%
        `;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report_${report.seller.storeName}_${report.period.month}_${report.period.year}.txt`;
        a.click();
    };

    return (
        <div className="admin-layout">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="admin-main">
                <Topbar onMenuClick={() => setSidebarOpen(true)} title="Seller Reports" />
                <main className="admin-content">
                    {error && <div className="alert alert-error">{error}</div>}

                    {/* Month Selector */}
                    <div className="reports-controls">
                        <div className="month-selector">
                            <FaCalendarAlt />
                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Reports Grid */}
                    <div className="reports-grid">
                        {loading ? (
                            <div className="loading-state">Loading reports...</div>
                        ) : reports.length === 0 ? (
                            <div className="empty-state">
                                <FaFileAlt className="empty-icon" />
                                <h3>No Reports Found</h3>
                                <p>No performance reports for this month</p>
                            </div>
                        ) : (
                            reports.map((report) => (
                                <div key={report._id} className="report-card">
                                    <div className="report-header">
                                        <div className="seller-info">
                                            <FaStore className="store-icon" />
                                            <div>
                                                <h4>{report.seller.storeName}</h4>
                                                <span>{report.seller.email}</span>
                                            </div>
                                        </div>
                                        {getScoreBadge(report.performanceScore)}
                                    </div>

                                    <div className="report-metrics">
                                        <div className="metric">
                                            <FaShoppingCart />
                                            <span className="metric-value">{report.metrics.totalOrders}</span>
                                            <span className="metric-label">Orders</span>
                                            {getTrendIcon(report.trends.orders)}
                                        </div>
                                        <div className="metric">
                                            <FaDollarSign />
                                            <span className="metric-value">{formatCurrency(report.metrics.totalRevenue)}</span>
                                            <span className="metric-label">Revenue</span>
                                            {getTrendIcon(report.trends.revenue)}
                                        </div>
                                        <div className="metric">
                                            <FaStar />
                                            <span className="metric-value">{report.metrics.averageRating}</span>
                                            <span className="metric-label">Rating</span>
                                        </div>
                                    </div>

                                    <div className="report-footer">
                                        {getStatusBadge(report.status)}
                                        <button
                                            className="btn-export"
                                            onClick={() => exportReport(report)}
                                        >
                                            <FaDownload /> Export
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
