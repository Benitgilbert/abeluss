import { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";

function RecentOrderTable({ endpoint = "/analytics/recent-orders" }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        const res = await axios.get(endpoint);
        setOrders(res.data);
      } catch (err) {
        console.error("Failed to fetch recent orders:", err?.response?.data || err.message);
        setError(err?.response?.data?.message || "Failed to load recent orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentOrders();
  }, []);

  if (loading) return (
    <div className="card">
      <div style={{ animate: "pulse", padding: "1rem" }}>Loading recent orders...</div>
    </div>
  );

  return (
    <div className="card h-full">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 className="card-title" style={{ marginBottom: 0 }}>Recent Orders</h3>
        <span style={{ color: "var(--color-text-gray)", fontSize: "0.875rem" }}>{orders.length} items</span>
      </div>

      {error && (
        <div style={{ marginBottom: "1rem", color: "#dc2626", fontSize: "0.875rem" }}>{error}</div>
      )}

      <div className="table-container" style={{ boxShadow: "none", borderRadius: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "#9ca3af", padding: "2rem" }}>No recent orders found.</td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order._id}>
                <td style={{ fontFamily: "monospace" }}>#{order.publicId || order._id.slice(-6).toUpperCase()}</td>
                <td>{order.customer?.name || order.guestInfo?.name || "Guest"}</td>
                <td>
                  <div style={{ maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {order.items?.map(i => i.productName).join(", ") || "N/A"}
                  </div>
                </td>
                <td>{order.items?.reduce((sum, i) => sum + i.quantity, 0) || order.quantity}</td>
                <td>
                  <span className={`stat-badge ${order.status === "delivered" ? "badge-green" :
                      order.status === "cancelled" ? "badge-red" :
                        order.status === "in-production" ? "badge-blue" :
                          order.status === "processing" ? "badge-teal" :
                            "badge-blue" // Default/Pending
                    }`}>
                    {order.status}
                  </span>
                </td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecentOrderTable;