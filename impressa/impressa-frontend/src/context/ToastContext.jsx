import React, { createContext, useContext, useState, useCallback } from 'react';

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

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now().toString() + Math.random().toString();
        setToasts(prev => [...prev, { id, message, type }]);

        if (duration) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, [removeToast]);

    const showSuccess = (msg) => addToast(msg, 'success');
    const showError = (msg) => addToast(msg, 'error');
    const showInfo = (msg) => addToast(msg, 'info');
    const showWarning = (msg) => addToast(msg, 'warning');

    const getTypeStyles = (type) => {
        switch (type) {
            case 'success':
                return 'bg-green-500 text-white shadow-green-500/20';
            case 'error':
                return 'bg-red-500 text-white shadow-red-500/20';
            case 'warning':
                return 'bg-yellow-500 text-white shadow-yellow-500/20';
            case 'info':
            default:
                return 'bg-charcoal-700 text-white shadow-charcoal-500/20';
        }
    };

    return (
        <ToastContext.Provider value={{ addToast, removeToast, showSuccess, showError, showInfo, showWarning }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`
                            pointer-events-auto min-w-[300px] max-w-sm p-4 rounded-xl shadow-lg border border-white/10 flex items-center justify-between gap-4 animate-in slide-in-from-bottom-2 fade-in duration-300
                            ${getTypeStyles(toast.type)}
                        `}
                        role="alert"
                    >
                        <div className="text-sm font-medium">{toast.message}</div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-white/60 hover:text-white transition-colors text-lg leading-none"
                            aria-label="Close"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
