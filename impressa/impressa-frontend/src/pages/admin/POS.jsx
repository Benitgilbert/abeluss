import { useState, useEffect } from "react";
import axios from "../../utils/axiosInstance";
import { FaSearch, FaShoppingCart, FaTrash, FaPlus, FaMinus, FaMoneyBillWave, FaMobileAlt, FaBoxOpen } from "react-icons/fa";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";

import "./POS.css";

const POS = () => {
    // ... state logic same as before ...
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("All");

    const [showMomoModal, setShowMomoModal] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [pendingOrder, setPendingOrder] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    // Polling for Payment Status
    useEffect(() => {
        let interval;
        if (pendingOrder) {
            interval = setInterval(async () => {
                try {
                    const res = await axios.get(`/payments/status/${pendingOrder}`);
                    if (res.data.status === "completed" || res.data.status === "delivered") {
                        clearInterval(interval);
                        setPendingOrder(null);
                        setProcessing(false);
                        setShowMomoModal(false);

                        // Success Feedback
                        const successMsg = document.createElement("div");
                        successMsg.className = "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded shadow-lg z-50 animate-bounce";
                        successMsg.innerText = "Payment Confirmed! Sale Completed! 🎉";
                        document.body.appendChild(successMsg);
                        setTimeout(() => successMsg.remove(), 3000);

                        setCart([]);
                        fetchProducts();
                    } else if (res.data.status === "failed") {
                        clearInterval(interval);
                        setPendingOrder(null);
                        setProcessing(false);
                        alert("Payment Failed. Please try again.");
                    }
                } catch (err) {
                    console.error("Polling error", err);
                }
            }, 3000); // Poll every 3 seconds
        }
        return () => clearInterval(interval);
    }, [pendingOrder]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            // Fetch only Impressa's own products (admin-owned)
            const res = await axios.get("/orders/admin/pos-products");
            if (res.data.success) {
                setProducts(res.data.data);
            } else {
                setProducts([]);
            }
        } catch (err) {
            console.error("Failed to fetch products");
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product) => {
        if (product.stock <= 0) return;
        const existing = cart.find((item) => item._id === product._id);
        if (existing) {
            if (existing.quantity >= product.stock) return;
            setCart(
                cart.map((item) =>
                    item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
                )
            );
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter((item) => item._id !== productId));
    };

    const updateQuantity = (productId, delta) => {
        setCart(
            cart.map((item) => {
                if (item._id === productId) {
                    const product = products.find(p => p._id === productId);
                    const newQty = Math.max(1, item.quantity + delta);
                    if (newQty > product.stock) return item;
                    return { ...item, quantity: newQty };
                }
                return item;
            })
        );
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    };

    const initiateMomoPayment = () => {
        setShowMomoModal(true);
    };

    const confirmMomoPayment = async () => {
        if (!phoneNumber) return alert("Please enter a phone number");
        setShowMomoModal(false);
        handleCheckout("mtn_momo", phoneNumber);
    };

    const handleCheckout = async (method, phone = null) => {
        if (cart.length === 0) return;
        setProcessing(true);
        try {
            const res = await axios.post("/orders/pos", {
                items: cart.map((item) => ({
                    product: item._id,
                    quantity: item.quantity,
                })),
                paymentMethod: method,
                phone: phone
            });

            if (method === "mtn_momo" && res.data.status === "pending") {
                setPendingOrder(res.data._id);
                return;
            }

            // Cash Success Feedback
            const successMsg = document.createElement("div");
            successMsg.className = "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded shadow-lg z-50 animate-bounce";
            successMsg.innerText = "Sale Completed Successfully! 🎉";
            document.body.appendChild(successMsg);
            setTimeout(() => successMsg.remove(), 3000);

            setCart([]);
            fetchProducts();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to process sale");
        } finally {
            if (method !== "mtn_momo") setProcessing(false);
        }
    };

    const filteredProducts = products.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedCategory === "All" || p.categories?.some(c => c.name === selectedCategory))
    );

    const categories = ["All", ...new Set(products.flatMap(p => p.categories?.map(c => c.name) || []))];

    return (
        <div className="pos-layout">
            {/* MoMo Modal */}
            {showMomoModal && (
                <div className="modal-overlay">
                    <div className="modal-content momo-modal">
                        <h3 className="modal-title flex items-center gap-2 mb-4 font-bold text-xl">
                            <FaMobileAlt className="text-yellow-500" />
                            MoMo Payment
                        </h3>
                        <p className="text-gray-500 mb-4 text-sm">Enter the customer's phone number to initiate payment.</p>
                        <input
                            type="text"
                            placeholder="078..."
                            className="modal-input"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            autoFocus
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowMomoModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                            >Cancel</button>
                            <button
                                onClick={confirmMomoPayment}
                                className="px-6 py-2 bg-yellow-500 text-white rounded-lg font-bold hover:bg-yellow-600"
                            >Request Pay</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Polling Overlay */}
            {pendingOrder && (
                <div className="polling-overlay">
                    <div className="loading-spinner"></div>
                    <h2 className="text-2xl font-bold mb-2">Waiting for Confirmation...</h2>
                    <p className="text-gray-300">Please ask the customer to approve the payment on their phone.</p>
                </div>
            )}

            <Sidebar />
            <div className="pos-main">
                <Topbar />
                <div className="pos-content">
                    {/* Left Side: Product Grid */}
                    <div className="pos-product-section">
                        {/* Header Bar */}
                        <div className="pos-search-bar">
                            <div className="search-input-wrapper">
                                <FaSearch className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search products by name or SKU..."
                                    className="search-input"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="category-chips">
                                <button
                                    onClick={() => setSelectedCategory("All")}
                                    className={`chip ${selectedCategory === "All" ? "chip-active" : "chip-inactive"}`}
                                >
                                    All Items
                                </button>
                                {categories.filter(c => c !== "All").map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`chip ${selectedCategory === cat ? "chip-active" : "chip-inactive"}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Grid Content */}
                        <div className="pos-grid-container">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                                    <p>Loading catalog...</p>
                                </div>
                            ) : (
                                <div className="pos-grid">
                                    {filteredProducts.map((product) => (
                                        <div
                                            key={product._id}
                                            onClick={() => addToCart(product)}
                                            className={`product-card ${product.stock <= 0 ? 'disabled' : ''}`}
                                        >
                                            <div className="card-image-wrapper">
                                                {product.image ? (
                                                    <img
                                                        src={`http://localhost:5000${product.image}`}
                                                        alt={product.name}
                                                        className="card-image"
                                                    />
                                                ) : (
                                                    <div className="no-image-placeholder">
                                                        <FaBoxOpen className="text-4xl mb-2" />
                                                        <span className="text-xs">No Image</span>
                                                    </div>
                                                )}
                                                {product.stock <= 0 && (
                                                    <div className="out-of-stock-overlay">
                                                        <span className="out-of-stock-badge">Out of Stock</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="card-content">
                                                <h3 className="card-title" title={product.name}>{product.name}</h3>
                                                <div className="card-footer">
                                                    <div>
                                                        <p className="card-stock">Stock: {product.stock}</p>
                                                        <span className="card-price">
                                                            <span className="text-xs align-top">RWF</span> {product.price.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <button className="card-add-btn">
                                                        <FaPlus className="text-xs" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Side: Cart Sidebar */}
                    <div className="pos-cart-section">
                        <div className="cart-header">
                            <div className="cart-title-row">
                                <h2 className="cart-title">
                                    <FaShoppingCart className="text-blue-600" />
                                    Current Sale
                                </h2>
                                <span className="cart-count-badge">{cart.length} Items</span>
                            </div>
                            <p className="order-id">Order #{Math.floor(Math.random() * 10000)}</p>
                        </div>

                        <div className="cart-items-container">
                            {cart.length === 0 ? (
                                <div className="cart-empty-state">
                                    <div className="cart-empty-icon">
                                        <FaShoppingCart />
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 500 }}>Your cart is empty</p>
                                        <p style={{ fontSize: '0.875rem' }}>Select products from the grid to start a sale.</p>
                                    </div>
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <div key={item._id} className="cart-item">
                                        <div className="item-info">
                                            <h4>{item.name}</h4>
                                            <div className="item-price-calc">
                                                RWF {item.price.toLocaleString()} x {item.quantity}
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="item-controls">
                                                <button
                                                    onClick={() => updateQuantity(item._id, -1)}
                                                    className="qty-btn"
                                                ><FaMinus style={{ fontSize: '10px' }} /></button>
                                                <span className="item-qty">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item._id, 1)}
                                                    className="qty-btn"
                                                ><FaPlus style={{ fontSize: '10px' }} /></button>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item._id)}
                                                className="item-remove"
                                            ><FaTrash /></button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer / Checkout */}
                        <div className="cart-footer">
                            <div className="cart-summary">
                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span>RWF {calculateTotal().toLocaleString()}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Tax (0%)</span>
                                    <span>RWF 0</span>
                                </div>
                                <div className="summary-row total">
                                    <span>Total Amount</span>
                                    <span className="total-amount">RWF {calculateTotal().toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="checkout-grid">
                                <button
                                    onClick={() => handleCheckout("cash")}
                                    disabled={processing || cart.length === 0}
                                    className="checkout-btn cash"
                                >
                                    <FaMoneyBillWave style={{ fontSize: '1.25rem', marginBottom: '4px' }} />
                                    <span className="btn-label">CASH PAY</span>
                                </button>
                                <button
                                    onClick={initiateMomoPayment}
                                    disabled={processing || cart.length === 0}
                                    className="checkout-btn momo"
                                >
                                    <FaMobileAlt style={{ fontSize: '1.25rem', marginBottom: '4px' }} />
                                    <span className="btn-label">MOMO PAY</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default POS;
