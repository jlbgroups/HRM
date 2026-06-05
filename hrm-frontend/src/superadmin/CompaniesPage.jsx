import React, { useState, useEffect } from "react";
import Sidebar from "../layouts/sidebar";
import MobileTopBar from "../employee/MobileTopBar";
import { Building2, Users, ShieldCheck, AlertTriangle, Plus, Search, Trash2, X, CheckCircle, Clock, Bell } from "lucide-react";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";

const API = import.meta.env.VITE_API_URL || "https://hrm-backend-vvqg.onrender.com";

const CompaniesPage = () => {
  const { isDark } = useTheme();
  const [companies, setCompanies] = useState([]);
  const [plans, setPlans] = useState([]);
  const [globalStats, setGlobalStats] = useState({ totalCompanies: 0, totalUsers: 0, activeLicenses: 0, systemAlerts: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [formData, setFormData] = useState({ company_name: "", pricing_plan: "" });
  const [formError, setFormError] = useState("");

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
    statIconBg3: isDark ? "#1E1B4B" : "#ECFEFF",
    statIconBg4: isDark ? "#451A03" : "#FFFBEB",
    statIconColor1: isDark ? "#818CF8" : "#4F46E5",
    statIconColor2: isDark ? "#6EE7B7" : "#059669",
    statIconColor3: isDark ? "#38BDF8" : "#0891B2",
    statIconColor4: isDark ? "#FCD34D" : "#D97706",
    toastSuccessBg: isDark ? "#064E3B" : "#ECFDF5",
    toastSuccessText: isDark ? "#6EE7B7" : "#059669",
    toastErrorBg: isDark ? "#2D0F0F" : "#FEF2F2",
    toastErrorText: isDark ? "#F87171" : "#DC2626",
    modalBg: isDark ? "#161B27" : "#fff",
    modalBorder: isDark ? "#1E2535" : "#F1F3F9",
    modalOverlay: isDark ? "rgba(0,0,0,0.7)" : "rgba(15,23,42,0.5)",
    buttonPrimary: "#4F46E5",
    buttonDeleteBg: isDark ? "#2D0F0F" : "#FEF2F2",
    buttonDeleteColor: "#EF4444",
    activeBadgeBg: isDark ? "#064E3B" : "#ECFDF5",
    activeBadgeText: isDark ? "#6EE7B7" : "#059669",
    inactiveBadgeBg: isDark ? "#2D0F0F" : "#FEF2F2",
    inactiveBadgeText: isDark ? "#F87171" : "#DC2626",
    trialBadgeBg: isDark ? "#451A03" : "#FFFBEB",
    trialBadgeText: isDark ? "#FCD34D" : "#D97706",
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
    setTimeout(() => setToast(null), 3500);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [companiesRes, statsRes, plansRes] = await Promise.all([
        axios.get(`${API}/api/saas/companies`, { headers }),
        axios.get(`${API}/api/saas/summary`, { headers }),
        axios.get(`${API}/api/plans`, { headers }).catch(() => ({ data: { data: [] } })),
      ]);
      if (companiesRes.data?.success) setCompanies(companiesRes.data.data || []);
      else if (Array.isArray(companiesRes.data)) setCompanies(companiesRes.data);
      if (statsRes.data?.success) setGlobalStats(statsRes.data.data);
      const plansList = plansRes.data?.data || plansRes.data || [];
      setPlans(Array.isArray(plansList) ? plansList : []);
    } catch (err) { showToast("Failed to load data", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company_name.trim()) { setFormError("Company name is required"); return; }
    if (!formData.pricing_plan) { setFormError("Please select a pricing plan"); return; }
    setSubmitting(true); setFormError("");
    try {
      await axios.post(`${API}/api/saas/companies`, { company_name: formData.company_name.trim(), pricing_plan: Number(formData.pricing_plan) }, { headers });
      showToast("Company added successfully");
      setShowModal(false); setFormData({ company_name: "", pricing_plan: "" }); fetchDashboardData();
    } catch (err) { setFormError(err.response?.data?.message || err.response?.data?.error || "Error adding company"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (company) => {
    try {
      await axios.delete(`${API}/api/saas/companies/${company._id || company.company_id}`, { headers });
      showToast("Company deleted successfully");
      setDeleteConfirm(null); fetchDashboardData();
    } catch (err) { showToast(err.response?.data?.message || "Delete failed", "error"); setDeleteConfirm(null); }
  };

  const getPlanName = (plan) => {
    if (!plan) return null;
    if (typeof plan === "string") return plan;
    if (typeof plan === "object") return plan.plan_name || plan.name || "—";
    return String(plan);
  };

  const getPlanBadgeColor = (plan) => {
    if (!plan) return { bg: t.skeletonBg, color: t.textMuted };
    const name = (getPlanName(plan) || "").toLowerCase();
    if (name.includes("enterprise") || name.includes("yearly")) return { bg: t.statIconBg1, color: t.statIconColor1 };
    if (name.includes("premium")) return { bg: t.statIconBg2, color: t.statIconColor2 };
    if (name.includes("basic")) return { bg: t.statIconBg4, color: t.statIconColor4 };
    return { bg: t.statIconBg3, color: t.statIconColor3 };
  };

  const filtered = companies.filter((c) => (c.company_name || "").toLowerCase().includes(search.toLowerCase()));

  const statCards = [
    { label: "Total Companies", value: globalStats.totalCompanies, bg: t.statIconBg1, color: t.statIconColor1, icon: <Building2 size={20} /> },
    { label: "Total Users", value: globalStats.totalUsers, bg: t.statIconBg2, color: t.statIconColor2, icon: <Users size={20} /> },
    { label: "Active Licenses", value: globalStats.activeLicenses, bg: t.statIconBg3, color: t.statIconColor3, icon: <ShieldCheck size={20} /> },
    { label: "System Alerts", value: globalStats.systemAlerts, bg: t.statIconBg4, color: t.statIconColor4, icon: <AlertTriangle size={20} /> },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: t.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        .stat-card { transition:transform 0.18s,box-shadow 0.18s; }
        .stat-card:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(15,23,42,0.15) !important; }
        .co-row { transition:background 0.12s; }
        .co-row:hover { background:${t.rowHover} !important; }
        .form-inp { width:100%; padding:9px 12px; border:1.5px solid ${t.inputBorder}; border-radius:9px; font-size:0.875rem; color:${t.textPrimary}; background:${t.inputBg}; outline:none; transition:border-color 0.18s,box-shadow 0.18s; font-family:inherit; box-sizing:border-box; }
        .form-inp:focus { border-color:#4F46E5; box-shadow:0 0 0 3px rgba(79,70,229,0.10); }
        .search-input:focus { outline:none; border-color:#4F46E5 !important; box-shadow:0 0 0 3px rgba(79,70,229,0.10); }
        .topbar-btn:hover { background:${isDark ? "#1E2535" : "#F3F4F6"} !important; }
        .modal-btn { border:none; cursor:pointer; font-family:inherit; transition:opacity 0.15s,transform 0.15s; }
        .modal-btn:hover:not(:disabled) { opacity:0.88; transform:translateY(-1px); }
        .modal-btn:disabled { opacity:0.5; cursor:not-allowed; }
        * { box-sizing:border-box; }
        @media (max-width: 768px) {
          .cp-main        { padding:76px 14px 32px !important; }
          .cp-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
          .cp-stat-val    { font-size:1.5rem !important; }
          .cp-table-header { flex-direction:column !important; align-items:flex-start !important; gap:10px !important; }
          .cp-table-actions { width:100% !important; }
          .cp-table-actions input { width:100% !important; }
          .cp-add-btn     { width:100% !important; justify-content:center !important; }
          .cp-tbl-hide    { display:none !important; }
          .cp-page-title  { font-size:1.5rem !important; }
          .cp-topbar      { display:none !important; }
        }
        @media (min-width:769px) and (max-width:1024px) {
          .cp-main       { padding:28px 18px 40px !important; }
          .cp-stats-grid { grid-template-columns:repeat(2,1fr) !important; }
          .cp-tbl-hide   { display:none !important; }
        }
      `}</style>

      <MobileTopBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="cp-main" style={{ marginLeft: `${sidebarWidth}px`, flex: 1, transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)", padding: "28px 28px 40px", minWidth: 0 }}>
        <div className="cp-topbar" style={{ marginBottom: 24, animation: "fadeUp 0.4s ease both 0.05s" }}>
          <p style={{ color: t.textSecondary, fontSize: "0.875rem", margin: "0 0 4px" }}>{greeting}, <strong style={{ color: t.buttonPrimary }}>{name}</strong> 👋</p>
          <p style={{ color: t.textSecondary, fontSize: "0.875rem", margin: "0 0 4px" }}>Super Admin</p>
          <h1 className="cp-page-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.5rem,4vw,1.85rem)", fontWeight: 700, color: t.textPrimary, margin: 0, lineHeight: 1.2 }}>
            Companies
          </h1>
          <p style={{ color: t.textMuted, fontSize: "0.85rem", margin: "5px 0 0" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        <div className="cp-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: 24 }}>
          {statCards.map((card, idx) => (
            <div key={card.label} className="stat-card" style={{ backgroundColor: t.card, borderRadius: 14, padding: 20, border: `1px solid ${t.border}`, boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.05)", animation: `fadeUp 0.4s ease both ${0.1 + idx * 0.07}s` }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", color: card.color, flexShrink: 0 }}>
                  {card.icon}
                </div>
                <div>
                  <div className="cp-stat-val" style={{ fontSize: "1.9rem", fontWeight: 700, color: t.textPrimary, lineHeight: 1, fontFamily: "'Playfair Display', serif" }}>
                    {loading ? <span style={{ display: "inline-block", width: 40, height: 26, background: t.skeletonBg, borderRadius: 6 }} /> : (card.value ?? 0)}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: t.textMuted, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.4px", marginTop: 3 }}>{card.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ backgroundColor: t.card, borderRadius: 14, border: `1px solid ${t.border}`, boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.05)", overflow: "hidden", animation: "fadeUp 0.4s ease both 0.38s" }}>
          <div className="cp-table-header" style={{ padding: "18px 22px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h2 style={{ fontSize: "1rem", fontWeight: 600, color: t.textPrimary, margin: "0 0 2px" }}>Companies List</h2>
              <p style={{ fontSize: "0.78rem", color: t.textMuted, margin: 0 }}>{filtered.length} {filtered.length === 1 ? "company" : "companies"} found</p>
            </div>
            <div className="cp-table-actions" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: t.textMuted }} />
                <input className="form-inp" placeholder="Search companies…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 32, minWidth: "180px" }} />
              </div>
              <button className="cp-add-btn" onClick={() => { setShowModal(true); setFormError(""); setFormData({ company_name: "", pricing_plan: "" }); }} style={{ display: "flex", alignItems: "center", gap: 6, background: t.buttonPrimary, color: "#fff", border: "none", padding: "9px 16px", borderRadius: 10, fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(79,70,229,0.25)", whiteSpace: "nowrap" }}>
                <Plus size={14} /> Add Company
              </button>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "480px" }}>
              <thead>
                <tr style={{ backgroundColor: t.tableHead }}>
                  {["#", "Company Name", "Plan", "Status", "Billing", "Created", "Actions"].map((h, i) => (
                    <th key={i} className={i === 4 || i === 5 ? "cp-tbl-hide" : ""} style={{ padding: "11px 16px", textAlign: i === 6 ? "right" : "left", fontSize: "0.70rem", fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: `1px solid ${t.border}`, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>{[30, 150, 100, 70, 80, 100, 80].map((w, j) => (
                      <td key={j} className={j === 4 || j === 5 ? "cp-tbl-hide" : ""} style={{ padding: "14px 16px" }}>
                        <div style={{ height: 14, width: w, background: t.skeletonBg, borderRadius: 4 }} />
                      </td>
                    ))}</tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="7" style={{ padding: 48, textAlign: "center", color: t.textMuted, fontSize: "0.875rem" }}>
                    {companies.length === 0 ? "No companies registered yet." : "No companies match your search."}
                  </td></tr>
                ) : (
                  filtered.map((c, i) => {
                    const planBadge = getPlanBadgeColor(c.pricing_plan);
                    const planName = getPlanName(c.pricing_plan);
                    const billing = typeof c.pricing_plan === "object" ? c.pricing_plan?.billing_cycle : null;
                    const price = typeof c.pricing_plan === "object" ? c.pricing_plan?.price : null;
                    const isActive = c.is_active !== false;
                    const isTrial = c.is_trial;
                    return (
                      <tr key={c._id || c.company_id} className="co-row" style={{ borderBottom: `1px solid ${t.border}` }}>
                        <td style={{ padding: "13px 16px", fontSize: "0.78rem", color: t.textMuted, fontWeight: 500 }}>{String(i + 1).padStart(2, "0")}</td>
                        <td style={{ padding: "13px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: "50%", background: `hsl(${(c.company_name?.charCodeAt(0) || 65) * 5 % 360},55%,${isDark ? "45%" : "55%"})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>
                              {(c.company_name || "?").slice(0, 2).toUpperCase()}
                            </div>
                            <span style={{ fontSize: "0.875rem", fontWeight: 500, color: t.textPrimary }}>{c.company_name}</span>
                          </div>
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          {planName ? (
                            <div>
                              <span style={{ ...planBadge, padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600, display: "inline-block" }}>{planName}</span>
                              {price != null && <div style={{ fontSize: "0.70rem", color: t.textMuted, marginTop: 3 }}>₹{price.toLocaleString("en-IN")}</div>}
                            </div>
                          ) : <span style={{ color: t.textMuted, fontSize: "0.82rem" }}>—</span>}
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 20, fontSize: "0.70rem", fontWeight: 600, backgroundColor: isActive ? t.activeBadgeBg : t.inactiveBadgeBg, color: isActive ? t.activeBadgeText : t.inactiveBadgeText }}>
                              <span style={{ width: 5, height: 5, borderRadius: "50%", background: isActive ? t.activeBadgeText : t.inactiveBadgeText }} />
                              {isActive ? "Active" : "Inactive"}
                            </span>
                            {isTrial && (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 20, fontSize: "0.70rem", fontWeight: 600, backgroundColor: t.trialBadgeBg, color: t.trialBadgeText }}>
                                <Clock size={9} /> Trial
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="cp-tbl-hide" style={{ padding: "13px 16px", fontSize: "0.78rem", color: t.textMuted, textTransform: "capitalize" }}>
                          {billing || "—"}
                        </td>
                        <td className="cp-tbl-hide" style={{ padding: "13px 16px", fontSize: "0.82rem", color: t.textMuted, whiteSpace: "nowrap" }}>
                          {(c.createdAt || c.created_at) ? new Date(c.createdAt || c.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                        </td>
                        <td style={{ padding: "13px 16px", textAlign: "right" }}>
                          <button onClick={() => setDeleteConfirm(c)} style={{ background: t.buttonDeleteBg, color: t.buttonDeleteColor, border: "none", padding: "6px 10px", borderRadius: 8, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "inherit" }}>
                            <Trash2 size={12} /> Del
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {!loading && filtered.length > 0 && (
            <div style={{ padding: "11px 18px", borderTop: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
              <span style={{ fontSize: "0.75rem", color: t.textMuted }}>Showing {filtered.length} of {companies.length} companies</span>
              <span style={{ fontSize: "0.70rem", color: t.textMuted }}>Updated just now</span>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: t.modalOverlay, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal-inner" style={{ background: t.modalBg, borderRadius: 16, padding: 32, width: 460, maxWidth: "100%", boxShadow: "0 24px 64px rgba(15,23,42,0.20)", animation: "fadeUp 0.25s ease", border: `1px solid ${t.modalBorder}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 700, color: t.textPrimary, margin: 0 }}>Add Company</h2>
                <p style={{ fontSize: "0.78rem", color: t.textMuted, margin: "4px 0 0" }}>Register a new company to the platform</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted, padding: 4 }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: t.textSecondary, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.4px" }}>Company Name <span style={{ color: "#EF4444" }}>*</span></label>
                <input className="form-inp" name="company_name" placeholder="e.g. Acme Corp" value={formData.company_name} onChange={handleChange} autoFocus />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: t.textSecondary, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.4px" }}>Pricing Plan <span style={{ color: "#EF4444" }}>*</span></label>
                {plans.length > 0 ? (
                  <select className="form-inp" name="pricing_plan" value={formData.pricing_plan} onChange={handleChange}>
                    <option value="">— Select a plan —</option>
                    {plans.map((p) => <option key={p._id} value={p.price}>{p.plan_name} — ₹{p.price?.toLocaleString("en-IN")} / {p.billing_cycle}</option>)}
                  </select>
                ) : (
                  <input className="form-inp" name="pricing_plan" type="number" placeholder="Plan price (e.g. 999)" value={formData.pricing_plan} onChange={handleChange} />
                )}
              </div>
              {formError && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, background: t.buttonDeleteBg, border: `1px solid ${t.buttonDeleteColor}`, borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
                  <X size={14} color={t.buttonDeleteColor} />
                  <p style={{ color: t.buttonDeleteColor, fontSize: "0.82rem", margin: 0 }}>{formError}</p>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" className="modal-btn" onClick={() => setShowModal(false)} style={{ padding: "9px 20px", border: `1.5px solid ${t.inputBorder}`, background: t.card, borderRadius: 10, fontSize: "0.875rem", fontWeight: 600, color: t.textSecondary }}>Cancel</button>
                <button type="submit" className="modal-btn" disabled={submitting} style={{ padding: "9px 24px", background: t.buttonPrimary, color: "#fff", borderRadius: 10, fontSize: "0.875rem", fontWeight: 600, opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? "Saving…" : "Add Company"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: t.modalOverlay, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteConfirm(null); }}>
          <div style={{ background: t.modalBg, borderRadius: 16, padding: 32, width: 420, maxWidth: "100%", boxShadow: "0 24px 64px rgba(15,23,42,0.20)", animation: "fadeUp 0.25s ease", border: `1px solid ${t.modalBorder}` }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: t.buttonDeleteBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Trash2 size={22} color={t.buttonDeleteColor} />
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", fontWeight: 700, color: t.textPrimary, margin: "0 0 8px" }}>Delete Company</h2>
            <p style={{ color: t.textMuted, fontSize: "0.875rem", margin: "0 0 6px", lineHeight: 1.6 }}>
              Are you sure you want to delete <strong style={{ color: t.textPrimary }}>{deleteConfirm.company_name}</strong>?
            </p>
            <p style={{ color: t.buttonDeleteColor, fontSize: "0.82rem", margin: "0 0 24px" }}>⚠ All users linked to this company may be affected. This cannot be undone.</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button className="modal-btn" onClick={() => setDeleteConfirm(null)} style={{ padding: "9px 20px", border: `1.5px solid ${t.inputBorder}`, background: t.card, borderRadius: 10, fontSize: "0.875rem", fontWeight: 600, color: t.textSecondary }}>Cancel</button>
              <button className="modal-btn" onClick={() => handleDelete(deleteConfirm)} style={{ padding: "9px 20px", background: t.buttonDeleteColor, color: "#fff", borderRadius: 10, fontSize: "0.875rem", fontWeight: 600 }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompaniesPage;