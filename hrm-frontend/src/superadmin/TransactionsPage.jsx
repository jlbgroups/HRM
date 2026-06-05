import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../layouts/sidebar";
import MobileTopBar from "../employee/MobileTopBar";
import { CreditCard, CheckCircle2, Clock, XCircle, Plus, Search, Edit2, Trash2, X, Bell } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const API = import.meta.env.VITE_API_URL || "https://hrm-backend-vvqg.onrender.com";

const STATUS_COLORS = {
  paid:    { bg: "#ECFDF5", text: "#059669", dot: "#059669", darkBg: "#064E3B", darkText: "#6EE7B7", darkDot: "#6EE7B7" },
  pending: { bg: "#FFFBEB", text: "#D97706", dot: "#D97706", darkBg: "#451A03", darkText: "#FCD34D", darkDot: "#FCD34D" },
  failed:  { bg: "#FEF2F2", text: "#DC2626", dot: "#DC2626", darkBg: "#2D0F0F", darkText: "#F87171", darkDot: "#F87171" },
};

export default function TransactionsPage() {
  const { isDark } = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [toast, setToast] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({ company_id: "", amount: "", payment_date: "", status: "pending" });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);

  const name = localStorage.getItem("name") || "Superadmin";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const isMobile = window.innerWidth <= 768;
  const sidebarWidth = isMobile ? 0 : (isOpen ? 255 : 68);
  const token = localStorage.getItem("token");
  const headers = { "x-auth-token": token };

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
    tableHead: isDark ? "#111827" : "#FAFBFF",
    statIconBg1: isDark ? "#1E1B4B" : "#EEF2FF",
    statIconBg2: isDark ? "#064E3B" : "#ECFDF5",
    statIconBg3: isDark ? "#451A03" : "#FFFBEB",
    statIconBg4: isDark ? "#2D0F0F" : "#FEF2F2",
    statIconColor1: isDark ? "#818CF8" : "#4F46E5",
    statIconColor2: isDark ? "#6EE7B7" : "#059669",
    statIconColor3: isDark ? "#FCD34D" : "#D97706",
    statIconColor4: isDark ? "#F87171" : "#DC2626",
    toastSuccessBg: isDark ? "#064E3B" : "#10B981",
    toastErrorBg: isDark ? "#7F1D1D" : "#EF4444",
    modalBg: isDark ? "#161B27" : "#fff",
    modalBorder: isDark ? "#1E2535" : "#F1F3F9",
    modalOverlay: isDark ? "rgba(0,0,0,0.7)" : "rgba(15,23,42,0.5)",
    buttonPrimary: "#4F46E5",
    buttonEditBg: isDark ? "#1E1B4B" : "#EEF2FF",
    buttonEditColor: isDark ? "#818CF8" : "#4F46E5",
    buttonDeleteBg: isDark ? "#2D0F0F" : "#FEF2F2",
    buttonDeleteColor: "#EF4444",
    filterBtnActive: "#4F46E5",
    filterBtnInactiveBg: isDark ? "#1E2535" : "#fff",
    filterBtnInactiveText: isDark ? "#9CA3AF" : "#6B7280",
    filterBtnBorder: isDark ? "#2D3748" : "#E5E7EB",
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      if (!mobile && !isOpen) setIsOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [txRes, statsRes, compRes] = await Promise.all([
        axios.get(`${API}/api/transactions`, { headers }),
        axios.get(`${API}/api/transactions/stats`, { headers }),
        axios.get(`${API}/api/saas/companies`, { headers }),
      ]);
      setTransactions(txRes.data.data || []);
      setStats(statsRes.data.data || null);
      setCompanies(compRes.data.data || []);
    } catch { showToast("Failed to load data", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openAdd = () => {
    setEditItem(null);
    setForm({ company_id: "", amount: "", payment_date: "", status: "pending" });
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (tx) => {
    setEditItem(tx);
    setForm({ company_id: tx.company_id, amount: tx.amount, payment_date: tx.payment_date ? tx.payment_date.split("T")[0] : "", status: tx.status || "pending" });
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditItem(null); setFormError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.company_id || String(form.company_id).trim() === "") { setFormError("Please select a company"); return; }
    if (!form.amount || isNaN(form.amount)) { setFormError("Enter a valid amount"); return; }
    setSubmitting(true); setFormError("");
    try {
      const payload = { company_id: form.company_id, amount: Number(form.amount), payment_date: form.payment_date || null, status: form.status };
      if (editItem) {
        await axios.put(`${API}/api/transactions/${editItem._id || editItem.transaction_id}`, payload, { headers });
        showToast("Transaction updated");
      } else {
        await axios.post(`${API}/api/transactions`, payload, { headers });
        showToast("Transaction created");
      }
      closeModal(); fetchAll();
    } catch (err) { setFormError(err.response?.data?.message || "Something went wrong"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (tx) => {
    try {
      await axios.delete(`${API}/api/transactions/${tx._id || tx.transaction_id}`, { headers });
      showToast("Transaction deleted");
      setDeleteConfirm(null); fetchAll();
    } catch { showToast("Delete failed", "error"); setDeleteConfirm(null); }
  };

  const getStatusStyle = (status) => {
    const s = STATUS_COLORS[status] || STATUS_COLORS.pending;
    if (isDark) {
      return { bg: s.darkBg, text: s.darkText, dot: s.darkDot };
    }
    return { bg: s.bg, text: s.text, dot: s.dot };
  };

  const filtered = transactions.filter((tx) => {
    const name = tx.company_name || tx.company_id?.company_name || "";
    const idStr = String(tx._id || tx.transaction_id || "");
    const matchSearch = name.toLowerCase().includes(search.toLowerCase()) || idStr.includes(search);
    const matchStatus = filterStatus === "all" || (tx.status || "").toLowerCase() === filterStatus;
    return matchSearch && matchStatus;
  });

  const statCards = stats ? [
    { label: "Total", value: stats.total, sub: `₹${(stats.totalAmount || 0).toLocaleString()}`, bg: t.statIconBg1, color: t.statIconColor1, icon: <CreditCard size={20} /> },
    { label: "Paid", value: stats.paid || stats.approved, sub: `₹${(stats.paidAmount || stats.approvedAmount || 0).toLocaleString()}`, bg: t.statIconBg2, color: t.statIconColor2, icon: <CheckCircle2 size={20} /> },
    { label: "Pending", value: stats.pending, sub: `₹${(stats.pendingAmount || 0).toLocaleString()}`, bg: t.statIconBg3, color: t.statIconColor3, icon: <Clock size={20} /> },
    { label: "Failed/Rejected", value: stats.failed || stats.rejected || 0, sub: "Requires attention", bg: t.statIconBg4, color: t.statIconColor4, icon: <XCircle size={20} /> },
  ] : [];

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: t.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        .stat-card { transition:transform 0.18s,box-shadow 0.18s; }
        .stat-card:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(15,23,42,0.15) !important; }
        .tx-row { transition:background 0.12s; }
        .tx-row:hover { background:${t.rowHover} !important; }
        .filter-btn { border:1.5px solid ${t.filterBtnBorder}; background:${t.filterBtnInactiveBg}; padding:7px 14px; border-radius:8px; font-size:0.82rem; font-weight:500; cursor:pointer; color:${t.filterBtnInactiveText}; transition:all 0.15s; font-family:inherit; }
        .filter-btn.active { background:${t.filterBtnActive}; color:#fff; border-color:${t.filterBtnActive}; }
        .filter-btn:hover:not(.active) { border-color:${t.filterBtnActive}; color:${t.filterBtnActive}; }
        .form-inp { width:100%; padding:9px 12px; border:1.5px solid ${t.inputBorder}; border-radius:9px; font-size:0.875rem; color:${t.textPrimary}; background:${t.inputBg}; outline:none; transition:border-color 0.18s,box-shadow 0.18s; font-family:inherit; box-sizing:border-box; }
        .form-inp:focus { border-color:#4F46E5; box-shadow:0 0 0 3px rgba(79,70,229,0.10); }
        .search-input:focus { outline:none; border-color:#4F46E5 !important; box-shadow:0 0 0 3px rgba(79,70,229,0.10); }
        .topbar-btn:hover { background:${isDark ? "#1E2535" : "#F3F4F6"} !important; }
        * { box-sizing:border-box; }
        @media (max-width: 768px) {
          .tx-main        { padding:76px 14px 32px !important; }
          .tx-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
          .tx-stat-val    { font-size:1.4rem !important; }
          .tx-toolbar     { flex-direction:column !important; align-items:stretch !important; gap:10px !important; }
          .tx-toolbar-search { width:100% !important; }
          .tx-toolbar-search input { width:100% !important; max-width:unset !important; }
          .tx-filters     { display:flex; flex-wrap:wrap; gap:6px !important; }
          .tx-count-badge { margin-left:0 !important; }
          .tx-add-btn     { width:100% !important; justify-content:center !important; }
          .tx-tbl-hide    { display:none !important; }
          .tx-page-title  { font-size:1.5rem !important; }
          .tx-topbar      { display:none !important; }
        }
        @media (min-width:769px) and (max-width:1024px) {
          .tx-main       { padding:28px 18px 40px !important; }
          .tx-stats-grid { grid-template-columns:repeat(2,1fr) !important; }
          .tx-tbl-hide   { display:none !important; }
        }
      `}</style>

      <MobileTopBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="tx-main" style={{ marginLeft: `${sidebarWidth}px`, flex: 1, transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)", padding: "28px 28px 40px", minWidth: 0 }}>
        <div className="tx-topbar" style={{ marginBottom: 24, animation: "fadeUp 0.4s ease both 0.05s" }}>
          <p style={{ color: t.textSecondary, fontSize: "0.875rem", margin: "0 0 4px" }}>{greeting}, <strong style={{ color: t.buttonPrimary }}>{name}</strong> 👋</p>
          <p style={{ color: t.textSecondary, fontSize: "0.875rem", margin: "0 0 4px" }}>Super Admin</p>
          <h1 className="tx-page-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.5rem,4vw,1.85rem)", fontWeight: 700, color: t.textPrimary, margin: 0, lineHeight: 1.2 }}>
            Transactions
          </h1>
          <p style={{ color: t.textMuted, fontSize: "0.85rem", margin: "5px 0 0" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {stats && (
          <div className="tx-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 24 }}>
            {statCards.map((card, idx) => (
              <div key={card.label} className="stat-card" style={{ backgroundColor: t.card, borderRadius: 14, padding: 20, border: `1px solid ${t.border}`, boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.05)", animation: `fadeUp 0.4s ease both ${0.1 + idx * 0.07}s` }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", color: card.color, flexShrink: 0 }}>
                    {card.icon}
                  </div>
                  <div>
                    <div className="tx-stat-val" style={{ fontSize: "1.9rem", fontWeight: 700, color: t.textPrimary, lineHeight: 1, fontFamily: "'Playfair Display', serif" }}>
                      {card.value ?? 0}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: t.textMuted, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.4px", margin: "3px 0 2px" }}>{card.label}</div>
                    <div style={{ fontSize: "0.75rem", color: card.color, fontWeight: 600 }}>{card.sub}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="tx-toolbar" style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap", alignItems: "center", animation: "fadeUp 0.4s ease both 0.32s" }}>
          <div className="tx-toolbar-search" style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: t.textMuted }} />
            <input className="form-inp" style={{ paddingLeft: 32, maxWidth: 260 }} placeholder="Search company or ID…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="tx-filters" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["all", "paid", "pending", "failed"].map((s) => (
              <button key={s} className={`filter-btn ${filterStatus === s ? "active" : ""}`} onClick={() => setFilterStatus(s)}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <span className="tx-count-badge" style={{ marginLeft: "auto", fontSize: "0.78rem", color: t.textMuted, background: t.skeletonBg, padding: "5px 12px", borderRadius: 20, whiteSpace: "nowrap" }}>
            {filtered.length} results
          </span>
          <button className="tx-add-btn" onClick={openAdd} style={{ display: "flex", alignItems: "center", gap: 6, background: t.buttonPrimary, color: "#fff", border: "none", padding: "9px 18px", borderRadius: 10, fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(79,70,229,0.25)", whiteSpace: "nowrap" }}>
            <Plus size={15} /> Add Transaction
          </button>
        </div>

        <div style={{ backgroundColor: t.card, borderRadius: 14, border: `1px solid ${t.border}`, boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.05)", overflow: "hidden", animation: "fadeUp 0.4s ease both 0.38s" }}>
          {loading ? (
            <div style={{ padding: 60, textAlign: "center", color: t.textMuted }}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 60, textAlign: "center", color: t.textMuted, fontSize: "0.875rem" }}>No transactions found.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "520px" }}>
                <thead>
                  <tr style={{ backgroundColor: t.tableHead }}>
                    {["#ID", "Company", "Amount", "Payment Date", "Status", "Actions"].map((h, i) => (
                      <th key={i} className={i === 3 ? "tx-tbl-hide" : ""} style={{ padding: "11px 18px", textAlign: i === 5 ? "right" : "left", fontSize: "0.72rem", fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: `1px solid ${t.border}`, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((tx) => {
                    const statusKey = (tx.status || "pending").toLowerCase();
                    const sc = getStatusStyle(statusKey);
                    const compName = tx.company_name || tx.company_id?.company_name || "—";
                    const txId = tx._id || tx.transaction_id;
                    return (
                      <tr key={txId} className="tx-row" style={{ borderBottom: `1px solid ${t.border}` }}>
                        <td style={{ padding: "13px 18px", fontSize: "0.78rem", color: t.textMuted, fontWeight: 500 }}>#{String(txId).slice(-6)}</td>
                        <td style={{ padding: "13px 18px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: t.statIconBg1, color: t.statIconColor1, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.75rem", flexShrink: 0 }}>
                              {compName.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontSize: "0.875rem", fontWeight: 500, color: t.textPrimary }}>{compName}</span>
                          </div>
                        </td>
                        <td style={{ padding: "13px 18px", fontWeight: 700, fontSize: "0.95rem", color: t.textPrimary }}>
                          ₹{parseFloat(tx.amount || 0).toLocaleString()}
                        </td>
                        <td className="tx-tbl-hide" style={{ padding: "13px 18px", fontSize: "0.855rem", color: t.textMuted }}>
                          {tx.payment_date ? new Date(tx.payment_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                        </td>
                        <td style={{ padding: "13px 18px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: sc.bg, color: sc.text, padding: "4px 12px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc.dot }} />
                            {tx.status || "pending"}
                          </span>
                        </td>
                        <td style={{ padding: "13px 18px", textAlign: "right", whiteSpace: "nowrap" }}>
                          <button onClick={() => openEdit(tx)} style={{ background: t.buttonEditBg, color: t.buttonEditColor, border: "none", padding: "6px 10px", borderRadius: 8, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", marginRight: 6, display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <Edit2 size={12} /> Edit
                          </button>
                          <button onClick={() => setDeleteConfirm(tx)} style={{ background: t.buttonDeleteBg, color: t.buttonDeleteColor, border: "none", padding: "6px 10px", borderRadius: 8, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <Trash2 size={12} /> Del
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div style={{ position: "fixed", inset: 0, background: t.modalOverlay, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
          <div className="modal-inner" style={{ background: t.modalBg, borderRadius: 16, padding: 32, width: 460, maxWidth: "100%", boxShadow: "0 24px 64px rgba(15,23,42,0.20)", animation: "fadeUp 0.25s ease", border: `1px solid ${t.modalBorder}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 700, color: t.textPrimary, margin: 0 }}>
                {editItem ? "Edit Transaction" : "New Transaction"}
              </h2>
              <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted, padding: 4 }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: t.textSecondary, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.4px" }}>Company *</label>
                <select className="form-inp" value={form.company_id} onChange={(e) => setForm({ ...form, company_id: e.target.value })}>
                  <option value="">Select company…</option>
                  {companies.map((c) => <option key={c._id || c.company_id} value={c._id || c.company_id}>{c.company_name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: t.textSecondary, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.4px" }}>Amount (₹) *</label>
                <input className="form-inp" type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="e.g. 4999" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: t.textSecondary, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.4px" }}>Payment Date</label>
                <input className="form-inp" type="date" value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: t.textSecondary, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.4px" }}>Status *</label>
                <select className="form-inp" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="approved">Approved</option>
                  <option value="failed">Failed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              {formError && <p style={{ color: "#EF4444", fontSize: "0.82rem", marginBottom: 14 }}>{formError}</p>}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" onClick={closeModal} style={{ padding: "9px 20px", border: `1.5px solid ${t.inputBorder}`, background: t.card, borderRadius: 10, fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", color: t.textSecondary, fontFamily: "inherit" }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ padding: "9px 24px", background: t.buttonPrimary, color: "#fff", border: "none", borderRadius: 10, fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? "Saving…" : editItem ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: t.modalOverlay, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
          <div style={{ background: t.modalBg, borderRadius: 16, padding: 32, width: 420, maxWidth: "100%", boxShadow: "0 24px 64px rgba(15,23,42,0.20)", animation: "fadeUp 0.25s ease", border: `1px solid ${t.modalBorder}` }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: t.buttonDeleteBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Trash2 size={22} color={t.buttonDeleteColor} />
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", fontWeight: 700, color: t.textPrimary, margin: "0 0 8px" }}>Delete Transaction</h2>
            <p style={{ color: t.textMuted, fontSize: "0.875rem", margin: "0 0 24px", lineHeight: 1.6 }}>
              Are you sure you want to delete the transaction for <strong style={{ color: t.textPrimary }}>{deleteConfirm.company_name || deleteConfirm.company_id?.company_name}</strong>? This cannot be undone.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ padding: "9px 20px", border: `1.5px solid ${t.inputBorder}`, background: t.card, borderRadius: 10, fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", color: t.textSecondary, fontFamily: "inherit" }}>Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ padding: "9px 20px", background: t.buttonDeleteColor, color: "#fff", border: "none", borderRadius: 10, fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}