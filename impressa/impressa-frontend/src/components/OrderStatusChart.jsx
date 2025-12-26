import { useEffect, useState } from "react";
import api from "../utils/axiosInstance";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "../styles/AdminLayout.css";

ChartJS.register(ArcElement, Tooltip, Legend);

function OrderStatusChart() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get("/dashboard/analytics");
                const statusCounts = res.data.statusCounts || [];

                // Map status to colors
                const statusColors = {
                    pending: '#f59e0b',
                    processing: '#3b82f6',
                    shipped: '#8b5cf6',
                    delivered: '#10b981',
                    cancelled: '#ef4444',
                    refunded: '#6b7280'
                };

                const labels = statusCounts.map(s => s._id?.charAt(0).toUpperCase() + s._id?.slice(1) || 'Unknown');
                const values = statusCounts.map(s => s.count);
                const colors = statusCounts.map(s => statusColors[s._id] || '#9ca3af');

                setData({
                    labels,
                    datasets: [{
                        data: values,
                        backgroundColor: colors,
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                });
            } catch (err) {
                console.error("Failed to fetch status data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((context.parsed / total) * 100).toFixed(1);
                        return `${context.label}: ${context.parsed} (${percentage}%)`;
                    }
                }
            }
        }
    };

    if (loading) {
        return (
            <div className="card">
                <h3 className="card-title">Order Status</h3>
                <div className="skeleton skeleton-card" style={{ height: '200px' }}></div>
            </div>
        );
    }

    if (!data || data.labels.length === 0) {
        return (
            <div className="card">
                <h3 className="card-title">Order Status Distribution</h3>
                <div className="empty-state" style={{ padding: '2rem' }}>
                    <p className="empty-state-title">No orders yet</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <h3 className="card-title">Order Status Distribution</h3>
            <div style={{ height: '220px', marginTop: '1rem' }}>
                <Pie data={data} options={options} />
            </div>
        </div>
    );
}

export default OrderStatusChart;
