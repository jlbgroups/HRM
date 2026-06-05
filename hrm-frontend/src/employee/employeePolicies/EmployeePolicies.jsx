import React, { useEffect, useState } from "react";
import Sidebar from "../../layouts/sidebar";
import MobileTopBar from "../MobileTopBar";
import axios from "axios";
import { ShieldCheck, FileText, Download, Eye, Search, Bell } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const API = "https://hrm-backend-vvqg.onrender.com/api/policies";
const BASE_URL = "https://hrm-backend-vvqg.onrender.com";

const EmployeePolicies = () => {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [policies, setPolicies] = useState([]);
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
    tableHead: isDark ? "#111827" : "#F9FAFB",
    headerIconBg: isDark ? "#1E1B4B" : "#EEF2FF",
    headerIconColor: isDark ? "#818CF8" : "#4F46E5",
    fileIconBg: isDark ? "#451A03" : "#FEF3C7",
    fileIconColor: isDark ? "#FCD34D" : "#D97706",
    viewBtnBg: isDark ? "#1E1B4B" : "#EEF2FF",
    viewBtnColor: isDark ? "#818CF8" : "#4F46E5",
    downloadBtnBg: isDark ? "#064E3B" : "#ECFDF5",
    downloadBtnColor: isDark ? "#6EE7B7" : "#059669",
    toastSuccessBg: isDark ? "#064E3B" : "#ECFDF5",
    toastSuccessText: isDark ? "#6EE7B7" : "#059669",
    toastErrorBg: isDark ? "#2D0F0F" : "#FEF2F2",
    toastErrorText: isDark ? "#F87171" : "#DC2626",
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API, { headers: { "x-auth-token": token } });
      setPolicies(res.data || []);
    } catch (err) {
      console.error("Policies load error:", err);
      showToast("Failed to load policies", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPolicies(); }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      if (!mobile && !isOpen) setIsOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  const filtered = policies.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: t.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        @keyframes spin    { to { transform:rotate(360deg); } }
        .policy-search:focus { border-color:#4F46E5 !important; box-shadow:0 0 0 3px rgba(79,70,229,.10); }
        .policy-row { transition: background 0.15s; }
        .policy-row:hover { background: ${t.rowHover} !important; }
        .icon-btn { border:none; cursor:pointer; transition: opacity 0.15s, transform 0.15s; background: transparent; }
        .icon-btn:hover { opacity:0.75; transform:scale(1.08); }
        .topbar-btn:hover { background: ${isDark ? "#1E2535" : "#F3F4F6"} !important; }
        * { box-sizing:border-box; }

        @media (max-width: 768px) {
          .policies-main { padding: 76px 16px 32px !important; }
          .policies-header-row { flex-direction: column !important; align-items: flex-start !important; }
          .policies-search-wrap { width: 100% !important; }
          .policies-search-wrap input { width: 100% !important; }
          .policies-table thead { display: none; }
          .policies-table, .policies-table tbody, .policies-table tr, .policies-table td { display: block; }
          .policies-table tr {
            margin-bottom: 12px;
            border-radius: 10px;
            border: 1px solid ${t.border} !important;
            padding: 14px !important;
            background: ${t.card};
          }
          .policies-table td {
            padding: 5px 0 !important;
            border: none !important;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .policies-table td::before {
            content: attr(data-label);
            font-size: 0.72rem;
            font-weight: 600;
            color: ${t.textMuted};
            text-transform: uppercase;
            letter-spacing: 0.4px;
            min-width: 90px;
            flex-shrink: 0;
          }
          .policies-table td:first-child::before { content: none; }
          .policies-table td:last-child { flex-wrap: wrap; }
          .pol-topbar { display: none !important; }
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
        }}>
          {toast.message}
        </div>
      )}

      <MobileTopBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div
        className="policies-main"
        style={{ marginLeft: `${sidebarWidth}px`, flex: 1, transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)", padding: "28px 28px 40px" }}
      >
        <div className="pol-topbar" style={{ marginBottom: "28px", animation: "fadeUp 0.4s ease both 0.05s" }}>
          <p style={{ color: t.textSecondary, fontSize: "0.875rem", margin: "0 0 4px" }}>{greeting}, <strong style={{ color: "#4F46E5" }}>{name}</strong> 👋</p>
          <p style={{ color: t.textSecondary, fontSize: "0.875rem", margin: "0 0 4px" }}>Company Documents</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.5rem, 4vw, 1.85rem)", fontWeight: "700", color: t.textPrimary, margin: 0, lineHeight: 1.2 }}>
            Policies
          </h1>
          <p style={{ color: t.textMuted, fontSize: "0.85rem", margin: "5px 0 0" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        <div style={{ backgroundColor: t.card, borderRadius: "14px", border: `1px solid ${t.border}`, boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.05)", overflow: "hidden", animation: "fadeUp 0.4s ease both 0.1s" }}>
          <div
            className="policies-header-row"
            style={{ padding: "18px 24px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "9px", backgroundColor: t.headerIconBg, display: "flex", alignItems: "center", justifyContent: "center", color: t.headerIconColor }}>
                <ShieldCheck size={17} />
              </div>
              <div>
                <h2 style={{ fontSize: "1rem", fontWeight: "600", color: t.textPrimary, margin: 0 }}>Company Policies</h2>
                <p style={{ fontSize: "0.78rem", color: t.textMuted, margin: 0 }}>
                  {policies.length} document{policies.length !== 1 ? "s" : ""} available
                </p>
              </div>
            </div>
            <div className="policies-search-wrap" style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: t.textMuted, pointerEvents: "none" }} />
              <input
                className="policy-search"
                placeholder="Search policies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ padding: "9px 14px 9px 38px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "9px", fontSize: "0.875rem", color: t.textPrimary, backgroundColor: t.inputBg, fontFamily: "'DM Sans', sans-serif", outline: "none", width: "260px", transition: "border-color 0.18s, box-shadow 0.18s" }}
              />
            </div>
          </div>

          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "260px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: "40px", height: "40px", border: `3px solid ${t.inputBorder}`, borderTop: `3px solid ${t.headerIconColor}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
                <p style={{ color: t.textMuted, fontWeight: "500", fontSize: "0.875rem" }}>Loading policies...</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "60px 24px", textAlign: "center" }}>
              <ShieldCheck size={40} style={{ color: t.textMuted, marginBottom: "12px" }} />
              <p style={{ color: t.textMuted, fontSize: "0.9rem", margin: 0 }}>
                {search ? "No policies match your search." : "No policies have been shared yet."}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="policies-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: t.tableHead }}>
                    {["Policy Title", "Uploaded On", "Actions"].map((h) => (
                      <th key={h} style={{ padding: "11px 20px", textAlign: "left", fontSize: "0.72rem", fontWeight: "600", color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: `1px solid ${t.border}` }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((policy, i) => (
                    <tr key={policy._id} className="policy-row" style={{ backgroundColor: i % 2 === 0 ? t.card : t.inputBg, borderBottom: `1px solid ${t.border}` }}>
                      <td data-label="" style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: t.fileIconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <FileText size={14} style={{ color: t.fileIconColor }} />
                          </div>
                          <span style={{ fontWeight: "500", color: t.textPrimary, fontSize: "0.875rem" }}>
                            {policy.title}
                          </span>
                        </div>
                      </td>
                      <td data-label="Uploaded" style={{ padding: "14px 20px", color: t.textMuted, fontSize: "0.85rem" }}>
                        {formatDate(policy.createdAt)}
                      </td>
                      <td data-label="Actions" style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          <button
                            className="icon-btn"
                            title="View"
                            onClick={() => window.open(`${BASE_URL}/api/policies/view/${policy.file}`, "_blank")}
                            style={{ padding: "6px 12px", borderRadius: "7px", backgroundColor: t.viewBtnBg, color: t.viewBtnColor, fontSize: "0.78rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "5px" }}
                          >
                            <Eye size={13} /> View
                          </button>
                          <a
                            href={`${BASE_URL}/api/policies/view/${policy.file}`}
                            download
                            style={{ padding: "6px 12px", borderRadius: "7px", backgroundColor: t.downloadBtnBg, color: t.downloadBtnColor, fontSize: "0.78rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "5px", textDecoration: "none", transition: "opacity 0.15s" }}
                          >
                            <Download size={13} /> Download
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeePolicies;