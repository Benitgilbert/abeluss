import { useEffect, useState } from "react";
import api from "../utils/axiosInstance";
import { FaStore, FaMedal, FaChartLine } from "react-icons/fa";
import "../styles/AdminLayout.css";

function TopSellersWidget() {
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get("/dashboard/analytics");
                setSellers(res.data.topSellers || []);
            } catch (err) {
                console.error("Failed to fetch top sellers:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getMedalColor = (index) => {
        switch (index) {
            case 0: return '#fbbf24'; // Gold
            case 1: return '#9ca3af'; // Silver
            case 2: return '#d97706'; // Bronze
            default: return 'var(--text-muted)';
        }
    };

    if (loading) {
        return (
            <div className="card">
                <h3 className="card-title">Top Sellers</h3>
                <div className="skeleton skeleton-card"></div>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="table-header" style={{ padding: 0, marginBottom: '1rem', border: 'none' }}>
                <h3 className="table-title">
                    <FaChartLine style={{ marginRight: '0.5rem', color: 'var(--primary)' }} />
                    Top Sellers (30 Days)
                </h3>
            </div>

            {sellers.length === 0 ? (
                <div className="empty-state" style={{ padding: '1.5rem' }}>
                    <FaStore className="empty-state-icon" />
                    <p className="empty-state-title">No sales data yet</p>
                    <p className="empty-state-text">Revenue data will appear here</p>
                </div>
            ) : (
                <div className="seller-leaderboard">
                    {sellers.map((seller, idx) => (
                        <div key={seller.sellerId} className="leaderboard-item">
                            <div className="leaderboard-rank">
                                <FaMedal style={{ color: getMedalColor(idx), fontSize: '1.25rem' }} />
                            </div>
                            <div className="leaderboard-info">
                                <span className="leaderboard-name">{seller.storeName || seller.name}</span>
                                <span className="leaderboard-orders">{seller.orders} orders</span>
                            </div>
                            <div className="leaderboard-revenue">
                                {seller.revenue?.toLocaleString()} RWF
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default TopSellersWidget;
