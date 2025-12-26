import { FaChartBar, FaBox, FaSignOutAlt, FaStore, FaList, FaShoppingCart, FaPlus, FaMoneyBillWave } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import "../styles/AdminLayout.css";

function SellerSidebar() {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path ? "nav-link active" : "nav-link";
    };

    return (
        <aside className="admin-sidebar" style={{ width: '260px', top: '70px', height: 'calc(100vh - 70px)' }}>
            <div className="sidebar-header">
                <h1 className="brand">
                    SELLER
                </h1>
                <p className="brand-sub">Portal</p>
            </div>

            <div className="nav-section">
                <div className="nav-label">Overview</div>
                <Link to="/seller/dashboard" className={isActive('/seller/dashboard')}>
                    <FaChartBar className="nav-icon" />
                    <span>Dashboard</span>
                </Link>
                <Link to="/seller/profile" className={isActive('/seller/profile')}>
                    <FaStore className="nav-icon" />
                    <span>My Store Profile</span>
                </Link>
            </div>

            <div className="nav-section">
                <div className="nav-label">Actions</div>
                <Link to="/seller/pos" className={isActive('/seller/pos')}>
                    <FaShoppingCart className="nav-icon" />
                    <span>Open POS</span>
                </Link>
                <Link to="/seller/products/add" className={isActive('/seller/products/add')}>
                    <FaPlus className="nav-icon" />
                    <span>Add Product</span>
                </Link>
            </div>

            <div className="nav-section">
                <div className="nav-label">Management</div>
                <Link to="/seller/products" className={isActive('/seller/products')}>
                    <FaBox className="nav-icon" />
                    <span>My Products</span>
                </Link>
                <Link to="/seller/orders" className={isActive('/seller/orders')}>
                    <FaList className="nav-icon" />
                    <span>My Orders</span>
                </Link>
                <Link to="/seller/payouts" className={isActive('/seller/payouts')}>
                    <FaMoneyBillWave className="nav-icon" />
                    <span>Payouts & Earnings</span>
                </Link>
            </div>

            <div className="logout-div">
                <Link to="/logout" className="logout-btn">
                    <FaSignOutAlt className="nav-icon" />
                    <span>Logout</span>
                </Link>
            </div>
        </aside>
    );
}

export default SellerSidebar;
