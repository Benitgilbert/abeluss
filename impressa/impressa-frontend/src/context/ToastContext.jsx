import React, { createContext, useContext, useState, useCallback } from 'react';
import "../styles/Toast.css";

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now().toString() + Math.random().toString();
        setToasts(prev => [...prev, { id, message, type }]);

        if (duration) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const showSuccess = (msg) => addToast(msg, 'success');
    const showError = (msg) => addToast(msg, 'error');
    const showInfo = (msg) => addToast(msg, 'info');
    const showWarning = (msg) => addToast(msg, 'warning');

    return (
        <ToastContext.Provider value={{ addToast, removeToast, showSuccess, showError, showInfo, showWarning }}>
            {children}
            <div className="toast-container" role="alert" aria-live="aggressive">
                {toasts.map(toast => (
                    <div key={toast.id} className={`toast-item ${toast.type}`}>
                        <div className="toast-content">{toast.message}</div>
                        <button onClick={() => removeToast(toast.id)} className="toast-close">×</button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
