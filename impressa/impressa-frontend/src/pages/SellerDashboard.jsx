import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FaChartLine, FaDollarSign, FaBox, FaShoppingCart, FaStar,
    FaExclamationTriangle, FaClock, FaCheckCircle, FaArrowUp,
    FaArrowDown, FaEye, FaMoneyBillWave
} from 'react-icons/fa';
import api from '../utils/axiosInstance';
import Header from '../components/Header';
import SellerSidebar from '../components/SellerSidebar';
import '../styles/AdminLayout.css'; // Import for theme variables
import './SellerDashboard.css';
import './SellerProducts.css'; // Import for layout styles

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function SellerDashboard() {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        totalProducts: 0,
        activeProducts: 0,
        pendingProducts: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalEarnings: 0,
        availableBalance: 0,
        pendingPayouts: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [revenueData, setRevenueData] = useState({ labels: [], datasets: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Get user info
            const userRes = await api.get('/auth/me');
            setUser(userRes.data);

            // Get seller's products stats
            const productsRes = await api.get('/products/seller/my-products?limit=5');
            if (productsRes.data.success) {
                setTopProducts(productsRes.data.data.slice(0, 5));
                setStats(prev => ({
                    ...prev,
                    totalProducts: productsRes.data.pagination?.total || productsRes.data.data.length
                }));
            }

            // Get earnings summary
            try {
                const earningsRes = await api.get('/commissions/my-earnings');
                if (earningsRes.data.success) {
                    setStats(prev => ({
                        ...prev,
                        totalEarnings: earningsRes.data.summary?.totalEarnings || 0,
                        availableBalance: earningsRes.data.summary?.availableBalance || 0,
                        pendingPayouts: earningsRes.data.summary?.pendingPayouts || 0
                    }));
                }
            } catch (err) {
                console.log('Earnings endpoint not available');
            }

            // Get recent orders for this seller
            try {
                const ordersRes = await api.get('/orders/seller/my-orders?limit=5');
                if (ordersRes.data.success) {
                    setRecentOrders(ordersRes.data.data || []);
                    setStats(prev => ({
                        ...prev,
                        totalOrders: ordersRes.data.pagination?.total || ordersRes.data.data?.length || 0
                    }));
                }
            } catch (err) {
                console.log('Seller orders endpoint not available');
            }

            // Get revenue data (Sales Chart)
            try {
                const revenueRes = await api.get('/analytics/seller/revenue?period=day');
                // Ensure array
                const data = Array.isArray(revenueRes.data) ? revenueRes.data : [];

                const labels = data.map(item => item.label);
                const revenues = data.map(item => item.revenue);

                setRevenueData({
                    labels,
                    datasets: [
                        {
                            label: 'Sales Revenue',
                            data: revenues,
                            borderColor: '#3b82f6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            fill: true,
                            tension: 0.4,
                            pointRadius: 4,
                            pointHoverRadius: 6
                        }
                    ]
                });
            } catch (err) {
                console.error('Failed to load revenue data', err);
            }

        } catch (err) {
            console.error('Failed to fetch dashboard data', err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => `RWF ${(amount || 0).toLocaleString()}`;

    const getStatusBadge = (status) => {
        const badges = {
            pending: { class: 'pending', text: 'Pending' },
            processing: { class: 'processing', text: 'Processing' },
            shipped: { class: 'shipped', text: 'Shipped' },
            delivered: { class: 'delivered', text: 'Delivered' },
            cancelled: { class: 'cancelled', text: 'Cancelled' }
        };
        const badge = badges[status?.toLowerCase()] || badges.pending;
        return <span className={`status-badge ${badge.class}`}>{badge.text}</span>;
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: '#f0f0f0'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    };

    if (loading) {
        return (
            <div className="seller-layout">
                <SellerSidebar />
                <div className="seller-main-content">
                    <Header />
                    <div className="loading-container">Loading dashboard...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="seller-layout">
            <SellerSidebar />
            <div className="seller-main-content">
                <Header />
                <div className="seller-dashboard-content">
                    {/* Welcome Header */}
                    <div className="dashboard-header">
                        <div>
                            <h1>Welcome back, {user?.name || 'Seller'}!</h1>
                            <p>Here's what's happening with your store today.</p>
                        </div>
                        <Link to="/seller/products/add" className="btn-add-product">
                            <FaBox /> Add New Product
                        </Link>
                    </div>

                    {/* Stats Grid */}
                    <div className="stats-grid">
                        <div className="stat-card earnings">
                            <div className="stat-icon"><FaDollarSign /></div>
                            <div className="stat-info">
                                <span className="stat-value">{formatCurrency(stats.totalEarnings)}</span>
                                <span className="stat-label">Total Earnings</span>
                            </div>
                        </div>
                        <div className="stat-card balance">
                            <div className="stat-icon"><FaMoneyBillWave /></div>
                            <div className="stat-info">
                                <span className="stat-value">{formatCurrency(stats.availableBalance)}</span>
                                <span className="stat-label">Available Balance</span>
                            </div>
                        </div>
                        <div className="stat-card orders">
                            <div className="stat-icon"><FaShoppingCart /></div>
                            <div className="stat-info">
                                <span className="stat-value">{stats.totalOrders}</span>
                                <span className="stat-label">Total Orders</span>
                            </div>
                        </div>
                        <div className="stat-card products">
                            <div className="stat-icon"><FaBox /></div>
                            <div className="stat-info">
                                <span className="stat-value">{stats.totalProducts}</span>
                                <span className="stat-label">Products</span>
                            </div>
                        </div>
                    </div>

                    {/* Sales Chart Section */}
                    <div className="chart-section">
                        <div className="chart-header">
                            <h3>Sales Overview (Last 30 Days)</h3>
                        </div>
                        <div style={{ height: '300px' }}>
                            {revenueData.labels.length > 0 ? (
                                <Line options={chartOptions} data={revenueData} />
                            ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>No sales data for this period</div>
                            )}
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="content-grid">
                        {/* Recent Orders */}
                        <div className="card orders-card">
                            <div className="card-header">
                                <h3><FaShoppingCart /> Recent Orders</h3>
                                <Link to="/seller/orders" className="view-all">View All</Link>
                            </div>
                            <div className="card-body">
                                {recentOrders.length === 0 ? (
                                    <div className="empty-state">No orders yet</div>
                                ) : (
                                    <table className="orders-table">
                                        <thead>
                                            <tr>
                                                <th>Order ID</th>
                                                <th>Customer</th>
                                                <th>Total</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentOrders.map(order => (
                                                <tr key={order._id}>
                                                    <td className="order-id">#{order.publicId}</td>
                                                    <td>{order.user?.name || order.guestInfo?.name || 'Customer'}</td>
                                                    <td>{formatCurrency(order.totals?.grandTotal)}</td>
                                                    <td>{getStatusBadge(order.status)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>

                        {/* Top Products */}
                        <div className="card products-card">
                            <div className="card-header">
                                <h3><FaBox /> Your Products</h3>
                                <Link to="/seller/products" className="view-all">View All</Link>
                            </div>
                            <div className="card-body">
                                {topProducts.length === 0 ? (
                                    <div className="empty-state">No products yet</div>
                                ) : (
                                    <div className="products-list">
                                        {topProducts.map(product => (
                                            <div key={product._id} className="product-item">
                                                <div className="product-image">
                                                    {product.image ? (
                                                        <img src={product.image} alt={product.name} />
                                                    ) : (
                                                        <FaBox />
                                                    )}
                                                </div>
                                                <div className="product-info">
                                                    <h4>{product.name}</h4>
                                                    <p>{formatCurrency(product.price)}</p>
                                                </div>
                                                <div className="product-stock">
                                                    <span className={product.stock > 0 ? 'in-stock' : 'out-stock'}>
                                                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
