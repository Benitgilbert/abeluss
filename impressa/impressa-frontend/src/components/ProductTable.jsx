import { useEffect, useMemo, useState } from "react";
import api from "../utils/axiosInstance";
import ProductCreateEditModal from "./ProductCreateEditModal";

function ProductTable() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkAction, setBulkAction] = useState("");
  const [bulkValue, setBulkValue] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      const q = search.trim().toLowerCase();
      const next = products.filter((p) => {
        const matchesQ = q
          ? (p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
          : true;
        return matchesQ;
      });
      setFiltered(next);
      setPage(1);
    }, 200);
    return () => clearTimeout(id);
  }, [search, products]);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setMessage("❌ Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      setMessage("✅ Product deleted");
    } catch (err) {
      console.error("Delete failed:", err);
      setMessage("❌ Failed to delete product");
    }
  };

  const handleSaved = (saved) => {
    if (editing) {
      setProducts((prev) => prev.map((p) => (p._id === saved._id ? saved : p)));
      setEditing(null);
      setMessage("✅ Product updated");
    } else {
      setProducts((prev) => [saved, ...prev]);
      setCreating(false);
      setMessage("✅ Product created");
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === pageItems.length) setSelectedIds([]);
    else setSelectedIds(pageItems.map(p => p._id));
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.length === 0) return;
    if (!window.confirm(`Apply ${bulkAction} to ${selectedIds.length} products?`)) return;

    try {
      if (bulkAction === "delete") {
        await Promise.all(selectedIds.map(id => api.delete(`/products/${id}`)));
        setProducts(prev => prev.filter(p => !selectedIds.includes(p._id)));
        setMessage(`✅ Deleted ${selectedIds.length} products`);
      } else if (bulkAction === "stock") {
        const val = parseInt(bulkValue);
        if (isNaN(val)) return alert("Invalid stock value");
        await Promise.all(selectedIds.map(id => api.put(`/products/${id}`, { stock: val })));
        setProducts(prev => prev.map(p => selectedIds.includes(p._id) ? { ...p, stock: val } : p));
        setMessage(`✅ Updated stock for ${selectedIds.length} products`);
      } else if (bulkAction === "price") {
        const val = parseFloat(bulkValue);
        if (isNaN(val)) return alert("Invalid price value");
        await Promise.all(selectedIds.map(id => api.put(`/products/${id}`, { price: val })));
        setProducts(prev => prev.map(p => selectedIds.includes(p._id) ? { ...p, price: val } : p));
        setMessage(`✅ Updated price for ${selectedIds.length} products`);
      }
      setSelectedIds([]);
      setBulkAction("");
      setBulkValue("");
    } catch (err) {
      console.error("Bulk action failed:", err);
      setMessage("❌ Bulk action failed");
    }
  };

  const sorted = useMemo(() => {
    const s = [...filtered].sort((a, b) => {
      const av = (a[sortKey] ?? "").toString().toLowerCase();
      const bv = (b[sortKey] ?? "").toString().toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return s;
  }, [filtered, sortKey, sortDir]);

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  const setSort = (key) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  if (loading) {
    return (
      <div className="product-table-container">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-40 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  const formatPrice = (v) => (typeof v === 'number' ? v.toLocaleString() : v);

  return (
    <div className="product-table-container">
      <div className="product-table-header">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
          <h2 className="product-table-title">Product Catalog</h2>
          <div className="product-actions">
            <div className="hidden sm:block text-sm text-gray-500">{total} items</div>
            <button
              onClick={() => setCreating(true)}
              className="btn-primary"
            >
              + Add Product
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className={`mb-3 text-sm ${message.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>{message}</div>
      )}

      <div className="toolbar">
        <input
          type="text"
          placeholder="Search name or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {selectedIds.length > 0 && (
        <div className="bulk-actions">
          <span className="bulk-count">{selectedIds.length} selected</span>
          <select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)} className="bulk-select">
            <option value="">-- Bulk Action --</option>
            <option value="delete">Delete</option>
            <option value="stock">Set Stock</option>
            <option value="price">Set Price</option>
          </select>
          {(bulkAction === "stock" || bulkAction === "price") && (
            <input
              type="number"
              placeholder="Value"
              value={bulkValue}
              onChange={(e) => setBulkValue(e.target.value)}
              className="bulk-input w-24"
            />
          )}
          <button onClick={handleBulkAction} className="btn-secondary">Apply</button>
        </div>
      )}

      <div className="table-wrapper">
        <table className="product-table">
          <thead>
            <tr>
              <th className="w-8"><input type="checkbox" checked={selectedIds.length === pageItems.length && pageItems.length > 0} onChange={toggleSelectAll} /></th>
              <th onClick={() => setSort("name")} className="cursor-pointer select-none">Name {sortKey === "name" && (sortDir === "asc" ? "▲" : "▼")}</th>
              <th onClick={() => setSort("price")} className="cursor-pointer select-none">Price {sortKey === "price" && (sortDir === "asc" ? "▲" : "▼")}</th>
              <th onClick={() => setSort("stock")} className="cursor-pointer select-none">Stock {sortKey === "stock" && (sortDir === "asc" ? "▲" : "▼")}</th>
              <th>Image</th>
              <th>Customization</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 py-6">No products match your filters.</td>
              </tr>
            )}
            {pageItems.map((p, idx) => {
              const isLowStock = p.stock !== null && p.stock < 5;
              return (
                <tr key={p._id} className={isLowStock ? "low-stock" : ""}>
                  <td><input type="checkbox" checked={selectedIds.includes(p._id)} onChange={() => toggleSelect(p._id)} /></td>
                  <td>
                    <div className="product-name">{p.name}</div>
                    <div className="product-desc">{p.description}</div>
                  </td>
                  <td>{formatPrice(p.price)}</td>
                  <td>
                    {p.stock !== null && (
                      <span className={`badge ${p.stock < 5 ? 'bg-red-100 text-red-800' : 'badge-gray'}`}>
                        {p.stock}
                      </span>
                    )}
                    {p.stock === null && <span className="text-gray-400">-</span>}
                  </td>
                  <td>
                    {p.image ? (
                      <img src={p.image} alt="" className="product-table-img" />
                    ) : (
                      <div className="product-table-img bg-gray-100 border"></div>
                    )}
                  </td>
                  <td>
                    {p.customizable ? (
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(p.customizationOptions) && p.customizationOptions.length > 0 ? (
                          p.customizationOptions.map((opt) => (
                            <span key={opt} className="badge badge-gray">
                              {opt}
                            </span>
                          ))
                        ) : (
                          <span className="badge badge-gray">enabled</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditing(p)}
                        className="action-btn btn-edit"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="action-btn btn-delete"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <div className="pagination-info">Page {page} of {totalPages}</div>
        <div className="pagination-controls">
          <label className="text-sm text-gray-600">Rows per page</label>
          <select value={pageSize} onChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPage(1); }} className="px-2 py-1 border rounded text-sm">
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
          <div className="flex items-center gap-2 ml-2">
            <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="pagination-btn">Prev</button>
            <button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="pagination-btn">Next</button>
          </div>
        </div>
      </div>

      {(creating || editing) && (
        <ProductCreateEditModal
          product={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

export default ProductTable;


