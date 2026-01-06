import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};

const ToastItem = ({ toast, onClose, isDarkMode }) => {
    const icons = {
        success: <CheckCircle className="w-5 h-5 text-green-500" />,
        error: <AlertCircle className="w-5 h-5 text-red-500" />,
        warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />,
    };

    const bgColors = {
        success: isDarkMode ? "bg-green-900/20 border-green-800" : "bg-green-50 border-green-200",
        error: isDarkMode ? "bg-red-900/20 border-red-800" : "bg-red-50 border-red-200",
        warning: isDarkMode ? "bg-yellow-900/20 border-yellow-800" : "bg-yellow-50 border-yellow-200",
        info: isDarkMode ? "bg-blue-900/20 border-blue-800" : "bg-blue-50 border-blue-200",
    };

    return (
        <div
            className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg animate-slide-in-right ${bgColors[toast.type] || bgColors.info
                } ${isDarkMode ? "text-white" : "text-gray-900"}`}
            role="alert"
        >
            <div className="flex-shrink-0">{icons[toast.type] || icons.info}</div>
            <div className="flex-1 min-w-0">
                {toast.title && (
                    <p className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {toast.title}
                    </p>
                )}
                <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                    {toast.message}
                </p>
            </div>
            <button
                onClick={() => onClose(toast.id)}
                className={`flex-shrink-0 p-1 rounded-lg transition-colors ${isDarkMode ? "hover:bg-white/10" : "hover:bg-black/5"
                    }`}
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem("darkMode") === "true";
    });

    // Listen for dark mode changes
    React.useEffect(() => {
        const checkDarkMode = () => {
            setIsDarkMode(localStorage.getItem("darkMode") === "true");
        };
        window.addEventListener("storage", checkDarkMode);
        return () => window.removeEventListener("storage", checkDarkMode);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback(
        (message, type = "info", title = "", duration = 4000) => {
            const id = Date.now() + Math.random();
            const toast = { id, message, type, title };

            setToasts((prev) => [...prev, toast]);

            if (duration > 0) {
                setTimeout(() => {
                    removeToast(id);
                }, duration);
            }

            return id;
        },
        [removeToast]
    );

    const toast = {
        success: (message, title = "") => addToast(message, "success", title),
        error: (message, title = "") => addToast(message, "error", title),
        warning: (message, title = "") => addToast(message, "warning", title),
        info: (message, title = "") => addToast(message, "info", title),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
                {toasts.map((t) => (
                    <div key={t.id} className="pointer-events-auto">
                        <ToastItem toast={t} onClose={removeToast} isDarkMode={isDarkMode} />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export default ToastProvider;
