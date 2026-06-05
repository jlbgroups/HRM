import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../layouts/sidebar";
import MobileTopBar from "../MobileTopBar";
import { useTheme } from "../../context/ThemeContext";

const API = import.meta.env.VITE_API_URL || "https://hrm-backend-vvqg.onrender.com/api";

const statusConfig = {
  open: { bg: "#EEF2FF", text: "#4F46E5", label: "Open", darkBg: "#1E1B4B", darkText: "#818CF8" },
  under_review: { bg: "#FFFBEB", text: "#D97706", label: "Under Review", darkBg: "#451A03", darkText: "#FCD34D" },
  resolved: { bg: "#ECFDF5", text: "#059669", label: "Resolved", darkBg: "#064E3B", darkText: "#6EE7B7" },
  dismissed: { bg: "#F3F4F6", text: "#6B7280", label: "Dismissed", darkBg: "#1E2535", darkText: "#9CA3AF" },
};

const priorityColors = {
  low: { bg: "#ECFDF5", text: "#059669", darkBg: "#064E3B", darkText: "#6EE7B7" },
  medium: { bg: "#FFFBEB", text: "#D97706", darkBg: "#451A03", darkText: "#FCD34D" },
  high: { bg: "#FEF2F2", text: "#DC2626", darkBg: "#2D0F0F", darkText: "#F87171" },
};

export default function EmployeeComplaints() {
  const { isDark } = useTheme();
  const [data, setData] = useState({ raisedByMe: [], raisedAgainstMe: [] });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("raised");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ against_employee_id: "", subject: "", description: "", priority: "medium" });
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
    tabBorder: isDark ? "#2D3748" : "#E5E7EB",
    tabActiveBorder: "#4F46E5",
    tabActiveText: "#4F46E5",
    tabInactiveText: isDark ? "#9CA3AF" : "#6B7280",
    modalBg: isDark ? "#161B27" : "#fff",
    modalBorder: isDark ? "#1E2535" : "#F1F3F9",
    modalOverlay: isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.45)",
    buttonPrimary: "#4F46E5",
    resolutionNoteBg: isDark ? "#064E3B" : "#ECFDF5",
    resolutionNoteBorder: "#059669",
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
    fetchMyComplaints();
    fetchEmployees();
  }, []);

  const fetchMyComplaints = async () => {
    try {
      const res = await axios.get(`${API}/complaints/my`, { headers });
      setData(res.data.data || { raisedByMe: [], raisedAgainstMe: [] });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API}/employees`, { headers });
      setEmployees(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    if (!form.against_employee_id || !form.subject || !form.description) {
      setError("All fields are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await axios.post(`${API}/complaints`, form, { headers });
      setShowModal(false);
      setForm({ against_employee_id: "", subject: "", description: "", priority: "medium" });
      fetchMyComplaints();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit complaint.");
    } finally {
      setSubmitting(false);
    }
  };

  const getName = (emp) => emp?.user_id?.name || emp?.name || "Unknown";
  const activeList = tab === "raised" ? data.raisedByMe : data.raisedAgainstMe;

  const getStatusStyle = (status) => {
    const s = statusConfig[status] || statusConfig.open;
    if (isDark) {
      return { bg: s.darkBg, text: s.darkText, label: s.label };
    }
    return { bg: s.bg, text: s.text, label: s.label };
  };

  const getPriorityStyle = (priority) => {
    const p = priorityColors[priority] || priorityColors.medium;
    if (isDark) {
      return { bg: p.darkBg, text: p.darkText };
    }
    return { bg: p.bg, text: p.text };
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: t.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
        .ec-card { transition: transform 0.15s, box-shadow 0.15s; }
        .ec-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(15,23,42,0.08) !important; }
        .topbar-btn:hover { background: ${isDark ? "#1E2535" : "#F3F4F6"} !important; }
        .form-input:focus { border-color:#4F46E5 !important; box-shadow:0 0 0 3px rgba(79,70,229,.10); }
        * { box-sizing: border-box; }
        @media (max-width: 768px) {
          .ec-main { padding: 76px 16px 32px !important; }
          .ec-header { flex-direction: column; align-items: flex-start !important; gap: 12px !important; }
          .ec-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .ec-topbar { display: none !important; }
        }
      `}</style>

      <MobileTopBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div
        className="ec-main"
        style={{
          marginLeft: `${sidebarWidth}px`,
          flex: 1,
          transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
          padding: "28px 28px 40px",
        }}
      >
        <div className="ec-topbar" style={{ marginBottom: 28, animation: "fadeUp 0.4s ease both 0.05s" }}>
          <p style={{ color: t.textSecondary, fontSize: "0.875rem", margin: "0 0 4px" }}>
            {greeting}, <strong style={{ color: "#4F46E5" }}>{name}</strong> 👋
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.5rem, 4vw, 1.85rem)", fontWeight: 700, color: t.textPrimary, margin: 0, lineHeight: 1.2 }}>
            Complaints
          </h1>
          <p style={{ color: t.textMuted, fontSize: "0.85rem", margin: "5px 0 0" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        <div className="ec-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, animation: "fadeUp 0.4s ease both 0.05s" }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.5rem, 4vw, 1.85rem)", fontWeight: 700, color: t.textPrimary, margin: 0, lineHeight: 1.2 }}>
              Complaints
            </h1>
            <p style={{ color: t.textMuted, fontSize: "0.85rem", margin: "5px 0 0" }}>Raise or view complaints</p>
          </div>
          <button
            onClick={() => { setShowModal(true); setError(""); }}
            style={{
              background: t.buttonPrimary, color: "#fff", border: "none", borderRadius: 8,
              padding: "10px 20px", fontWeight: 600, fontSize: 14, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap",
            }}
          >
            + Raise Complaint
          </button>
        </div>

        <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: `2px solid ${t.tabBorder}`, animation: "fadeUp 0.4s ease both 0.1s" }}>
          {[
            { key: "raised", label: `Raised by me (${data.raisedByMe.length})` },
            { key: "against", label: `Against me (${data.raisedAgainstMe.length})` },
          ].map((tItem) => (
            <button
              key={tItem.key}
              onClick={() => setTab(tItem.key)}
              style={{
                padding: "10px 20px", border: "none",
                borderBottom: tab === tItem.key ? `2px solid ${t.tabActiveBorder}` : "2px solid transparent",
                background: "transparent",
                color: tab === tItem.key ? t.tabActiveText : t.tabInactiveText,
                fontWeight: tab === tItem.key ? 700 : 500,
                fontSize: 14, cursor: "pointer", marginBottom: -2,
                fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s",
              }}
            >
              {tItem.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 80 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 44, height: 44, border: "3px solid #E5E7EB", borderTop: "3px solid #4F46E5", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
              <p style={{ color: t.textMuted, fontWeight: 500, fontSize: "0.9rem" }}>Loading...</p>
            </div>
          </div>
        ) : activeList.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, background: t.card, borderRadius: 14, color: t.textMuted, border: `1px solid ${t.border}`, animation: "fadeUp 0.4s ease both 0.15s" }}>
            <p style={{ fontWeight: 600, margin: 0, fontSize: 15, color: t.textPrimary }}>No complaints found</p>
            <p style={{ fontSize: 13, color: t.textMuted, margin: "4px 0 0" }}>
              {tab === "raised" ? "You haven't raised any complaints." : "No one has raised a complaint against you."}
            </p>
          </div>
        ) : (
          <div className="ec-table-wrap" style={{ animation: "fadeUp 0.4s ease both 0.15s" }}>
            <div style={{ minWidth: 520, display: "flex", flexDirection: "column", gap: 10 }}>
              {activeList.map((c, idx) => {
                const sc = getStatusStyle(c.status);
                const pc = getPriorityStyle(c.priority);
                return (
                  <div
                    key={c._id}
                    className="ec-card"
                    style={{
                      background: t.card,
                      borderRadius: 12,
                      padding: "18px 22px",
                      border: `1px solid ${t.border}`,
                      boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.04)",
                      animation: `fadeUp 0.4s ease both ${0.15 + idx * 0.04}s`,
                    }}
                  >
                    <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: t.textPrimary }}>
                        {tab === "raised" ? `Against: ${getName(c.against)}` : `From: ${getName(c.raised_by)}`}
                      </span>
                      <span style={{ background: sc.bg, color: sc.text, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{sc.label}</span>
                      <span style={{ background: pc.bg, color: pc.text, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: "capitalize" }}>
                        {c.priority}
                      </span>
                    </div>
                    <p style={{ fontWeight: 600, fontSize: 14, color: t.textSecondary, margin: "0 0 4px" }}>{c.subject}</p>
                    <p style={{ fontSize: 13, color: t.textMuted, margin: "0 0 8px", lineHeight: 1.5 }}>{c.description}</p>
                    <div style={{ fontSize: 12, color: t.textMuted }}>
                      {new Date(c.complaint_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      {c.resolved_at && ` · Resolved on ${new Date(c.resolved_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`}
                    </div>
                    {c.resolution_note && (
                      <div style={{ marginTop: 8, padding: "8px 12px", background: t.resolutionNoteBg, borderRadius: 8, fontSize: 13, color: t.textSecondary, borderLeft: `3px solid ${t.resolutionNoteBorder}` }}>
                        {c.resolution_note}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div
          style={{ position: "fixed", inset: 0, background: t.modalOverlay, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "0 16px" }}
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div style={{ background: t.modalBg, borderRadius: 16, padding: 32, width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(15,23,42,0.18)", border: `1px solid ${t.modalBorder}` }}>
            <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: t.textPrimary }}>Raise a Complaint</h2>
            <p style={{ margin: "0 0 20px", color: t.textMuted, fontSize: 13 }}>This will be reviewed by HR administration.</p>

            {error && (
              <div style={{ background: t.modalOverlay, border: `1px solid #DC2626`, color: "#DC2626", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: t.textSecondary, marginBottom: 6, display: "block" }}>Complaint Against</label>
                <select value={form.against_employee_id} onChange={(e) => setForm({ ...form, against_employee_id: e.target.value })} className="form-input" style={{ width: "100%", padding: "9px 12px", border: `1px solid ${t.inputBorder}`, borderRadius: 8, fontSize: 14, color: t.textPrimary, background: t.inputBg, boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif" }}>
                  <option value="">Select employee</option>
                  {employees.map((e) => (
                    <option key={e._id} value={e._id}>{e.name} — {e.designation || "Employee"}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: t.textSecondary, marginBottom: 6, display: "block" }}>Subject</label>
                <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Brief subject of the complaint" className="form-input" style={{ width: "100%", padding: "9px 12px", border: `1px solid ${t.inputBorder}`, borderRadius: 8, fontSize: 14, color: t.textPrimary, background: t.inputBg, boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif" }} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: t.textSecondary, marginBottom: 6, display: "block" }}>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the incident or issue in detail..." rows={4} className="form-input" style={{ width: "100%", padding: "9px 12px", border: `1px solid ${t.inputBorder}`, borderRadius: 8, fontSize: 14, color: t.textPrimary, background: t.inputBg, resize: "vertical", fontFamily: "'DM Sans', sans-serif" }} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: t.textSecondary, marginBottom: 6, display: "block" }}>Priority</label>
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="form-input" style={{ width: "100%", padding: "9px 12px", border: `1px solid ${t.inputBorder}`, borderRadius: 8, fontSize: 14, color: t.textPrimary, background: t.inputBg, boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif" }}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "11px", border: `1px solid ${t.inputBorder}`, borderRadius: 8, background: t.card, fontWeight: 600, cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: t.textSecondary }}>
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