import React, { useState, useEffect, useCallback } from "react";
import {
    FaGift, FaPlus, FaEdit, FaTrash, FaSave, FaTimes,
    FaEye, FaEyeSlash, FaPalette, FaTag, FaCalendarAlt
} from "react-icons/fa";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { getAdminGiftCardProducts, createGiftCardProduct, updateGiftCardProduct, deleteGiftCardProduct } from "../../services/api";
import { useToast } from "../../context/ToastContext";

// Gradient presets for easy selection
const GRADIENT_PRESETS = [
    { name: "Purple", value: "from-violet-500 to-indigo-600" },
    { name: "Orange", value: "from-terracotta-500 to-amber-500" },
    { name: "Dark", value: "from-charcoal-700 to-charcoal-900" },
    { name: "Teal", value: "from-emerald-500 to-teal-600" },
    { name: "Pink", value: "from-pink-500 to-rose-600" },
    { name: "Blue", value: "from-blue-500 to-cyan-500" },
    { name: "Gold", value: "from-amber-400 to-yellow-500" },
    { name: "Red", value: "from-red-500 to-rose-600" },
];

const AdminGiftCardProducts = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showSuccess, showError } = useToast();

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        label: "",
        amount: "",
        color: "from-violet-500 to-indigo-600",
        isCustom: false,
        isActive: true,
        expiryDays: 365,
    });

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getAdminGiftCardProducts();
            setProducts(response.data || []);
        } catch (error) {
            console.error("Failed to fetch products:", error);
            showError("Failed to load gift card products");
        } finally {
            setLoading(false);
        }
    }, [showError]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // OPEN CREATE MODAL
    const openCreateModal = () => {
        setEditingProduct(null);
        setFormData({
            label: "",
            amount: "",
            color: "from-violet-500 to-indigo-600",
            isCustom: false,
            isActive: true,
            expiryDays: 365,
        });
        setShowModal(true);
    };

    // OPEN EDIT MODAL
    const openEditModal = (product) => {
        setEditingProduct(product);
        setFormData({
            label: product.label,
            amount: product.amount,
            color: product.color,
            isCustom: product.isCustom,
            isActive: product.isActive,
            expiryDays: product.expiryDays || 365,
        });
        setShowModal(true);
    };

    // HANDLE CREATE/UPDATE
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                label: formData.label,
                amount: formData.isCustom ? 0 : parseFloat(formData.amount) || 0,
                color: formData.color,
                isCustom: formData.isCustom,
                isActive: formData.isActive,
                expiryDays: parseInt(formData.expiryDays) || 365,
            };

            if (editingProduct) {
                await updateGiftCardProduct(editingProduct.id, payload);
                showSuccess("Gift card product updated!");
            } else {
                await createGiftCardProduct(payload);
                showSuccess("Gift card product created!");
            }

            setShowModal(false);
            fetchProducts();
        } catch (error) {
            showError(error.response?.data?.message || "Operation failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    // TOGGLE ACTIVE STATUS
    const toggleActive = async (product) => {
        try {
            await updateGiftCardProduct(product.id, { isActive: !product.isActive });
            showSuccess(`Product ${product.isActive ? "hidden" : "shown"} `);
            fetchProducts();
        } catch (error) {
            showError("Failed to update status");
        }
    };

    // DELETE
    const openDeleteModal = (product) => {
        setEditingProduct(product);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        setIsSubmitting(true);
        try {
            await deleteGiftCardProduct(editingProduct.id);
            showSuccess("Gift card product deleted!");
            setShowDeleteModal(false);
            fetchProducts();
        } catch (error) {
            showError("Failed to delete product");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatRwf = (amount) => {
        return `${Number(amount || 0).toLocaleString()} RWF`;
    };

    return (
        <div className="min-h-screen bg-cream-100 dark:bg-charcoal-900 transition-colors duration-300">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="lg:ml-64 min-h-screen flex flex-col transition-all duration-300">
                <Topbar onMenuClick={() => setSidebarOpen(true)} title="Gift Card Products" />

                <main className="flex-1 p-4 lg:p-6 max-w-[1400px] w-full mx-auto">
                    {/* Header */}
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-charcoal-800 dark:text-white">
                                Gift Card Products
                            </h1>
                            <p className="text-charcoal-500 dark:text-charcoal-400 text-sm mt-1">
                                Manage the gift card tiers customers can purchase
                            </p>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="flex items-center gap-2 px-5 py-2.5 bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-terracotta-500/20"
                        >
                            <FaPlus /> Add Product
                        </button>
                    </div>

                    {/* Product Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {loading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="bg-white dark:bg-charcoal-800 rounded-2xl p-1 animate-pulse">
                                    <div className="aspect-[1.6/1] bg-charcoal-200 dark:bg-charcoal-700 rounded-xl mb-4"></div>
                                    <div className="p-4 space-y-2">
                                        <div className="h-4 bg-charcoal-200 dark:bg-charcoal-700 rounded w-3/4"></div>
                                        <div className="h-6 bg-charcoal-200 dark:bg-charcoal-700 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))
                        ) : products.length === 0 ? (
                            <div className="col-span-full text-center py-16">
                                <FaGift className="text-6xl text-charcoal-300 dark:text-charcoal-600 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-charcoal-600 dark:text-charcoal-400 mb-2">No Gift Card Products</h3>
                                <p className="text-charcoal-400 mb-6">Create your first gift card tier to get started</p>
                                <button
                                    onClick={openCreateModal}
                                    className="px-6 py-3 bg-terracotta-500 text-white font-bold rounded-xl hover:bg-terracotta-600 transition-colors"
                                >
                                    <FaPlus className="inline mr-2" /> Create Product
                                </button>
                            </div>
                        ) : (
                            products.map((product) => (
                                <div
                                    key={product.id}
                                    className={`relative bg-white dark:bg-charcoal-800 rounded-2xl p-1 shadow-sm border border-cream-200 dark:border-charcoal-700 overflow-hidden transition-all ${!product.isActive && "opacity-60"}`}
                                >
                                    {/* Status Badge */}
                                    {!product.isActive && (
                                        <div className="absolute top-4 right-4 z-10 px-2 py-1 bg-charcoal-900/80 text-white text-[10px] font-bold uppercase rounded-full">
                                            Hidden
                                        </div>
                                    )}

                                    {/* Card Preview */}
                                    <div className={`aspect-[1.6/1] rounded-xl bg-gradient-to-br ${product.color} p-5 flex flex-col justify-between text-white relative overflow-hidden`}>
                                        <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full blur-3xl -mr-14 -mt-14"></div>
                                        <div className="z-10">
                                            <div className="text-[10px] font-bold opacity-80 uppercase tracking-widest">{product.label}</div>
                                            <div className="text-2xl font-black mt-1">Abelus</div>
                                        </div>
                                        <div className="z-10 flex justify-between items-end">
                                            <div className="text-lg font-bold">
                                                {product.isCustom ? "Custom" : formatRwf(product.amount)}
                                            </div>
                                            <FaGift className="text-2xl opacity-30" />
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="p-4 flex items-center justify-between gap-2">
                                        <div>
                                            <h4 className="font-bold text-charcoal-800 dark:text-white">{product.label}</h4>
                                            <p className="text-sm text-charcoal-500">
                                                {product.isCustom ? "User enters amount" : formatRwf(product.amount)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => toggleActive(product)}
                                                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${product.isActive
                                                    ? "text-sage-500 hover:bg-sage-50 dark:hover:bg-sage-900/20"
                                                    : "text-charcoal-400 hover:bg-charcoal-100 dark:hover:bg-charcoal-700"
                                                    }`}
                                                title={product.isActive ? "Hide" : "Show"}
                                            >
                                                {product.isActive ? <FaEye /> : <FaEyeSlash />}
                                            </button>
                                            <button
                                                onClick={() => openEditModal(product)}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                                title="Edit"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(product)}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                title="Delete"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </main>
            </div>

            {/* CREATE/EDIT MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-charcoal-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-cream-200 dark:border-charcoal-700 flex items-center justify-between bg-gradient-to-r from-terracotta-500/10 to-transparent">
                            <h3 className="text-lg font-bold text-charcoal-800 dark:text-white flex items-center gap-2">
                                {editingProduct ? <FaEdit className="text-blue-500" /> : <FaPlus className="text-terracotta-500" />}
                                {editingProduct ? "Edit Gift Card Product" : "Create Gift Card Product"}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-2 text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100 dark:hover:bg-charcoal-700 rounded-lg transition-colors">
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
                            {/* Live Preview Card */}
                            <div className="mb-2">
                                <p className="text-xs font-medium text-charcoal-500 dark:text-charcoal-400 mb-2 uppercase tracking-wider">Live Preview</p>
                                <div className={`aspect-[2/1] rounded-xl bg-gradient-to-br ${formData.color} p-5 flex flex-col justify-between text-white relative overflow-hidden shadow-lg`}>
                                    <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full blur-3xl -mr-14 -mt-14"></div>
                                    <div className="z-10">
                                        <div className="text-[10px] font-bold opacity-80 uppercase tracking-widest">{formData.label || "Label"}</div>
                                        <div className="text-2xl font-black mt-1">Abelus</div>
                                    </div>
                                    <div className="z-10 flex justify-between items-end">
                                        <div className="text-lg font-bold">
                                            {formData.isCustom ? "Custom" : formatRwf(formData.amount || 0)}
                                        </div>
                                        <FaGift className="text-2xl opacity-30" />
                                    </div>
                                </div>
                            </div>

                            {/* Label Field */}
                            <div>
                                <label className="block text-xs font-bold text-charcoal-600 dark:text-charcoal-300 uppercase tracking-wider mb-2">
                                    <FaTag className="inline mr-1" /> Label
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.label}
                                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                    className="w-full px-4 py-3 bg-cream-100 dark:bg-charcoal-700 border border-cream-200 dark:border-charcoal-600 rounded-xl text-charcoal-800 dark:text-white outline-none focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20 transition-all"
                                    placeholder="e.g., Starter, Premium, VIP"
                                />
                            </div>

                            {/* Is Custom Toggle */}
                            <div className="flex items-center gap-3 p-3 bg-cream-50 dark:bg-charcoal-700/50 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, isCustom: !formData.isCustom })}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${formData.isCustom ? "bg-terracotta-500" : "bg-charcoal-300 dark:bg-charcoal-600"}`}
                                >
                                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${formData.isCustom ? "left-7" : "left-1"}`} />
                                </button>
                                <span className="text-sm text-charcoal-600 dark:text-charcoal-300">
                                    Custom amount (user enters value)
                                </span>
                            </div>

                            {/* Amount */}
                            {!formData.isCustom && (
                                <div>
                                    <label className="block text-xs font-bold text-charcoal-600 dark:text-charcoal-300 uppercase tracking-wider mb-2">
                                        Amount (RWF)
                                    </label>
                                    <input
                                        type="number"
                                        required={!formData.isCustom}
                                        min="1000"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full px-4 py-3 bg-cream-100 dark:bg-charcoal-700 border border-cream-200 dark:border-charcoal-600 rounded-xl text-charcoal-800 dark:text-white outline-none focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20 transition-all"
                                        placeholder="e.g., 25000"
                                    />
                                </div>
                            )}

                            {/* Color Picker */}
                            <div>
                                <label className="block text-xs font-bold text-charcoal-600 dark:text-charcoal-300 uppercase tracking-wider mb-2">
                                    <FaPalette className="inline mr-1" /> Card Color
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {GRADIENT_PRESETS.map((preset) => (
                                        <button
                                            type="button"
                                            key={preset.value}
                                            onClick={() => setFormData({ ...formData, color: preset.value })}
                                            className={`h-10 rounded-lg bg-gradient-to-r ${preset.value} transition-all ${formData.color === preset.value
                                                ? "ring-2 ring-offset-2 ring-terracotta-500 scale-105"
                                                : "hover:scale-105"
                                                }`}
                                            title={preset.name}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Expiry Period */}
                            <div>
                                <label className="block text-xs font-bold text-charcoal-600 dark:text-charcoal-300 uppercase tracking-wider mb-2">
                                    <FaCalendarAlt className="inline mr-1" /> Expiry Period (Days)
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={formData.expiryDays}
                                    onChange={(e) => setFormData({ ...formData, expiryDays: e.target.value })}
                                    className="w-full px-4 py-3 bg-cream-100 dark:bg-charcoal-700 border border-cream-200 dark:border-charcoal-600 rounded-xl text-charcoal-800 dark:text-white outline-none focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20 transition-all"
                                    placeholder="e.g., 365"
                                />
                                <p className="text-xs text-charcoal-400 mt-1.5">How long gift cards of this type remain valid after purchase</p>
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center gap-3 p-3 bg-cream-50 dark:bg-charcoal-700/50 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${formData.isActive ? "bg-sage-500" : "bg-charcoal-300 dark:bg-charcoal-600"}`}
                                >
                                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${formData.isActive ? "left-7" : "left-1"}`} />
                                </button>
                                <span className="text-sm text-charcoal-600 dark:text-charcoal-300">
                                    {formData.isActive ? "Visible to customers" : "Hidden from customers"}
                                </span>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-3 border border-cream-200 dark:border-charcoal-600 text-charcoal-600 dark:text-charcoal-300 rounded-xl font-medium hover:bg-cream-100 dark:hover:bg-charcoal-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-3 bg-terracotta-500 hover:bg-terracotta-600 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? "Saving..." : <><FaSave /> {editingProduct ? "Update" : "Create"}</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DELETE MODAL */}
            {showDeleteModal && editingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-charcoal-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaTrash className="text-2xl text-red-500" />
                            </div>
                            <h3 className="text-lg font-bold text-charcoal-800 dark:text-white mb-2">Delete Product?</h3>
                            <p className="text-charcoal-500 dark:text-charcoal-400 text-sm mb-4">
                                This will permanently delete the <strong>{editingProduct.label}</strong> gift card product.
                            </p>
                            <p className="text-xs text-red-500 mb-6">This action cannot be undone.</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 px-4 py-3 border border-cream-200 dark:border-charcoal-600 text-charcoal-600 dark:text-charcoal-300 rounded-xl font-medium hover:bg-cream-100 dark:hover:bg-charcoal-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminGiftCardProducts;
