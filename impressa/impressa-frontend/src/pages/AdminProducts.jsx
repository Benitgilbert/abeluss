import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import ProductTable from "../components/ProductTable";

function AdminProducts() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-charcoal-900 transition-colors duration-300">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64 min-h-screen flex flex-col transition-all duration-300">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title="Products" />
        <main className="flex-1 p-4 lg:p-6 max-w-[1600px] w-full mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-charcoal-800 dark:text-white">Product Catalog</h1>
            <p className="text-charcoal-500 dark:text-charcoal-400 text-sm mt-1">Manage all products in the marketplace</p>
          </div>

          {/* Product Table */}
          <div className="bg-white dark:bg-charcoal-800 rounded-2xl shadow-sm border border-cream-200 dark:border-charcoal-700 overflow-hidden">
            <ProductTable />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminProducts;
