import { useEffect, useMemo, useState } from "react";
import axios from "../utils/axiosInstance";
import EditUserModal from "./EditUserModal"; // ✅ Make sure this component exists

function UserTable({ onCreate }) {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Debounced search + role filtering
  useEffect(() => {
    const id = setTimeout(() => {
      const filteredUsers = users.filter((user) => {
        const q = search.trim().toLowerCase();
        const matchesSearch = q
          ? (user.name?.toLowerCase().includes(q) || user.email?.toLowerCase().includes(q))
          : true;
        const matchesRole = roleFilter ? user.role === roleFilter : true;
        return matchesSearch && matchesRole;
      });
      setFiltered(filteredUsers);
      setPage(1);
    }, 200);
    return () => clearTimeout(id);
  }, [search, roleFilter, users]);

  const fetchUsers = async () => {
    try {
      // axiosInstance auto-injects `authToken` from localStorage (key: authToken)
      const res = await axios.get("/auth/users");
      setUsers(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setMessage("❌ Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSave = (updatedUser) => {
    setUsers(users.map((u) => (u._id === updatedUser._id ? updatedUser : u)));
    setMessage("✅ User updated");
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      // route is mounted under /api/auth on the backend
      await axios.delete(`/auth/users/${userId}`);
      setUsers(users.filter((u) => u._id !== userId));
      setMessage("✅ User deleted");
    } catch (err) {
      console.error("Delete failed:", err);
      setMessage("❌ Failed to delete user");
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await axios.get("/reports/generate?type=users&format=csv", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "users-report.csv");
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("CSV export failed:", err);
    }
  };

  const handleExportPDF = async () => {
    try {
      const res = await axios.get("/reports/generate?type=users&format=pdf", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "users.pdf");
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("PDF export failed:", err);
    }
  };
  const handleExportUserTablePDF = async () => {
    try {
      const res = await axios.get("/reports/generate?type=users&format=pdf", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "user-table.pdf");
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("User table PDF export failed:", err);
    }
  };

  const sorted = useMemo(() => {
    const s = [...filtered].sort((a, b) => {
      const av = (a[sortKey] || "").toString().toLowerCase();
      const bv = (b[sortKey] || "").toString().toLowerCase();
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
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-gray)" }}>
          Loading users...
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <h2 className="card-title" style={{ marginBottom: 0 }}>User List</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>{total} users</span>
          <button
            onClick={onCreate}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "var(--color-primary)",
              color: "white",
              borderRadius: "0.5rem",
              border: "none",
              fontSize: "0.875rem",
              cursor: "pointer",
              fontWeight: 500
            }}
          >
            + Create User
          </button>
        </div>
      </div>

      {message && (
        <div style={{
          marginBottom: "1rem",
          padding: "0.75rem",
          borderRadius: "0.5rem",
          fontSize: "0.875rem",
          backgroundColor: message.startsWith("✅") ? "#dcfce7" : "#fee2e2",
          color: message.startsWith("✅") ? "#166534" : "#991b1b"
        }}>
          {message}
        </div>
      )}

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "0.625rem 1rem",
            borderRadius: "0.5rem",
            border: "1px solid var(--border-color)",
            backgroundColor: "var(--bg-secondary)",
            color: "var(--text-primary)",
            fontSize: "0.875rem",
            flex: 1,
            minWidth: "200px"
          }}
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{
            padding: "0.625rem 1rem",
            borderRadius: "0.5rem",
            border: "1px solid var(--border-color)",
            backgroundColor: "var(--bg-secondary)",
            color: "var(--text-primary)",
            fontSize: "0.875rem",
            minWidth: "150px"
          }}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="cashier">Cashier</option>
          <option value="inventory">Inventory</option>
          <option value="delivery">Delivery</option>
          <option value="customer">Customer</option>
          <option value="guest">Guest</option>
        </select>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={handleExportCSV}
            style={{
              padding: "0.625rem 1rem",
              backgroundColor: "#22c55e",
              color: "white",
              borderRadius: "0.5rem",
              border: "none",
              fontSize: "0.875rem",
              cursor: "pointer"
            }}
          >
            Export CSV
          </button>
          <button
            onClick={handleExportPDF}
            style={{
              padding: "0.625rem 1rem",
              backgroundColor: "#6366f1",
              color: "white",
              borderRadius: "0.5rem",
              border: "none",
              fontSize: "0.875rem",
              cursor: "pointer"
            }}
          >
            Export PDF
          </button>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => setSort("name")} style={{ cursor: "pointer" }}>
                Name {sortKey === "name" && (sortDir === "asc" ? "▲" : "▼")}
              </th>
              <th onClick={() => setSort("email")} style={{ cursor: "pointer" }}>
                Email {sortKey === "email" && (sortDir === "asc" ? "▲" : "▼")}
              </th>
              <th onClick={() => setSort("role")} style={{ cursor: "pointer" }}>
                Role {sortKey === "role" && (sortDir === "asc" ? "▲" : "▼")}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-gray)" }}>
                  No users match your filters.
                </td>
              </tr>
            )}
            {pageItems.map((user) => {
              // Map role to badge color (using standard badge classes if available, otherwise inline)
              const badgeClass = `stat-badge badge-${user.role === "admin" ? "purple" :
                user.role === "seller" ? "blue" :
                  user.role === "customer" ? "green" : "gray"
                }`;

              return (
                <tr key={user._id}>
                  <td>
                    <div style={{ fontWeight: 500, color: "var(--text-primary)" }}>{user.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "none" }} className="mobile-only">{user.email}</div>
                  </td>
                  <td className="desktop-only" style={{ color: "var(--text-primary)" }}>{user.email}</td>
                  <td>
                    <span className={badgeClass} style={{ textTransform: "capitalize" }}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={() => setEditingUser(user)}
                        style={{
                          border: "none",
                          background: "none",
                          fontSize: "1.2rem",
                          cursor: "pointer",
                          padding: "0.25rem"
                        }}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        style={{
                          border: "none",
                          background: "none",
                          fontSize: "1.2rem",
                          cursor: "pointer",
                          padding: "0.25rem"
                        }}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
        <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
          Page {page} of {totalPages}
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              border: "1px solid var(--border-color)",
              backgroundColor: page === 1 ? "var(--bg-tertiary)" : "var(--bg-secondary)",
              color: page === 1 ? "var(--text-muted)" : "var(--text-primary)",
              cursor: page === 1 ? "not-allowed" : "pointer"
            }}
          >
            Prev
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              border: "1px solid var(--border-color)",
              backgroundColor: page === totalPages ? "var(--bg-tertiary)" : "var(--bg-secondary)",
              color: page === totalPages ? "var(--text-muted)" : "var(--text-primary)",
              cursor: page === totalPages ? "not-allowed" : "pointer"
            }}
          >
            Next
          </button>
        </div>
      </div>

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
}

export default UserTable;