import { useState } from "react";
import UserTable from "../components/UserTable";
import UserCreateModal from "../components/UserCreateModal";

function AdminUsers() {
  const [showModal, setShowModal] = useState(false);

  const handleUserCreated = () => {
    // Optional: refresh user table or show toast
  };

  return (
    <div className="p-6">
      <div className="mb-3">
        <h2 className="text-2xl font-semibold text-gray-800">Manage Users</h2>
        <p className="text-sm text-gray-500 mt-1">Search, sort, and manage roles for your team.</p>
      </div>

      <UserTable onCreate={() => setShowModal(true)} />
      <UserCreateModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onUserCreated={handleUserCreated}
      />
    </div>
  );
}

export default AdminUsers;