import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatRwf } from "../utils/currency";
import { FaShoppingCart, FaTrashAlt, FaArrowRight, FaHeart, FaSearch, FaTimes } from "react-icons/fa";
import LandingFooter from "../components/LandingFooter";
import Header from "../components/Header";
import * as api from "../services/api";
import "./Cart.css";

export default function CartPage() {
  const { items, updateQty, removeItem, totals, setFile, applyCoupon, removeCoupon, coupon } = useCart();
  const nav = useNavigate();
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState(null);

  // Shipping Calculator State
  const [shippingAddress, setShippingAddress] = useState({ country: "Rwanda", city: "", zip: "" });
  const [shippingEstimate, setShippingEstimate] = useState(null);
  const [calculating, setCalculating] = useState(false);

  const handleCalculateShipping = async () => {
    try {
      setCalculating(true);
      const res = await api.calculateShipping(shippingAddress);
      setShippingEstimate(res.data);
    } catch (error) {
      console.error("Failed to calculate shipping", error);
    } finally {
      setCalculating(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      await applyCoupon(couponCode);
      setCouponMessage({ type: "success", text: "Coupon applied successfully!" });
      setCouponCode("");
    } catch (error) {
      setCouponMessage({ type: "error", text: error.response?.data?.message || "Invalid coupon code" });
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await removeCoupon();
      setCouponMessage(null);
    } catch (error) {
      console.error("Failed to remove coupon", error);
    }
  };

  return (
    <div className="cart-page-wrapper">
      <Header />

      <main>
        <section className="cart-hero-section">
          <div className="cart-hero-bg">
            <div className="cart-hero-blob blob-green animate-blob"></div>
            <div className="cart-hero-blob blob-yellow animate-blob animation-delay-2000"></div>
            <div className="cart-hero-blob blob-blue animate-blob animation-delay-4000"></div>
          </div>
          <div className="cart-hero-content">
            <h1 className="cart-hero-title">
              <FaShoppingCart className="inline mr-3 text-blue-800" />
              Your Shopping Cart
            </h1>
            <p className="cart-hero-subtitle">
              Review your items, make any changes, and proceed to checkout.
            </p>
          </div>
        </section>

        <section className="cart-main-content">
          <div className="cart-container">
            {items.length === 0 ? (
              <div className="cart-empty-state">
                <div className="cart-empty-text">Your cart is empty. Time to find some amazing products!</div>
                <Link
                  to="/shop"
                  className="cart-continue-btn"
                >
                  Continue Shopping <FaArrowRight className="ml-2" />
                </Link>
              </div>
            ) : (
              <div className="cart-grid">
                <div className="cart-items-col">
                  <table className="cart-table">
                    <thead className="cart-thead">
                      <tr>
                        <th className="cart-th">Product</th>
                        <th className="cart-th hidden-sm">Price</th>
                        <th className="cart-th">Qty</th>
                        <th className="cart-th">Subtotal</th>
                        <th className="cart-th"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((it, idx) => (
                        <tr key={idx} className="cart-tr">
                          <td className="cart-td">
                            <div className="cart-item-name">{it.name}</div>
                            {it.customText && <div className="cart-item-meta">Text: <strong>{it.customText}</strong></div>}
                            {it.cloudLink && <div className="cart-item-meta truncate">Cloud: <strong>{it.cloudLink}</strong></div>}
                            <div className="cart-file-upload">
                              <label className="cart-file-label">Customization file (image/PDF)</label>
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={(e) => setFile(idx, e.target.files?.[0] || null)}
                                className="cart-file-input"
                              />
                            </div>
                          </td>
                          <td className="cart-td-center cart-price-cell hidden-sm">
                            {formatRwf(it.product.price)}
                          </td>
                          <td className="cart-td-center">
                            <input
                              type="number"
                              min={1}
                              value={it.quantity}
                              onChange={(e) => updateQty(idx, parseInt(e.target.value || "1"))}
                              className="cart-qty-input"
                            />
                          </td>
                          <td className="cart-td-center cart-subtotal-cell">
                            {formatRwf((it.product.price || 0) * it.quantity)}
                          </td>
                          <td className="cart-td-center">
                            <button
                              onClick={() => removeItem(idx)}
                              className="cart-remove-btn"
                            >
                              <FaTrashAlt />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="cart-summary-col">
                  <h2 className="cart-summary-title">Order Summary</h2>
                  <div className="space-y-4">
                    <div className="cart-summary-row">
                      <div className="cart-summary-label">Items Count</div>
                      <div className="cart-summary-value">{totals.itemCount}</div>
                    </div>
                    <div className="cart-total-row">
                      <div className="cart-total-label">Order Total</div>
                      <div className="cart-total-value">{formatRwf(totals.grandTotal || totals.subtotal)}</div>
                    </div>
                    {totals.discount > 0 && (
                      <div className="cart-summary-row text-green-600 text-sm">
                        <span>Discount ({coupon})</span>
                        <span>-{formatRwf(totals.discount)}</span>
                      </div>
                    )}
                  </div>

                  {/* Coupon Section */}
                  <div className="cart-coupon-section">
                    {coupon ? (
                      <div className="cart-applied-coupon">
                        <span className="cart-coupon-text">Coupon: {coupon}</span>
                        <button onClick={handleRemoveCoupon} className="cart-remove-btn text-red-500">
                          <FaTimes />
                        </button>
                      </div>
                    ) : (
                      <div className="cart-coupon-input-group">
                        <input
                          type="text"
                          placeholder="Coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="cart-coupon-input"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          className="cart-coupon-btn"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                    {couponMessage && (
                      <p className={`text-xs mt-2 ${couponMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {couponMessage.text}
                      </p>
                    )}
                  </div>

                  {/* Shipping Calculator */}
                  <div className="cart-shipping-section">
                    <h3 className="cart-shipping-title">Estimate Shipping</h3>
                    <div className="cart-shipping-form">
                      <select
                        value={shippingAddress.country}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                        className="cart-shipping-input"
                      >
                        <option value="Rwanda">Rwanda</option>
                        <option value="USA">United States</option>
                        <option value="Other">International</option>
                      </select>
                      <input
                        type="text"
                        placeholder="City"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        className="cart-shipping-input"
                      />
                      <input
                        type="text"
                        placeholder="Zip Code"
                        value={shippingAddress.zip}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, zip: e.target.value })}
                        className="cart-shipping-input"
                      />
                      <button
                        onClick={handleCalculateShipping}
                        disabled={calculating}
                        className="cart-shipping-btn"
                      >
                        {calculating ? "Calculating..." : "Calculate Shipping"}
                      </button>
                      {shippingEstimate && (
                        <div className="cart-shipping-result">
                          <div className="flex justify-between">
                            <span>Shipping Cost:</span>
                            <span className="font-bold text-blue-800">{formatRwf(shippingEstimate.cost)}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Est. Delivery: {shippingEstimate.estimatedDays} days
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => nav("/checkout")}
                    className="cart-checkout-btn"
                  >
                    Proceed to Checkout <FaArrowRight className="ml-2" />
                  </button>
                  <Link to="/shop" className="cart-continue-link">
                    Continue Shopping
                  </Link>
                </div>
              </div>
            )}

            {/* Cross Sells */}
            {items.some(item => item.product.crossSells?.length > 0) && (
              <div className="cart-cross-sells-section">
                <h2 className="cart-cross-sells-title">Complete your order</h2>
                <div className="contact-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))" }}>
                  {Array.from(new Map(items.flatMap(item => item.product.crossSells || []).map(p => [p._id, p])).values()).map(p => (
                    <Link key={p._id} to={`/product/${p.slug}`} className="wishlist-card">
                      <div className="wishlist-card-img-link">
                        {p.image ? (
                          <img src={process.env.REACT_APP_API_URL + p.image} alt={p.name} className="wishlist-card-img" />
                        ) : (
                          <div className="wishlist-fallback-img">
                            <FaShoppingCart className="text-4xl" />
                          </div>
                        )}
                      </div>
                      <div className="wishlist-card-body">
                        <h3 className="wishlist-card-title">{p.name}</h3>
                        <div className="wishlist-price">{formatRwf(p.price)}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}