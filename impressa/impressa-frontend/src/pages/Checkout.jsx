import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatRwf } from "../utils/currency";
import api from "../utils/axiosInstance";
import { getProvinces, getDistricts, getSectors, getCells } from "../utils/locationHelpers";
import { FaShoppingCart, FaCreditCard, FaMoneyBillWave, FaLock, FaHeart, FaSearch, FaTruck, FaMobileAlt } from "react-icons/fa";
import LandingFooter from "../components/LandingFooter";
import Header from "../components/Header";
import "./Checkout.css";

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, totals, clearCart } = useCart();
  const nav = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    province: "",
    district: "",
    sector: "",
    cell: "",
    // We keep these for backend compatibility if needed
    city: "",
    country: "Rwanda"
  });

  // Location data states
  const [provinces, setProvinces] = useState([]);
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [availableSectors, setAvailableSectors] = useState([]);
  const [availableCells, setAvailableCells] = useState([]);

  // Initialize Provinces
  useEffect(() => {
    setProvinces(getProvinces());
  }, []);

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.name ? user.name.split(' ')[0] : prev.firstName,
        lastName: user.name && user.name.split(' ').length > 1 ? user.name.split(' ').slice(1).join(' ') : prev.lastName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        address: user.address || prev.address,
      }));
    }
  }, [user]);

  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [loadingShipping, setLoadingShipping] = useState(false);

  const [taxData, setTaxData] = useState({ totalTax: 0, taxes: [] });

  const [paymentMethod, setPaymentMethod] = useState("mtn_momo");
  const [momoPhone, setMomoPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'pending', 'success', 'failed'

  // Fetch shipping methods when district changes
  useEffect(() => {
    const fetchShipping = async () => {
      setLoadingShipping(true);
      try {
        const { data } = await api.post("/shipping/calculate", {
          province: formData.province,
          district: formData.district,
          sector: formData.sector,
          cell: formData.cell,
          total: totals.subtotal,
          items: items
        });
        setShippingMethods(data.data);

        // Auto-select first method if available
        if (data.data.length > 0) {
          const first = data.data[0];
          setSelectedMethod(first);
          setShippingCost(first.cost);
        } else {
          setSelectedMethod(null);
          setShippingCost(0);
        }
      } catch (error) {
        console.error("Error fetching shipping:", error);
      } finally {
        setLoadingShipping(false);
      }
    };

    if (formData.district) {
      fetchShipping();
    }
  }, [formData.district, formData.province, totals.subtotal, items]);

  // Fetch tax calculation when shipping/subtotal changes
  useEffect(() => {
    const fetchTax = async () => {
      try {
        const { data } = await api.post("/taxes/calculate", {
          province: formData.province,
          district: formData.district,
          sector: formData.sector,
          cell: formData.cell,
          subtotal: totals.subtotal - (totals.discount || 0),
          shippingCost: shippingCost
        });
        setTaxData(data.data);
      } catch (error) {
        console.error("Error calculating tax:", error);
      }
    };

    fetchTax();
  }, [formData.district, formData.province, totals.subtotal, totals.discount, shippingCost]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProvinceChange = (e) => {
    const province = e.target.value;
    setFormData({
      ...formData,
      province,
      district: "",
      sector: "",
      cell: "",
      city: "" // Reset city/district
    });
    setAvailableDistricts(getDistricts(province));
    setAvailableSectors([]);
    setAvailableCells([]);
  };

  const handleDistrictChange = (e) => {
    const district = e.target.value;
    setFormData({
      ...formData,
      district,
      sector: "",
      cell: "",
      city: district // Map district to city for backend compatibility
    });
    setAvailableSectors(getSectors(district));
    setAvailableCells([]);
  };

  const handleSectorChange = (e) => {
    const sector = e.target.value;
    setFormData({
      ...formData,
      sector,
      cell: ""
    });
    setAvailableCells(getCells(sector));
  };

  const handleCellChange = (e) => {
    const cell = e.target.value;
    setFormData({
      ...formData,
      cell
    });
  };

  const handleMethodChange = (method) => {
    setSelectedMethod(method);
    setShippingCost(method.cost);
  };

  const grandTotal = (totals.subtotal - (totals.discount || 0)) + shippingCost + taxData.totalTax;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!selectedMethod) {
      alert("Please select a shipping method");
      return;
    }
    if (paymentMethod === "mtn_momo" && !momoPhone) {
      alert("Please enter your Mobile Money phone number");
      return;
    }

    setIsProcessing(true);
    setPaymentStatus("creating_order");

    try {
      // 1. Create Order
      const fullAddressString = `${formData.address}, ${formData.cell}, ${formData.sector}, ${formData.district}, ${formData.province}`;

      const orderPayload = {
        items,
        billingAddress: {
          ...formData,
          fullName: `${formData.firstName} ${formData.lastName}`,
          address: fullAddressString
        },
        shippingAddress: {
          ...formData,
          fullName: `${formData.firstName} ${formData.lastName}`,
          address: fullAddressString
        },
        totals: { ...totals, grandTotal },
        shipping: selectedMethod,
        tax: taxData,
        paymentMethod,
        guestInfo: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone
        }
      };

      const orderRes = await api.post("/orders/create", orderPayload);
      const { orderId } = orderRes.data;

      // 2. Process Payment
      if (paymentMethod === "mtn_momo") {
        setPaymentStatus("awaiting_payment");
        const payRes = await api.post("/payments/process", {
          orderId,
          paymentMethod: "mtn_momo",
          phone: momoPhone
        });

        if (payRes.data.success) {
          // Poll for status
          const pollInterval = setInterval(async () => {
            try {
              const statusRes = await api.get(`/payments/status/${orderId}`);
              const status = statusRes.data.status;

              if (status === "completed" || status === "processing") {
                clearInterval(pollInterval);
                setPaymentStatus("success");
                clearCart();
                setTimeout(() => nav("/shop"), 3000); // Redirect to shop or success page
              } else if (status === "failed") {
                clearInterval(pollInterval);
                setPaymentStatus("failed");
                setIsProcessing(false);
              }
            } catch (err) {
              console.error("Polling error", err);
            }
          }, 3000); // Check every 3 seconds
        }
      } else {
        // Other methods (e.g. Cash)
        setPaymentStatus("success");
        clearCart();
        alert("Order placed successfully!");
        nav("/shop");
      }

    } catch (error) {
      console.error("Order placement failed:", error);
      alert("Failed to place order. Please try again.");
      setIsProcessing(false);
      setPaymentStatus(null);
    }
  };

  return (
    <div className="checkout-page font-roboto">
      <Header />

      <main>
        <section className="checkout-hero">
          <div className="hero-bg-shapes">
            <div className="shape shape-green"></div>
            <div className="shape shape-yellow"></div>
            <div className="shape shape-blue"></div>
          </div>
          <div className="hero-content">
            <h1 className="hero-title">
              <FaLock className="secure-icon" />
              Secure Checkout
            </h1>
            <p className="hero-subtitle">
              Almost there! Please provide your details to complete the order.
            </p>
          </div>
        </section>

        <section className="checkout-content-wrapper">
          <div className="checkout-container max-w-3xl mx-auto px-4">
            <form onSubmit={handlePlaceOrder} className="flex flex-col gap-6">

              {/* 1. Billing & Shipping Card */}
              <div className="card billing-section">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-700 pb-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                    <FaTruck className="text-xl" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Billing & Shipping</h2>
                    <p className="text-slate-400 text-sm">Enter your delivery details hierarchy</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="firstName" className="text-xs font-bold text-slate-400 uppercase">First Name</label>
                    <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required className="checkout-input" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="lastName" className="text-xs font-bold text-slate-400 uppercase">Last Name</label>
                    <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required className="checkout-input" />
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label htmlFor="email" className="text-xs font-bold text-slate-400 uppercase">Email Address</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required className="checkout-input" />
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label htmlFor="phone" className="text-xs font-bold text-slate-400 uppercase">Phone Number</label>
                    <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} required className="checkout-input" />
                  </div>

                  {/* Location - Province/District Row */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="province" className="text-xs font-bold text-slate-400 uppercase">Province</label>
                    <select id="province" name="province" value={formData.province} onChange={handleProvinceChange} required className="checkout-input">
                      <option value="">Select Province</option>
                      {provinces.map(prov => <option key={prov} value={prov}>{prov}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="district" className="text-xs font-bold text-slate-400 uppercase">District</label>
                    <select id="district" name="district" value={formData.district} onChange={handleDistrictChange} required disabled={!formData.province} className={`checkout-input ${!formData.province ? 'read-only' : ''}`}>
                      <option value="">Select District</option>
                      {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  {/* Location - Sector/Cell Row */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="sector" className="text-xs font-bold text-slate-400 uppercase">Sector</label>
                    <select id="sector" name="sector" value={formData.sector} onChange={handleSectorChange} required disabled={!formData.district} className={`checkout-input ${!formData.district ? 'read-only' : ''}`}>
                      <option value="">Select Sector</option>
                      {availableSectors.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="cell" className="text-xs font-bold text-slate-400 uppercase">Cell</label>
                    <select id="cell" name="cell" value={formData.cell} onChange={handleCellChange} required disabled={!formData.sector} className={`checkout-input ${!formData.sector ? 'read-only' : ''}`}>
                      <option value="">Select Cell</option>
                      {availableCells.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Address Full Width */}
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label htmlFor="address" className="text-xs font-bold text-slate-400 uppercase">Street Address / Village</label>
                    <input type="text" id="address" name="address" value={formData.address} onChange={handleInputChange} required className="checkout-input" placeholder="e.g. KG 123 St, Village name" />
                  </div>
                </div>

                {/* Shipping Method Selector inside Billing Card */}
                <div className="shipping-methods-container mt-8 pt-8 border-t border-slate-700">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <FaTruck className="text-purple-500" />
                    Shipping Method
                  </h3>
                  {loadingShipping ? (
                    <p className="text-slate-400 text-sm">Loading shipping methods...</p>
                  ) : shippingMethods.length > 0 ? (
                    <div className="grid gap-3">
                      {shippingMethods.map((method, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleMethodChange(method)}
                          className={`p-4 rounded-xl border cursor-pointer flex justify-between items-center transition-all ${selectedMethod?._id === method._id ? 'bg-purple-500/10 border-purple-500 shadow-lg shadow-purple-500/10' : 'bg-slate-900 border-slate-700 hover:border-slate-500'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedMethod?._id === method._id ? 'border-purple-500' : 'border-slate-500'}`}>
                              {selectedMethod?._id === method._id && <div className="w-2 h-2 bg-purple-500 rounded-full" />}
                            </div>
                            <span className="text-slate-200 font-medium">{method.name}</span>
                          </div>
                          <span className="text-white font-bold">{method.cost === 0 ? "Free" : formatRwf(method.cost)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 bg-slate-900/50 p-3 rounded border border-slate-800">Select province and district to see shipping options.</p>
                  )}
                </div>
              </div>

              {/* 2. Payment Method Card - Middle */}
              <div className="card payment-section">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-700 pb-4">
                  <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400">
                    <FaCreditCard className="text-xl" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Payment Method</h2>
                    <p className="text-slate-400 text-sm">Secure checkout with MTN MoMo</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* MoMo Option */}
                  <div onClick={() => setPaymentMethod("mtn_momo")} className={`border rounded-xl overflow-hidden transition-all ${paymentMethod === 'mtn_momo' ? 'border-yellow-500 ring-1 ring-yellow-500 bg-slate-800/50' : 'border-slate-700 bg-slate-900'}`}>
                    <div className="p-4 flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'mtn_momo' ? 'border-yellow-500' : 'border-slate-500'}`}>
                          {paymentMethod === 'mtn_momo' && <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>}
                        </div>
                        <span className="font-semibold text-white">MTN Mobile Money</span>
                      </div>
                      <FaMoneyBillWave className="text-yellow-500 text-xl" />
                    </div>

                    {paymentMethod === "mtn_momo" && (
                      <div className="px-4 pb-4 pt-0 animate-fadeIn">
                        <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                          <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">MoMo Phone Number</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><FaMobileAlt /></span>
                            <input
                              type="tel"
                              value={momoPhone}
                              onChange={(e) => setMomoPhone(e.target.value)}
                              placeholder="078..."
                              className="w-full bg-slate-800 border border-slate-600 rounded-lg py-3 pl-10 pr-4 text-white focus:border-yellow-500 focus:outline-none placeholder:text-slate-600 transition-colors"
                            />
                          </div>
                          <p className="text-xs text-yellow-500/80 mt-2 italic flex items-center gap-1">
                            <span className="w-1 h-1 bg-yellow-500 rounded-full"></span>
                            Prompt will be sent to this number
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Credit Card (Disabled) */}
                  <div onClick={() => setPaymentMethod("credit_card")} className={`border rounded-xl p-4 flex items-center justify-between opacity-50 cursor-not-allowed ${paymentMethod === 'credit_card' ? 'border-purple-500' : 'border-slate-800 bg-slate-900'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border border-slate-600"></div>
                      <span className="font-semibold text-slate-400">Credit Card (Coming Soon)</span>
                    </div>
                    <FaCreditCard className="text-slate-600 text-xl" />
                  </div>
                </div>
              </div>

              {/* 3. Order Summary & Total Card - Bottom */}
              <div className="card summary-section">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <FaShoppingCart className="text-green-500" /> Your Order
                </h2>

                <div className="space-y-3 mb-6">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                      <div className="w-12 h-12 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0 relative">
                        {item.product?.images?.[0] ? (
                          <img src={`http://localhost:5000${item.product.images[0]}`} alt={item.name} className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                        ) : null}
                        <div className="w-full h-full absolute inset-0 flex items-center justify-center text-slate-600 text-xs font-bold bg-slate-800 -z-10">IMG</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{item.name}</p>
                        <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-white whitespace-nowrap">{formatRwf(item.quantity * (item.product.price || 0))}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-700">
                  <div className="flex justify-between text-slate-400 text-sm">
                    <span>Subtotal</span>
                    <span>{formatRwf(totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-sm">
                    <span>Shipping</span>
                    <span>{selectedMethod ? formatRwf(shippingCost) : "--"}</span>
                  </div>
                  {taxData.taxes.map((tax, idx) => (
                    <div key={idx} className="flex justify-between text-slate-400 text-sm">
                      <span>{tax.name} ({tax.rate}%)</span>
                      <span>{formatRwf(tax.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-white font-bold text-xl pt-4 border-t border-slate-700 mt-2">
                    <span>Total to Pay</span>
                    <span className="text-purple-400">{formatRwf(grandTotal)}</span>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  type="submit"
                  disabled={!selectedMethod || isProcessing}
                  className={`mt-8 w-full py-4 rounded-full font-bold text-lg flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] ${(!selectedMethod || isProcessing) ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white shadow-xl shadow-purple-600/20'}`}
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Place Order Securely</span>
                      <FaLock />
                    </>
                  )}
                </button>

                {paymentStatus === "awaiting_payment" && (
                  <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-center animate-pulse">
                    <p className="font-bold text-yellow-500">Check your phone!</p>
                    <p className="text-sm text-yellow-100/70 mt-1">Please approve the payment on {momoPhone}.</p>
                  </div>
                )}

                {paymentStatus === "success" && (
                  <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
                    <p className="font-bold text-green-500">Payment Successful!</p>
                    <p className="text-sm text-green-100/70 mt-1">Redirecting to order confirmation...</p>
                  </div>
                )}

                <p className="text-center text-xs text-slate-500 mt-6">
                  By placing your order, you agree to our <Link to="/terms" className="underline hover:text-purple-400 transition-colors">Terms and Conditions</Link>.
                </p>
              </div>

            </form>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
