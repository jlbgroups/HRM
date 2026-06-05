import React, { useEffect, useState } from "react";
import Sidebar from "../../layouts/sidebar";
import MobileTopBar from "../MobileTopBar";
import axios from "axios";
import { Mail, FileText, Eye, Search, BadgeCheck, X, Download, Bell } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const API = "https://hrm-backend-vvqg.onrender.com/api/letters";

const letterTypeLabel = {
  offer:      "Offer Letter",
  experience: "Experience Certificate",
  salary:     "Salary Slip",
  relieving:  "Relieving Letter",
  custom:     "Custom Letter",
};

const letterTypeColor = {
  offer:      { bg: "#EEF2FF", color: "#4F46E5", darkBg: "#1E1B4B", darkColor: "#818CF8" },
  experience: { bg: "#FEF3C7", color: "#D97706", darkBg: "#451A03", darkColor: "#FCD34D" },
  salary:     { bg: "#ECFDF5", color: "#059669", darkBg: "#064E3B", darkColor: "#6EE7B7" },
  relieving:  { bg: "#FEF2F2", color: "#DC2626", darkBg: "#2D0F0F", darkColor: "#F87171" },
  custom:     { bg: "#F5F3FF", color: "#7C3AED", darkBg: "#1E1B4B", darkColor: "#A78BFA" },
};

const getTypeStyle = (type, isDark) => {
  const style = letterTypeColor[type] || letterTypeColor.custom;
  if (isDark) {
    return { bg: style.darkBg, color: style.darkColor };
  }
  return { bg: style.bg, color: style.color };
};

const EmployeeLetters = () => {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState(null);
  const [toast, setToast] = useState(null);
  const [downloading, setDownloading] = useState(null);

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
    statusBg: isDark ? "#064E3B" : "#ECFDF5",
    statusColor: isDark ? "#6EE7B7" : "#059669",
    viewBtnBg: isDark ? "#1E1B4B" : "#EEF2FF",
    viewBtnColor: isDark ? "#818CF8" : "#4F46E5",
    downloadBtnBg: isDark ? "#064E3B" : "#ECFDF5",
    downloadBtnColor: isDark ? "#6EE7B7" : "#059669",
    modalBg: isDark ? "#161B27" : "#fff",
    modalOverlay: isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.45)",
    toastSuccessBg: isDark ? "#064E3B" : "#ECFDF5",
    toastSuccessText: isDark ? "#6EE7B7" : "#059669",
    toastErrorBg: isDark ? "#2D0F0F" : "#FEF2F2",
    toastErrorText: isDark ? "#F87171" : "#DC2626",
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadLetters = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/my-letters`, {
        headers: { "x-auth-token": token },
      });
      setLetters(res.data?.data || []);
    } catch (err) {
      console.error("Letters load error:", err);
      showToast("Failed to load letters", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLetters(); }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      if (!mobile && !isOpen) setIsOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  const getType = (l) => l.letterType || l.letter_type || "";
  const getHtml = (l) => l.htmlContent || l.html_content || "";
  const getSentAt = (l) => l.sent_at || l.createdAt || l.created_at;
  const getName = (l) => l.employeeName || l.employee_name || "—";

  const getDisplayLabel = (letter) => {
    const type = getType(letter);
    if (type === "custom" && letter.customTitle) return letter.customTitle;
    return letterTypeLabel[type] || type || "—";
  };

  const filtered = letters.filter((l) => {
    const label = getDisplayLabel(l);
    return label.toLowerCase().includes(search.toLowerCase());
  });

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  const handleDownload = async (letter) => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) {
      showToast("You are not authenticated. Please log in again.", "error");
      return;
    }

    try {
      setDownloading(letter._id);

      const res = await fetch(`${API}/download/${letter._id}`, {
        headers: { "x-auth-token": currentToken },
      });
      if (!res.ok) {
        const contentType = res.headers.get("content-type") || "";
        let errMessage = `Download failed (${res.status})`;
        if (contentType.includes("application/json")) {
          const errJson = await res.json().catch(() => ({}));
          errMessage = errJson.message || errMessage;
        } else {
          const errText = await res.text().catch(() => "");
          if (errText) errMessage = errText.slice(0, 120);
        }
        showToast(errMessage, "error");
        return;
      }

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/pdf")) {
        const errJson = await res.json().catch(() => ({}));
        showToast(errJson.message || "Unexpected response from server", "error");
        return;
      }

      const blob = await res.blob();
      if (blob.size === 0) {
        showToast("Received an empty file. Please try again.", "error");
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const type = getType(letter);
      const safeName = getName(letter).replace(/\s+/g, "_").toLowerCase();
      a.href = url;
      a.download = `${letterTypeLabel[type] || type}-${safeName}.pdf`.toLowerCase();
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast("Letter downloaded successfully!");
    } catch (err) {
      console.error("Download error:", err);
      if (err instanceof TypeError && err.message.includes("fetch")) {
        showToast("Network error — please check your connection.", "error");
      } else {
        showToast("Download failed: " + err.message, "error");
      }
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: t.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        @keyframes spin    { to { transform:rotate(360deg); } }
        @keyframes toastIn { from { opacity:0; transform:translateY(-10px) scale(.96); } to { opacity:1; transform:translateY(0) scale(1); } }
        .letter-search:focus { border-color:#4F46E5 !important; box-shadow:0 0 0 3px rgba(79,70,229,.10); }
        .letter-row { transition: background 0.15s; }
        .letter-row:hover { background: ${t.rowHover} !important; }
        .icon-btn { border:none; cursor:pointer; transition:opacity 0.15s, transform 0.15s; }
        .icon-btn:hover:not(:disabled) { opacity:0.8; transform:scale(1.04); }
        .icon-btn:disabled { opacity:0.55; cursor:not-allowed; }
        .topbar-btn:hover { background: ${isDark ? "#1E2535" : "#F3F4F6"} !important; }
        * { box-sizing:border-box; }
        .modal-bg {
          position:fixed; inset:0;
          background:${t.modalOverlay};
          z-index:9998;
          display:flex; align-items:center; justify-content:center;
          padding:16px;
          animation:fadeUp 0.2s ease both;
        }
        .modal-box {
          background:${t.modalBg}; border-radius:16px;
          width:min(760px, 100%);
          max-height:90vh;
          overflow:hidden;
          display:flex; flex-direction:column;
          box-shadow:0 20px 60px rgba(0,0,0,0.2);
          border:1px solid ${t.border};
        }
        @media (max-width: 768px) {
          .letters-main { padding: 76px 16px 32px !important; }
          .letters-header-row { flex-direction: column !important; align-items: flex-start !important; }
          .letters-search-wrap { width: 100% !important; }
          .letters-search-wrap input { width: 100% !important; }
          .letters-table thead { display: none; }
          .letters-table, .letters-table tbody, .letters-table tr, .letters-table td { display: block; }
          .letters-table tr {
            margin-bottom: 12px;
            border-radius: 10px;
            border: 1px solid ${t.border} !important;
            padding: 14px !important;
            background: ${t.card};
          }
          .letters-table td {
            padding: 6px 0 !important;
            border: none !important;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.875rem;
          }
          .letters-table td::before {
            content: attr(data-label);
            font-size: 0.72rem;
            font-weight: 600;
            color: ${t.textMuted};
            text-transform: uppercase;
            letter-spacing: 0.4px;
            min-width: 80px;
            flex-shrink: 0;
          }
          .letters-table td:first-child::before { content: none; }
          .modal-box { max-height: 95vh; border-radius: 12px; }
          .action-btns { flex-direction: column !important; }
          .let-topbar { display: none !important; }
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
          animation: "toastIn 0.25s ease both",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          display: "flex", alignItems: "center", gap: "8px",
          maxWidth: "360px",
        }}>
          {toast.type === "error" ? <X size={15}/> : <BadgeCheck size={15}/>}
          {toast.message}
        </div>
      )}

      {preview && (
        <div className="modal-bg" onClick={() => setPreview(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{
              padding: "16px 24px", borderBottom: `1px solid ${t.border}`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: "600", color: t.textPrimary }}>
                  {getDisplayLabel(preview)}
                </h3>
                <p style={{ margin: 0, fontSize: "0.78rem", color: t.textMuted }}>
                  Issued on {formatDate(getSentAt(preview))}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  className="icon-btn"
                  disabled={downloading === preview._id}
                  onClick={() => handleDownload(preview)}
                  style={{
                    padding: "7px 16px", borderRadius: "8px",
                    backgroundColor: t.downloadBtnBg, color: t.downloadBtnColor,
                    fontSize: "0.8rem", fontWeight: "600",
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    border: `1.5px solid ${t.border}`,
                  }}
                >
                  {downloading === preview._id
                    ? (
                      <>
                        <div style={{
                          width: "13px", height: "13px",
                          border: `2px solid ${t.border}`,
                          borderTop: `2px solid ${t.downloadBtnColor}`,
                          borderRadius: "50%",
                          animation: "spin .7s linear infinite",
                        }}/>
                        Generating…
                      </>
                    ) : (
                      <><Download size={13}/> Download PDF</>
                    )
                  }
                </button>
                <button
                  className="icon-btn"
                  onClick={() => setPreview(null)}
                  style={{
                    width: "32px", height: "32px", borderRadius: "8px",
                    backgroundColor: t.inputBg, color: t.textMuted,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <div
              style={{ overflowY: "auto", padding: "28px 32px", flex: 1, background: isDark ? "#fff" : "#fff" }}
              dangerouslySetInnerHTML={{ __html: getHtml(preview) }}
            />
          </div>
        </div>
      )}

      <MobileTopBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div
        className="letters-main"
        style={{
          marginLeft: `${sidebarWidth}px`,
          flex: 1,
          transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
          padding: "28px 28px 40px",
        }}
      >
        <div className="let-topbar" style={{ marginBottom: "28px", animation: "fadeUp 0.4s ease both 0.05s" }}>
          <p style={{ color: t.textSecondary, fontSize: "0.875rem", margin: "0 0 4px" }}>{greeting}, <strong style={{ color: "#4F46E5" }}>{name}</strong> 👋</p>
          <p style={{ color: t.textSecondary, fontSize: "0.875rem", margin: "0 0 4px" }}>My Documents</p>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(1.5rem, 4vw, 1.85rem)",
            fontWeight: "700", color: t.textPrimary, margin: 0, lineHeight: 1.2,
          }}>
            My Letters
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
            className="letters-header-row"
            style={{
              padding: "18px 24px", borderBottom: `1px solid ${t.border}`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexWrap: "wrap", gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "9px",
                backgroundColor: t.headerIconBg, display: "flex",
                alignItems: "center", justifyContent: "center", color: t.headerIconColor,
              }}>
                <Mail size={17} />
              </div>
              <div>
                <h2 style={{ fontSize: "1rem", fontWeight: "600", color: t.textPrimary, margin: 0 }}>
                  Issued Letters
                </h2>
                <p style={{ fontSize: "0.78rem", color: t.textMuted, margin: 0 }}>
                  {letters.length} letter{letters.length !== 1 ? "s" : ""} on record
                </p>
              </div>
            </div>
            <div className="letters-search-wrap" style={{ position: "relative" }}>
              <Search size={14} style={{
                position: "absolute", left: "12px", top: "50%",
                transform: "translateY(-50%)", color: t.textMuted, pointerEvents: "none",
              }} />
              <input
                className="letter-search"
                placeholder="Search letters..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  padding: "9px 14px 9px 38px", border: `1.5px solid ${t.inputBorder}`,
                  borderRadius: "9px", fontSize: "0.875rem", color: t.textPrimary,
                  backgroundColor: t.inputBg, fontFamily: "'DM Sans', sans-serif",
                  outline: "none", width: "260px",
                  transition: "border-color 0.18s, box-shadow 0.18s",
                }}
              />
            </div>
          </div>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "260px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: "40px", height: "40px",
                  border: `3px solid ${t.inputBorder}`, borderTop: `3px solid ${t.headerIconColor}`,
                  borderRadius: "50%", animation: "spin 0.8s linear infinite",
                  margin: "0 auto 14px",
                }} />
                <p style={{ color: t.textMuted, fontWeight: "500", fontSize: "0.875rem" }}>
                  Loading letters...
                </p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "60px 24px", textAlign: "center" }}>
              <Mail size={40} style={{ color: t.textMuted, marginBottom: "12px" }} />
              <p style={{ color: t.textMuted, fontSize: "0.9rem", margin: 0 }}>
                {search ? "No letters match your search." : "No letters have been issued to you yet."}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="letters-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: t.tableHead }}>
                    {["Letter Type", "Recipient", "Issued On", "Status", "Actions"].map((h) => (
                      <th key={h} style={{
                        padding: "11px 20px", textAlign: "left",
                        fontSize: "0.72rem", fontWeight: "600", color: t.textMuted,
                        textTransform: "uppercase", letterSpacing: "0.5px",
                        borderBottom: `1px solid ${t.border}`, whiteSpace: "nowrap",
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((letter, i) => {
                    const type = getType(letter);
                    const typeStyle = getTypeStyle(type, isDark);
                    const isThisDown = downloading === letter._id;

                    return (
                      <tr
                        key={letter._id}
                        className="letter-row"
                        style={{
                          backgroundColor: i % 2 === 0 ? t.card : t.inputBg,
                          borderBottom: `1px solid ${t.border}`,
                        }}
                      >
                        <td data-label="" style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{
                              width: "32px", height: "32px", borderRadius: "8px",
                              backgroundColor: typeStyle.bg,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              flexShrink: 0,
                            }}>
                              <FileText size={14} style={{ color: typeStyle.color }} />
                            </div>
                            <span style={{ fontWeight: "500", color: t.textPrimary, fontSize: "0.875rem" }}>
                              {getDisplayLabel(letter)}
                            </span>
                          </div>
                        </td>
                        <td data-label="Recipient" style={{ padding: "14px 20px" }}>
                          <p style={{ margin: 0, fontWeight: "500", fontSize: "0.875rem", color: t.textPrimary }}>
                            {getName(letter)}
                          </p>
                        </td>
                        <td data-label="Issued On" style={{ padding: "14px 20px", color: t.textMuted, fontSize: "0.85rem" }}>
                          {formatDate(getSentAt(letter))}
                        </td>
                        <td data-label="Status" style={{ padding: "14px 20px" }}>
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: "5px",
                            padding: "3px 10px", borderRadius: "20px",
                            fontSize: "0.75rem", fontWeight: "600",
                            backgroundColor: t.statusBg, color: t.statusColor,
                          }}>
                            <BadgeCheck size={12} /> Sent
                          </span>
                        </td>
                        <td data-label="Actions" style={{ padding: "14px 20px" }}>
                          <div
                            className="action-btns"
                            style={{ display: "flex", alignItems: "center", gap: "8px" }}
                          >
                            <button
                              className="icon-btn"
                              onClick={() => setPreview(letter)}
                              style={{
                                padding: "6px 14px", borderRadius: "7px",
                                backgroundColor: t.viewBtnBg, color: t.viewBtnColor,
                                fontSize: "0.78rem", fontWeight: "600",
                                display: "inline-flex", alignItems: "center", gap: "5px",
                                border: `1.5px solid ${t.border}`,
                              }}
                            >
                              <Eye size={13} /> View
                            </button>
                            <button
                              className="icon-btn"
                              disabled={isThisDown}
                              onClick={() => handleDownload(letter)}
                              style={{
                                padding: "6px 14px", borderRadius: "7px",
                                backgroundColor: isThisDown ? t.inputBg : t.downloadBtnBg,
                                color: t.downloadBtnColor,
                                fontSize: "0.78rem", fontWeight: "600",
                                display: "inline-flex", alignItems: "center", gap: "5px",
                                border: `1.5px solid ${t.border}`,
                              }}
                            >
                              {isThisDown ? (
                                <>
                                  <div style={{
                                    width: "12px", height: "12px",
                                    border: `2px solid ${t.border}`,
                                    borderTop: `2px solid ${t.downloadBtnColor}`,
                                    borderRadius: "50%",
                                    animation: "spin .7s linear infinite",
                                  }} />
                                  Generating…
                                </>
                              ) : (
                                <><Download size={13}/> PDF</>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {!loading && filtered.length > 0 && (
            <div style={{
              padding: "11px 24px", borderTop: `1px solid ${t.border}`,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ fontSize: "0.75rem", color: t.textMuted }}>
                Showing {filtered.length} of {letters.length} letters
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "5px", color: t.textMuted, fontSize: "0.72rem" }}>
                <BadgeCheck size={11}/> Up to date
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeLetters;