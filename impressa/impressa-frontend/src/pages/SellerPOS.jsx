import { useState, useEffect, useRef } from "react";
import api from "../utils/axiosInstance";
import { FaSearch, FaShoppingCart, FaTrash, FaPlus, FaMinus, FaMoneyBillWave, FaMobileAlt, FaBoxOpen, FaStore, FaBarcode } from "react-icons/fa";
import Header from "../components/Header";
import Receipt from "../components/Receipt";
import SellerSidebar from "../components/SellerSidebar"; // Import Sidebar
import "./SellerPOS.css";
import "./SellerProducts.css"; // Reuse layout styles

// Beep sound for successful scan
const playBeep = () => {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 1200;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.3;

        oscillator.start();
        setTimeout(() => oscillator.stop(), 100);
    } catch (e) {
        console.log('Audio not available');
    }
};

export default function SellerPOS() {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [seller, setSeller] = useState(null);

    // Barcode scanning
    const [scanBuffer, setScanBuffer] = useState("");
    const [lastKeyTime, setLastKeyTime] = useState(0);
    const searchInputRef = useRef(null);

    // Modals
    const [showMomoModal, setShowMomoModal] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [pendingOrder, setPendingOrder] = useState(null);
    const [showCashConfirm, setShowCashConfirm] = useState(false);
    const [cashReceived, setCashReceived] = useState("");

    // Receipt
    const [showReceipt, setShowReceipt] = useState(false);
    const [completedOrder, setCompletedOrder] = useState(null);
    const [scanError, setScanError] = useState("");

    useEffect(() => {
        fetchProducts();
        fetchSellerInfo();
    }, []);

    // Barcode scanner detection - rapid keypresses
    useEffect(() => {
        const handleKeyDown = (e) => {
            const now = Date.now();

            // If Enter is pressed, check if we have a barcode
            if (e.key === 'Enter' && scanBuffer.length >= 4) {
                e.preventDefault();
                handleBarcodeScan(scanBuffer);
                setScanBuffer("");
                return;
            }

            // If keystroke is fast (< 50ms) and alphanumeric, it's likely a scanner
            if (now - lastKeyTime < 50) {
                if (/^[a-zA-Z0-9\-]$/.test(e.key)) {
                    setScanBuffer(prev => prev + e.key);
                }
            } else {
                // Too slow, reset buffer
                setScanBuffer(e.key);
            }

            setLastKeyTime(now);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [scanBuffer, lastKeyTime, products]);

    const handleBarcodeScan = async (barcode) => {
        setScanError("");

        // First check if product is in local list
        const localProduct = products.find(
            p => p.barcode?.toUpperCase() === barcode.toUpperCase() ||
                p.sku?.toUpperCase() === barcode.toUpperCase()
        );

        if (localProduct) {
            playBeep();
            addToCart(localProduct);
            return;
        }

        // Fallback to API lookup
        try {
            const res = await api.get(`/orders/pos/lookup?barcode=${barcode}`);
            if (res.data.success && res.data.product) {
                playBeep();
                addToCart(res.data.product);
            }
        } catch (err) {
            setScanError(`Product not found: ${barcode}`);
            setTimeout(() => setScanError(""), 3000);
        }
    };

    // Manual barcode entry via search
    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter' && searchTerm.length >= 4) {
            handleBarcodeScan(searchTerm);
            setSearchTerm("");
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await api.get("/orders/seller/pos-products");
            if (res.data.success) {
                setProducts(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch products");
        } finally {
            setLoading(false);
        }
    };

    const fetchSellerInfo = async () => {
        try {
            const res = await api.get("/auth/me");
            setSeller(res.data);
        } catch (err) {
            console.error("Failed to fetch seller info");
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
                    if (newQty > (product?.stock || 0)) return item;
                    return { ...item, quantity: newQty };
                }
                return item;
            })
        );
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    };

    // Cash payment - show confirmation modal first
    const initiateCashPayment = () => {
        setCashReceived(calculateTotal().toString());
        setShowCashConfirm(true);
    };

    const confirmCashPayment = () => {
        setShowCashConfirm(false);
        handleCheckout("cash", null, parseFloat(cashReceived));
    };

    const initiateMomoPayment = () => {
        setShowMomoModal(true);
    };

    const confirmMomoPayment = async () => {
        if (!phoneNumber) return alert("Please enter a phone number");
        setShowMomoModal(false);
        handleCheckout("mtn_momo", phoneNumber);
    };

    const handleCheckout = async (method, phone = null, receivedAmount = null) => {
        if (cart.length === 0) return;
        setProcessing(true);
        try {
            const res = await api.post("/orders/seller/pos", {
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

            // Payment confirmed - show receipt
            const order = {
                ...res.data,
                cashReceived: receivedAmount,
                cashierName: seller?.name,
                items: cart.map(item => ({
                    productName: item.name,
                    quantity: item.quantity,
                    price: item.price
                }))
            };

            setCompletedOrder(order);
            setShowReceipt(true);
            setCart([]);
            fetchProducts(); // Refresh stock
        } catch (err) {
            alert(err.response?.data?.message || "Failed to process sale");
        } finally {
            if (method !== "mtn_momo") setProcessing(false);
        }
    };

    // MoMo polling
    useEffect(() => {
        let interval;
        if (pendingOrder) {
            interval = setInterval(async () => {
                try {
                    const res = await api.get(`/payments/status/${pendingOrder}`);
                    if (res.data.status === "completed" || res.data.status === "delivered") {
                        clearInterval(interval);
                        setPendingOrder(null);
                        setProcessing(false);

                        // Show receipt
                        setCompletedOrder({
                            ...res.data,
                            cashierName: seller?.name,
                            items: cart.map(item => ({
                                productName: item.name,
                                quantity: item.quantity,
                                price: item.price
                            }))
                        });
                        setShowReceipt(true);
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
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [pendingOrder]);

    const handleReceiptClose = () => {
        setShowReceipt(false);
        setCompletedOrder(null);
    };

    const filteredProducts = products.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedCategory === "All" || p.categories?.some(c => c.name === selectedCategory))
    );

    const categories = ["All", ...new Set(products.flatMap(p => p.categories?.map(c => c.name) || []))];
    const changeAmount = parseFloat(cashReceived || 0) - calculateTotal();

    return (
        <div className="seller-layout">
            <SellerSidebar />
            <div className="seller-main-content">
                <Header />
                <div className="seller-pos-page">
                    {/* Header moved up to main content, removed from here */}

                    {/* Scan Error Toast */}
                    {scanError && (
                        <div className="scan-error-toast">
                            ❌ {scanError}
                        </div>
                    )}

                    {/* Receipt Modal */}
                    {showReceipt && completedOrder && (
                        <Receipt
                            order={completedOrder}
                            seller={seller}
                            onClose={handleReceiptClose}
                        />
                    )}

                    {/* Cash Confirmation Modal */}
                    {showCashConfirm && (
                        <div className="modal-overlay">
                            <div className="modal-content cash-modal">
                                <h3><FaMoneyBillWave /> Cash Payment</h3>
                                <p className="total-display">Total: RWF {calculateTotal().toLocaleString()}</p>
                                <div className="cash-input-group">
                                    <label>Cash Received:</label>
                                    <input
                                        type="number"
                                        value={cashReceived}
                                        onChange={(e) => setCashReceived(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                {changeAmount > 0 && (
                                    <p className="change-display">
                                        Change: <strong>RWF {changeAmount.toLocaleString()}</strong>
                                    </p>
                                )}
                                <div className="modal-actions">
                                    <button className="btn-cancel" onClick={() => setShowCashConfirm(false)}>Cancel</button>
                                    <button
                                        className="btn-confirm"
                                        onClick={confirmCashPayment}
                                        disabled={parseFloat(cashReceived) < calculateTotal()}
                                    >
                                        ✓ Confirm Payment
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MoMo Modal */}
                    {showMomoModal && (
                        <div className="modal-overlay">
                            <div className="modal-content">
                                <h3><FaMobileAlt /> MoMo Payment</h3>
                                <p>Enter customer's phone number</p>
                                <input
                                    type="text"
                                    placeholder="078..."
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    autoFocus
                                />
                                <div className="modal-actions">
                                    <button className="btn-cancel" onClick={() => setShowMomoModal(false)}>Cancel</button>
                                    <button className="btn-confirm" onClick={confirmMomoPayment}>Request Pay</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pending Payment Overlay */}
                    {pendingOrder && (
                        <div className="pending-overlay">
                            <div className="pending-spinner"></div>
                            <h2>Waiting for Confirmation...</h2>
                            <p>Ask customer to approve payment on their phone</p>
                        </div>
                    )}

                    <main className="seller-pos-content">
                        {/* Header */}
                        <div className="pos-header">
                            <div className="pos-header-left">
                                <h1><FaStore /> {seller?.storeName || 'My Store'} POS</h1>
                                <p><FaBarcode /> Scan barcode or select products</p>
                            </div>
                        </div>

                        <div className="pos-grid-layout">
                            {/* Product Grid */}
                            <div className="pos-products">
                                <div className="search-bar">
                                    <FaSearch className="search-icon" />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Scan barcode or search products..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyDown={handleSearchKeyDown}
                                    />
                                </div>

                                <div className="category-chips">
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            className={`chip ${selectedCategory === cat ? 'active' : ''}`}
                                            onClick={() => setSelectedCategory(cat)}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>

                                <div className="products-grid">
                                    {loading ? (
                                        <div className="loading">Loading products...</div>
                                    ) : filteredProducts.length === 0 ? (
                                        <div className="empty">No products found</div>
                                    ) : (
                                        filteredProducts.map((product) => (
                                            <div
                                                key={product._id}
                                                className={`product-card ${product.stock <= 0 ? 'out-of-stock' : ''}`}
                                                onClick={() => addToCart(product)}
                                            >
                                                <div className="product-image">
                                                    {product.image ? (
                                                        <img src={product.image.startsWith('http') ? product.image : `http://localhost:5000${product.image}`} alt={product.name} />
                                                    ) : (
                                                        <FaBoxOpen className="placeholder-icon" />
                                                    )}
                                                    {product.stock <= 0 && <span className="oos-badge">Out of Stock</span>}
                                                </div>
                                                <div className="product-info">
                                                    <h4>{product.name}</h4>
                                                    <div className="product-meta">
                                                        <span className="price">RWF {product.price.toLocaleString()}</span>
                                                        <span className="stock">Stock: {product.stock}</span>
                                                    </div>
                                                    {product.barcode && (
                                                        <span className="barcode-label">{product.barcode}</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Cart */}
                            <div className="pos-cart">
                                <div className="cart-header">
                                    <h2><FaShoppingCart /> Current Sale</h2>
                                    <span className="item-count">{cart.length} items</span>
                                </div>

                                <div className="cart-items">
                                    {cart.length === 0 ? (
                                        <div className="cart-empty">
                                            <FaShoppingCart />
                                            <p>Scan or select products</p>
                                        </div>
                                    ) : (
                                        cart.map((item) => (
                                            <div key={item._id} className="cart-item">
                                                <div className="item-details">
                                                    <h5>{item.name}</h5>
                                                    <p>RWF {item.price.toLocaleString()} × {item.quantity}</p>
                                                </div>
                                                <div className="item-controls">
                                                    <button onClick={() => updateQuantity(item._id, -1)}><FaMinus /></button>
                                                    <span>{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item._id, 1)}><FaPlus /></button>
                                                    <button className="remove" onClick={() => removeFromCart(item._id)}><FaTrash /></button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="cart-footer">
                                    <div className="totals">
                                        <div className="total-row">
                                            <span>Subtotal</span>
                                            <span>RWF {calculateTotal().toLocaleString()}</span>
                                        </div>
                                        <div className="total-row grand">
                                            <span>Total</span>
                                            <span>RWF {calculateTotal().toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="checkout-buttons">
                                        <button
                                            className="btn-cash"
                                            onClick={initiateCashPayment}
                                            disabled={processing || cart.length === 0}
                                        >
                                            <FaMoneyBillWave /> Cash
                                        </button>
                                        <button
                                            className="btn-momo"
                                            onClick={initiateMomoPayment}
                                            disabled={processing || cart.length === 0}
                                        >
                                            <FaMobileAlt /> MoMo
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
