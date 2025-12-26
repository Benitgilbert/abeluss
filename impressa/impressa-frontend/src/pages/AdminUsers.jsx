import { useState } from "react";
import UserTable from "../components/UserTable";
import UserCreateModal from "../components/UserCreateModal";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles/AdminLayout.css";

function AdminUsers() {
  const [showModal, setShowModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleUserCreated = () => {
    // Optional: refresh user table or show toast
  };

  return (
    <div className="admin-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title="Manage Users" />
        <main className="dashboard-content">
          <UserTable onCreate={() => setShowModal(true)} />

          <UserCreateModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onUserCreated={handleUserCreated}
          />
        </main>
      </div>
    </div>
  );
}

export default AdminUsers;