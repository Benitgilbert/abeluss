import { useEffect, useState } from "react";
import api from "../utils/axiosInstance";
import { FaExclamationTriangle, FaBox } from "react-icons/fa";
import "../styles/AdminLayout.css";

function LowStockWidget() {
    const [products, setProducts] = useState([]);
    const [outOfStock, setOutOfStock] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get("/dashboard/analytics");
                setProducts(res.data.lowStockProducts || []);
                setOutOfStock(res.data.outOfStockCount || 0);
            } catch (err) {
                console.error("Failed to fetch low stock:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getStockClass = (stock) => {
        if (stock <= 3) return 'stock-critical';
        if (stock <= 5) return 'stock-warning';
        return 'stock-low';
    };

    if (loading) {
        return (
            <div className="card">
                <h3 className="card-title">Inventory Alerts</h3>
                <div className="skeleton skeleton-card"></div>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="table-header" style={{ padding: 0, marginBottom: '1rem', border: 'none' }}>
                <h3 className="table-title">
                    <FaExclamationTriangle style={{ marginRight: '0.5rem', color: 'var(--warning)' }} />
                    Inventory Alerts
                </h3>
                {outOfStock > 0 && (
                    <span className="badge badge-danger">
                        {outOfStock} out of stock
                    </span>
                )}
            </div>

            {products.length === 0 && outOfStock === 0 ? (
                <div className="empty-state" style={{ padding: '1.5rem' }}>
                    <FaBox className="empty-state-icon" style={{ color: 'var(--success)' }} />
                    <p className="empty-state-title">All stocked up!</p>
                    <p className="empty-state-text">No low stock items</p>
                </div>
            ) : (
                <div className="low-stock-list">
                    {products.map((product) => (
                        <div key={product._id} className="low-stock-item">
                            <div className="low-stock-product">
                                {product.image ? (
                                    <img
                                        src={`http://localhost:5000${product.image}`}
                                        alt={product.name}
                                        className="low-stock-img"
                                    />
                                ) : (
                                    <div className="low-stock-img-placeholder">
                                        <FaBox />
                                    </div>
                                )}
                                <div className="low-stock-info">
                                    <span className="low-stock-name">{product.name}</span>
                                    <span className="low-stock-seller">{product.seller?.storeName || 'Unknown seller'}</span>
                                </div>
                            </div>
                            <span className={`low-stock-badge ${getStockClass(product.stock)}`}>
                                {product.stock} left
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default LowStockWidget;
