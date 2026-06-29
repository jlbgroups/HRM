import React, { useEffect, useState } from "react";
import Sidebar from "../../layouts/sidebar";
import MobileTopBar from "../MobileTopBar";
import axios from "axios";
import { Star, Award, Search, Heart } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const API = `${import.meta.env.VITE_API_URL || "https://hrm-backend-vvqg.onrender.com"}/api/appreciations";

const typeColors = {
  general:          { bg: "#FFFBEB", color: "#F59E0B", label: "General", darkBg: "#451A03", darkColor: "#FCD34D" },
  performance:      { bg: "#EEF2FF", color: "#6366F1", label: "Performance", darkBg: "#1E1B4B", darkColor: "#818CF8" },
  teamwork:         { bg: "#ECFDF5", color: "#10B981", label: "Teamwork", darkBg: "#064E3B", darkColor: "#6EE7B7" },
  innovation:       { bg: "#EFF6FF", color: "#3B82F6", label: "Innovation", darkBg: "#1E1B4B", darkColor: "#60A5FA" },
  leadership:       { bg: "#F5F3FF", color: "#8B5CF6", label: "Leadership", darkBg: "#1E1B4B", darkColor: "#A78BFA" },
  customer_service: { bg: "#FDF2F8", color: "#EC4899", label: "Customer Service", darkBg: "#2D0F0F", darkColor: "#F87171" },
};

const getTypeStyle = (t, isDark) => {
  const style = typeColors[t] || typeColors.general;
  if (isDark) {
    return { bg: style.darkBg, color: style.darkColor, label: style.label };
  }
  return { bg: style.bg, color: style.color, label: style.label };
};

const EmployeeAppreciations = () => {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [appreciations, setAppreciations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  const token = localStorage.getItem("token");
  const name = localStorage.getItem("name") || "Employee";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const isMobile = window.innerWidth <= 768;
  const sidebarWidth = isMobile ? 0 : (isOpen ? 255 : 68);

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
    rowHover: isDark ? "#1E2535" : "#F5F7FF",
    headerIconBg: isDark ? "#1E1B4B" : "#FEF3C7",
    headerIconColor: isDark ? "#FCD34D" : "#D97706",
    toastSuccessBg: isDark ? "#064E3B" : "#ECFDF5",
    toastSuccessText: isDark ? "#6EE7B7" : "#059669",
    toastErrorBg: isDark ? "#2D0F0F" : "#FEF2F2",
    toastErrorText: isDark ? "#F87171" : "#DC2626",
    heartColor: "#F87171",
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadAppreciations = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/my`, {
        headers: { "x-auth-token": token },
      });
      const raw = res.data?.data || [];
      setAppreciations(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error("Appreciations load error:", err);
      showToast("Failed to load appreciations", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppreciations();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filtered = appreciations.filter((a) => {
    const text = `${a.title || ""} ${a.message || ""} ${a.employee_name || ""} ${a.appreciation_type || ""}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      backgroundColor: t.bg,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        @keyframes spin    { to { transform:rotate(360deg); } }
        @keyframes pulse   { 0%,100%{ transform:scale(1); } 50%{ transform:scale(1.12); } }
        .appr-search:focus { border-color:#4F46E5 !important; box-shadow:0 0 0 3px rgba(79,70,229,.10); }
        .appr-card { transition: box-shadow 0.2s, transform 0.2s; }
        .appr-card:hover { box-shadow: 0 6px 24px rgba(79,70,229,0.10); transform: translateY(-2px); }
        .heart { animation: pulse 2.4s ease-in-out infinite; display:inline-block; }
        * { box-sizing:border-box; }
        @media (max-width: 768px) {
          .appr-main { padding: 76px 14px 32px !important; }
          .appr-header-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
          .appr-search-wrap { width: 100% !important; }
          .appr-search-wrap input { width: 100% !important; min-width: unset !important; }
          .appr-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
          .appr-header-inner { padding: 14px !important; }
          .appr-content-inner { padding: 14px !important; }
          .appr-page-title { font-size: 1.5rem !important; }
          .appr-topbar { display: none !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .appr-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .appr-main { padding: 28px 18px 40px !important; }
        }
      `}</style>

      {toast && (
        <div style={{
          position: "fixed", top: "20px", right: "20px", zIndex: 9999,
          padding: "12px 20px", borderRadius: "10px",
          backgroundColor: toast.type === "error" ? t.toastErrorBg : t.toastSuccessBg,
          color: toast.type === "error" ? t.toastErrorText : t.toastSuccessText,
          border: `1px solid ${toast.type === "error" ? "#FECACA" : "#A7F3D0"}`,
          fontWeight: "500", fontSize: "0.875rem",
          animation: "slideIn 0.3s ease both",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          maxWidth: "calc(100vw - 40px)",
        }}>
          {toast.message}
        </div>
      )}

      <MobileTopBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div
        className="appr-main"
        style={{
          marginLeft: `${sidebarWidth}px`,
          flex: 1,
          transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
          padding: "28px 28px 40px",
          minWidth: 0,
        }}
      >
        <div className="appr-topbar" style={{ marginBottom: "28px", animation: "fadeUp 0.4s ease both 0.05s" }}>
          <p style={{ color: t.textSecondary, fontSize: "0.875rem", margin: "0 0 4px" }}>{greeting}, <strong style={{ color: "#4F46E5" }}>{name}</strong> 👋</p>
          <p style={{ color: t.textSecondary, fontSize: "0.875rem", margin: "0 0 4px" }}>Recognition</p>
          <h1 className="appr-page-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.5rem, 4vw, 1.85rem)", fontWeight: "700", color: t.textPrimary, margin: 0, lineHeight: 1.2 }}>
            My Appreciations
          </h1>
          <p style={{ color: t.textMuted, fontSize: "0.85rem", margin: "5px 0 0" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div style={{
          backgroundColor: t.card, borderRadius: "14px",
          border: `1px solid ${t.border}`,
          boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.05)",
          overflow: "hidden", animation: "fadeUp 0.4s ease both 0.1s",
        }}>
          <div
            className="appr-header-row appr-header-inner"
            style={{
              padding: "18px 24px", borderBottom: `1px solid ${t.border}`,
              display: "flex", alignItems: "center",
              justifyContent: "space-between", flexWrap: "wrap", gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "9px",
                backgroundColor: t.headerIconBg, display: "flex",
                alignItems: "center", justifyContent: "center", color: t.headerIconColor,
                flexShrink: 0,
              }}>
                <Award size={17} />
              </div>
              <div>
                <h2 style={{ fontSize: "1rem", fontWeight: "600", color: t.textPrimary, margin: 0 }}>
                  Wall of Recognition
                </h2>
                <p style={{ fontSize: "0.78rem", color: t.textMuted, margin: 0 }}>
                  {appreciations.length} appreciation{appreciations.length !== 1 ? "s" : ""} received
                </p>
              </div>
            </div>

            <div className="appr-search-wrap" style={{ position: "relative" }}>
              <Search size={14} style={{
                position: "absolute", left: "12px", top: "50%",
                transform: "translateY(-50%)", color: t.textMuted, pointerEvents: "none",
              }} />
              <input
                className="appr-search"
                placeholder="Search appreciations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  padding: "9px 14px 9px 38px",
                  border: `1.5px solid ${t.inputBorder}`, borderRadius: "9px",
                  fontSize: "0.875rem", color: t.textPrimary,
                  backgroundColor: t.inputBg,
                  fontFamily: "'DM Sans', sans-serif",
                  outline: "none", width: "260px",
                  transition: "border-color 0.18s, box-shadow 0.18s",
                }}
              />
            </div>
          </div>
          <div className="appr-content-inner" style={{ padding: "24px" }}>
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "240px" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    width: "40px", height: "40px",
                    border: `3px solid ${t.inputBorder}`, borderTop: `3px solid ${t.headerIconColor}`,
                    borderRadius: "50%", animation: "spin 0.8s linear infinite",
                    margin: "0 auto 14px",
                  }} />
                  <p style={{ color: t.textMuted, fontWeight: "500", fontSize: "0.875rem" }}>
                    Loading appreciations...
                  </p>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: "40px 24px", textAlign: "center" }}>
                <Heart size={40} style={{ color: t.textMuted, marginBottom: "12px" }} />
                <p style={{ color: t.textMuted, fontSize: "0.9rem", margin: 0 }}>
                  {search ? "No appreciations match your search." : "No appreciations have been received yet."}
                </p>
              </div>
            ) : (
              <div
                className="appr-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "16px",
                }}
              >
                {filtered.map((item, i) => {
                  const cs = getTypeStyle(item.appreciation_type, isDark);
                  return (
                    <div
                      key={item._id}
                      className="appr-card"
                      style={{
                        backgroundColor: t.card, border: `1px solid ${t.border}`,
                        borderRadius: "12px", padding: "20px",
                        boxShadow: isDark ? "0 1px 4px rgba(0,0,0,0.3)" : "0 1px 4px rgba(15,23,42,0.05)",
                        animation: `fadeUp 0.4s ease both ${0.05 + i * 0.04}s`,
                        display: "flex", flexDirection: "column", gap: "12px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                          <div style={{
                            width: "36px", height: "36px", borderRadius: "50%",
                            backgroundColor: cs.bg,
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                          }}>
                            <Star size={15} style={{ color: cs.color }} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{
                              margin: 0, fontWeight: "600", fontSize: "0.875rem", color: t.textPrimary,
                              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                            }}>
                              {item.title || "Recognition"}
                            </p>
                            <span style={{
                              fontSize: "0.7rem", fontWeight: "600",
                              padding: "2px 8px", borderRadius: "20px",
                              backgroundColor: cs.bg, color: cs.color,
                              display: "inline-block",
                            }}>
                              {cs.label}
                            </span>
                          </div>
                        </div>
                        <span className="heart" style={{ flexShrink: 0 }}>
                          <Heart size={16} style={{ color: t.heartColor, marginTop: "2px" }} />
                        </span>
                      </div>

                      {item.message && (
                        <p style={{
                          margin: 0, fontSize: "0.855rem", color: t.textSecondary,
                          lineHeight: 1.6,
                          borderLeft: `3px solid ${cs.color}`,
                          paddingLeft: "10px", fontStyle: "italic",
                        }}>
                          {item.message}
                        </p>
                      )}

                      <div style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        paddingTop: "10px", borderTop: `1px solid ${t.border}`,
                        gap: "8px", flexWrap: "wrap",
                      }}>
                        <p style={{ margin: 0, fontSize: "0.78rem", color: t.textSecondary, fontWeight: "500" }}>
                          {item.employee_name || "—"}
                        </p>
                        <span style={{ fontSize: "0.72rem", color: t.textMuted, whiteSpace: "nowrap" }}>
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAppreciations;