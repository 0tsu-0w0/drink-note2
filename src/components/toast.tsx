"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

/** 記録が画面の外で変わったことを知らせるイベント名 */
export const DRINKS_CHANGED = "mg:drinks-changed";

type Toast = {
  id: number;
  title: string;
  sub?: string;
  action?: { label: string; run: () => void };
  /** 表示しておく時間（ミリ秒） */
  ms?: number;
};

type Ctx = { show: (t: Omit<Toast, "id">) => void };

const ToastContext = createContext<Ctx>({ show: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seq = useRef(0);

  const show = useCallback((t: Omit<Toast, "id">) => {
    seq.current += 1;
    setToast({ ...t, id: seq.current });
  }, []);

  useEffect(() => {
    if (!toast) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), toast.ms ?? 4000);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [toast]);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="toast-wrap" aria-live="polite">
        {toast && (
          <div className="toast" key={toast.id} role="status">
            <div className="msg">
              <b>{toast.title}</b>
              {toast.sub && <span>{toast.sub}</span>}
            </div>
            {toast.action && (
              <button
                type="button"
                onClick={() => {
                  toast.action!.run();
                  setToast(null);
                }}
              >
                {toast.action.label}
              </button>
            )}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}
