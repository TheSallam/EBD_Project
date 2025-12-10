import { ToastProvider, useToast } from "./use-toast.jsx";

function ToastItem({ toast }) {
  return (
    <div className="rounded-lg border border-slate-800/70 bg-slate-950/80 px-4 py-3 shadow-lg shadow-emerald-500/10 text-sm">
      <p className="font-medium text-white">{toast.title}</p>
      {toast.description && <p className="text-muted-foreground text-xs mt-1">{toast.description}</p>}
    </div>
  );
}

function ToastViewport() {
  const { toasts } = useToast();
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}

function Toaster() {
  return <ToastViewport />;
}

export { Toaster, ToastProvider };

