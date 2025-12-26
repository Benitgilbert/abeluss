import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import LandingFooter from '../components/LandingFooter';
import { FaClock, FaFire, FaShoppingCart, FaPercent } from 'react-icons/fa';
import { formatRwf } from '../utils/currency';
import { useCart } from '../context/CartContext';
import './DailyDeals.css';

export default function DailyDeals() {
    const [flashSales, setFlashSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [activeSale, setActiveSale] = useState(null);
    const { addItem } = useCart();

    // Fetch active flash sales
    useEffect(() => {
        const fetchFlashSales = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/flash-sales/active');
                const data = await res.json();

                if (data.success && data.data && data.data.length > 0) {
                    setFlashSales(data.data);
                    setActiveSale(data.data[0]); // Use the first active sale
                }
            } catch (error) {
                console.error('Error fetching flash sales:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFlashSales();
    }, []);

    // Countdown timer
    useEffect(() => {
        if (!activeSale) return;

        const endTime = new Date(activeSale.endDate);

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = endTime.getTime() - now;

            if (distance < 0) {
                clearInterval(timer);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            setTimeLeft({
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000)
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [activeSale]);

    const handleAddToCart = (product) => {
        addItem({
            _id: product._id,
            name: product.name,
            price: product.flashSalePrice,
            image: product.images?.[0]
        }, { quantity: 1 });
    };

    // Get all products from all active sales
    const allProducts = flashSales.flatMap(sale =>
        sale.products.map(p => ({
            ...p,
            saleName: sale.name,
            saleEndDate: sale.endDate
        }))
    );

    return (
        <div className="daily-deals-page">
            <Header />

            {/* Hero Section with Countdown */}
            <section
                className={`deals-hero ${activeSale ? 'custom-banner' : ''}`}
                style={activeSale ? { '--tw-gradient-from': activeSale.bannerColor?.split(' ')[1] || '#ef4444', '--tw-gradient-to': activeSale.bannerColor?.split(' ')[3] || '#f97316' } : {}}
            >
                <div className="deals-hero-pattern"></div>
                <div className="deals-container">
                    <div className="deals-hero-content">
                        <span className="deals-badge">
                            <FaFire /> Flash Sale
                        </span>
                        <h1 className="deals-hero-title">
                            {activeSale ? activeSale.name : 'Daily Deals'}
                        </h1>
                        <p className="deals-hero-subtitle">
                            {activeSale
                                ? activeSale.description || 'Massive discounts on top products. Don\'t miss out!'
                                : 'Check back soon for our next flash sale!'
                            }
                        </p>

                        {/* Countdown Timer */}
                        {activeSale && (
                            <>
                                <div className="deals-countdown">
                                    <div className="deals-time-box">
                                        <div className="deals-time-value">{String(timeLeft.days).padStart(2, '0')}</div>
                                        <div className="deals-time-label">Days</div>
                                    </div>
                                    <div className="deals-time-box">
                                        <div className="deals-time-value">{String(timeLeft.hours).padStart(2, '0')}</div>
                                        <div className="deals-time-label">Hours</div>
                                    </div>
                                    <div className="deals-time-box">
                                        <div className="deals-time-value">{String(timeLeft.minutes).padStart(2, '0')}</div>
                                        <div className="deals-time-label">Mins</div>
                                    </div>
                                    <div className="deals-time-box">
                                        <div className="deals-time-value">{String(timeLeft.seconds).padStart(2, '0')}</div>
                                        <div className="deals-time-label">Secs</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'rgba(255,255,255,0.9)' }}>
                                    <FaClock />
                                    <span>Hurry! Sale ends {new Date(activeSale.endDate).toLocaleDateString()}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Deals Grid */}
            <section className="deals-container">
                {loading ? (
                    <div className="deals-empty-state">
                        Loading deals...
                    </div>
                ) : allProducts.length > 0 ? (
                    <div className="deals-grid">
                        {allProducts.map((product, index) => {
                            const isAvailable = product.isAvailable;
                            const imageUrl = product.images?.[0] || 'https://via.placeholder.com/300';

                            return (
                                <div key={`${product._id}-${index}`} className="deals-card">
                                    {product.discount > 0 && (
                                        <div className="deals-discount-badge">
                                            <FaPercent style={{ fontSize: '10px' }} />
                                            {product.discount}% OFF
                                        </div>
                                    )}

                                    {product.remaining !== null && product.remaining > 0 && (
                                        <div className="deals-stock-badge">
                                            Only {product.remaining} left!
                                        </div>
                                    )}

                                    {!isAvailable && (
                                        <div className="deals-sold-out-badge">
                                            Sold Out
                                        </div>
                                    )}

                                    <Link to={`/product/${product._id}`}>
                                        <div className="deals-image-container">
                                            <img
                                                src={imageUrl}
                                                alt={product.name}
                                                className="deals-image"
                                                style={{
                                                    filter: isAvailable ? 'none' : 'grayscale(100%)',
                                                    opacity: isAvailable ? 1 : 0.6
                                                }}
                                                onError={(e) => e.target.src = 'https://via.placeholder.com/300'}
                                            />
                                        </div>
                                    </Link>

                                    <div className="deals-card-body">
                                        <Link to={`/product/${product._id}`} style={{ textDecoration: 'none' }}>
                                            <h3 className="deals-product-name">{product.name}</h3>
                                        </Link>

                                        <div className="deals-price-row">
                                            <span className="deals-price">{formatRwf(product.flashSalePrice)}</span>
                                            {product.originalPrice && product.originalPrice > product.flashSalePrice && (
                                                <span className="deals-old-price">{formatRwf(product.originalPrice)}</span>
                                            )}
                                        </div>

                                        {product.remaining !== null && (
                                            <div className="deals-stock-info">
                                                {product.soldCount} sold • {product.remaining} remaining
                                            </div>
                                        )}

                                        {isAvailable ? (
                                            <button
                                                className="deals-add-btn"
                                                onClick={() => handleAddToCart(product)}
                                            >
                                                <FaShoppingCart />
                                                Add to Cart
                                            </button>
                                        ) : (
                                            <button className="deals-disabled-btn" disabled>
                                                Sold Out
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="deals-empty-state">
                        <FaFire className="deals-empty-icon" />
                        <h2 className="deals-empty-title">No Active Flash Sales</h2>
                        <p className="deals-empty-text">
                            Check back soon! New flash sales are added regularly.
                        </p>
                        <Link to="/shop" className="deals-browse-btn">
                            Browse All Products
                        </Link>
                    </div>
                )}
            </section>

            <LandingFooter />
        </div>
    );
}
