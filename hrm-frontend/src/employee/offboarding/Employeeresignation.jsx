import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../layouts/sidebar";
import MobileTopBar from "../MobileTopBar";
import { useTheme } from "../../context/ThemeContext";

const API = import.meta.env.VITE_API_URL || "https://hrm-backend-vvqg.onrender.com/api";

const statusConfig = {
  pending: { bg: "#FFFBEB", text: "#D97706", label: "Pending Review", darkBg: "#451A03", darkText: "#FCD34D" },
  approved: { bg: "#ECFDF5", text: "#059669", label: "Approved", darkBg: "#064E3B", darkText: "#6EE7B7" },
  rejected: { bg: "#FEF2F2", text: "#DC2626", label: "Rejected", darkBg: "#2D0F0F", darkText: "#F87171" },
  withdrawn: { bg: "#F3F4F6", text: "#6B7280", label: "Withdrawn", darkBg: "#1E2535", darkText: "#9CA3AF" },
};

export default function EmployeeResignation() {
  const { isDark } = useTheme();
  const [resignations, setResignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    last_working_day: "",
    reason: "",
    notice_date: new Date().toISOString().split("T")[0],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
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
    pendingAlertBg: isDark ? "#451A03" : "#FFFBEB",
    pendingAlertBorder: isDark ? "#FCD34D" : "#FCD34D",
    pendingAlertText: isDark ? "#FCD34D" : "#D97706",
    adminNoteBg: isDark ? "#1E2535" : "#F9FAFB",
    adminNoteBorder: isDark ? "#4F46E5" : "#4F46E5",
    modalBg: isDark ? "#161B27" : "#fff",
    modalBorder: isDark ? "#1E2535" : "#F1F3F9",
    modalOverlay: isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.45)",
    buttonPrimary: "#4F46E5",
    buttonWithdrawBg: isDark ? "#2D0F0F" : "#FEF2F2",
    buttonWithdrawText: "#DC2626",
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
    fetchMyResignations();
  }, []);

  const fetchMyResignations = async () => {
    try {
      const res = await axios.get(`${API}/resignations/my`, { headers });
      setResignations(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const hasActivePending = resignations.some((r) => r.status === "pending");

  const handleNoticeDateChange = (val) => {
    const notice = new Date(val);
    const lastDay = new Date(notice);
    lastDay.setDate(lastDay.getDate() + 30);
    const lastDayStr = lastDay.toISOString().split("T")[0];
    setForm({ ...form, notice_date: val, last_working_day: lastDayStr });
  };

  const handleSubmit = async () => {
    if (!form.last_working_day || !form.reason) {
      setError("Last working day and reason are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await axios.post(`${API}/resignations`, form, { headers });
      setShowForm(false);
      setForm({ last_working_day: "", reason: "", notice_date: new Date().toISOString().split("T")[0] });
      fetchMyResignations();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async (id) => {
    if (!window.confirm("Withdraw this resignation request?")) return;
    try {
      await axios.patch(`${API}/resignations/${id}/withdraw`, {}, { headers });
      fetchMyResignations();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to withdraw.");
    }
  };

  const getStatusStyle = (status) => {
    const s = statusConfig[status] || statusConfig.pending;
    if (isDark) {
      return { bg: s.darkBg, text: s.darkText, label: s.label };
    }
    return { bg: s.bg, text: s.text, label: s.label };
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: t.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
        .er-card { transition: transform 0.15s, box-shadow 0.15s; }
        .er-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(15,23,42,0.08) !important; }
        .topbar-btn:hover { background: ${isDark ? "#1E2535" : "#F3F4F6"} !important; }
        .form-input:focus { border-color:#4F46E5 !important; box-shadow:0 0 0 3px rgba(79,70,229,.10); }
        * { box-sizing: border-box; }
        @media (max-width: 768px) {
          .er-main { padding: 76px 16px 32px !important; }
          .er-header { flex-direction: column; align-items: flex-start !important; gap: 12px !important; }
          .er-card-inner { flex-direction: column !important; }
          .er-withdraw-btn { margin-left: 0 !important; align-self: flex-start; margin-top: 12px; }
          .er-date-row { flex-direction: column !important; gap: 10px !important; }
          .er-form-date-row { flex-direction: column !important; }
          .er-form-date-row > div { flex: unset !important; width: 100% !important; }
          .er-modal-inner { padding: 24px 20px !important; }
          .er-topbar { display: none !important; }
        }
      `}</style>

      <MobileTopBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div
        className="er-main"
        style={{
          marginLeft: `${sidebarWidth}px`,
          flex: 1,
          transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
          padding: "28px 28px 40px",
        }}
      >
        <div className="er-topbar" style={{ marginBottom: 28, animation: "fadeUp 0.4s ease both 0.05s" }}>
          <p style={{ color: t.textSecondary, fontSize: "0.875rem", margin: "0 0 4px" }}>
            {greeting}, <strong style={{ color: "#4F46E5" }}>{name}</strong> 👋
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.5rem, 4vw, 1.85rem)", fontWeight: 700, color: t.textPrimary, margin: 0, lineHeight: 1.2 }}>
            Resignation
          </h1>
          <p style={{ color: t.textMuted, fontSize: "0.85rem", margin: "5px 0 0" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        <div className="er-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, animation: "fadeUp 0.4s ease both 0.05s" }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.5rem, 4vw, 1.85rem)", fontWeight: 700, color: t.textPrimary, margin: 0, lineHeight: 1.2 }}>
              Resignation
            </h1>
            <p style={{ color: t.textMuted, fontSize: "0.85rem", margin: "5px 0 0" }}>Manage your resignation requests</p>
          </div>
          {!hasActivePending && (
            <button
              onClick={() => { setShowForm(true); setError(""); }}
              style={{
                background: t.buttonPrimary, color: "#fff", border: "none", borderRadius: 8,
                padding: "10px 20px", fontWeight: 600, fontSize: 14, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap",
              }}
            >
              Submit Resignation
            </button>
          )}
        </div>

        {hasActivePending && (
          <div style={{
            background: t.pendingAlertBg, border: `1px solid ${t.pendingAlertBorder}`, borderRadius: 10,
            padding: "12px 16px", marginBottom: 20, fontSize: 13, color: t.pendingAlertText,
            fontWeight: 500, animation: "fadeUp 0.4s ease both 0.08s",
          }}>
            You have a pending resignation under review. You can withdraw it if needed.
          </div>
        )}

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 80 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 44, height: 44, border: "3px solid #E5E7EB", borderTop: "3px solid #4F46E5", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
              <p style={{ color: t.textMuted, fontWeight: 500, fontSize: "0.9rem" }}>Loading...</p>
            </div>
          </div>
        ) : resignations.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, background: t.card, borderRadius: 14, color: t.textMuted, border: `1px solid ${t.border}`, animation: "fadeUp 0.4s ease both 0.15s" }}>
            <p style={{ fontWeight: 600, margin: 0, fontSize: 15, color: t.textPrimary }}>No resignation requests</p>
            <p style={{ fontSize: 13, color: t.textMuted, margin: "4px 0 0" }}>Submit a resignation when you're ready</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "fadeUp 0.4s ease both 0.15s" }}>
            {resignations.map((r, idx) => {
              const sc = getStatusStyle(r.status);
              return (
                <div
                  key={r._id}
                  className="er-card"
                  style={{
                    background: t.card,
                    borderRadius: 12,
                    padding: "20px 24px",
                    border: `1px solid ${t.border}`,
                    boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.04)",
                    animation: `fadeUp 0.4s ease both ${0.15 + idx * 0.06}s`,
                  }}
                >
                  <div className="er-card-inner" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ background: sc.bg, color: sc.text, padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                          {sc.label}
                        </span>
                        <span style={{ fontSize: 12, color: t.textMuted }}>
                          Submitted {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <div className="er-date-row" style={{ display: "flex", gap: 28, marginBottom: 12, flexWrap: "wrap" }}>
                        <div style={{ minWidth: 120 }}>
                          <p style={{ fontSize: 11, color: t.textMuted, margin: "0 0 2px", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.4px" }}>Notice Date</p>
                          <p style={{ fontSize: 14, color: t.textPrimary, fontWeight: 700, margin: 0, fontFamily: "'Playfair Display', serif" }}>
                            {new Date(r.notice_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                        <div style={{ minWidth: 140 }}>
                          <p style={{ fontSize: 11, color: t.textMuted, margin: "0 0 2px", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.4px" }}>Last Working Day</p>
                          <p style={{ fontSize: 14, color: t.textPrimary, fontWeight: 700, margin: 0, fontFamily: "'Playfair Display', serif" }}>
                            {new Date(r.last_working_day).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                      <p style={{ fontSize: 13, color: t.textSecondary, margin: 0, lineHeight: 1.5 }}>{r.reason}</p>
                      {r.admin_note && (
                        <div style={{ marginTop: 12, padding: "10px 12px", background: t.adminNoteBg, borderRadius: 8, borderLeft: `3px solid ${t.adminNoteBorder}` }}>
                          <p style={{ fontSize: 11, color: t.textMuted, margin: "0 0 2px", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.4px" }}>Admin Note</p>
                          <p style={{ fontSize: 13, color: t.textSecondary, margin: 0 }}>{r.admin_note}</p>
                        </div>
                      )}
                    </div>
                    {r.status === "pending" && (
                      <button
                        className="er-withdraw-btn"
                        onClick={() => handleWithdraw(r._id)}
                        style={{
                          marginLeft: 16, padding: "8px 14px", border: `1px solid ${t.inputBorder}`,
                          borderRadius: 8, background: t.buttonWithdrawBg, color: t.buttonWithdrawText,
                          fontWeight: 600, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && (
        <div
          style={{ position: "fixed", inset: 0, background: t.modalOverlay, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}
          onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
        >
          <div
            className="er-modal-inner"
            style={{ background: t.modalBg, borderRadius: 16, padding: 32, width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(15,23,42,0.18)", maxHeight: "90vh", overflowY: "auto", border: `1px solid ${t.modalBorder}` }}
          >
            <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: t.textPrimary }}>Submit Resignation</h2>
            <p style={{ margin: "0 0 20px", color: t.textMuted, fontSize: 13 }}>This will be sent to HR for review.</p>

            {error && (
              <div style={{ background: t.buttonWithdrawBg, border: `1px solid ${t.buttonWithdrawText}`, color: t.buttonWithdrawText, padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: t.textSecondary, marginBottom: 6, display: "block" }}>Notice Date</label>
                <input
                  type="date"
                  value={form.notice_date}
                  onChange={(e) => handleNoticeDateChange(e.target.value)}
                  className="form-input"
                  style={{ width: "100%", padding: "9px 12px", border: `1px solid ${t.inputBorder}`, borderRadius: 8, fontSize: 14, color: t.textPrimary, background: t.inputBg, boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: t.textSecondary, marginBottom: 6, display: "block" }}>Last Working Day</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="date"
                    value={form.last_working_day}
                    onChange={(e) => setForm({ ...form, last_working_day: e.target.value })}
                    className="form-input"
                    style={{ width: "100%", padding: "9px 12px", border: `1px solid ${t.inputBorder}`, borderRadius: 8, fontSize: 14, color: t.textPrimary, background: t.inputBg, boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif" }}
                  />
                  {form.last_working_day && (
                    <span style={{
                      position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                      fontSize: 10, color: t.buttonPrimary, fontWeight: 700, background: t.inputBg,
                      padding: "2px 6px", borderRadius: 4, pointerEvents: "none",
                    }}>
                      Auto
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 11, color: t.textMuted, margin: "4px 0 0" }}>Auto-calculated as 30 days from notice date. You can adjust if needed.</p>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: t.textSecondary, marginBottom: 6, display: "block" }}>Reason for Leaving</label>
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Please describe your reason for resigning..."
                  rows={4}
                  className="form-input"
                  style={{ width: "100%", padding: "9px 12px", border: `1px solid ${t.inputBorder}`, borderRadius: 8, fontSize: 14, color: t.textPrimary, background: t.inputBg, resize: "vertical", fontFamily: "'DM Sans', sans-serif" }}
                />
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button
                  onClick={() => setShowForm(false)}
                  style={{ flex: 1, padding: "11px", border: `1px solid ${t.inputBorder}`, borderRadius: 8, background: t.card, fontWeight: 600, cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: t.textSecondary }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{ flex: 1, padding: "11px", border: "none", borderRadius: 8, background: t.buttonPrimary, color: "#fff", fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", fontSize: 14, opacity: submitting ? 0.7 : 1, fontFamily: "'DM Sans', sans-serif" }}
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}