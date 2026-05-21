import React, { useState, useEffect } from "react";
import Sidebar from "../layouts/sidebar";
import MobileTopBar from "../employee/MobileTopBar";
import { Building2, Users, ShieldCheck, AlertTriangle, Plus, Search, Trash2, X, CheckCircle, Clock } from "lucide-react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "https://hrm-backend-vvqg.onrender.com";

const CompaniesPage = () => {
  const [companies,     setCompanies]     = useState([]);
  const [plans,         setPlans]         = useState([]);
  const [globalStats,   setGlobalStats]   = useState({ totalCompanies: 0, totalUsers: 0, activeLicenses: 0, systemAlerts: 0 });
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [showModal,     setShowModal]     = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [submitting,    setSubmitting]    = useState(false);
  const [toast,         setToast]         = useState(null);
  const [isOpen,        setIsOpen]        = useState(window.innerWidth > 768);
  const [formData,      setFormData]      = useState({ company_name: "", pricing_plan: "" });
  const [formError,     setFormError]     = useState("");

  const isMobile    = window.innerWidth <= 768;
  const sidebarWidth = isMobile ? 0 : (isOpen ? 255 : 68);
  const token       = localStorage.getItem("token");
  const headers     = { "x-auth-token": token };

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth <= 768) setIsOpen(false); };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [companiesRes, statsRes, plansRes] = await Promise.all([
        axios.get(`${API}/api/saas/companies`, { headers }),
        axios.get(`${API}/api/saas/summary`,   { headers }),
        axios.get(`${API}/api/plans`,           { headers }).catch(() => ({ data: { data: [] } })),
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
    if (!formData.pricing_plan)        { setFormError("Please select a pricing plan"); return; }
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
    if (!plan) return { bg: "#F3F4F6", color: "#6B7280" };
    const name = (getPlanName(plan) || "").toLowerCase();
    if (name.includes("enterprise") || name.includes("yearly")) return { bg: "#EEF2FF", color: "#4F46E5" };
    if (name.includes("premium")) return { bg: "#ECFDF5", color: "#059669" };
    if (name.includes("basic"))   return { bg: "#FFFBEB", color: "#D97706" };
    return { bg: "#ECFEFF", color: "#0891B2" };
  };

  const filtered = companies.filter((c) => (c.company_name || "").toLowerCase().includes(search.toLowerCase()));

  const statCards = [
    { label: "Total Companies", value: globalStats.totalCompanies, color: "#4F46E5", bg: "#EEF2FF", icon: <Building2 size={20} />    },
    { label: "Total Users",     value: globalStats.totalUsers,     color: "#059669", bg: "#ECFDF5", icon: <Users size={20} />         },
    { label: "Active Licenses", value: globalStats.activeLicenses, color: "#0891B2", bg: "#ECFEFF", icon: <ShieldCheck size={20} />  },
    { label: "System Alerts",   value: globalStats.systemAlerts,   color: "#D97706", bg: "#FFFBEB", icon: <AlertTriangle size={20} /> },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F9FAFB", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        .stat-card { transition:transform 0.18s,box-shadow 0.18s; }
        .stat-card:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(15,23,42,0.10) !important; }
        .co-row { transition:background 0.12s; }
        .co-row:hover { background:#F5F7FF !important; }
        .form-inp { width:100%; padding:9px 12px; border:1.5px solid #E5E7EB; border-radius:9px; font-size:0.875rem; color:#374151; background:#F9FAFB; outline:none; transition:border-color 0.18s,box-shadow 0.18s; font-family:inherit; box-sizing:border-box; }
        .form-inp:focus { border-color:#4F46E5; box-shadow:0 0 0 3px rgba(79,70,229,0.10); }
        .modal-btn { border:none; cursor:pointer; font-family:inherit; transition:opacity 0.15s,transform 0.15s; }
        .modal-btn:hover:not(:disabled) { opacity:0.88; transform:translateY(-1px); }
        .modal-btn:disabled { opacity:0.5; cursor:not-allowed; }
        * { box-sizing:border-box; }
        @media (max-width: 768px) {
          .cp-main        { padding:76px 14px 32px !important; }
          .cp-stats-grid  {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}
          .cp-stat-val    { font-size:1.5rem !important; }
          .cp-table-header { flex-direction:column !important; align-items:flex-start !important; gap:10px !important; }
          .cp-table-actions { width:100% !important; }
          .cp-table-actions input { width:100% !important; }
          .cp-add-btn     { width:100% !important; justify-content:center !important; }
          .cp-tbl-hide    { display:none !important; }
          .cp-page-title  { font-size:1.5rem !important; }
          .modal-inner    { padding:22px !important; width:calc(100vw - 32px) !important; }
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

        {toast && (
          <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, padding: "12px 20px", borderRadius: 10, fontWeight: 500, fontSize: "0.875rem", animation: "slideIn 0.3s ease", boxShadow: "0 4px 16px rgba(0,0,0,0.12)", backgroundColor: toast.type === "error" ? "#FEF2F2" : "#ECFDF5", color: toast.type === "error" ? "#DC2626" : "#059669", border: toast.type === "error" ? "1px solid #FECACA" : "1px solid #A7F3D0", display: "flex", alignItems: "center", gap: 8, maxWidth: "calc(100vw - 40px)" }}>
            {toast.type === "error" ? <X size={15} /> : <CheckCircle size={15} />}
            {toast.message}
          </div>
        )}
        <div style={{ marginBottom: 24, animation: "fadeUp 0.4s ease both 0.05s" }}>
          <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "0 0 4px" }}>Super Admin</p>
          <h1 className="cp-page-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.5rem,4vw,1.85rem)", fontWeight: 700, color: "#111827", margin: 0, lineHeight: 1.2 }}>
            Companies
          </h1>
          <p style={{ color: "#9CA3AF", fontSize: "0.85rem", margin: "5px 0 0" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="cp-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: 24 }}>
          {statCards.map((card, idx) => (
            <div key={card.label} className="stat-card" style={{ backgroundColor: "#fff", borderRadius: 14, padding: 20, border: "1px solid #F1F3F9", boxShadow: "0 2px 8px rgba(15,23,42,0.05)", animation: `fadeUp 0.4s ease both ${0.1 + idx * 0.07}s` }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", color: card.color, flexShrink: 0 }}>
                  {card.icon}
                </div>
                <div>
                  <div className="cp-stat-val" style={{ fontSize: "1.9rem", fontWeight: 700, color: "#111827", lineHeight: 1, fontFamily: "'Playfair Display', serif" }}>
                    {loading ? <span style={{ display: "inline-block", width: 40, height: 26, background: "#F3F4F6", borderRadius: 6 }} /> : (card.value ?? 0)}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#9CA3AF", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.4px", marginTop: 3 }}>{card.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ backgroundColor: "#fff", borderRadius: 14, border: "1px solid #F1F3F9", boxShadow: "0 2px 8px rgba(15,23,42,0.05)", overflow: "hidden", animation: "fadeUp 0.4s ease both 0.38s" }}>
          <div className="cp-table-header" style={{ padding: "18px 22px", borderBottom: "1px solid #F1F3F9", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#111827", margin: "0 0 2px" }}>Companies List</h2>
              <p style={{ fontSize: "0.78rem", color: "#9CA3AF", margin: 0 }}>{filtered.length} {filtered.length === 1 ? "company" : "companies"} found</p>
            </div>
            <div className="cp-table-actions" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
                <input className="form-inp" placeholder="Search companies…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 32, minWidth: "180px" }} />
              </div>
              <button
                className="cp-add-btn"
                onClick={() => { setShowModal(true); setFormError(""); setFormData({ company_name: "", pricing_plan: "" }); }}
                style={{ display: "flex", alignItems: "center", gap: 6, background: "#4F46E5", color: "#fff", border: "none", padding: "9px 16px", borderRadius: 10, fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(79,70,229,0.25)", whiteSpace: "nowrap" }}
              >
                <Plus size={14} /> Add Company
              </button>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "480px" }}>
              <thead>
                <tr style={{ backgroundColor: "#FAFBFF" }}>
                  {["#", "Company Name", "Plan", "Status", "Billing", "Created", "Actions"].map((h, i) => (
                    <th key={i} className={i === 4 || i === 5 ? "cp-tbl-hide" : ""} style={{ padding: "11px 16px", textAlign: i === 6 ? "right" : "left", fontSize: "0.70rem", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #F1F3F9", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>{[30, 150, 100, 70, 80, 100, 80].map((w, j) => (
                      <td key={j} className={j === 4 || j === 5 ? "cp-tbl-hide" : ""} style={{ padding: "14px 16px" }}>
                        <div style={{ height: 14, width: w, background: "#F3F4F6", borderRadius: 4 }} />
                      </td>
                    ))}</tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="7" style={{ padding: 48, textAlign: "center", color: "#9CA3AF", fontSize: "0.875rem" }}>
                    {companies.length === 0 ? "No companies registered yet." : "No companies match your search."}
                  </td></tr>
                ) : (
                  filtered.map((c, i) => {
                    const planBadge = getPlanBadgeColor(c.pricing_plan);
                    const planName  = getPlanName(c.pricing_plan);
                    const billing   = typeof c.pricing_plan === "object" ? c.pricing_plan?.billing_cycle : null;
                    const price     = typeof c.pricing_plan === "object" ? c.pricing_plan?.price : null;
                    const isActive  = c.is_active !== false;
                    const isTrial   = c.is_trial;
                    return (
                      <tr key={c._id || c.company_id} className="co-row" style={{ borderBottom: "1px solid #F9FAFB" }}>
                        <td style={{ padding: "13px 16px", fontSize: "0.78rem", color: "#9CA3AF", fontWeight: 500 }}>{String(i + 1).padStart(2, "0")}</td>
                        <td style={{ padding: "13px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: "50%", background: `hsl(${(c.company_name?.charCodeAt(0) || 65) * 5 % 360},55%,55%)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>
                              {(c.company_name || "?").slice(0, 2).toUpperCase()}
                            </div>
                            <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#111827" }}>{c.company_name}</span>
                          </div>
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          {planName ? (
                            <div>
                              <span style={{ ...planBadge, padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600, display: "inline-block" }}>{planName}</span>
                              {price != null && <div style={{ fontSize: "0.70rem", color: "#9CA3AF", marginTop: 3 }}>₹{price.toLocaleString("en-IN")}</div>}
                            </div>
                          ) : <span style={{ color: "#9CA3AF", fontSize: "0.82rem" }}>—</span>}
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 20, fontSize: "0.70rem", fontWeight: 600, backgroundColor: isActive ? "#ECFDF5" : "#FEF2F2", color: isActive ? "#059669" : "#DC2626" }}>
                              <span style={{ width: 5, height: 5, borderRadius: "50%", background: isActive ? "#059669" : "#DC2626" }} />
                              {isActive ? "Active" : "Inactive"}
                            </span>
                            {isTrial && (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 20, fontSize: "0.70rem", fontWeight: 600, backgroundColor: "#FFFBEB", color: "#D97706" }}>
                                <Clock size={9} /> Trial
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="cp-tbl-hide" style={{ padding: "13px 16px", fontSize: "0.78rem", color: "#6B7280", textTransform: "capitalize" }}>
                          {billing || "—"}
                        </td>
                        <td className="cp-tbl-hide" style={{ padding: "13px 16px", fontSize: "0.82rem", color: "#6B7280", whiteSpace: "nowrap" }}>
                          {(c.createdAt || c.created_at)
                            ? new Date(c.createdAt || c.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                            : "—"}
                        </td>
                        <td style={{ padding: "13px 16px", textAlign: "right" }}>
                          <button onClick={() => setDeleteConfirm(c)} style={{ background: "#FEF2F2", color: "#EF4444", border: "none", padding: "6px 10px", borderRadius: 8, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "inherit" }}>
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
            <div style={{ padding: "11px 18px", borderTop: "1px solid #F1F3F9", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
              <span style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>Showing {filtered.length} of {companies.length} companies</span>
              <span style={{ fontSize: "0.70rem", color: "#9CA3AF" }}>Updated just now</span>
            </div>
          )}
        </div>
      </div>
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal-inner" style={{ background: "#fff", borderRadius: 16, padding: 32, width: 460, maxWidth: "100%", boxShadow: "0 24px 64px rgba(15,23,42,0.20)", animation: "fadeUp 0.25s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 700, color: "#111827", margin: 0 }}>Add Company</h2>
                <p style={{ fontSize: "0.78rem", color: "#9CA3AF", margin: "4px 0 0" }}>Register a new company to the platform</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 4 }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.4px" }}>Company Name <span style={{ color: "#EF4444" }}>*</span></label>
                <input className="form-inp" name="company_name" placeholder="e.g. Acme Corp" value={formData.company_name} onChange={handleChange} autoFocus />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.4px" }}>Pricing Plan <span style={{ color: "#EF4444" }}>*</span></label>
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
                <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
                  <X size={14} color="#DC2626" />
                  <p style={{ color: "#DC2626", fontSize: "0.82rem", margin: 0 }}>{formError}</p>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" className="modal-btn" onClick={() => setShowModal(false)} style={{ padding: "9px 20px", border: "1.5px solid #E5E7EB", background: "#fff", borderRadius: 10, fontSize: "0.875rem", fontWeight: 600, color: "#6B7280" }}>Cancel</button>
                <button type="submit" className="modal-btn" disabled={submitting} style={{ padding: "9px 24px", background: "#4F46E5", color: "#fff", borderRadius: 10, fontSize: "0.875rem", fontWeight: 600, opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? "Saving…" : "Add Company"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteConfirm(null); }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 420, maxWidth: "100%", boxShadow: "0 24px 64px rgba(15,23,42,0.20)", animation: "fadeUp 0.25s ease" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Trash2 size={22} color="#EF4444" />
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", fontWeight: 700, color: "#111827", margin: "0 0 8px" }}>Delete Company</h2>
            <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "0 0 6px", lineHeight: 1.6 }}>
              Are you sure you want to delete <strong style={{ color: "#111827" }}>{deleteConfirm.company_name}</strong>?
            </p>
            <p style={{ color: "#EF4444", fontSize: "0.82rem", margin: "0 0 24px" }}>⚠ All users linked to this company may be affected. This cannot be undone.</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button className="modal-btn" onClick={() => setDeleteConfirm(null)} style={{ padding: "9px 20px", border: "1.5px solid #E5E7EB", background: "#fff", borderRadius: 10, fontSize: "0.875rem", fontWeight: 600, color: "#6B7280" }}>Cancel</button>
              <button className="modal-btn" onClick={() => handleDelete(deleteConfirm)} style={{ padding: "9px 20px", background: "#EF4444", color: "#fff", borderRadius: 10, fontSize: "0.875rem", fontWeight: 600 }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompaniesPage;