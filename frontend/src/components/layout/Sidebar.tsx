import React from "react";

export type ViewKey = "dashboard" | "history";

interface SidebarProps {
  view: ViewKey;
  onViewChange: (view: ViewKey) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ view, onViewChange }) => (
  <aside className="sidebar">
    <div className="brand-mark">
      <span className="brand-icon">MG</span>
      <span>Mini Grua</span>
    </div>
    <nav className="nav-list">
      <button
        className={view === "dashboard" ? "active" : ""}
        onClick={() => onViewChange("dashboard")}
      >
        Dashboard
      </button>
      <button
        className={view === "history" ? "active" : ""}
        onClick={() => onViewChange("history")}
      >
        Historial
      </button>
    </nav>
  </aside>
);
