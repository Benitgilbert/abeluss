import { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";

function TopOrderedProductsTable() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const res = await axios.get("/analytics/top-products");
        setProducts(res.data);
      } catch (err) {
        console.error("Failed to fetch top products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopProducts();
  }, []);

  if (loading) return (
    <div className="card">
      <div style={{ padding: "1rem" }}>Loading top products...</div>
    </div>
  );

  return (
    <div className="card h-full">
      <h3 className="card-title">Most Ordered Products</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {products.map((product, idx) => (
          <div
            key={product._id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.75rem",
              backgroundColor: "#f9fafb",
              borderRadius: "0.5rem",
              transition: "background-color 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f3f4f6"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{
                width: "2.5rem", height: "2.5rem", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: "bold", color: "white", flexShrink: 0,
                backgroundColor: idx === 0 ? "#eab308" : idx === 1 ? "#9ca3af" : idx === 2 ? "#fb923c" : "#3b82f6"
              }}>
                #{idx + 1}
              </div>
              <div>
                <p style={{ fontWeight: 500, color: "#111827", margin: 0 }}>{product.productName}</p>
                <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0 }}>{product.totalOrders} orders</p>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontWeight: 600, color: "#111827", margin: 0 }}>{product.totalQuantity} units</p>
              <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0 }}>sold</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopOrderedProductsTable;
