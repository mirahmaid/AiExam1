import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, XCircle, RefreshCw, X } from "lucide-react";

const ToastContext = createContext(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast يجب استخدامه داخل ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, isExiting: true } : t)));

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 450);
  }, []);

  const showToast = useCallback(
    (toast) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { ...toast, id, isExiting: false }]);

      setTimeout(() => {
        dismissToast(id);
      }, 6000);
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="pointer-events-none fixed top-6 right-6 z-[100] flex flex-col items-end gap-3 px-4 max-w-md w-full perspective-[1200px]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto relative overflow-hidden flex w-full flex-col rounded-2xl border p-4 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] backdrop-blur-2xl ${
              toast.isExiting ? "toast-out" : "toast-in"
            } ${
              toast.type === "success"
                ? "border-[#38B793]/25 bg-white/95 text-[#002C5A]"
                : "border-red-500/25 bg-white/95 text-slate-950"
            }`}
          >
            <div className="flex items-start gap-3.5 w-full">
              {toast.type === "success" ? (
                <div className="rounded-full bg-[#38B793]/15 p-1.5 shrink-0">
                  <CheckCircle2 size={18} className="text-[#38B793]" />
                </div>
              ) : (
                <div className="rounded-full bg-red-100/80 p-1.5 shrink-0">
                  <XCircle size={18} className="text-red-500" />
                </div>
              )}

              <div className="flex-1 text-right pt-0.5">
                <p className="text-sm font-bold tracking-tight leading-snug">{toast.message}</p>

                {toast.onRetry && (
                  <button
                    onClick={() => {
                      toast.onRetry?.();
                      dismissToast(toast.id);
                    }}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"
                  >
                    <RefreshCw size={13} />
                    إعادة المحاولة
                  </button>
                )}
              </div>

              <button
                onClick={() => dismissToast(toast.id)}
                className="shrink-0 text-slate-400 transition-colors hover:text-slate-700 rounded-lg p-1.5 hover:bg-slate-100/80"
                aria-label="إغلاق"
              >
                <X size={16} />
              </button>
            </div>

            {/* شريط التقدم الزمني السفلي */}
            <div className="absolute bottom-0 right-0 left-0 h-1 bg-slate-100 overflow-hidden rounded-b-2xl">
              <div
                className={`toast-progress h-full ${
                  toast.type === "success" ? "bg-[#38B793]" : "bg-red-500"
                }`}
              />
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(20px) scale(0.95); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes toastOut {
          from { opacity: 1; transform: translateX(0) scale(1); }
          to { opacity: 0; transform: translateX(20px) scale(0.95); }
        }
        @keyframes toastProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
        .toast-in { animation: toastIn 0.35s ease-out forwards; }
        .toast-out { animation: toastOut 0.35s ease-in forwards; }
        .toast-progress { animation: toastProgress 6s linear forwards; }
      `}</style>
    </ToastContext.Provider>
  );
}
