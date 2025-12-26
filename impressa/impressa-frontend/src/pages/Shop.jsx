import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FaSearch, FaHeart, FaShoppingCart, FaStar, FaStarHalfAlt, FaTshirt, FaRegHeart
} from "react-icons/fa";

import api from "../utils/axiosInstance";
import { formatRwf } from "../utils/currency";
import assetUrl from "../utils/assetUrl";
import Header from "../components/Header";
import LandingFooter from "../components/LandingFooter";
import { useCart } from "../context/CartContext";

import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext";
import Breadcrumbs from "../components/Breadcrumbs";
import "./Shop.css";

const WishlistButton = ({ product }) => {
  const { ids, toggle } = useWishlist();
  const isWishlisted = ids.includes(product._id);

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product._id);
  };

  return (
    <button
      onClick={toggleWishlist}
      className="shop-wishlist-btn"
      title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      {isWishlisted ? (
        <FaHeart className="text-red-500 text-lg" />
      ) : (
        <FaRegHeart className="text-gray-600 hover:text-red-500 text-lg" />
      )}
    </button>
  );
};

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // Get initial values from URL params
  const [q, setQ] = useState(searchParams.get("q") || searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  const { addItem } = useCart();
  const { showError, showSuccess } = useToast();
  const [categories, setCategories] = useState([]);
  const [debouncedQ, setDebouncedQ] = useState(q);

  const handleAddToCart = async (product) => {
    if (product.customizable) {
      window.location.href = `/product/${product._id}`;
      return;
    }
    try {
      await addItem(product, { quantity: 1 });
      showSuccess("Added to cart!");
    } catch (err) {
      showError("Failed to add to cart");
    }
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(q), 500);
    return () => clearTimeout(timer);
  }, [q]);

  // Fetch categories on mount
  useEffect(() => {
    (async () => {
      try {
        const catRes = await api.get("/categories");
        setCategories(catRes.data.data || []);
      } catch (e) {
        console.error("Failed to load categories", e);
        showError("Failed to load product categories.");
      }
    })();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        // Check for special sort types (featured, trending)
        if (sortBy === "featured") {
          const { data } = await api.get("/products/featured/list");
          const productList = Array.isArray(data) ? data : (data.products || []);
          setProducts(productList);
          setLoading(false);
          return;
        }

        if (sortBy === "trending") {
          const { data } = await api.get("/products/trending");
          const productList = Array.isArray(data) ? data : [];
          setProducts(productList);
          setLoading(false);
          return;
        }

        // Build query params for regular product fetch
        const params = new URLSearchParams();
        if (debouncedQ) params.append("search", debouncedQ);

        // Handle category - could be ID or name from Home page
        if (selectedCategory) {
          // Check if it's a category ID (24-char hex) or a name
          const isObjectId = /^[a-f\d]{24}$/i.test(selectedCategory);
          if (isObjectId) {
            params.append("category", selectedCategory);
          } else {
            // Find category by name and use its ID
            const cat = categories.find(c =>
              c.name.toLowerCase() === selectedCategory.toLowerCase() ||
              c.slug?.toLowerCase() === selectedCategory.toLowerCase()
            );
            if (cat) {
              params.append("category", cat._id);
            } else {
              // Still append as-is, backend might support name search
              params.append("category", selectedCategory);
            }
          }
        }

        if (minPrice) params.append("minPrice", minPrice);
        if (maxPrice) params.append("maxPrice", maxPrice);

        // Add sort parameter
        if (sortBy && sortBy !== "newest") {
          params.append("sort", sortBy);
        }

        const { data } = await api.get(`/products?${params.toString()}`);
        let productList = Array.isArray(data) ? data : (data.products || []);

        // Client-side sorting if backend doesn't support it
        if (sortBy === "price-asc") {
          productList = [...productList].sort((a, b) => a.price - b.price);
        } else if (sortBy === "price-desc") {
          productList = [...productList].sort((a, b) => b.price - a.price);
        } else if (sortBy === "newest") {
          productList = [...productList].sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
          );
        }

        setProducts(productList);
      } catch (e) {
        console.error("Failed to load products", e);
        if (e.name !== "CanceledError") showError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    })();
  }, [debouncedQ, selectedCategory, minPrice, maxPrice, sortBy, categories]);

  // Handle sort change
  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSortBy(newSort);
    // Update URL
    const newParams = new URLSearchParams(searchParams);
    if (newSort && newSort !== "newest") {
      newParams.set("sort", newSort);
    } else {
      newParams.delete("sort");
    }
    setSearchParams(newParams);
  };

  // Handle category selection
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    // Update URL
    const newParams = new URLSearchParams(searchParams);
    if (categoryId) {
      newParams.set("category", categoryId);
    } else {
      newParams.delete("category");
    }
    setSearchParams(newParams);
  };

  // Get display title based on current filter
  const getPageTitle = () => {
    if (sortBy === "featured") return "Featured Products";
    if (sortBy === "trending") return "Trending Now";
    if (selectedCategory) {
      const cat = categories.find(c => c._id === selectedCategory || c.name === selectedCategory);
      return cat ? cat.name : "Shop";
    }
    return "All Products";
  };

  return (
    <div style={{ fontFamily: "'Roboto', sans-serif" }}>
      <Header />

      <main>
        <section className="shop-main-section">
          <div className="shop-layout">
            <div style={{ width: '100%' }}>
              <Breadcrumbs items={[{ label: 'Shop' }]} />
            </div>
            <aside className="shop-sidebar">
              <div className="shop-sidebar-title"><FaSearch /> Filters</div>

              <div className="shop-filter-group">
                <label className="shop-filter-label">Search</label>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Product name..."
                  className="shop-filter-input"
                />
              </div>

              <div className="shop-filter-group">
                <label className="shop-filter-label">Category</label>
                <div className="category-list">
                  <div
                    className={`category-item ${selectedCategory === "" ? "active" : ""}`}
                    onClick={() => handleCategoryChange("")}
                  >
                    <span>All Categories</span>
                  </div>
                  {categories.map(c => (
                    <div
                      key={c._id}
                      className={`category-item ${selectedCategory === c._id || selectedCategory === c.name ? "active" : ""}`}
                      onClick={() => handleCategoryChange(c._id)}
                    >
                      <span>{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="shop-filter-group">
                <label className="shop-filter-label">Price Range</label>
                <div className="shop-price-inputs">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Min"
                    className="shop-price-input"
                  />
                  <div className="shop-price-separator">-</div>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Max"
                    className="shop-price-input"
                  />
                </div>
              </div>
            </aside>

            <div className="shop-content">
              <div className="shop-top-bar">
                <div>
                  <h2 className="shop-page-title">{getPageTitle()}</h2>
                  <span className="shop-results-count">{products.length} Products Found</span>
                </div>
                <select
                  className="shop-sort-select"
                  value={sortBy}
                  onChange={handleSortChange}
                >
                  <option value="newest">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="featured">Featured</option>
                  <option value="trending">Trending</option>
                </select>
              </div>

              <div className="shop-grid">
                {loading ? <div className="text-gray-500 col-span-full text-center">Loading products...</div> : products.map((p) => (
                  <div key={p._id} className="shop-card group">
                    <Link to={`/product/${p._id}`} className="shop-card-image-wrapper">
                      {p.image ? <img src={assetUrl(p.image)} alt={p.name} className="shop-card-img" /> : <div className="product-fallback-container"><FaTshirt className="product-fallback-icon" /></div>}
                      <WishlistButton product={p} />
                    </Link>
                    <div className="shop-card-body">
                      <h3 className="shop-card-title">{p.name}</h3>
                      <p className="shop-card-desc">{p.description}</p>
                      <div className="shop-card-footer">
                        <span className="shop-card-price">{formatRwf(p.price)}</span>
                        <div className="shop-rating"><FaStar className="text-sm" /><FaStar className="text-sm" /><FaStar className="text-sm" /><FaStar className="text-sm" /><FaStarHalfAlt className="text-sm" /></div>
                      </div>
                      <button
                        onClick={() => handleAddToCart(p)}
                        className="shop-add-btn"
                      >
                        <FaShoppingCart className="mr-2 inline" />{p.customizable ? 'Customize' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {products.length === 0 && !loading && (
                <div className="shop-empty-state">
                  <h3 className="text-2xl font-bold mb-2">No Products Found</h3>
                  <p>Try adjusting your search or check back later for new arrivals.</p>
                </div>
              )}
            </div>
          </div>
        </section>

      </main>
      <LandingFooter />
    </div>
  );
}