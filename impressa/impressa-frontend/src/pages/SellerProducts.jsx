import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaSearch, FaEdit, FaTrash, FaBoxOpen, FaEye } from "react-icons/fa";
import api from "../utils/axiosInstance";
import SellerSidebar from "../components/SellerSidebar";
import Header from "../components/Header"; // Assuming we want the main header too, or just sidebar
import "./SellerProducts.css";

const SellerProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await api.get("/products/seller/my-products"); // Ensure this endpoint exists
            if (res.data.success) {
                setProducts(res.data.data);
            } else {
                setProducts([]);
            }
        } catch (err) {
            console.error("Failed to fetch products:", err);
            setError("Failed to load products.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await api.delete(`/products/${id}`);
                setProducts(products.filter((p) => p._id !== id));
            } catch (err) {
                alert("Failed to delete product");
            }
        }
    };

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="seller-layout">
            <SellerSidebar />
            <div className="seller-main-content">
                <Header />
                <div className="seller-page-container">
                    <div className="page-header">
                        <div className="header-title">
                            <h1>My Products</h1>
                            <p>Manage your inventory and product listings</p>
                        </div>
                        <Link to="/seller/products/add" className="btn-primary">
                            <FaPlus /> Add New Product
                        </Link>
                    </div>

                    {/* Search Bar */}
                    <div className="search-bar">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {loading ? (
                        <div className="loading-state">Loading products...</div>
                    ) : error ? (
                        <div className="error-state">{error}</div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="empty-state">
                            <FaBoxOpen className="empty-icon" />
                            <h3>No Products Found</h3>
                            <p>Start selling by adding your first product!</p>
                            <Link to="/seller/products/add" className="btn-secondary">
                                Add Product
                            </Link>
                        </div>
                    ) : (
                        <div className="products-table-container">
                            <table className="products-table">
                                <thead>
                                    <tr>
                                        <th>Image</th>
                                        <th>Name</th>
                                        <th>Price</th>
                                        <th>Stock</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map((product) => (
                                        <tr key={product._id}>
                                            <td>
                                                <img
                                                    src={product.image || "https://via.placeholder.com/50"}
                                                    alt={product.name}
                                                    className="product-thumbnail"
                                                />
                                            </td>
                                            <td className="product-name-cell">
                                                <span className="product-name">{product.name}</span>
                                                <span className="product-sku">SKU: {product.sku || 'N/A'}</span>
                                            </td>
                                            <td>RWF {product.price?.toLocaleString()} </td>
                                            <td>
                                                <span className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                                    {product.stock > 0 ? `${product.stock} In Stock` : 'Out of Stock'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${product.approvalStatus || 'pending'}`}>
                                                    {product.approvalStatus || 'Pending'}
                                                </span>
                                            </td>
                                            <td className="actions-cell">
                                                <Link to={`/product/${product._id}`} className="action-btn view" title="View">
                                                    <FaEye />
                                                </Link>
                                                <Link to={`/seller/products/edit/${product._id}`} className="action-btn edit" title="Edit">
                                                    <FaEdit />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product._id)}
                                                    className="action-btn delete"
                                                    title="Delete"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SellerProducts;
