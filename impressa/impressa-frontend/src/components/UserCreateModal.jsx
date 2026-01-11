import UserCreateForm from "./UserCreateForm";
import "../styles/PremiumModal.css";

function UserCreateModal({ isOpen, onClose, onUserCreated }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h3 className="modal-title">Create New User</h3>
          <button onClick={onClose} className="btn-close">×</button>
        </div>

        <div className="modal-body">
          <UserCreateForm
            onSuccess={() => {
              onUserCreated?.();
              onClose();
            }}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}

export default UserCreateModal;