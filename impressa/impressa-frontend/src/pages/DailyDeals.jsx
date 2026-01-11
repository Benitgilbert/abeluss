import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import LandingFooter from '../components/LandingFooter';
import { FaClock, FaFire, FaShoppingCart, FaPercent } from 'react-icons/fa';
import { formatRwf } from '../utils/currency';
import { useCart } from '../context/CartContext';

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
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
            <Header />

            {/* Hero Section with Countdown */}
            <section
                className="relative py-16 md:py-24 overflow-hidden"
                style={{
                    background: activeSale
                        ? `linear-gradient(135deg, ${activeSale.bannerColor?.split(' ')[1] || '#ef4444'} 0%, ${activeSale.bannerColor?.split(' ')[3] || '#f97316'} 100%)`
                        : 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)'
                }}
            >
                <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
                <div className="relative mx-auto max-w-7xl px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-6 py-2 bg-white/20 backdrop-blur-md rounded-full text-white font-bold text-sm mb-8 animate-bounce">
                        <FaFire /> <span>Flash Sale</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
                        {activeSale ? activeSale.name : 'Daily Deals'}
                    </h1>
                    <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-12 font-medium leading-relaxed">
                        {activeSale
                            ? activeSale.description || 'Massive discounts on top products. Don\'t miss out!'
                            : 'Check back soon for our next flash sale!'
                        }
                    </p>

                    {/* Countdown Timer */}
                    {activeSale && (
                        <div className="space-y-8">
                            <div className="flex justify-center flex-wrap gap-4 md:gap-8 mb-12">
                                {[
                                    { label: 'Days', value: timeLeft.days },
                                    { label: 'Hours', value: timeLeft.hours },
                                    { label: 'Mins', value: timeLeft.minutes },
                                    { label: 'Secs', value: timeLeft.seconds }
                                ].map((box, i) => (
                                    <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 min-w-[100px] md:min-w-[140px] shadow-2xl transform hover:scale-105 transition-transform duration-300 border border-white/50 dark:border-slate-800">
                                        <div className="text-4xl md:text-6xl font-black text-red-600 dark:text-red-500 leading-none mb-2">
                                            {String(box.value).padStart(2, '0')}
                                        </div>
                                        <div className="text-xs md:text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{box.label}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-center gap-3 text-white/90 font-bold bg-black/10 backdrop-blur-sm inline-flex px-8 py-3 rounded-2xl mx-auto border border-white/10">
                                <FaClock className="animate-pulse" />
                                <span>Hurry! Sale ends {new Date(activeSale.endDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Deals Grid */}
            <section className="mx-auto max-w-7xl px-4 py-20">
                {loading ? (
                    <div className="py-20 text-center">
                        <div className="w-20 h-20 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                        <p className="text-xl font-bold text-gray-500 dark:text-gray-400">Loading daily deals...</p>
                    </div>
                ) : allProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {allProducts.map((product, index) => {
                            const isAvailable = product.isAvailable;
                            const imageUrl = product.images?.[0] || 'https://via.placeholder.com/300';

                            return (
                                <div key={`${product._id}-${index}`} className="group bg-white dark:bg-slate-900 rounded-3xl shadow-sm hover:shadow-2xl border border-gray-100 dark:border-slate-800 transition-all duration-500 overflow-hidden flex flex-col h-full transform hover:-translate-y-2">
                                    <div className="relative">
                                        {product.discount > 0 && (
                                            <div className="absolute top-4 left-4 z-10 bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-black flex items-center gap-1 shadow-lg shadow-red-500/20">
                                                <FaPercent className="text-[10px]" />
                                                {product.discount}% OFF
                                            </div>
                                        )}

                                        {product.remaining !== null && product.remaining > 0 && isAvailable && (
                                            <div className="absolute top-4 right-4 z-10 bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg shadow-amber-500/20">
                                                Only {product.remaining} left!
                                            </div>
                                        )}

                                        {!isAvailable && (
                                            <div className="absolute inset-0 z-20 bg-gray-900/40 backdrop-blur-[2px] flex items-center justify-center p-6">
                                                <span className="bg-white/90 dark:bg-slate-900/90 text-gray-900 dark:text-white px-10 py-4 rounded-2xl font-black text-2xl uppercase tracking-widest shadow-2xl rotate-[-10deg]">Sold Out</span>
                                            </div>
                                        )}

                                        <Link to={`/product/${product._id}`} className="block aspect-square overflow-hidden bg-gray-50 dark:bg-slate-950">
                                            <img
                                                src={imageUrl}
                                                alt={product.name}
                                                className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${!isAvailable ? 'grayscale opacity-50' : ''}`}
                                                onError={(e) => e.target.src = 'https://via.placeholder.com/300'}
                                            />
                                        </Link>
                                    </div>

                                    <div className="p-6 flex flex-col flex-grow">
                                        <Link to={`/product/${product._id}`} className="block mb-2 group/title">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1 group-hover/title:text-red-500 transition-colors">{product.name}</h3>
                                        </Link>

                                        <div className="flex items-center gap-3 mb-6">
                                            <span className="text-3xl font-black text-red-600 dark:text-red-500">{formatRwf(product.flashSalePrice)}</span>
                                            {product.originalPrice && product.originalPrice > product.flashSalePrice && (
                                                <span className="text-lg text-gray-400 dark:text-slate-600 line-through font-bold">{formatRwf(product.originalPrice)}</span>
                                            )}
                                        </div>

                                        {product.remaining !== null && (
                                            <div className="space-y-2 mb-8">
                                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-600">
                                                    <span>{product.soldCount} Sold</span>
                                                    <span>{product.remaining} Left</span>
                                                </div>
                                                <div className="h-2 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-red-600 to-orange-500"
                                                        style={{ width: `${(product.soldCount / (product.soldCount + product.remaining)) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-auto">
                                            {isAvailable ? (
                                                <button
                                                    onClick={() => handleAddToCart(product)}
                                                    className="w-full py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black flex items-center justify-center gap-3 transition-all hover:bg-red-600 dark:hover:bg-red-500 hover:text-white shadow-xl group/btn active:scale-95"
                                                >
                                                    <FaShoppingCart className="transition-transform group-hover/btn:-translate-y-1" />
                                                    Add to Cart
                                                </button>
                                            ) : (
                                                <button className="w-full py-5 bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-600 rounded-2xl font-black cursor-not-allowed" disabled>
                                                    Sold Out
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="max-w-xl mx-auto text-center py-20 px-6 bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl border border-gray-100 dark:border-slate-800">
                        <div className="w-24 h-24 bg-red-50 dark:bg-red-900/10 rounded-3xl flex items-center justify-center mx-auto mb-8 text-red-500 shadow-inner">
                            <FaFire className="text-4xl" />
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">No Active Flash Sales</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-10 text-lg leading-relaxed">
                            Check back soon! New flash sales are added regularly. Join our newsletter to get notified first!
                        </p>
                        <Link
                            to="/shop"
                            className="inline-flex items-center gap-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-10 py-5 rounded-2xl font-black text-lg transition-all hover:bg-red-600 dark:hover:bg-red-500 hover:text-white shadow-2xl"
                        >
                            Browse All Products
                        </Link>
                    </div>
                )}
            </section>

            <LandingFooter />
        </div>
    );
}
