import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaSearch, FaFilter, FaBox } from "react-icons/fa";
import api from "../utils/axiosInstance";
import SellerSidebar from "../components/SellerSidebar";
import Header from "../components/Header";
import "../styles/AdminLayout.css"; // Ensure theme variables are available
import "./SellerProducts.css"; // Reuse existing styles

const SellerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("all");

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.get("/orders/seller/my-orders");
            if (res.data.success) {
                setOrders(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch orders", err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { class: 'pending', text: 'Pending' },
            processing: { class: 'processing', text: 'Processing' },
            shipped: { class: 'shipped', text: 'Shipped' },
            delivered: { class: 'delivered', text: 'Delivered' },
            cancelled: { class: 'cancelled', text: 'Cancelled' },
            paid: { class: 'approved', text: 'Paid' }
        };
        const badge = badges[status?.toLowerCase()] || { class: 'pending', text: status };
        return <span className={`status-badge ${badge.class}`}>{badge.text}</span>;
    };

    const filteredOrders = filterStatus === "all"
        ? orders
        : orders.filter(o => o.status === filterStatus);

    return (
        <div className="seller-layout">
            <SellerSidebar />
            <div className="seller-main-content">
                <Header />
                <div className="seller-page-container">
                    <div className="page-header">
                        <div className="header-title">
                            <h1>My Orders</h1>
                            <p>Track and manage your customer orders</p>
                        </div>
                    </div>

                    <div className="search-bar">
                        <div className="filter-group" style={{ display: 'flex', gap: '1rem', alignItems: 'center', width: '100%' }}>
                            <FaFilter className="search-icon" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                style={{ border: 'none', background: 'transparent', fontSize: '1rem', outline: 'none', cursor: 'pointer' }}
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-state">Loading orders...</div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="empty-state">
                            <FaBox className="empty-icon" />
                            <h3>No Orders Found</h3>
                            <p>Orders will appear here once customers purchase your products.</p>
                        </div>
                    ) : (
                        <div className="products-table-container">
                            <table className="products-table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Date</th>
                                        <th>Customer</th>
                                        <th>Items</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.map(order => (
                                        <tr key={order._id}>
                                            <td style={{ fontWeight: '600' }}>#{order.publicId}</td>
                                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td>{order.user?.name || order.guestInfo?.name || 'Guest'}</td>
                                            <td>{order.items?.length || 0} items</td>
                                            <td>RWF {order.totals?.grandTotal?.toLocaleString()}</td>
                                            <td>{getStatusBadge(order.status)}</td>
                                            <td>
                                                {/* For now just a placeholder or link to standard order details if useful */}
                                                <button className="action-btn view" title="View Details">
                                                    <FaEye />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SellerOrders;
