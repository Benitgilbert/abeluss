import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import {
  FaShoppingCart, FaHeart, FaSearch, FaUser,
  FaBars, FaTimes, FaTruck, FaChevronDown, FaMoon, FaSun
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import RoleSwitcher from "./RoleSwitcher";
import api from "../utils/axiosInstance";
import "./Layout.css";

export default function Header() {
  const { items = [] } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMobileMenuOpen(false);
    setCategoryDropdownOpen(false);
    setAccountDropdownOpen(false);
  }, [location]);

  // Fetch categories from API
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    logout();
    setAccountDropdownOpen(false);
    navigate("/login");
  };

  // Inline styles
  const headerStyle = {
    backgroundColor: '#0f172a',
    color: 'white',
    position: 'sticky',
    top: 0,
    zIndex: 50,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  };

  const containerStyle = {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 16px'
  };

  const navRowStyle = {
    display: 'flex',
    alignItems: 'center',
    height: '64px',
    gap: '16px'
  };

  const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
    color: 'white'
  };

  const logoIconStyle = {
    width: '36px',
    height: '36px',
    background: 'linear-gradient(135deg, #8b5cf6, #d946ef)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '18px'
  };

  const linkStyle = {
    color: '#d1d5db',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    background: 'none',
    border: 'none'
  };

  const searchFormStyle = {
    flex: 1,
    maxWidth: '350px'
  };

  const searchInputStyle = {
    width: '100%',
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '9999px',
    padding: '8px 40px 8px 16px',
    color: 'white',
    fontSize: '14px',
    outline: 'none'
  };

  const iconBtnStyle = {
    padding: '8px',
    color: '#d1d5db',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    textDecoration: 'none'
  };

  const signInBtnStyle = {
    backgroundColor: '#7c3aed',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '9999px',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer'
  };

  const dropdownStyle = {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: '8px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
    minWidth: '220px',
    maxHeight: '400px',
    overflowY: 'auto',
    zIndex: 100
  };

  const dropdownItemStyle = {
    display: 'block',
    padding: '12px 16px',
    color: '#374151',
    textDecoration: 'none',
    fontSize: '14px',
    borderBottom: '1px solid #f3f4f6',
    transition: 'background 0.2s'
  };

  // Determine if we are in a seller or admin view to hide client features
  const isSellerOrAdminView = location.pathname.startsWith('/seller') || location.pathname.startsWith('/admin');

  return (
    <header style={headerStyle}>
      <div style={containerStyle}>
        <div style={navRowStyle}>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ ...iconBtnStyle, display: 'none' }}
            className="mobile-menu-btn"
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>

          {/* Logo */}
          <Link to="/" style={logoStyle}>
            <div style={logoIconStyle}>I</div>
            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>Impressa</span>
          </Link>

          {/* Client Features: Categories, Nav, Search */}
          {!isSellerOrAdminView && (
            <>
              {/* Categories Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  style={linkStyle}
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  onMouseEnter={() => setCategoryDropdownOpen(true)}
                >
                  Categories <FaChevronDown style={{ fontSize: '10px' }} />
                </button>

                {categoryDropdownOpen && (
                  <div
                    style={dropdownStyle}
                    onMouseLeave={() => setCategoryDropdownOpen(false)}
                  >
                    <Link
                      to="/shop"
                      style={{ ...dropdownItemStyle, fontWeight: '600', color: '#7c3aed' }}
                      onClick={() => setCategoryDropdownOpen(false)}
                    >
                      All Products
                    </Link>
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <Link
                          key={cat._id}
                          to={`/shop?category=${encodeURIComponent(cat.name || cat.slug)}`}
                          style={dropdownItemStyle}
                          onClick={() => setCategoryDropdownOpen(false)}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
                          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          {cat.name}
                        </Link>
                      ))
                    ) : (
                      <div style={{ ...dropdownItemStyle, color: '#9ca3af' }}>
                        No categories yet
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Nav Links */}
              <Link to="/shop" style={linkStyle}>Shop</Link>
              <Link to="/daily-deals" style={{ ...linkStyle, color: '#fbbf24' }}>Deals</Link>
              <Link to="/track" style={linkStyle}>
                <FaTruck style={{ fontSize: '12px' }} /> Track
              </Link>
              <Link to="/blog" style={linkStyle}>Blog</Link>

              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} style={searchFormStyle}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    style={searchInputStyle}
                  />
                  <button
                    type="submit"
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#9ca3af',
                      cursor: 'pointer'
                    }}
                  >
                    <FaSearch />
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              style={{ ...iconBtnStyle, marginRight: '4px' }}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <FaMoon style={{ fontSize: '18px' }} /> : <FaSun style={{ fontSize: '18px', color: '#f59e0b' }} />}
            </button>

            {/* Admin Role Switcher */}
            {user?.role === 'admin' && (
              <div style={{ marginRight: '8px' }}>
                <RoleSwitcher user={user} theme="dark" />
              </div>
            )}

            {/* Client Actions: Wishlist & Cart */}
            {!isSellerOrAdminView && (
              <>
                <Link to="/wishlist" style={iconBtnStyle} title="Wishlist">
                  <FaHeart style={{ fontSize: '18px' }} />
                </Link>

                <Link to="/cart" style={{ ...iconBtnStyle, position: 'relative' }} title="Cart">
                  <FaShoppingCart style={{ fontSize: '18px' }} />
                  {items.length > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '0',
                      right: '0',
                      backgroundColor: '#8b5cf6',
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {items.length}
                    </span>
                  )}
                </Link>
              </>
            )}

            {isAuthenticated ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                  style={iconBtnStyle}
                >
                  <FaUser style={{ fontSize: '18px' }} />
                  <FaChevronDown style={{ fontSize: '10px', marginLeft: '4px' }} />
                </button>
                {accountDropdownOpen && (
                  <>
                    <div
                      style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                      onClick={() => setAccountDropdownOpen(false)}
                    />
                    <div style={{ ...dropdownStyle, right: 0, left: 'auto' }}>
                      {/* Context-aware Dropdown Items */}
                      {isSellerOrAdminView ? (
                        <>
                          <Link to="/seller/profile" style={dropdownItemStyle} onClick={() => setAccountDropdownOpen(false)}>
                            Seller Profile
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link to="/dashboard" style={dropdownItemStyle} onClick={() => setAccountDropdownOpen(false)}>
                            My Dashboard
                          </Link>
                          <Link to="/orders" style={dropdownItemStyle} onClick={() => setAccountDropdownOpen(false)}>
                            My Orders
                          </Link>
                          <Link to="/wishlist" style={dropdownItemStyle} onClick={() => setAccountDropdownOpen(false)}>
                            Wishlist
                          </Link>
                        </>
                      )}

                      <button
                        onClick={handleLogout}
                        style={{ ...dropdownItemStyle, width: '100%', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to="/login" style={signInBtnStyle}>
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div style={{ borderTop: '1px solid #334155', padding: '16px 0' }}>
            {!isSellerOrAdminView && (
              <form onSubmit={handleSearchSubmit} style={{ marginBottom: '16px' }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  style={{ ...searchInputStyle, width: '100%' }}
                />
              </form>
            )}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {!isSellerOrAdminView && (
                <>
                  <Link to="/shop" style={linkStyle}>All Categories</Link>
                  {categories.slice(0, 5).map((cat) => (
                    <Link
                      key={cat._id}
                      to={`/shop?category=${encodeURIComponent(cat.name)}`}
                      style={{ ...linkStyle, paddingLeft: '24px' }}
                    >
                      {cat.name}
                    </Link>
                  ))}
                  <Link to="/daily-deals" style={{ ...linkStyle, color: '#fbbf24' }}>🔥 Deals</Link>
                  <Link to="/track" style={linkStyle}><FaTruck /> Track Order</Link>
                </>
              )}
              {!isAuthenticated && (
                <Link to="/login" style={{ ...signInBtnStyle, textAlign: 'center', marginTop: '8px' }}>
                  Sign In
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
