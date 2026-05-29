import React, { useEffect, useState } from "react";
import Sidebar from "../../layouts/sidebar";
import MobileTopBar from "../MobileTopBar";
import axios from "axios";
import { Mail, FileText, Eye, Search, BadgeCheck, X, Download } from "lucide-react";

const API = "http://localhost:5001/api/letters";

const letterTypeLabel = {
  offer:      "Offer Letter",
  experience: "Experience Certificate",
  salary:     "Salary Slip",
  relieving:  "Relieving Letter",
  custom:     "Custom Letter",
};

const letterTypeColor = {
  offer:      { bg: "#EEF2FF", color: "#4F46E5" },
  experience: { bg: "#FEF3C7", color: "#D97706" },
  salary:     { bg: "#ECFDF5", color: "#059669" },
  relieving:  { bg: "#FEF2F2", color: "#DC2626" },
  custom:     { bg: "#F5F3FF", color: "#7C3AED" },
};

const EmployeeLetters = () => {
  const [isOpen, setIsOpen]           = useState(window.innerWidth > 768);
  const [letters, setLetters]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [preview, setPreview]         = useState(null);
  const [toast, setToast]             = useState(null);
  const [downloading, setDownloading] = useState(null);

  const token    = localStorage.getItem("token");
  const isMobile = window.innerWidth <= 768;
  const sidebarWidth = isMobile ? 0 : (isOpen ? 255 : 68);

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

  const getType   = (l) => l.letterType  || l.letter_type  || "";
  const getHtml   = (l) => l.htmlContent || l.html_content || "";
  const getSentAt = (l) => l.sent_at     || l.createdAt    || l.created_at;
  const getName   = (l) => l.employeeName || l.employee_name || "—";

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

      const url      = URL.createObjectURL(blob);
      const a        = document.createElement("a");
      const type     = getType(letter);
      const safeName = getName(letter).replace(/\s+/g, "_").toLowerCase();
      a.href         = url;
      a.download     = `${letterTypeLabel[type] || type}-${safeName}.pdf`.toLowerCase();
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
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F9FAFB", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        @keyframes spin    { to { transform:rotate(360deg); } }
        @keyframes toastIn { from { opacity:0; transform:translateY(-10px) scale(.96); } to { opacity:1; transform:translateY(0) scale(1); } }
        .letter-search:focus { border-color:#4F46E5 !important; box-shadow:0 0 0 3px rgba(79,70,229,.10); }
        .letter-row { transition: background 0.15s; }
        .letter-row:hover { background: #F5F7FF !important; }
        .icon-btn { border:none; cursor:pointer; transition:opacity 0.15s, transform 0.15s; }
        .icon-btn:hover:not(:disabled) { opacity:0.8; transform:scale(1.04); }
        .icon-btn:disabled { opacity:0.55; cursor:not-allowed; }
        * { box-sizing:border-box; }
        .modal-bg {
          position:fixed; inset:0;
          background:rgba(0,0,0,0.45);
          z-index:9998;
          display:flex; align-items:center; justify-content:center;
          padding:16px;
          animation:fadeUp 0.2s ease both;
        }
        .modal-box {
          background:#fff; border-radius:16px;
          width:min(760px, 100%);
          max-height:90vh;
          overflow:hidden;
          display:flex; flex-direction:column;
          box-shadow:0 20px 60px rgba(0,0,0,0.2);
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
            border: 1px solid #F1F3F9 !important;
            padding: 14px !important;
            background: #fff;
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
            color: #9CA3AF;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            min-width: 80px;
            flex-shrink: 0;
          }
          .letters-table td:first-child::before { content: none; }
          .modal-box { max-height: 95vh; border-radius: 12px; }
          .action-btns { flex-direction: column !important; }
        }
      `}</style>
      {toast && (
        <div style={{
          position: "fixed", top: "20px", right: "20px", zIndex: 9999,
          padding: "12px 20px", borderRadius: "10px",
          backgroundColor: toast.type === "error" ? "#FEF2F2" : "#ECFDF5",
          color: toast.type === "error" ? "#DC2626" : "#059669",
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
              padding: "16px 24px", borderBottom: "1px solid #F1F3F9",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: "600", color: "#111827" }}>
                  {getDisplayLabel(preview)}
                </h3>
                <p style={{ margin: 0, fontSize: "0.78rem", color: "#9CA3AF" }}>
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
                    backgroundColor: "#ECFDF5", color: "#059669",
                    fontSize: "0.8rem", fontWeight: "600",
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    border: "1.5px solid #A7F3D0",
                  }}
                >
                  {downloading === preview._id
                    ? (
                      <>
                        <div style={{
                          width: "13px", height: "13px",
                          border: "2px solid #A7F3D0",
                          borderTop: "2px solid #059669",
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
                    backgroundColor: "#F3F4F6", color: "#6B7280",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <div
              style={{ overflowY: "auto", padding: "28px 32px", flex: 1 }}
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
        <div style={{ marginBottom: "28px", animation: "fadeUp 0.4s ease both 0.05s" }}>
          <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "0 0 4px" }}>My Documents</p>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(1.5rem, 4vw, 1.85rem)",
            fontWeight: "700", color: "#111827", margin: 0, lineHeight: 1.2,
          }}>
            My Letters
          </h1>
          <p style={{ color: "#9CA3AF", fontSize: "0.85rem", margin: "5px 0 0" }}>
            All official letters and certificates issued to you.
          </p>
        </div>
        <div style={{
          backgroundColor: "#fff", borderRadius: "14px",
          border: "1px solid #F1F3F9",
          boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
          overflow: "hidden", animation: "fadeUp 0.4s ease both 0.1s",
        }}>
          <div
            className="letters-header-row"
            style={{
              padding: "18px 24px", borderBottom: "1px solid #F1F3F9",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexWrap: "wrap", gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "9px",
                backgroundColor: "#EEF2FF", display: "flex",
                alignItems: "center", justifyContent: "center", color: "#4F46E5",
              }}>
                <Mail size={17} />
              </div>
              <div>
                <h2 style={{ fontSize: "1rem", fontWeight: "600", color: "#111827", margin: 0 }}>
                  Issued Letters
                </h2>
                <p style={{ fontSize: "0.78rem", color: "#9CA3AF", margin: 0 }}>
                  {letters.length} letter{letters.length !== 1 ? "s" : ""} on record
                </p>
              </div>
            </div>
            <div className="letters-search-wrap" style={{ position: "relative" }}>
              <Search size={14} style={{
                position: "absolute", left: "12px", top: "50%",
                transform: "translateY(-50%)", color: "#9CA3AF", pointerEvents: "none",
              }} />
              <input
                className="letter-search"
                placeholder="Search letters..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  padding: "9px 14px 9px 38px", border: "1.5px solid #E5E7EB",
                  borderRadius: "9px", fontSize: "0.875rem", color: "#374151",
                  backgroundColor: "#F9FAFB", fontFamily: "'DM Sans', sans-serif",
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
                  border: "3px solid #E5E7EB", borderTop: "3px solid #4F46E5",
                  borderRadius: "50%", animation: "spin 0.8s linear infinite",
                  margin: "0 auto 14px",
                }} />
                <p style={{ color: "#6B7280", fontWeight: "500", fontSize: "0.875rem" }}>
                  Loading letters...
                </p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "60px 24px", textAlign: "center" }}>
              <Mail size={40} style={{ color: "#E5E7EB", marginBottom: "12px" }} />
              <p style={{ color: "#9CA3AF", fontSize: "0.9rem", margin: 0 }}>
                {search ? "No letters match your search." : "No letters have been issued to you yet."}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="letters-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F9FAFB" }}>
                    {["Letter Type", "Recipient", "Issued On", "Status", "Actions"].map((h) => (
                      <th key={h} style={{
                        padding: "11px 20px", textAlign: "left",
                        fontSize: "0.72rem", fontWeight: "600", color: "#6B7280",
                        textTransform: "uppercase", letterSpacing: "0.5px",
                        borderBottom: "1px solid #F1F3F9", whiteSpace: "nowrap",
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((letter, i) => {
                    const type       = getType(letter);
                    const typeStyle  = letterTypeColor[type] || { bg: "#F3F4F6", color: "#6B7280" };
                    const isThisDown = downloading === letter._id;

                    return (
                      <tr
                        key={letter._id}
                        className="letter-row"
                        style={{
                          backgroundColor: i % 2 === 0 ? "#fff" : "#FAFAFA",
                          borderBottom: "1px solid #F1F3F9",
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
                            <span style={{ fontWeight: "500", color: "#111827", fontSize: "0.875rem" }}>
                              {getDisplayLabel(letter)}
                            </span>
                          </div>
                        </td>
                        <td data-label="Recipient" style={{ padding: "14px 20px" }}>
                          <p style={{ margin: 0, fontWeight: "500", fontSize: "0.875rem", color: "#111827" }}>
                            {getName(letter)}
                          </p>
                        </td>
                        <td data-label="Issued On" style={{ padding: "14px 20px", color: "#6B7280", fontSize: "0.85rem" }}>
                          {formatDate(getSentAt(letter))}
                        </td>
                        <td data-label="Status" style={{ padding: "14px 20px" }}>
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: "5px",
                            padding: "3px 10px", borderRadius: "20px",
                            fontSize: "0.75rem", fontWeight: "600",
                            backgroundColor: "#ECFDF5", color: "#059669",
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
                                backgroundColor: "#EEF2FF", color: "#4F46E5",
                                fontSize: "0.78rem", fontWeight: "600",
                                display: "inline-flex", alignItems: "center", gap: "5px",
                                border: "1.5px solid #C7D2FE",
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
                                backgroundColor: isThisDown ? "#F0FDF4" : "#ECFDF5",
                                color: "#059669",
                                fontSize: "0.78rem", fontWeight: "600",
                                display: "inline-flex", alignItems: "center", gap: "5px",
                                border: "1.5px solid #A7F3D0",
                              }}
                            >
                              {isThisDown ? (
                                <>
                                  <div style={{
                                    width: "12px", height: "12px",
                                    border: "2px solid #A7F3D0",
                                    borderTop: "2px solid #059669",
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
              padding: "11px 24px", borderTop: "1px solid #F1F3F9",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>
                Showing {filtered.length} of {letters.length} letters
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#9CA3AF", fontSize: "0.72rem" }}>
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