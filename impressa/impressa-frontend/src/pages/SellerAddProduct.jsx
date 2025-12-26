import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaSave, FaImage, FaUpload } from "react-icons/fa";
import api from "../utils/axiosInstance";
import SellerSidebar from "../components/SellerSidebar";
import Header from "../components/Header";
import "./SellerAddProduct.css";

const SellerAddProduct = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "",
        image: null,
        preview: null
    });
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get("/categories");
                if (res.data.success) {
                    setCategories(res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch categories");
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                image: file,
                preview: URL.createObjectURL(file)
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("description", formData.description);
            data.append("price", formData.price);
            data.append("stock", formData.stock);
            data.append("category", formData.category);
            if (formData.image) {
                data.append("image", formData.image);
            }

            const res = await api.post("/products", data, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (res.status === 201) {
                // Success
                navigate("/seller/products");
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to create product");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="seller-layout">
            <SellerSidebar />
            <div className="seller-main-content">
                <Header />
                <div className="seller-page-container">
                    <div className="page-header">
                        <div className="header-title">
                            <Link to="/seller/products" className="back-link">
                                <FaArrowLeft /> Back to Products
                            </Link>
                            <h1>Add New Product</h1>
                        </div>
                    </div>

                    <div className="add-product-container">
                        <form onSubmit={handleSubmit} className="product-form">
                            {error && <div className="error-message">{error}</div>}

                            <div className="form-section">
                                <h3>Basic Information</h3>
                                <div className="form-group">
                                    <label>Product Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g. Vintage Leather Jacket"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                        rows="5"
                                        placeholder="Describe your product..."
                                    ></textarea>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Pricing & Inventory</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Price (RWF)</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            required
                                            min="0"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Stock Quantity</label>
                                        <input
                                            type="number"
                                            name="stock"
                                            value={formData.stock}
                                            onChange={handleChange}
                                            required
                                            min="0"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Organization</h3>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Product Image</h3>
                                <div className="image-upload-box">
                                    <input
                                        type="file"
                                        id="product-image"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        hidden
                                    />
                                    <label htmlFor="product-image" className="upload-label">
                                        {formData.preview ? (
                                            <img src={formData.preview} alt="Preview" className="image-preview" />
                                        ) : (
                                            <div className="upload-placeholder">
                                                <FaImage className="upload-icon" />
                                                <span>Click to upload image</span>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>

                            <div className="form-actions">
                                <Link to="/seller/products" className="btn-secondary">Cancel</Link>
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    <FaSave /> {loading ? "Creating..." : "Save Product"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerAddProduct;
