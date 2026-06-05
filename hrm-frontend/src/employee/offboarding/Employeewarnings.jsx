import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../layouts/sidebar";
import MobileTopBar from "../MobileTopBar";
import { useTheme } from "../../context/ThemeContext";

const API = import.meta.env.VITE_API_URL || "https://hrm-backend-vvqg.onrender.com";

const severityColors = {
  low: { bg: "#ECFDF5", text: "#059669", border: "#6EE7B7", darkBg: "#064E3B", darkText: "#6EE7B7", darkBorder: "#6EE7B7" },
  medium: { bg: "#FFFBEB", text: "#D97706", border: "#FCD34D", darkBg: "#451A03", darkText: "#FCD34D", darkBorder: "#FCD34D" },
  high: { bg: "#FEF2F2", text: "#DC2626", border: "#FCA5A5", darkBg: "#2D0F0F", darkText: "#F87171", darkBorder: "#F87171" },
};

export default function EmployeeWarnings() {
  const { isDark } = useTheme();
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);

  const name = localStorage.getItem("name") || "Employee";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const isMobile = window.innerWidth <= 768;
  const sidebarWidth = isMobile ? 0 : isOpen ? 255 : 68;

  const t = {
    bg: isDark ? "#0F1219" : "#F9FAFB",
    card: isDark ? "#161B27" : "#fff",
    border: isDark ? "#1E2535" : "#F1F3F9",
    textPrimary: isDark ? "#F3F4F6" : "#111827",
    textSecondary: isDark ? "#9CA3AF" : "#6B7280",
    textMuted: isDark ? "#6B7280" : "#9CA3AF",
    inputBg: isDark ? "#1E2535" : "#F9FAFB",
    inputBorder: isDark ? "#2D3748" : "#E5E7EB",
    topbar: isDark ? "#161B27" : "#fff",
    skeletonBg: isDark ? "#1E2535" : "#F3F4F6",
    acknowledgedBg: isDark ? "#1E1B4B" : "#EEF2FF",
    acknowledgedText: isDark ? "#818CF8" : "#4F46E5",
    resolvedBg: isDark ? "#064E3B" : "#ECFDF5",
    resolvedText: isDark ? "#6EE7B7" : "#059669",
    emptyIconBg: isDark ? "#1E2535" : "#fff",
  };

  const token = localStorage.getItem("token");
  const headers = { "x-auth-token": token };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) setIsOpen(false);
      else setIsOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchMyWarnings();
  }, []);

  const fetchMyWarnings = async () => {
    try {
      const res = await axios.get(`${API}/api/warnings/my`, { headers });
      setWarnings(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (id) => {
    try {
      const res = await axios.patch(`${API}/api/warnings/${id}/acknowledge`, {}, { headers });
      setWarnings((prev) => prev.map((w) => (w._id === id ? res.data.data : w)));
    } catch (err) {
      alert(err.response?.data?.error || "Failed to acknowledge.");
    }
  };

  const getSeverityStyle = (severity) => {
    const s = severityColors[severity] || severityColors.medium;
    if (isDark) {
      return { bg: s.darkBg, text: s.darkText, border: s.darkBorder };
    }
    return { bg: s.bg, text: s.text, border: s.border };
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: t.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .ew-card { transition: transform 0.15s, box-shadow 0.15s; }
        .ew-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(15,23,42,0.08) !important; }
        .topbar-btn:hover { background: ${isDark ? "#1E2535" : "#F3F4F6"} !important; }
        * { box-sizing: border-box; }
        @media (max-width: 768px) {
          .ew-main { padding: 76px 16px 32px !important; }
          .ew-card-inner { flex-direction: column !important; align-items: flex-start !important; }
          .ew-ack-btn { margin-left: 0 !important; margin-top: 12px; }
          .ew-topbar { display: none !important; }
        }
      `}</style>

      <MobileTopBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div
        className="ew-main"
        style={{
          marginLeft: `${sidebarWidth}px`,
          flex: 1,
          transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
          padding: "28px 28px 40px",
        }}
      >
        <div className="ew-topbar" style={{ marginBottom: 28, animation: "fadeUp 0.4s ease both 0.05s" }}>
          <p style={{ color: t.textSecondary, fontSize: "0.875rem", margin: "0 0 4px" }}>
            {greeting}, <strong style={{ color: "#4F46E5" }}>{name}</strong> 👋
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.5rem, 4vw, 1.85rem)", fontWeight: 700, color: t.textPrimary, margin: 0, lineHeight: 1.2 }}>
            My Warnings
          </h1>
          <p style={{ color: t.textMuted, fontSize: "0.85rem", margin: "5px 0 0" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 80 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 44, height: 44, border: "3px solid #E5E7EB", borderTop: "3px solid #4F46E5", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
              <p style={{ color: t.textMuted, fontWeight: 500, fontSize: "0.9rem" }}>Loading...</p>
            </div>
          </div>
        ) : warnings.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, background: t.card, borderRadius: 14, color: t.textMuted, border: `1px solid ${t.border}`, animation: "fadeUp 0.4s ease both 0.15s" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
            <p style={{ fontWeight: 600, margin: 0, fontSize: 15, color: t.textPrimary }}>No warnings issued</p>
            <p style={{ fontSize: 13, color: t.textMuted, margin: "4px 0 0" }}>You have a clean record</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "fadeUp 0.4s ease both 0.15s" }}>
            {warnings.map((w, idx) => {
              const sev = getSeverityStyle(w.severity);
              return (
                <div
                  key={w._id}
                  className="ew-card"
                  style={{
                    background: t.card,
                    borderRadius: 12,
                    padding: "20px 24px",
                    border: `1px solid ${t.border}`,
                    borderLeft: `4px solid ${sev.border}`,
                    boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.04)",
                    animation: `fadeUp 0.4s ease both ${0.15 + idx * 0.06}s`,
                  }}
                >
                  <div className="ew-card-inner" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: t.textPrimary }}>{w.subject}</span>
                        <span style={{ background: sev.bg, color: sev.text, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
                          {w.severity}
                        </span>
                        {w.status === "acknowledged" && (
                          <span style={{ background: t.acknowledgedBg, color: t.acknowledgedText, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                            Acknowledged
                          </span>
                        )}
                        {w.status === "resolved" && (
                          <span style={{ background: t.resolvedBg, color: t.resolvedText, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                            Resolved
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 13, color: t.textSecondary, margin: "0 0 10px", lineHeight: 1.5 }}>{w.description}</p>
                      <div style={{ fontSize: 12, color: t.textMuted }}>
                        Issued by <strong style={{ color: t.textSecondary }}>{w.issued_by?.name || "Management"}</strong>
                        {" · "}
                        {new Date(w.warning_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        {w.acknowledged_at && ` · Acknowledged ${new Date(w.acknowledged_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`}
                      </div>
                    </div>
                    {w.status === "active" && (
                      <button
                        className="ew-ack-btn"
                        onClick={() => handleAcknowledge(w._id)}
                        style={{
                          marginLeft: 16, padding: "8px 16px", border: `1px solid ${t.inputBorder}`,
                          borderRadius: 8, background: t.card, color: t.textSecondary,
                          fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
                          fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s",
                        }}
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}