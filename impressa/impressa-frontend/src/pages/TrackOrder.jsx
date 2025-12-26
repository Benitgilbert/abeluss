import { useState } from "react";
import { FaSearch, FaBoxOpen, FaTruck, FaCheckCircle, FaClipboardList, FaSpinner } from "react-icons/fa";
import Header from "../components/Header";
import LandingFooter from "../components/LandingFooter";
import api from "../utils/axiosInstance";
import "../styles/TrackOrder.css";

export default function TrackOrder() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    if (!query.trim()) return;

    try {
      setLoading(true);
      const res = await api.get(`/orders/track/${encodeURIComponent(query)}`);
      setResult(res.data);
    } catch (e) {
      setError(e?.response?.data?.message || "We couldn't find an order with that ID. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'status-delivered';
      case 'shipped': return 'status-shipped';
      case 'processing': return 'status-processing';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return <FaCheckCircle className="track-icon-xl" />;
      case 'shipped': return <FaTruck className="track-icon-xl" />;
      case 'processing': return <FaBoxOpen className="track-icon-xl" />;
      default: return <FaClipboardList className="track-icon-xl" />;
    }
  };

  return (
    <div className="track-page">
      <Header />

      <main className="track-main">
        {/* Hero Section */}
        <section className="track-hero">
          <div className="track-hero-content">
            <h1 className="track-title">Track Your Order</h1>
            <p className="track-subtitle">
              Enter your Order ID below to check the current status of your shipment.
            </p>
          </div>
        </section>

        <div className="track-search-container">
          <div className="track-card">
            <form onSubmit={submit}>
              <div className="track-form-row">
                <div className="track-input-wrapper">
                  <FaSearch className="track-search-icon" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter your Order ID (e.g., ORD-12345)"
                    className="track-input"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="track-btn"
                >
                  {loading ? <FaSpinner className="animate-spin" /> : "Track Order"}
                </button>
              </div>
            </form>

            {error && (
              <div className="track-error">
                <FaClipboardList style={{ marginRight: '0.75rem', fontSize: '1.25rem' }} />
                {error}
              </div>
            )}
          </div>

          {result && (
            <div className="track-result-card">
              <div className="track-header">
                <div>
                  <h2 className="track-result-title">Order Status</h2>
                  <p className="track-result-subtitle">Order ID: <span className="track-order-id">{result.publicId}</span></p>
                </div>
                <div className={`track-status-badge ${getStatusClass(result.status)}`}>
                  {getStatusIcon(result.status)}
                  <span>{result.status}</span>
                </div>
              </div>

              <div className="track-details">
                <div className="track-grid">
                  <div>
                    <h3 className="track-section-title">Product Details</h3>
                    <div className="track-info-box">
                      <div className="track-product-name">
                        {result.product || result.items?.[0]?.productName || `Order #${result.publicId}`}
                      </div>
                      {result.items && result.items.length > 0 && (
                        <div className="track-item-count">{result.items.length} item(s)</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="track-section-title">Timeline</h3>
                    <div className="timeline-container">
                      <div className="timeline-item">
                        <div className="timeline-dot"></div>
                        <div className="timeline-content">
                          <p className="timeline-title">Order Placed</p>
                          <p className="timeline-date">{new Date(result.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}

