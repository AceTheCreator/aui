import { useEffect } from "react";
import { createPortal } from "react-dom";

export type SidePanelSide = "left" | "right";

export interface ISidePanelProps {
  isOpen: boolean;
  side: SidePanelSide;
  onClose: () => void;
  title?: string | React.ReactNode;
  children?: React.ReactNode;
}

export function SidePanel({ isOpen, side, onClose, title, children }: ISidePanelProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const translateClosed = side === "right" ? "translate-x-full" : "-translate-x-full";
  const panelPosition = side === "right" ? "right-0" : "left-0";

  return createPortal(
    <div className="fixed inset-0 z-50" style={{ pointerEvents: isOpen ? "auto" : "none" }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        style={{ pointerEvents: isOpen ? "auto" : "none" }}
      />

      {/* Panel */}
      <div
        className={`absolute top-0 ${panelPosition} h-full w-[50rem] bg-white shadow-xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : translateClosed
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="text-sm font-semibold text-gray-800 min-w-0 flex-1 overflow-hidden">
            {typeof title === "string" ? <span className="truncate block">{title}</span> : title}
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close panel"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 2l12 12M14 2L2 14" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
