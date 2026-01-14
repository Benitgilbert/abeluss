import React, { useState, useEffect } from "react";
import {
    FaSearch, FaFilter, FaGift, FaChevronLeft, FaChevronRight,
    FaCalendarAlt, FaEnvelope, FaBan, FaCheckCircle,
    FaTimes, FaPlus, FaEdit, FaTrash, FaSave
} from "react-icons/fa";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { getAdminGiftCards, updateGiftCardStatus, createAdminGiftCard, deleteGiftCard, formatCurrency } from "../../services/api";
import { useToast } from "../../context/ToastContext";

const AdminGiftCards = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [giftCards, setGiftCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const { showSuccess, showError } = useToast();

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form states for Create/Edit
    const [formData, setFormData] = useState({
        initialAmount: "",
        currentBalance: "",
        recipientEmail: "",
        message: "",
        expiryDate: "",
        status: "Active"
    });

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        fetchGiftCards();
    }, [page, statusFilter, debouncedSearch]);

    const fetchGiftCards = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 10,
                status: statusFilter !== "all" ? statusFilter : undefined,
                search: debouncedSearch
            };
            const response = await getAdminGiftCards(params);
            setGiftCards(response.data);
            setTotalPages(response.pages);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch gift cards:", error);
            showError("Failed to load gift cards");
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await updateGiftCardStatus(id, { status: newStatus });
            showSuccess(`Gift Card marked as ${newStatus}`);
            fetchGiftCards();
        } catch (error) {
            showError("Failed to update status");
        }
    };

    // CREATE handlers
    const openCreateModal = () => {
        setFormData({
            initialAmount: "",
            currentBalance: "",
            recipientEmail: "",
            message: "",
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
            status: "Active"
        });
        setShowCreateModal(true);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createAdminGiftCard({
                initialAmount: parseFloat(formData.initialAmount),
                recipientEmail: formData.recipientEmail,
                message: formData.message,
                expiryDate: formData.expiryDate
            });
            showSuccess("Gift Card created successfully!");
            setShowCreateModal(false);
            fetchGiftCards();
        } catch (error) {
            showError(error.response?.data?.message || "Failed to create gift card");
        } finally {
            setIsSubmitting(false);
        }
    };

    // EDIT handlers
    const openEditModal = (card) => {
        setSelectedCard(card);
        setFormData({
            initialAmount: card.initialAmount,
            currentBalance: card.currentBalance,
            recipientEmail: card.recipientEmail || "",
            message: card.message || "",
            expiryDate: new Date(card.expiryDate).toISOString().split('T')[0],
            status: card.status
        });
        setShowEditModal(true);
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await updateGiftCardStatus(selectedCard._id, {
                currentBalance: parseFloat(formData.currentBalance),
                recipientEmail: formData.recipientEmail,
                message: formData.message,
                expiryDate: formData.expiryDate,
                status: formData.status
            });
            showSuccess("Gift Card updated successfully!");
            setShowEditModal(false);
            fetchGiftCards();
        } catch (error) {
            showError(error.response?.data?.message || "Failed to update gift card");
        } finally {
            setIsSubmitting(false);
        }
    };

    // DELETE handlers
    const openDeleteModal = (card) => {
        setSelectedCard(card);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        setIsSubmitting(true);
        try {
            await deleteGiftCard(selectedCard._id);
            showSuccess("Gift Card deleted successfully!");
            setShowDeleteModal(false);
            fetchGiftCards();
        } catch (error) {
            showError(error.response?.data?.message || "Failed to delete gift card");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider";
        switch (status) {
            case "Active":
                return `${baseClasses} bg-sage-100 text-sage-700 dark:bg-sage-900/20 dark:text-sage-400`;
            case "Redeemed":
                return `${baseClasses} bg-charcoal-100 text-charcoal-600 dark:bg-charcoal-700 dark:text-charcoal-300`;
            case "Expired":
                return `${baseClasses} bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400`;
            case "Pending":
                return `${baseClasses} bg-sand-100 text-sand-700 dark:bg-sand-900/20 dark:text-sand-400`;
            default:
                return `${baseClasses} bg-charcoal-100 text-charcoal-600 dark:bg-charcoal-700 dark:text-charcoal-300`;
        }
    };

    return (
        <div className="min-h-screen bg-cream-100 dark:bg-charcoal-900 transition-colors duration-300">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="lg:ml-64 min-h-screen flex flex-col transition-all duration-300">
                <Topbar onMenuClick={() => setSidebarOpen(true)} title="Gift Card Management" />

                <main className="flex-1 p-4 lg:p-6 max-w-[1600px] w-full mx-auto">
                    {/* Page Header */}
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-charcoal-800 dark:text-white">
                                Gift Card Management
                            </h1>
                            <p className="text-charcoal-500 dark:text-charcoal-400 text-sm mt-1">
                                Create, manage, and monitor digital gift codes
                            </p>
                        </div>
                        {/* Create Button */}
                        <button
                            onClick={openCreateModal}
                            className="flex items-center gap-2 px-5 py-2.5 bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-terracotta-500/20"
                        >
                            <FaPlus /> Create Gift Card
                        </button>
                    </div>

                    {/* Main Card */}
                    <div className="bg-white dark:bg-charcoal-800 rounded-2xl shadow-sm border border-cream-200 dark:border-charcoal-700 overflow-hidden">
                        {/* Filters & Search */}
                        <div className="p-4 lg:p-6 border-b border-cream-200 dark:border-charcoal-700">
                            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                                <div className="relative flex-1 max-w-md">
                                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by Code or Recipient..."
                                        className="w-full pl-11 pr-4 py-2.5 bg-cream-100 dark:bg-charcoal-700 border border-transparent focus:border-terracotta-500 rounded-xl text-sm text-charcoal-800 dark:text-white placeholder:text-charcoal-400 outline-none transition-colors"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2.5 bg-cream-100 dark:bg-charcoal-700 rounded-xl border border-cream-200 dark:border-charcoal-600">
                                    <FaFilter className="text-charcoal-400 text-sm" />
                                    <select
                                        className="bg-transparent text-sm text-charcoal-800 dark:text-white outline-none cursor-pointer"
                                        value={statusFilter}
                                        onChange={(e) => {
                                            setStatusFilter(e.target.value);
                                            setPage(1);
                                        }}
                                    >
                                        <option value="all">All Statuses</option>
                                        <option value="Active">Active</option>
                                        <option value="Redeemed">Redeemed</option>
                                        <option value="Expired">Expired</option>
                                        <option value="Pending">Pending</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Gift Cards Table - Desktop */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-cream-50 dark:bg-charcoal-900">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-charcoal-500 dark:text-charcoal-400 uppercase tracking-wider">Gift Code</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-charcoal-500 dark:text-charcoal-400 uppercase tracking-wider">Recipient</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-charcoal-500 dark:text-charcoal-400 uppercase tracking-wider">Balance</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-charcoal-500 dark:text-charcoal-400 uppercase tracking-wider">Expiry</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-charcoal-500 dark:text-charcoal-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-charcoal-500 dark:text-charcoal-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-cream-100 dark:divide-charcoal-700">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-charcoal-500 dark:text-charcoal-400">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-8 h-8 border-2 border-terracotta-500 border-t-transparent rounded-full animate-spin"></div>
                                                    <span>Loading gift cards...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : giftCards.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center">
                                                <FaGift className="text-4xl text-charcoal-300 dark:text-charcoal-600 mx-auto mb-3" />
                                                <p className="text-charcoal-500 dark:text-charcoal-400">No gift cards found</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        giftCards.map((card) => (
                                            <tr key={card._id} className="hover:bg-cream-50 dark:hover:bg-charcoal-700/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-mono text-sm font-bold text-terracotta-500">
                                                        {card.code}
                                                    </div>
                                                    <div className="text-[10px] text-charcoal-400 uppercase tracking-tighter mt-0.5">
                                                        Ref: {card._id.substring(0, 8)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <FaEnvelope className="text-charcoal-400 text-xs" />
                                                        <span className="text-sm font-medium text-charcoal-800 dark:text-white">
                                                            {card.recipientEmail || "—"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-charcoal-800 dark:text-white">
                                                    {formatCurrency(card.currentBalance)}
                                                    <div className="text-[10px] text-charcoal-400 font-normal">
                                                        of {formatCurrency(card.initialAmount)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-charcoal-600 dark:text-charcoal-300">
                                                    <div className="flex items-center gap-2">
                                                        <FaCalendarAlt className="text-charcoal-400 text-xs" />
                                                        {new Date(card.expiryDate).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={getStatusBadge(card.status)}>
                                                        {card.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        {/* Edit Button */}
                                                        <button
                                                            onClick={() => openEditModal(card)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        {/* Status Toggle */}
                                                        {card.status === "Active" ? (
                                                            <button
                                                                onClick={() => handleStatusUpdate(card._id, "Expired")}
                                                                className="w-8 h-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                                title="Expire"
                                                            >
                                                                <FaBan />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleStatusUpdate(card._id, "Active")}
                                                                className="w-8 h-8 flex items-center justify-center rounded-lg text-sage-500 hover:bg-sage-50 dark:hover:bg-sage-900/20 transition-colors"
                                                                title="Re-activate"
                                                            >
                                                                <FaCheckCircle />
                                                            </button>
                                                        )}
                                                        {/* Delete Button */}
                                                        <button
                                                            onClick={() => openDeleteModal(card)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Gift Card List - Mobile */}
                        <div className="md:hidden divide-y divide-cream-100 dark:divide-charcoal-700">
                            {loading ? (
                                <div className="p-8 text-center text-charcoal-500">
                                    <div className="w-8 h-8 border-2 border-terracotta-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                    Loading cards...
                                </div>
                            ) : giftCards.length === 0 ? (
                                <div className="p-8 text-center">
                                    <FaGift className="text-4xl text-charcoal-300 mx-auto mb-3" />
                                    <p className="text-charcoal-500">No gift cards found</p>
                                </div>
                            ) : (
                                giftCards.map((card) => (
                                    <div key={card._id} className="p-4 hover:bg-cream-50 dark:hover:bg-charcoal-700/50 transition-colors">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <span className="font-mono text-sm font-bold text-terracotta-500">
                                                    {card.code}
                                                </span>
                                                <p className="text-xs text-charcoal-800 dark:text-white mt-1">
                                                    {card.recipientEmail || "No recipient"}
                                                </p>
                                            </div>
                                            <span className={getStatusBadge(card.status)}>
                                                {card.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <div className="font-bold text-charcoal-800 dark:text-white">
                                                {formatCurrency(card.currentBalance)}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => openEditModal(card)} className="p-2 text-blue-500"><FaEdit /></button>
                                                <button onClick={() => openDeleteModal(card)} className="p-2 text-red-400"><FaTrash /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Pagination */}
                        {!loading && giftCards.length > 0 && (
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 lg:p-6 border-t border-cream-200 dark:border-charcoal-700">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(p => p - 1)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${page === 1
                                        ? 'border-cream-200 dark:border-charcoal-700 bg-cream-100 dark:bg-charcoal-700 text-charcoal-400 cursor-not-allowed'
                                        : 'border-cream-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-700 text-charcoal-700 dark:text-white hover:border-terracotta-500 hover:text-terracotta-500'
                                        }`}
                                >
                                    <FaChevronLeft className="text-xs" /> Previous
                                </button>
                                <span className="text-sm text-charcoal-500 dark:text-charcoal-400">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    disabled={page === totalPages}
                                    onClick={() => setPage(p => p + 1)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${page === totalPages
                                        ? 'border-cream-200 dark:border-charcoal-700 bg-cream-100 dark:bg-charcoal-700 text-charcoal-400 cursor-not-allowed'
                                        : 'border-cream-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-700 text-charcoal-700 dark:text-white hover:border-terracotta-500 hover:text-terracotta-500'
                                        }`}
                                >
                                    Next <FaChevronRight className="text-xs" />
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* CREATE MODAL */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-charcoal-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-cream-200 dark:border-charcoal-700 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-charcoal-800 dark:text-white flex items-center gap-2">
                                <FaGift className="text-terracotta-500" /> Create Gift Card
                            </h3>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 text-charcoal-400 hover:text-charcoal-600">
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-charcoal-600 dark:text-charcoal-300 uppercase tracking-wider mb-2">Amount (RWF)</label>
                                <input
                                    type="number"
                                    required
                                    min="1000"
                                    value={formData.initialAmount}
                                    onChange={(e) => setFormData({ ...formData, initialAmount: e.target.value })}
                                    className="w-full px-4 py-3 bg-cream-100 dark:bg-charcoal-700 border border-cream-200 dark:border-charcoal-600 rounded-xl text-charcoal-800 dark:text-white outline-none focus:border-terracotta-500"
                                    placeholder="e.g. 50000"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-charcoal-600 dark:text-charcoal-300 uppercase tracking-wider mb-2">Recipient Email</label>
                                <input
                                    type="email"
                                    value={formData.recipientEmail}
                                    onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                                    className="w-full px-4 py-3 bg-cream-100 dark:bg-charcoal-700 border border-cream-200 dark:border-charcoal-600 rounded-xl text-charcoal-800 dark:text-white outline-none focus:border-terracotta-500"
                                    placeholder="recipient@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-charcoal-600 dark:text-charcoal-300 uppercase tracking-wider mb-2">Message (Optional)</label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-4 py-3 bg-cream-100 dark:bg-charcoal-700 border border-cream-200 dark:border-charcoal-600 rounded-xl text-charcoal-800 dark:text-white outline-none focus:border-terracotta-500 resize-none"
                                    rows="2"
                                    placeholder="Enjoy your gift!"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-charcoal-600 dark:text-charcoal-300 uppercase tracking-wider mb-2">Expiry Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.expiryDate}
                                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                    className="w-full px-4 py-3 bg-cream-100 dark:bg-charcoal-700 border border-cream-200 dark:border-charcoal-600 rounded-xl text-charcoal-800 dark:text-white outline-none focus:border-terracotta-500"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-3 border border-cream-200 dark:border-charcoal-600 text-charcoal-600 dark:text-charcoal-300 rounded-xl font-medium hover:bg-cream-100 dark:hover:bg-charcoal-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-3 bg-terracotta-500 hover:bg-terracotta-600 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? "Creating..." : <><FaPlus /> Create</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {showEditModal && selectedCard && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-charcoal-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-cream-200 dark:border-charcoal-700 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-charcoal-800 dark:text-white flex items-center gap-2">
                                <FaEdit className="text-blue-500" /> Edit Gift Card
                            </h3>
                            <button onClick={() => setShowEditModal(false)} className="p-2 text-charcoal-400 hover:text-charcoal-600">
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={handleEdit} className="p-6 space-y-4">
                            <div className="bg-cream-100 dark:bg-charcoal-700 p-3 rounded-xl">
                                <span className="text-xs text-charcoal-500 uppercase tracking-wider">Code</span>
                                <p className="font-mono font-bold text-terracotta-500">{selectedCard.code}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-charcoal-600 dark:text-charcoal-300 uppercase tracking-wider mb-2">Current Balance (RWF)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.currentBalance}
                                    onChange={(e) => setFormData({ ...formData, currentBalance: e.target.value })}
                                    className="w-full px-4 py-3 bg-cream-100 dark:bg-charcoal-700 border border-cream-200 dark:border-charcoal-600 rounded-xl text-charcoal-800 dark:text-white outline-none focus:border-terracotta-500"
                                />
                                <p className="text-xs text-charcoal-400 mt-1">Original: {formatCurrency(selectedCard.initialAmount)}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-charcoal-600 dark:text-charcoal-300 uppercase tracking-wider mb-2">Recipient Email</label>
                                <input
                                    type="email"
                                    value={formData.recipientEmail}
                                    onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                                    className="w-full px-4 py-3 bg-cream-100 dark:bg-charcoal-700 border border-cream-200 dark:border-charcoal-600 rounded-xl text-charcoal-800 dark:text-white outline-none focus:border-terracotta-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-charcoal-600 dark:text-charcoal-300 uppercase tracking-wider mb-2">Message</label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-4 py-3 bg-cream-100 dark:bg-charcoal-700 border border-cream-200 dark:border-charcoal-600 rounded-xl text-charcoal-800 dark:text-white outline-none focus:border-terracotta-500 resize-none"
                                    rows="2"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-charcoal-600 dark:text-charcoal-300 uppercase tracking-wider mb-2">Expiry Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.expiryDate}
                                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                        className="w-full px-4 py-3 bg-cream-100 dark:bg-charcoal-700 border border-cream-200 dark:border-charcoal-600 rounded-xl text-charcoal-800 dark:text-white outline-none focus:border-terracotta-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-charcoal-600 dark:text-charcoal-300 uppercase tracking-wider mb-2">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-3 bg-cream-100 dark:bg-charcoal-700 border border-cream-200 dark:border-charcoal-600 rounded-xl text-charcoal-800 dark:text-white outline-none focus:border-terracotta-500 cursor-pointer"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Expired">Expired</option>
                                        <option value="Redeemed">Redeemed</option>
                                        <option value="Pending">Pending</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 px-4 py-3 border border-cream-200 dark:border-charcoal-600 text-charcoal-600 dark:text-charcoal-300 rounded-xl font-medium hover:bg-cream-100 dark:hover:bg-charcoal-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? "Saving..." : <><FaSave /> Save Changes</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {showDeleteModal && selectedCard && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-charcoal-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaTrash className="text-2xl text-red-500" />
                            </div>
                            <h3 className="text-lg font-bold text-charcoal-800 dark:text-white mb-2">Delete Gift Card?</h3>
                            <p className="text-charcoal-500 dark:text-charcoal-400 text-sm mb-2">
                                This will permanently delete gift card:
                            </p>
                            <p className="font-mono font-bold text-terracotta-500 mb-4">{selectedCard.code}</p>
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

export default AdminGiftCards;
