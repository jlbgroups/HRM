import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../layouts/sidebar";
import MobileTopBar from "../../employee/MobileTopBar";
import { Tag, Plus, Trash2, X, CheckCircle2, Bell, Search } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const API = import.meta.env.VITE_API_URL || "https://hrm-backend-vvqg.onrender.com";

function PricingPage() {
  const { isDark } = useTheme();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [formError, setFormError] = useState("");
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    plan_name: "",
    price: "",
    billing_cycle: "monthly",
    max_employees: "",
    features: "",
  });

  const token = localStorage.getItem("token");
  const name = localStorage.getItem("name") || "Admin";
  const headers = { "x-auth-token": token };
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

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
    statIconColor1: isDark ? "#818CF8" : "#4F46E5",
    statIconBg2: isDark ? "#064E3B" : "#ECFDF5",
    statIconColor2: isDark ? "#6EE7B7" : "#059669",
    statIconBg3: isDark ? "#1E1B4B" : "#ECFEFF",
    statIconColor3: isDark ? "#38BDF8" : "#0891B2",
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
    planMonthlyBg: isDark ? "#1E1B4B" : "#EEF2FF",
    planMonthlyText: isDark ? "#818CF8" : "#4F46E5",
    planYearlyBg: isDark ? "#064E3B" : "#ECFDF5",
    planYearlyText: isDark ? "#6EE7B7" : "#059669",
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarWidth = isMobile ? 0 : isOpen ? 255 : 68;

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/plans`);
      setPlans(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch {
      showToast("Failed to load plans", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const resetForm = () => setForm({
    plan_name: "",
    price: "",
    billing_cycle: "monthly",
    max_employees: "",
    features: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.plan_name.trim()) {
      setFormError("Plan name is required");
      return;
    }
    if (!form.price || isNaN(form.price)) {
      setFormError("Enter a valid price");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      await axios.post(`${API}/api/plans`, {
        plan_name: form.plan_name,
        price: Number(form.price),
        billing_cycle: form.billing_cycle,
        max_employees: form.max_employees ? Number(form.max_employees) : null,
        features: form.features,
      }, { headers });
      showToast("Plan created successfully");
      setShowModal(false);
      resetForm();
      fetchPlans();
    } catch (err) {
      setFormError(err.response?.data?.error || err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (plan) => {
    try {
      const id = plan._id || plan.plan_id;
      await axios.delete(`${API}/api/plans/${id}`, { headers });
      showToast("Plan deleted");
      setDeleteConfirm(null);
      fetchPlans();
    } catch {
      showToast("Delete failed", "error");
      setDeleteConfirm(null);
    }
  };

  const getCycleColors = (cycle) => {
    if (cycle === "monthly") {
      return { bg: t.planMonthlyBg, text: t.planMonthlyText };
    }
    return { bg: t.planYearlyBg, text: t.planYearlyText };
  };

  const filteredPlans = plans.filter((plan) =>
    (plan.plan_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const planStats = {
    total: plans.length,
    monthly: plans.filter(p => p.billing_cycle === "monthly").length,
    yearly: plans.filter(p => p.billing_cycle === "yearly").length,
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: t.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        .plan-row { transition: background 0.12s; }
        .plan-row:hover { background: ${t.rowHover} !important; }
        .plan-card { transition: transform 0.18s, box-shadow 0.18s; }
        .plan-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(15,23,42,0.10) !important; }
        .form-inp { width:100%; padding:9px 12px; border:1.5px solid ${t.inputBorder}; border-radius:9px; font-size:0.875rem; color:${t.textPrimary}; background:${t.inputBg}; outline:none; transition:border-color 0.18s,box-shadow 0.18s; font-family:inherit; box-sizing:border-box; }
        .form-inp:focus { border-color:#4F46E5; box-shadow:0 0 0 3px rgba(79,70,229,0.10); }
        .search-input:focus { outline:none; border-color:#4F46E5 !important; box-shadow:0 0 0 3px rgba(79,70,229,0.10); }
        .topbar-btn:hover { background:${isDark ? "#1E2535" : "#F3F4F6"} !important; }
        * { box-sizing:border-box; }
        @media (max-width: 768px) {
          .pp-topbar        { display: none !important; }
          .pp-main          { padding: 72px 14px 32px !important; }
          .pp-header        { flex-direction: column !important; align-items: stretch !important; gap: 12px !important; }
          .pp-h1            { font-size: 1.45rem !important; }
          .pp-cards-grid    { grid-template-columns: 1fr !important; }
          .pp-plan-card     { padding: 14px !important; }
          .pp-table-wrap    { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .pp-table-wrap table { min-width: 600px; }
          .pp-col-features  { display: none !important; }
          .pp-col-billing   { display: none !important; }
          .pp-modal-inner   { width: calc(100vw - 24px) !important; padding: 18px !important; }
          .pp-modal-grid    { grid-template-columns: 1fr !important; }
          .pp-add-btn       { width: 100% !important; justify-content: center !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .pp-main       { padding: 24px 20px 32px !important; }
          .pp-cards-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .pp-col-features { display: none !important; }
        }
      `}</style>

      <MobileTopBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div style={{ marginLeft: `${sidebarWidth}px`, flex: 1, transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)", display: "flex", flexDirection: "column", minHeight: "100vh", minWidth: 0 }}>
        {toast && (
          <div style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            background: toast.type === "error" ? t.toastErrorBg : t.toastSuccessBg,
            color: toast.type === "error" ? t.toastErrorText : t.toastSuccessText,
            padding: "12px 20px",
            borderRadius: 10,
            fontWeight: 500,
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: "0.875rem",
            animation: "fadeUp 0.3s ease"
          }}>
            {toast.type === "error" ? <X size={16} /> : <CheckCircle2 size={16} />}
            {toast.message}
          </div>
        )}

        <div className="pp-topbar" style={{
          height: "64px",
          backgroundColor: t.topbar,
          borderBottom: `1px solid ${t.border}`,
          display: "flex",
          alignItems: "center",
          padding: "0 28px",
          gap: "16px",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: isDark ? "0 1px 4px rgba(0,0,0,0.2)" : "0 1px 4px rgba(15,23,42,0.04)"
        }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "380px" }}>
            <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: t.textMuted }} />
            <input
              className="search-input"
              placeholder="Search plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px 8px 36px",
                border: `1.5px solid ${t.inputBorder}`,
                borderRadius: "10px",
                fontSize: "0.875rem",
                color: t.textPrimary,
                backgroundColor: t.inputBg,
              }}
            />
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
            <button className="topbar-btn" style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              border: `1.5px solid ${t.inputBorder}`,
              background: t.card,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: t.textMuted
            }}>
              <Bell size={17} />
            </button>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
              padding: "5px 12px 5px 6px",
              border: `1.5px solid ${t.inputBorder}`,
              borderRadius: "10px",
              background: t.card,
              cursor: "pointer"
            }}>
              <div style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "0.72rem",
                fontWeight: "600"
              }}>
                {name.slice(0, 2).toUpperCase()}
              </div>
              <span style={{ fontSize: "0.83rem", fontWeight: "500", color: t.textPrimary }}>{name}</span>
            </div>
          </div>
        </div>

        <div className="pp-main" style={{ padding: "28px 28px 40px", flex: 1 }}>
          <div className="pp-header" style={{
            marginBottom: 24,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            animation: "fadeUp 0.4s ease both 0.05s"
          }}>
            <div>
              <p style={{ color: t.textSecondary, fontSize: "0.875rem", margin: "0 0 4px" }}>{greeting}, <strong style={{ color: t.buttonPrimary }}>{name}</strong> 👋</p>
              <p style={{ color: t.textSecondary, fontSize: "0.875rem", margin: "0 0 4px" }}>Super Admin</p>
              <h1 className="pp-h1" style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.85rem",
                fontWeight: 700,
                color: t.textPrimary,
                margin: 0,
                lineHeight: 1.2
              }}>Pricing Plans</h1>
              <p style={{ color: t.textMuted, fontSize: "0.85rem", margin: "5px 0 0" }}>
                {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            <button
              className="pp-add-btn"
              onClick={() => {
                setShowModal(true);
                setFormError("");
                resetForm();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: t.buttonPrimary,
                color: "#fff",
                border: "none",
                padding: "10px 20px",
                borderRadius: 10,
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "0 2px 8px rgba(79,70,229,0.25)",
                alignSelf: "flex-start"
              }}
            >
              <Plus size={15} /> Add Plan
            </button>
          </div>

          <div className="pp-cards-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 14,
            marginBottom: 24
          }}>
            {!loading && plans.slice(0, 4).map((plan, idx) => {
              const cc = getCycleColors(plan.billing_cycle);
              return (
                <div
                  key={plan._id || plan.plan_id}
                  className="plan-card pp-plan-card"
                  style={{
                    backgroundColor: t.card,
                    borderRadius: 14,
                    padding: 18,
                    border: `1px solid ${t.border}`,
                    boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.05)",
                    animation: `fadeUp 0.4s ease both ${0.1 + idx * 0.07}s`
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 9,
                      background: t.statIconBg1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: t.statIconColor1
                    }}>
                      <Tag size={16} />
                    </div>
                    <span style={{ fontSize: "0.875rem", fontWeight: 600, color: t.textPrimary }}>{plan.plan_name}</span>
                  </div>
                  <div style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: t.textPrimary,
                    fontFamily: "'Playfair Display', serif",
                    lineHeight: 1
                  }}>
                    ₹{Number(plan.price).toLocaleString()}
                  </div>
                  <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span style={{
                      background: cc.bg,
                      color: cc.text,
                      padding: "2px 10px",
                      borderRadius: 20,
                      fontSize: "0.7rem",
                      fontWeight: 600
                    }}>{plan.billing_cycle}</span>
                    {plan.max_employees && (
                      <span style={{ fontSize: "0.72rem", color: t.textMuted }}>
                        up to {plan.max_employees} users
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{
            backgroundColor: t.card,
            borderRadius: 14,
            border: `1px solid ${t.border}`,
            boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.05)",
            overflow: "hidden",
            animation: "fadeUp 0.4s ease both 0.38s"
          }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${t.border}` }}>
              <h2 style={{ fontSize: "0.95rem", fontWeight: 600, color: t.textPrimary, margin: "0 0 2px" }}>All Plans</h2>
              <p style={{ fontSize: "0.75rem", color: t.textMuted, margin: 0 }}>
                {filteredPlans.length} {filteredPlans.length === 1 ? "plan" : "plans"} available
              </p>
            </div>

            <div className="pp-table-wrap">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: t.tableHead }}>
                    {[
                      { label: "#" },
                      { label: "Plan Name" },
                      { label: "Price" },
                      { label: "Billing", cls: "pp-col-billing" },
                      { label: "Max Users" },
                      { label: "Features", cls: "pp-col-features" },
                      { label: "Actions", right: true },
                    ].map((h, i) => (
                      <th
                        key={i}
                        className={h.cls || ""}
                        style={{
                          padding: "10px 18px",
                          textAlign: h.right ? "right" : "left",
                          fontSize: "0.68rem",
                          fontWeight: 600,
                          color: t.textMuted,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          borderBottom: `1px solid ${t.border}`,
                          whiteSpace: "nowrap"
                        }}
                      >
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        {[30, 120, 80, 80, 70, 150, 60].map((w, j) => (
                          <td
                            key={j}
                            className={j === 3 ? "pp-col-billing" : j === 5 ? "pp-col-features" : ""}
                            style={{ padding: "13px 18px" }}
                          >
                            <div style={{ height: 13, width: w, background: t.skeletonBg, borderRadius: 4 }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filteredPlans.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ padding: 48, textAlign: "center", color: t.textMuted, fontSize: "0.875rem" }}>
                        {plans.length === 0 ? "No plans available. Add your first plan!" : "No plans match your search."}
                      </td>
                    </tr>
                  ) : (
                    filteredPlans.map((plan, i) => {
                      const cc = getCycleColors(plan.billing_cycle);
                      return (
                        <tr key={plan._id || plan.plan_id} className="plan-row" style={{ borderBottom: `1px solid ${t.border}` }}>
                          <td style={{ padding: "12px 18px", fontSize: "0.8rem", color: t.textMuted, fontWeight: 500 }}>
                            {String(i + 1).padStart(2, "0")}
                          </td>
                          <td style={{ padding: "12px 18px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{
                                width: 28,
                                height: 28,
                                borderRadius: 7,
                                background: t.statIconBg1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: t.statIconColor1,
                                flexShrink: 0
                              }}>
                                <Tag size={12} />
                              </div>
                              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: t.textPrimary, whiteSpace: "nowrap" }}>
                                {plan.plan_name}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: "12px 18px", fontWeight: 700, fontSize: "0.95rem", color: t.textPrimary, whiteSpace: "nowrap" }}>
                            ₹{Number(plan.price).toLocaleString()}
                          </td>
                          <td className="pp-col-billing" style={{ padding: "12px 18px" }}>
                            <span style={{
                              background: cc.bg,
                              color: cc.text,
                              padding: "3px 10px",
                              borderRadius: 20,
                              fontSize: "0.7rem",
                              fontWeight: 600
                            }}>{plan.billing_cycle}</span>
                          </td>
                          <td style={{ padding: "12px 18px", fontSize: "0.84rem", color: t.textSecondary }}>
                            {plan.max_employees ? plan.max_employees.toLocaleString() : "Unlimited"}
                          </td>
                          <td className="pp-col-features" style={{ padding: "12px 18px", fontSize: "0.82rem", color: t.textSecondary, maxWidth: 180 }}>
                            <span style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden"
                            }}>{plan.features || "—"}</span>
                          </td>
                          <td style={{ padding: "12px 18px", textAlign: "right" }}>
                            <button
                              onClick={() => setDeleteConfirm(plan)}
                              style={{
                                background: t.buttonDeleteBg,
                                color: t.buttonDeleteColor,
                                border: "none",
                                padding: isMobile ? "6px 8px" : "6px 12px",
                                borderRadius: 8,
                                fontSize: "0.78rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                fontFamily: "inherit",
                                whiteSpace: "nowrap"
                              }}
                            >
                              <Trash2 size={12} />
                              {!isMobile && "Delete"}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {!loading && filteredPlans.length > 0 && (
              <div style={{
                padding: "11px 18px",
                borderTop: `1px solid ${t.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "8px"
              }}>
                <span style={{ fontSize: "0.75rem", color: t.textMuted }}>
                  Showing {filteredPlans.length} of {plans.length} plans
                </span>
                <span style={{ fontSize: "0.70rem", color: t.textMuted }}>Updated just now</span>
              </div>
            )}
          </div>
        </div>

        {showModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: t.modalOverlay,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "16px"
            }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
          >
            <div className="pp-modal-inner" style={{
              background: t.modalBg,
              borderRadius: 16,
              padding: 28,
              width: 480,
              maxWidth: "100%",
              boxShadow: "0 24px 64px rgba(15,23,42,0.20)",
              animation: "fadeUp 0.25s ease",
              maxHeight: "90vh",
              overflowY: "auto",
              border: `1px solid ${t.modalBorder}`
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", fontWeight: 700, color: t.textPrimary, margin: 0 }}>
                    New Pricing Plan
                  </h2>
                  <p style={{ fontSize: "0.75rem", color: t.textMuted, margin: "4px 0 0" }}>Create a subscription tier</p>
                </div>
                <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted, padding: 4 }}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="pp-modal-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <div style={{ gridColumn: "1/-1" }}>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: t.textSecondary, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                      Plan Name <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <input
                      className="form-inp"
                      placeholder="e.g. Enterprise"
                      value={form.plan_name}
                      onChange={(e) => setForm({ ...form, plan_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: t.textSecondary, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                      Price (₹) <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <input
                      className="form-inp"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g. 4999"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: t.textSecondary, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                      Billing Cycle
                    </label>
                    <select
                      className="form-inp"
                      value={form.billing_cycle}
                      onChange={(e) => setForm({ ...form, billing_cycle: e.target.value })}
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: t.textSecondary, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                      Max Employees
                    </label>
                    <input
                      className="form-inp"
                      type="number"
                      min="1"
                      placeholder="e.g. 100"
                      value={form.max_employees}
                      onChange={(e) => setForm({ ...form, max_employees: e.target.value })}
                    />
                  </div>
                  <div style={{ gridColumn: "1/-1" }}>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: t.textSecondary, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                      Features
                    </label>
                    <input
                      className="form-inp"
                      placeholder="e.g. Payroll, Attendance, Leave Management"
                      value={form.features}
                      onChange={(e) => setForm({ ...form, features: e.target.value })}
                    />
                  </div>
                </div>
                {formError && (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: t.buttonDeleteBg,
                    border: `1px solid ${t.buttonDeleteColor}`,
                    borderRadius: 8,
                    padding: "10px 14px",
                    marginBottom: 16
                  }}>
                    <X size={14} color={t.buttonDeleteColor} />
                    <p style={{ color: t.buttonDeleteColor, fontSize: "0.82rem", margin: 0 }}>{formError}</p>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{
                      padding: "9px 20px",
                      border: `1.5px solid ${t.inputBorder}`,
                      background: t.card,
                      borderRadius: 10,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      color: t.textSecondary,
                      fontFamily: "inherit"
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      padding: "9px 24px",
                      background: t.buttonPrimary,
                      color: "#fff",
                      border: "none",
                      borderRadius: 10,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      opacity: submitting ? 0.7 : 1
                    }}
                  >
                    {submitting ? "Saving…" : "Create Plan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {deleteConfirm && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: t.modalOverlay,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "16px"
            }}
            onClick={(e) => { if (e.target === e.currentTarget) setDeleteConfirm(null); }}
          >
            <div style={{
              background: t.modalBg,
              borderRadius: 16,
              padding: 32,
              width: 420,
              maxWidth: "100%",
              boxShadow: "0 24px 64px rgba(15,23,42,0.20)",
              animation: "fadeUp 0.25s ease",
              border: `1px solid ${t.modalBorder}`
            }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: t.buttonDeleteBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16
              }}>
                <Trash2 size={22} color={t.buttonDeleteColor} />
              </div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", fontWeight: 700, color: t.textPrimary, margin: "0 0 8px" }}>
                Delete Plan
              </h2>
              <p style={{ color: t.textMuted, fontSize: "0.875rem", margin: "0 0 6px", lineHeight: 1.6 }}>
                Are you sure you want to delete the <strong style={{ color: t.textPrimary }}>{deleteConfirm.plan_name}</strong> plan?
              </p>
              <p style={{ color: t.buttonDeleteColor, fontSize: "0.82rem", margin: "0 0 24px" }}>
                ⚠ Companies using this plan may be affected. This cannot be undone.
              </p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  style={{
                    padding: "9px 20px",
                    border: `1.5px solid ${t.inputBorder}`,
                    background: t.card,
                    borderRadius: 10,
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    color: t.textSecondary,
                    fontFamily: "inherit"
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  style={{
                    padding: "9px 20px",
                    background: t.buttonDeleteColor,
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit"
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PricingPage;