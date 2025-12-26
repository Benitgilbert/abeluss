import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import DashboardCards from "../components/DashboardCards";
import RevenueChart from "../components/RevenueChart";
import WeeklyProfitChart from "../components/WeeklyProfitChart";
import RecentOrderTable from "../components/RecentOrderTable";
import CustomizationDemandTable from "../components/CustomizationDemandTable";
import TopOrderedProductsTable from "../components/TopOrderedProductsTable";
import TopSellersWidget from "../components/TopSellersWidget";
import LowStockWidget from "../components/LowStockWidget";
import PendingApprovalsWidget from "../components/PendingApprovalsWidget";
import OrderStatusChart from "../components/OrderStatusChart";
import "../styles/AdminLayout.css";

function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title="Dashboard Overview" />

        <main className="dashboard-content">

          {/* Metrics Cards */}
          <div className="section-mb">
            <DashboardCards />
          </div>

          {/* Charts Section - Row 1 */}
          <div className="section-mb">
            <div className="page-header">
              <h2 className="card-title">Performance Analytics</h2>
            </div>
            <div className="two-col-grid">
              <div className="card">
                <RevenueChart />
              </div>
              <div className="card">
                <WeeklyProfitChart />
              </div>
            </div>
          </div>

          {/* Multi-Vendor Insights - Row 2 */}
          <div className="section-mb">
            <div className="page-header">
              <h2 className="card-title">Marketplace Insights</h2>
            </div>
            <div className="three-col-grid">
              <TopSellersWidget />
              <PendingApprovalsWidget />
              <OrderStatusChart />
            </div>
          </div>

          {/* Inventory & Orders - Row 3 */}
          <div className="section-mb">
            <div className="two-col-grid">
              <LowStockWidget />
              <RecentOrderTable />
            </div>
          </div>

          {/* Products Analysis - Row 4 */}
          <div className="two-col-grid">
            <TopOrderedProductsTable />
            <CustomizationDemandTable />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;