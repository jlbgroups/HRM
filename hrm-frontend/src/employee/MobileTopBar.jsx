import React from "react";
import { Menu } from "lucide-react";

const MobileTopBar = ({ isOpen, setIsOpen }) => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600&family=Playfair+Display:wght@700&display=swap');
        .mobile-topbar {
          display: none;
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 56px;
          background: #fff;
          border-bottom: 1px solid #F1F3F9;
          box-shadow: 0 2px 8px rgba(15,23,42,0.06);
          z-index: 998;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          font-family: 'DM Sans', sans-serif;
        }
        @media (max-width: 768px) {
          .mobile-topbar { display: flex; }
        }
      `}</style>
      <header className="mobile-topbar" role="banner">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            aria-hidden="true"
            style={{
              width: "30px", height: "30px", borderRadius: "8px",
              background: "linear-gradient(135deg, #1E1B4B, #4F46E5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontFamily: "'Playfair Display', serif",
              fontSize: "1rem", fontWeight: "700",
            }}
          >S</div>
          <span style={{ fontSize: "0.95rem", fontWeight: "600", color: "#111827", letterSpacing: "-0.2px" }}>
            Shnoor
          </span>
        </div>
        <button
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isOpen}
          aria-controls="sidebar-nav"
          onClick={() => setIsOpen(prev => !prev)}
          style={{
            width: "36px", height: "36px", borderRadius: "9px",
            border: "1px solid #F1F3F9", background: "#F9FAFB",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#374151", cursor: "pointer",
          }}
        >
          <Menu size={18} aria-hidden="true" />
        </button>
      </header>
    </>
  );
};

export default MobileTopBar;