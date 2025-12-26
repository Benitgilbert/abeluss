import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaChevronDown, FaUserShield, FaStore, FaCheck } from "react-icons/fa";
import "../styles/RoleSwitcher.css";

function RoleSwitcher({ user, theme = 'light' }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Determine current view based on URL
    const isAdminView = location.pathname.startsWith('/admin');
    const isSellerView = location.pathname.startsWith('/seller');

    // Only show for admin users (who can access both views)
    const canSwitch = user?.role === 'admin';

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!canSwitch) return null;

    const handleSwitch = (view) => {
        setIsOpen(false);
        if (view === 'admin' && !isAdminView) {
            navigate('/admin');
        } else if (view === 'seller' && !isSellerView) {
            navigate('/seller/dashboard');
        }
    };

    return (
        <div className={`role-switcher ${theme}`} ref={dropdownRef}>
            <button
                className="role-switcher-btn"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isAdminView ? (
                    <>
                        <FaUserShield className="role-icon" />
                        <span>Admin Panel</span>
                    </>
                ) : (
                    <>
                        <FaStore className="role-icon" />
                        <span>My Store</span>
                    </>
                )}
                <FaChevronDown className={`chevron ${isOpen ? 'open' : ''}`} />
            </button>

            {isOpen && (
                <div className="role-switcher-dropdown">
                    <div className="role-option-header">Switch View</div>

                    <button
                        className={`role-option ${isAdminView ? 'active' : ''}`}
                        onClick={() => handleSwitch('admin')}
                    >
                        <FaUserShield className="role-option-icon" style={{ color: '#6366f1' }} />
                        <div className="role-option-info">
                            <span className="role-option-title">Admin Panel</span>
                            <span className="role-option-desc">Manage entire platform</span>
                        </div>
                        {isAdminView && <FaCheck className="role-check" />}
                    </button>

                    <button
                        className={`role-option ${isSellerView ? 'active' : ''}`}
                        onClick={() => handleSwitch('seller')}
                    >
                        <FaStore className="role-option-icon" style={{ color: '#10b981' }} />
                        <div className="role-option-info">
                            <span className="role-option-title">My Store</span>
                            <span className="role-option-desc">Your products & orders</span>
                        </div>
                        {isSellerView && <FaCheck className="role-check" />}
                    </button>
                </div>
            )}
        </div>
    );
}

export default RoleSwitcher;
