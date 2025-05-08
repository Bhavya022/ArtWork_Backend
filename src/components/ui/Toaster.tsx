import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
  };

  // Automatically remove toasts after 5 seconds
  useEffect(() => {
    if (toasts.length === 0) return;

    const timer = setTimeout(() => {
      setToasts((prevToasts) => prevToasts.slice(1));
    }, 5000);

    return () => clearTimeout(timer);
  }, [toasts]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-0 right-0 p-6 z-50 flex flex-col space-y-4 items-end">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              toast={toast}
              onClose={() => {
                setToasts((prevToasts) =>
                  prevToasts.filter((t) => t.id !== toast.id)
                );
              }}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const Toast = ({ toast, onClose }: { toast: Toast; onClose: () => void }) => {
  const { type, message } = toast;

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  };

  const colors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className={`max-w-md w-full rounded-lg shadow-md border ${colors[type]} p-4`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">{icons[type]}</div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-gray-700">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  );
};

// Standalone Toaster component that can be used without context
export const Toaster = () => {
  // Context for direct access in components
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Make toast function available globally
  useEffect(() => {
    const showToast = (message: string, type: ToastType) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
    };

    window.showToast = showToast;

    return () => {
      delete window.showToast;
    };
  }, []);

  // Automatically remove toasts after 5 seconds
  useEffect(() => {
    if (toasts.length === 0) return;

    const timer = setTimeout(() => {
      setToasts((prevToasts) => prevToasts.slice(1));
    }, 5000);

    return () => clearTimeout(timer);
  }, [toasts]);

  return (
    <div className="fixed bottom-0 right-0 p-6 z-50 flex flex-col space-y-4 items-end">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onClose={() => {
              setToasts((prevToasts) =>
                prevToasts.filter((t) => t.id !== toast.id)
              );
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Add showToast to the global Window interface
declare global {
  interface Window {
    showToast: (message: string, type: ToastType) => void;
  }
}