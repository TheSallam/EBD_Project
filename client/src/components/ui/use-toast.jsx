import * as React from "react";

const ToastContext = React.createContext(null);

function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([]);

  const dismiss = React.useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = React.useCallback(
    (toast) => {
      const id = crypto.randomUUID();
      const item = { id, ...toast };
      setToasts((prev) => [...prev, item]);
      setTimeout(() => dismiss(id), toast.duration ?? 3500);
    },
    [dismiss]
  );

  const value = React.useMemo(() => ({ toasts, add, dismiss }), [toasts, add, dismiss]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");

  const add = ctx.add;

  // ✅ HELPER: Force Error Style (Red)
  const error = (title, description = "") => {
    add({ variant: "destructive", title, description });
  };

  // ✅ HELPER: Force Success Style (White/Dark)
  const success = (title, description = "") => {
    add({ variant: "default", title, description });
  };

  return {
    toast: add,
    error,   // Use this for errors
    success, // Use this for success
    dismiss: ctx.dismiss,
    toasts: ctx.toasts,
  };
}

export { ToastProvider, useToast };