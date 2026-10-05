import { createContext, useContext, useState, useCallback, useRef } from "react";
import { CheckCircle2, XCircle, Info, RefreshCw, X } from "lucide-react";

const ToastContext = createContext(null);

const FONT = "'Cairo','Tajawal',system-ui,sans-serif";
const DURATION = 6000;

const TYPES = {
  success: { Icon: CheckCircle2, icon: "bg-[#E8F7F3] text-[#0F8B78]", bar: "bg-[#0F8B78]", ring: "ring-[#BFE8DD]" },
  error: { Icon: XCircle, icon: "bg-rose-50 text-rose-500", bar: "bg-rose-500", ring: "ring-rose-100" },
  info: { Icon: Info, icon: "bg-sky-50 text-sky-500", bar: "bg-sky-500", ring: "ring-sky-100" },
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast يجب استخدامه داخل ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());
  const counter = useRef(0);

  const clearTimer = useCallback((id) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
  }, []);

  const dismissToast = useCallback(
    (id) => {
      clearTimer(id);
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, isExiting: true } : t)));
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 400);
    },
    [clearTimer]
  );

  const schedule = useCallback(
    (id, ms) => {
      clearTimer(id);
      timers.current.set(id, setTimeout(() => dismissToast(id), ms));
    },
    [clearTimer, dismissToast]
  );

  const showToast = useCallback(
    (toast) => {
      const id = ++counter.current;
      // نحتفظ بآخر 3 إشعارات فقط حتى ما تمتلئ الشاشة
      setToasts((prev) => [...prev, { type: "success", ...toast, id, isExiting: false }].slice(-3));
      schedule(id, DURATION);
    },
    [schedule]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div
        dir="rtl"
        aria-live="polite"
        style={{ fontFamily: FONT }}
        className="pointer-events-none fixed inset-x-0 top-20 z-[100] flex flex-col items-center gap-3 px-4 sm:inset-x-auto sm:left-6 sm:items-start"
      >
        {toasts.map((toast) => {
          const t = TYPES[toast.type] ?? TYPES.success;
          const Icon = t.Icon;

          return (
            <div
              key={toast.id}
              role={toast.type === "error" ? "alert" : "status"}
              onMouseEnter={() => clearTimer(toast.id)}
              onMouseLeave={() => schedule(toast.id, 2500)}
              className={`toast-card pointer-events-auto relative flex w-full max-w-sm flex-col overflow-hidden rounded-[24px] bg-white p-4 pb-5 shadow-[0_25px_60px_-20px_rgba(15,42,74,0.35)] ring-1 ${t.ring} ${
                toast.isExiting ? "toast-out" : "toast-in"
              }`}
            >
              <div className="flex w-full items-start gap-3">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${t.icon}`}>
                  <Icon size={19} aria-hidden="true" />
                </span>

                <div className="flex-1 pt-1.5">
                  <p className="text-[14px] font-black leading-6 text-[#0F2A4A]">{toast.message}</p>

                  {toast.onRetry && (
                    <button
                      type="button"
                      onClick={() => {
                        toast.onRetry?.();
                        dismissToast(toast.id);
                      }}
                      className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-[#0F2A4A] px-3.5 py-1.5 text-[12px] font-black text-white transition hover:bg-[#0F8B78]"
                    >
                      <RefreshCw size={12} aria-hidden="true" />
                      إعادة المحاولة
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  className="shrink-0 rounded-full p-1.5 text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  aria-label="إغلاق"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>

              {/* شريط الوقت */}
              <div className="absolute inset-x-0 bottom-0 h-1 bg-slate-100">
                <div className={`toast-progress h-full ${t.bar}`} />
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-14px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes toastOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(-14px) scale(0.96); }
        }
        @keyframes toastProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
        .toast-in { animation: toastIn 0.35s cubic-bezier(.2,.8,.2,1) forwards; }
        .toast-out { animation: toastOut 0.35s ease-in forwards; }
        .toast-progress { animation: toastProgress ${DURATION}ms linear forwards; }
        .toast-card:hover .toast-progress { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .toast-in, .toast-out { animation-duration: 0.01ms; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}