import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/axiosInstance";
import {
    FaSearch, FaFilter, FaEye, FaChevronLeft, FaChevronRight
} from "react-icons/fa";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import "../../styles/AdminLayout.css";

const AdminOrders = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset to page 1 on search
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        fetchOrders();
    }, [page, statusFilter, debouncedSearch]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 10,
                status: statusFilter !== "all" ? statusFilter : undefined,
                search: debouncedSearch
            };
            const { data } = await api.get("/orders", { params });
            setOrders(data.orders);
            setTotalPages(data.pages);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "pending": return "status-pill status-pending";
            case "processing": return "status-pill status-processing";
            case "shipped": return "status-pill status-shipped";
            case "delivered": return "status-pill status-delivered";
            case "cancelled": return "status-pill status-cancelled";
            case "refunded": return "status-pill badge-gray";
            default: return "status-pill badge-gray";
        }
    };

    return (
        <div className="admin-container">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="admin-main">
                <Topbar onMenuClick={() => setSidebarOpen(true)} />
                <main className="dashboard-content">
                    <div className="page-header">
                        <h1 className="page-title">Order Management</h1>
                        <p className="page-subtitle">Track and manage customer orders.</p>
                    </div>

                    <div className="card">
                        {/* Filters & Search */}
                        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap", justifyContent: "space-between" }}>
                            <div style={{ position: "relative", flex: 1, minWidth: "250px" }}>
                                <FaSearch style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-gray)" }} />
                                <input
                                    type="text"
                                    placeholder="Search by ID, Customer Name/Email..."
                                    style={{
                                        width: "100%",
                                        padding: "0.625rem 1rem 0.625rem 2.5rem",
                                        borderRadius: "0.5rem",
                                        border: "1px solid var(--color-border)",
                                        fontSize: "0.875rem"
                                    }}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            <div style={{ display: "flex", items: "center", gap: "0.5rem" }}>
                                <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--color-border)", borderRadius: "0.5rem", padding: "0 0.5rem", height: "42px" }}>
                                    <FaFilter style={{ color: "var(--color-text-gray)", marginRight: "0.5rem" }} />
                                    <select
                                        style={{ border: "none", outline: "none", fontSize: "0.875rem", background: "transparent", color: "var(--color-text-primary)" }}
                                        value={statusFilter}
                                        onChange={(e) => {
                                            setStatusFilter(e.target.value);
                                            setPage(1);
                                        }}
                                    >
                                        <option value="all">All Statuses</option>
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                        <option value="refunded">Refunded</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Orders Table */}
                        <div style={{ overflowX: "auto" }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Date</th>
                                        <th>Customer</th>
                                        <th>Total</th>
                                        <th>Payment</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: "center" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="7" style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-gray)" }}>
                                                Loading orders...
                                            </td>
                                        </tr>
                                    ) : orders.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-gray)" }}>
                                                No orders found.
                                            </td>
                                        </tr>
                                    ) : (
                                        orders.map((order) => (
                                            <tr key={order._id}>
                                                <td style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "var(--color-text-gray)" }}>
                                                    #{order.publicId}
                                                </td>
                                                <td>
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>
                                                        {order.customer?.name || order.guestInfo?.name || "Guest"}
                                                    </div>
                                                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-gray)" }}>
                                                        {order.customer?.email || order.guestInfo?.email}
                                                    </div>
                                                </td>
                                                <td style={{ fontWeight: 500 }}>
                                                    {order.totals?.grandTotal?.toLocaleString()} Rwf
                                                </td>
                                                <td style={{ textTransform: "capitalize" }}>
                                                    <span style={{ fontSize: "0.85rem", color: "var(--color-text-gray)" }}>
                                                        {order.payment?.method?.replace("_", " ")}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={getStatusColor(order.status)}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: "center" }}>
                                                    <Link
                                                        to={`/admin/orders/${order._id}`}
                                                        style={{
                                                            color: "var(--color-primary)",
                                                            fontSize: "1.1rem",
                                                            padding: "0.25rem",
                                                            display: "inline-block"
                                                        }}
                                                        title="View Details"
                                                    >
                                                        <FaEye />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {!loading && orders.length > 0 && (
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--color-border)" }}>
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(p => p - 1)}
                                    style={{
                                        display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)",
                                        backgroundColor: page === 1 ? "var(--color-bg-light)" : "white",
                                        color: page === 1 ? "var(--color-text-gray)" : "var(--color-text-primary)",
                                        cursor: page === 1 ? "not-allowed" : "pointer"
                                    }}
                                >
                                    <FaChevronLeft size={12} /> Previous
                                </button>
                                <span style={{ fontSize: "0.875rem", color: "var(--color-text-gray)" }}>
                                    Page {page} of {totalPages}
                                </span >
                                <button
                                    disabled={page === totalPages}
                                    onClick={() => setPage(p => p + 1)}
                                    style={{
                                        display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)",
                                        backgroundColor: page === totalPages ? "var(--color-bg-light)" : "white",
                                        color: page === totalPages ? "var(--color-text-gray)" : "var(--color-text-primary)",
                                        cursor: page === totalPages ? "not-allowed" : "pointer"
                                    }}
                                >
                                    Next <FaChevronRight size={12} />
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminOrders;
