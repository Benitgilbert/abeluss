import { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";

function RecentOrderTable() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        const res = await axios.get("/analytics/recent-orders");
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
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="animate-pulse space-y-3">
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="h-32 bg-gray-100 rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Recent Orders</h3>
        <div className="text-sm text-gray-500">{orders.length} items</div>
      </div>
      {error && (
        <div className="mb-3 text-sm text-red-600">{error}</div>
      )}
      <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Order ID</th>
            <th className="p-2">Customer</th>
            <th className="p-2">Product</th>
            <th className="p-2">Quantity</th>
            <th className="p-2">Status</th>
            <th className="p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 && (
            <tr>
              <td colSpan={6} className="p-6 text-center text-gray-500">No recent orders found.</td>
            </tr>
          )}
          {orders.map((order) => (
            <tr key={order._id} className="border-t">
              <td className="p-2">{order._id.slice(-6)}</td>
              <td className="p-2">{order.customer?.name || "N/A"}</td>
              <td className="p-2">{order.product?.name || "N/A"}</td>
              <td className="p-2">{order.quantity}</td>
              <td className="p-2">
                <span className={`px-2 py-1 rounded text-xs capitalize ${
                  order.status === "delivered" ? "bg-green-100 text-green-800" :
                  order.status === "cancelled" ? "bg-red-100 text-red-800" :
                  order.status === "in-production" ? "bg-blue-100 text-blue-800" :
                  "bg-yellow-100 text-yellow-800"
                }`}>
                  {order.status}
                </span>
              </td>
              <td className="p-2">{new Date(order.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

export default RecentOrderTable;