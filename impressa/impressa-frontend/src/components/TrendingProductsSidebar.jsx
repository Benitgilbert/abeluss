import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/axiosInstance";
import { FaStar, FaArrowRight } from "react-icons/fa";
import "../styles/TrendingProductsSidebar.css";

function TrendingProductsSidebar() {
    const [products, setProducts] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const res = await api.get("/products/trending");
                if (res.data && res.data.length > 0) {
                    setProducts(res.data.slice(0, 5)); // Take top 5
                }
            } catch (err) {
                console.error("Failed to fetch trending products:", err);
            }
        };
        fetchTrending();
    }, []);

    // Auto-rotate carousel
    useEffect(() => {
        if (products.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % products.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [products]);

    if (products.length === 0) {
        // Fallback if no products
        return (
            <div className="trending-sidebar">
                <div className="sidebar-fallback">
                    <h1>IMPRESSA</h1>
                    <p>Premium Shopping Experience</p>
                </div>
            </div>
        );
    }

    const currentProduct = products[currentIndex];

    return (
        <div className="trending-sidebar">
            {/* Background Image with Blur */}
            <div className="sidebar-bg-layer">
                <img
                    src={`http://localhost:5000${currentProduct.images?.[0] || currentProduct.image}`}
                    alt="Background"
                    className="sidebar-bg-image"
                />
                <div className="sidebar-overlay"></div>
            </div>

            <div className="sidebar-content">
                <div className="sidebar-header">
                    <div className="trending-badge">
                        <span>Trending Now</span>
                    </div>
                    <div className="rating-stars">
                        {[...Array(5)].map((_, i) => (
                            <FaStar key={i} className="star-icon" />
                        ))}
                    </div>
                </div>

                <div className="product-display">
                    <div className="product-image-wrapper">
                        <div className="glow-effect"></div>
                        <img
                            src={`http://localhost:5000${currentProduct.images?.[0] || currentProduct.image}`}
                            alt={currentProduct.name}
                            className="product-image"
                        />
                    </div>

                    <h2 className="product-name">{currentProduct.name}</h2>
                    <p className="product-price">{currentProduct.price?.toLocaleString()} RWF</p>

                    <Link to={`/product/${currentProduct._id}`} className="view-details-btn">
                        View Details <FaArrowRight className="arrow-icon" />
                    </Link>
                </div>

                {/* Carousel Indicators */}
                <div className="carousel-indicators">
                    {products.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`indicator-dot ${idx === currentIndex ? "active" : "inactive"}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default TrendingProductsSidebar;
