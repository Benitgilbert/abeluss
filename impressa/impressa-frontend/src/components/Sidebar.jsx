import { FaChartBar, FaUser, FaBox, FaFileAlt, FaSignOutAlt, FaTags, FaTicketAlt, FaTruck, FaPercentage, FaCog, FaCashRegister, FaMoneyBillWave, FaFolder, FaFire, FaDesktop, FaQuoteLeft, FaHandshake, FaGlobe, FaEnvelope, FaStore, FaPercent, FaDollarSign, FaClipboardCheck, FaStar, FaHeadset, FaMoon, FaSun, FaExclamationTriangle, FaChartLine } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useRef, useEffect, useLayoutEffect } from "react";

import AdminChatbot from "./AdminChatBot";
// import '../styles/AdminLayout.css'; // Removed as per instruction, assuming this was the intended target for removal
// The instruction specifically mentioned 'import './Layout.css';' which was not present.
// If the intention was to remove '../styles/AdminLayout.css', this line is commented out.

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const sidebarRef = useRef(null);

  // Restore scroll position immediately after DOM updates
  useLayoutEffect(() => {
    const savedPos = sessionStorage.getItem('sidebarScrollPos');
    if (sidebarRef.current && savedPos) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        if (sidebarRef.current) {
          sidebarRef.current.scrollTop = parseInt(savedPos, 10);
        }
      });
    }
  }, [location.pathname]);

  // Save scroll position before navigation
  const handleLinkClick = () => {
    if (sidebarRef.current) {
      sessionStorage.setItem('sidebarScrollPos', sidebarRef.current.scrollTop.toString());
    }
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  const isActive = (path) => {
    return location.pathname === path ? "nav-link active" : "nav-link";
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
      />

      <aside ref={sidebarRef} className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1 className="brand">IMPRESSA</h1>
          <p className="brand-sub">Admin Portal</p>
        </div>

        <div className="nav-section">
          <div className="nav-label">Overview</div>
          <Link to="/admin" className={isActive('/admin')} onClick={handleLinkClick}>
            <FaChartBar className="nav-icon" />
            <span>Dashboard</span>
          </Link>
        </div>

        <div className="nav-section">
          <div className="nav-label">Management</div>
          <Link to="/admin/users" className={isActive('/admin/users')} onClick={handleLinkClick}>
            <FaUser className="nav-icon" />
            <span>Users</span>
          </Link>
          <Link to="/admin/sellers" className={isActive('/admin/sellers')} onClick={handleLinkClick}>
            <FaStore className="nav-icon" style={{ color: '#f59e0b' }} />
            <span>Sellers</span>
          </Link>
          <Link to="/admin/violations" className={isActive('/admin/violations')} onClick={handleLinkClick}>
            <FaExclamationTriangle className="nav-icon" style={{ color: '#ef4444' }} />
            <span>Violations</span>
          </Link>
          <Link to="/admin/seller-reports" className={isActive('/admin/seller-reports')} onClick={handleLinkClick}>
            <FaChartLine className="nav-icon" style={{ color: '#6366f1' }} />
            <span>Seller Reports</span>
          </Link>
          <Link to="/admin/orders" className={isActive('/admin/orders')} onClick={handleLinkClick}>
            <FaBox className="nav-icon" />
            <span>Orders</span>
          </Link>
          <Link to="/admin/products" className={isActive('/admin/products')} onClick={handleLinkClick}>
            <FaBox className="nav-icon" />
            <span>Products</span>
          </Link>
          <Link to="/admin/product-approval" className={isActive('/admin/product-approval')} onClick={handleLinkClick}>
            <FaClipboardCheck className="nav-icon" style={{ color: '#f97316' }} />
            <span>Product Approval</span>
          </Link>
          <Link to="/admin/categories" className={isActive('/admin/categories')} onClick={handleLinkClick}>
            <FaFolder className="nav-icon" />
            <span>Categories</span>
          </Link>
          <Link to="/admin/attributes" className={isActive('/admin/attributes')} onClick={handleLinkClick}>
            <FaTags className="nav-icon" />
            <span>Attributes</span>
          </Link>
          <Link to="/admin/reviews" className={isActive('/admin/reviews')} onClick={handleLinkClick}>
            <FaStar className="nav-icon" style={{ color: '#eab308' }} />
            <span>Reviews</span>
          </Link>
          <Link to="/admin/tickets" className={isActive('/admin/tickets')} onClick={handleLinkClick}>
            <FaHeadset className="nav-icon" style={{ color: '#6366f1' }} />
            <span>Support Tickets</span>
          </Link>
        </div>

        <div className="nav-section">
          <div className="nav-label">Marketing</div>
          <Link to="/admin/coupons" className={isActive('/admin/coupons')} onClick={handleLinkClick}>
            <FaTicketAlt className="nav-icon" />
            <span>Coupons</span>
          </Link>
          <Link to="/admin/flash-sales" className={isActive('/admin/flash-sales')} onClick={handleLinkClick}>
            <FaFire className="nav-icon" style={{ color: '#ef4444' }} />
            <span>Flash Sales</span>
          </Link>
          <Link to="/admin/banners" className={isActive('/admin/banners')} onClick={handleLinkClick}>
            <FaDesktop className="nav-icon" style={{ color: '#8b5cf6' }} />
            <span>Banners</span>
          </Link>
          <Link to="/admin/testimonials" className={isActive('/admin/testimonials')} onClick={handleLinkClick}>
            <FaQuoteLeft className="nav-icon" style={{ color: '#06b6d4' }} />
            <span>Testimonials</span>
          </Link>
          <Link to="/admin/brand-partners" className={isActive('/admin/brand-partners')} onClick={handleLinkClick}>
            <FaHandshake className="nav-icon" style={{ color: '#f59e0b' }} />
            <span>Brand Partners</span>
          </Link>
        </div>

        <div className="nav-section">
          <div className="nav-label">Finance</div>
          <Link to="/admin/finance" className={isActive('/admin/finance')} onClick={handleLinkClick}>
            <FaMoneyBillWave className="nav-icon" />
            <span>Finance</span>
          </Link>
          <Link to="/admin/commissions" className={isActive('/admin/commissions')} onClick={handleLinkClick}>
            <FaPercent className="nav-icon" style={{ color: '#10b981' }} />
            <span>Commissions</span>
          </Link>
          <Link to="/admin/payouts" className={isActive('/admin/payouts')} onClick={handleLinkClick}>
            <FaDollarSign className="nav-icon" style={{ color: '#8b5cf6' }} />
            <span>Payouts</span>
          </Link>
        </div>

        <div className="nav-section">
          <div className="nav-label">Configuration</div>
          <Link to="/admin/site-settings" className={isActive('/admin/site-settings')} onClick={handleLinkClick}>
            <FaGlobe className="nav-icon" style={{ color: '#10b981' }} />
            <span>Site Settings</span>
          </Link>
          <Link to="/admin/subscribers" className={isActive('/admin/subscribers')} onClick={handleLinkClick}>
            <FaEnvelope className="nav-icon" style={{ color: '#ec4899' }} />
            <span>Subscribers</span>
          </Link>
          <Link to="/admin/shipping" className={isActive('/admin/shipping')} onClick={handleLinkClick}>
            <FaTruck className="nav-icon" />
            <span>Shipping</span>
          </Link>
          <Link to="/admin/taxes" className={isActive('/admin/taxes')} onClick={handleLinkClick}>
            <FaPercentage className="nav-icon" />
            <span>Taxes</span>
          </Link>
          <Link to="/admin/reports" className={isActive('/admin/reports')} onClick={handleLinkClick}>
            <FaFileAlt className="nav-icon" />
            <span>Reports</span>
          </Link>
          <Link to="/admin/settings" className={isActive('/admin/settings')} onClick={handleLinkClick}>
            <FaCog className="nav-icon" />
            <span>Settings</span>
          </Link>
        </div>

        <div className="logout-div">


          <Link to="/logout" className="logout-btn" onClick={handleLinkClick}>
            <FaSignOutAlt className="nav-icon" />
            <span>Logout</span>
          </Link>
        </div>
      </aside>
      <AdminChatbot />
    </>
  );
}

export default Sidebar;