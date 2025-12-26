import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaTrashAlt, FaShoppingCart, FaHeart, FaArrowRight, FaTshirt } from "react-icons/fa";
import Header from "../components/Header";
import LandingFooter from "../components/LandingFooter";
import api from "../utils/axiosInstance";
import assetUrl from "../utils/assetUrl";
import { formatRwf } from "../utils/currency";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import "./Wishlist.css";

export default function Wishlist() {
  const { ids, remove } = useWishlist();
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!ids.length) {
        setProducts([]);
        setLoading(false);
        return;
      }
      try {
        const res = await api.get("/products/by-ids", { params: { ids: ids.join(",") } });
        setProducts(res.data || []);
      } catch (e) {
        console.error("Failed to load wishlist products", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [ids]);

  return (
    <div className="wishlist-page-wrapper">
      <Header />

      <main className="wishlist-main">
        {/* Hero Section */}
        <section className="wishlist-hero-section">
          <div className="wishlist-hero-bg-blobs">
            <div className="hero-blob-white blob-pos-1"></div>
            <div className="hero-blob-white blob-pos-2"></div>
          </div>
          <div className="wishlist-hero-content">
            <h1 className="wishlist-title">
              <FaHeart className="wishlist-title-icon" />
              Your Wishlist
            </h1>
            <p className="wishlist-subtitle">
              Save your favorite items for later.
            </p>
          </div>
        </section>

        <div className="wishlist-content-container">
          {loading ? (
            <div className="wishlist-state-card">
              <div className="loading-text">Loading your favorites...</div>
            </div>
          ) : ids.length === 0 ? (
            <div className="wishlist-state-card">
              <div className="wishlist-empty-icon-wrapper">
                <FaHeart className="wishlist-empty-icon" />
              </div>
              <h2 className="wishlist-empty-title">Your wishlist is empty</h2>
              <p className="wishlist-empty-text">Looks like you haven't added any items yet.</p>
              <Link
                to="/shop"
                className="wishlist-start-btn"
              >
                Start Shopping <FaArrowRight className="ml-2" />
              </Link>
            </div>
          ) : (
            <div className="wishlist-grid">
              {products.map((p) => (
                <div key={p._id} className="wishlist-card group">
                  <Link to={`/product/${p._id}`} className="wishlist-card-img-link">
                    {p.image ? (
                      <img
                        src={assetUrl(p.image)}
                        alt={p.name}
                        className="wishlist-card-img"
                      />
                    ) : (
                      <div className="wishlist-fallback-img">
                        <FaTshirt className="text-6xl opacity-50" />
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        remove(p._id);
                      }}
                      className="wishlist-remove-btn"
                      title="Remove from wishlist"
                    >
                      <FaTrashAlt />
                    </button>
                  </Link>

                  <div className="wishlist-card-body">
                    <Link to={`/product/${p._id}`} className="contact-link">
                      <h3 className="wishlist-card-title">{p.name}</h3>
                    </Link>
                    <p className="wishlist-card-desc">{p.description}</p>

                    <div className="wishlist-card-footer">
                      <span className="wishlist-price">{formatRwf(p.price)}</span>
                    </div>

                    <button
                      onClick={() => {
                        if (p.customizable || p.type === 'variable') {
                          window.location.href = `/product/${p._id}`;
                        } else {
                          addItem(p, { quantity: 1 });
                        }
                      }}
                      className="wishlist-add-btn"
                    >
                      <FaShoppingCart className="mr-2" />
                      {p.customizable || p.type === 'variable' ? 'Customize' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
