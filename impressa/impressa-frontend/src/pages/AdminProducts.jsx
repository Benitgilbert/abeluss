import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import ProductTable from "../components/ProductTable";
import "./AdminProducts.css";

function AdminProducts() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title="Products" />
        <main className="admin-content">
          <ProductTable />
        </main>
      </div>
    </div>
  );
}

export default AdminProducts;
