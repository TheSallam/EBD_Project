import { ToastProvider, useToast } from "./use-toast.jsx";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

function ToastItem({ toast }) {
  const isDestructive = toast.variant === "destructive";
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDarkMode();
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      className={cn(
        // BASE STYLES
        "pointer-events-auto relative w-full max-w-[350px] overflow-hidden rounded-xl border p-4 pr-8 shadow-lg transition-all",
        // Light mode: bright red
        isDark ? "bg-red-900 border-red-900 shadow-red-950/30" : "bg-red-600 text-white border-red-600 shadow-red-500/20"
      )}
    >
      <div className="grid gap-1">
        {toast.title && <p className="text-sm font-semibold">{toast.title}</p>}
        {toast.description && (
          <p className="text-xs text-red-50">
            {toast.description}
          </p>
        )}
      </div>
    </div>
  );
}

function ToastViewport() {
  const { toasts } = useToast();
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 outline-none">
      {toasts.map((t) => <ToastItem key={t.id} toast={t} />)}
    </div>
  );
}

// Ensure this component is exported!
function Toaster() {
  return <ToastViewport />;
}

export { Toaster, ToastProvider };