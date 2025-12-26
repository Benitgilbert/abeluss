import { useEffect, useState } from "react";
import api from "../utils/axiosInstance";
import { FaShoppingCart, FaBox, FaCheckCircle, FaTimesCircle, FaDollarSign, FaPalette, FaStar, FaUserPlus, FaUsers, FaClock, FaBuilding } from "react-icons/fa";
import "../styles/AdminLayout.css";

function DashboardCards() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get("/dashboard/analytics");
        setData(res.data);
      } catch (err) {
        console.error("Failed to load dashboard analytics:", err);
      }
    };

    fetchAnalytics();
  }, []);

  const cards = data
    ? [
      {
        title: "Total Orders",
        value: data.totalOrders?.toLocaleString() || "0",
        change: `${data.changes?.ordersChange || "0"}`,
        icon: FaShoppingCart,
        gradientClass: "gradient-blue",
      },
      {
        title: "Items Sold",
        value: data.totalItems?.toLocaleString() || "0",
        change: data.changes?.itemsChange || "0%",
        icon: FaBox,
        gradientClass: "gradient-indigo",
      },
      {
        title: "Unique Products",
        value: data.totalProducts?.toLocaleString() || "0",
        change: "Listings",
        icon: FaBox,
        gradientClass: "gradient-cyan",
      },
      {
        title: "Total Inventory",
        value: data.totalInventory?.toLocaleString() || "0",
        change: "Stock",
        icon: FaBuilding,
        gradientClass: "gradient-teal",
      },
      {
        title: "Delivered",
        value: data.deliveredOrders?.toLocaleString() || "0",
        change: `${data.changes?.deliveredChange || "0"}`,
        icon: FaCheckCircle,
        gradientClass: "gradient-emerald",
      },
      {
        title: "Cancelled",
        value: data.cancelledOrders?.toLocaleString() || "0",
        change: `${data.changes?.cancelledChange || "0"}`,
        icon: FaTimesCircle,
        gradientClass: "gradient-rose",
      },
      {
        title: "Revenue (Month)",
        value: `${data.revenueThisMonth?.toLocaleString() || "0"} RWF`,
        change: `${data.changes?.revenueChange || "0"}`,
        icon: FaDollarSign,
        gradientClass: "gradient-amber",
      },
      {
        title: "Custom Orders",
        value: data.customOrders?.toLocaleString() || "0",
        change: `${data.changes?.customChange || "0"}`,
        icon: FaPalette,
        gradientClass: "gradient-purple",
      },
      {
        title: "Top Product",
        value: data.topProductName || "N/A",
        change: data.topProductChange || "",
        icon: FaStar,
        gradientClass: "gradient-orange",
      },
      {
        title: "New Customers",
        value: data.newCustomersThisMonth?.toLocaleString() || "0",
        change: `${data.changes?.usersChange || "0"}`,
        icon: FaUserPlus,
        gradientClass: "gradient-pink",
      },
      {
        title: "Active Users",
        value: data.activeUsers?.toLocaleString() || "0",
        change: `${data.changes?.activeChange || "0"}`,
        icon: FaUsers,
        gradientClass: "gradient-cyan",
      },
      {
        title: "Pending",
        value: data.pendingOrders?.toLocaleString() || "0",
        change: `${data.changes?.pendingChange || "0"}`,
        icon: FaClock,
        gradientClass: "gradient-orange",
      }
    ]
    : [];

  const getBadgeClass = (change) => {
    if (!change) return "";
    if (change.startsWith("-")) return "badge-red";
    if (change === "New") return "badge-blue";
    if (change === "Stock" || change === "Listings") return "badge-teal";
    return "badge-green";
  };

  const getChangeText = (change) => {
    if (!change) return "";
    if (change.startsWith("-") || change === "New" || change === "Stock" || change === "Listings") return change;
    return `+${change}`;
  };

  return (
    <div className="stat-card-grid">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className="stat-card">
            {/* Background decoration */}
            <div className={`stat-bg-decor ${card.gradientClass}`}></div>

            <div className="stat-card-header">
              <div className={`stat-icon-wrapper ${card.gradientClass}`}>
                <Icon />
              </div>
              {card.change && (
                <span className={`stat-badge ${getBadgeClass(card.change)}`}>
                  {getChangeText(card.change)}
                </span>
              )}
            </div>

            <div>
              <p className="stat-title">{card.title}</p>
              <h3 className="stat-value">{card.value}</h3>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default DashboardCards;