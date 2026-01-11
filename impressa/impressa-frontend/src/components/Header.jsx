import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  LuSearch,
  LuShoppingCart,
  LuHeart,
  LuMoon,
  LuSun,
  LuTruck,
  LuChevronDown,
  LuUser,
  LuLogOut
} from "react-icons/lu";
import api from "../utils/axiosInstance";
import assetUrl from "../utils/assetUrl";
import { formatRwf } from "../utils/currency";

export default function Header() {
  const { items = [] } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const isSellerOrAdminView = location.pathname.startsWith('/seller') || location.pathname.startsWith('/admin');

  useEffect(() => {
    setCategoryDropdownOpen(false);
    setAccountDropdownOpen(false);
    setShowSuggestions(false);
  }, [location]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/categories');
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      setIsSearching(true);
      try {
        const res = await api.get(`/products/suggestions?q=${encodeURIComponent(searchQuery)}`);
        setSuggestions(res.data);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsSearching(false);
      }
    };
    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (productId) => {
    navigate(`/product/${productId}`);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const handleLogout = () => {
    logout();
    setAccountDropdownOpen(false);
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950 text-white shadow-xl border-b border-slate-800">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/20">
            <span className="text-xl font-bold text-white">I</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Impressa</span>
        </Link>

        {/* Navigation - ALWAYS VISIBLE */}
        {!isSellerOrAdminView && (
          <nav className="flex items-center gap-2">
            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Categories <LuChevronDown className={`w-4 h-4 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {categoryDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setCategoryDropdownOpen(false)} />
                  <div className="absolute top-full left-0 mt-2 w-60 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-40 overflow-hidden">
                    <Link
                      to="/shop"
                      onClick={() => setCategoryDropdownOpen(false)}
                      className="block px-4 py-3 text-sm text-purple-400 font-semibold hover:bg-slate-800 transition-colors"
                    >
                      All Products
                    </Link>
                    <div className="h-px bg-slate-800 mx-2" />
                    <div className="max-h-80 overflow-y-auto p-1">
                      {categories.map((cat) => (
                        <Link
                          key={cat._id}
                          to={`/shop?category=${encodeURIComponent(cat.name)}`}
                          onClick={() => setCategoryDropdownOpen(false)}
                          className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <Link to="/shop" className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Shop</Link>
            <Link to="/daily-deals" className="px-3 py-2 text-sm font-medium text-yellow-400 hover:text-yellow-300 transition-colors">Deals</Link>
            <Link to="/track" className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
              <LuTruck className="w-4 h-4" /> Track
            </Link>
            <Link to="/blog" className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Blog</Link>
          </nav>
        )}

        {/* Search Bar - ALWAYS VISIBLE */}
        {!isSellerOrAdminView && (
          <div className="flex-1 max-w-md px-4">
            <div className="relative w-full group">
              <form onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                  placeholder="Search products..."
                  className="w-full h-10 pl-4 pr-10 rounded-full bg-slate-900/50 border border-slate-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm text-white placeholder-gray-500 outline-none transition-all"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors">
                  <LuSearch className="w-5 h-5" />
                </button>
              </form>

              {showSuggestions && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowSuggestions(false)} />
                  <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-xl z-40 overflow-hidden">
                    {isSearching ? (
                      <div className="p-4 text-center text-sm text-gray-400">Searching...</div>
                    ) : suggestions.length > 0 ? (
                      <div className="py-1">
                        {suggestions.map((item) => (
                          <div
                            key={item._id}
                            onClick={() => handleSuggestionClick(item._id)}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 cursor-pointer transition-colors"
                          >
                            <img src={assetUrl(item.image)} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-slate-800" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-200 truncate">{item.name}</div>
                              <div className="text-xs text-purple-400 font-semibold">{formatRwf(item.price)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Action Icons & Auth - ALWAYS VISIBLE */}
        <div className="flex items-center gap-3">

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 text-gray-400 hover:text-white transition-colors"
            title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          >
            {theme === 'light' ? <LuMoon className="w-5 h-5" /> : <LuSun className="w-5 h-5" />}
          </button>

          {!isSellerOrAdminView && (
            <>
              {/* Wishlist */}
              <Link to="/wishlist" className="p-2.5 text-gray-400 hover:text-white transition-colors">
                <LuHeart className="w-5 h-5" />
              </Link>

              {/* Cart */}
              <Link to="/cart" className="relative p-2.5 text-gray-400 hover:text-white transition-colors">
                <LuShoppingCart className="w-5 h-5" />
                {items.length > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white border-2 border-slate-950">
                    {items.length}
                  </span>
                )}
              </Link>
            </>
          )}

          {/* User Account / Sign In */}
          {isAuthenticated ? (
            <div className="relative ml-2">
              <button
                onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 border border-slate-700 text-purple-400 hover:border-purple-500 transition-colors"
              >
                <LuUser className="w-5 h-5" />
              </button>

              {accountDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setAccountDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-40">
                    <div className="p-4 border-b border-slate-800">
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Signed in as</p>
                      <p className="text-sm font-medium text-white truncate">{user?.name || user?.email}</p>
                    </div>
                    <div className="p-1">
                      <Link to={isSellerOrAdminView ? "/seller/profile" : "/dashboard"} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                        <LuUser className="w-4 h-4" /> {isSellerOrAdminView ? 'Seller Profile' : 'Dashboard'}
                      </Link>
                      <Link to="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                        <LuTruck className="w-4 h-4" /> My Orders
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                      >
                        <LuLogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="ml-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-bold rounded-full shadow-lg shadow-purple-900/20 transition-all"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
