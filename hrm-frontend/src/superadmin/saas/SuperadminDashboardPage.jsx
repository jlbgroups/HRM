import React, { useState } from "react";
import Sidebar from "../../layouts/sidebar";
import MobileTopBar from "../../employee/MobileTopBar";
import { Shield, Building, Users, Settings, Search, Bell, MoreHorizontal, ArrowUpRight } from "lucide-react";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";

const SuperadminDashboardPage = () => {
  const { isDark } = useTheme();
  const [companies, setCompanies] = useState([]);
  const [globalStats, setGlobalStats] = useState({
    totalCompanies: 0,
    totalUsers: 0,
    activeLicenses: 0,
    systemAlerts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);

  const name = localStorage.getItem("name") || "Superadmin";
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
    tableHead: isDark ? "#111827" : "#FAFBFF",
    statIconBg1: isDark ? "#1E1B4B" : "#EEF2FF",
    statIconBg2: isDark ? "#064E3B" : "#ECFDF5",
    statIconBg3: isDark ? "#1E1B4B" : "#ECFEFF",
    statIconBg4: isDark ? "#451A03" : "#FFFBEB",
    statIconColor1: isDark ? "#818CF8" : "#4F46E5",
    statIconColor2: isDark ? "#34D399" : "#059669",
    statIconColor3: isDark ? "#38BDF8" : "#0891B2",
    statIconColor4: isDark ? "#FCD34D" : "#D97706",
    trendUp: isDark ? "#34D399" : "#059669",
    trendDown: isDark ? "#FCD34D" : "#D97706",
    superadminBadgeBg: "linear-gradient(135deg,#DC2626,#B91C1C)",
    superadminText: "#DC2626",
    alertDotBg: "#EF4444",
    planBadgeBg: isDark ? "#1E1B4B" : "#EEF2FF",
    planBadgeColor: isDark ? "#818CF8" : "#4F46E5",
    activeBadgeBg: isDark ? "#064E3B" : "#ECFDF5",
    activeBadgeColor: isDark ? "#6EE7B7" : "#059669",
    inactiveBadgeBg: isDark ? "#2D0F0F" : "#FEF2F2",
    inactiveBadgeColor: isDark ? "#F87171" : "#DC2626",
    statBorder: isDark ? "#1E2535" : "#F1F3F9",
  };

  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      if (!mobile && !isOpen) setIsOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { "x-auth-token": token };
        const [companiesRes, statsRes] = await Promise.all([
          axios.get("https://hrm-backend-vvqg.onrender.com/api/saas/companies", { headers }),
          axios.get("https://hrm-backend-vvqg.onrender.com/api/saas/summary", { headers }),
        ]);
        if (companiesRes.data.success) setCompanies(companiesRes.data.data);
        if (statsRes.data.success) setGlobalStats(statsRes.data.data);
      } catch (err) {
        console.error("Error fetching superadmin dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const stats = [
    { title: "Total Companies", count: globalStats.totalCompanies, icon: <Building size={20} />, bg: t.statIconBg1, color: t.statIconColor1, trend: "All registered", trendUp: true },
    { title: "Active Licenses", count: globalStats.activeLicenses, icon: <Shield size={20} />, bg: t.statIconBg2, color: t.statIconColor2, trend: "Currently active", trendUp: true },
    { title: "Total Users", count: globalStats.totalUsers, icon: <Users size={20} />, bg: t.statIconBg3, color: t.statIconColor3, trend: "Across all companies", trendUp: true },
    { title: "System Alerts", count: globalStats.systemAlerts, icon: <Settings size={20} />, bg: t.statIconBg4, color: t.statIconColor4, trend: "Needs attention", trendUp: false },
  ];

  const filtered = companies.filter((c) =>
    c.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.pricing_plan?.plan_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: t.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform:rotate(360deg); } }
        .stat-card { transition:transform 0.18s,box-shadow 0.18s; }
        .stat-card:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(15,23,42,0.15) !important; }
        .company-row { transition:background 0.12s; }
        .company-row:hover { background:${t.rowHover} !important; }
        .search-input:focus { outline:none; border-color:#4F46E5 !important; box-shadow:0 0 0 3px rgba(79,70,229,0.10); }
        .topbar-btn:hover { background:${isDark ? "#1E2535" : "#F3F4F6"} !important; }
        * { box-sizing:border-box; }
        @media (max-width: 768px) {
          .sa-main       { padding: 76px 14px 32px !important; }
          .sa-topbar     { display: none !important; }
          .sa-stats-grid { grid-template-columns: repeat(2,1fr) !important; gap:10px !important; }
          .sa-stat-val   { font-size:1.5rem !important; }
          .sa-tbl-wrap   { font-size:0.78rem !important; }
          .sa-tbl-hide   { display:none !important; }
          .sa-head-row   { flex-direction:column !important; align-items:flex-start !important; gap:10px !important; }
          .sa-search-inner { width:100% !important; }
          .sa-search-inner input { width:100% !important; }
          .sa-page-title { font-size:1.5rem !important; }
          .sa-table-search { display:none !important; }
        }
        @media (min-width:769px) and (max-width:1024px) {
          .sa-main       { padding:28px 18px 40px !important; }
          .sa-stats-grid { grid-template-columns:repeat(2,1fr) !important; }
          .sa-tbl-hide   { display:none !important; }
        }
      `}</style>

      <MobileTopBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div style={{
        marginLeft: `${sidebarWidth}px`,
        flex: 1,
        transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column", minHeight: "100vh", minWidth: 0,
      }}>
        <div className="sa-topbar" style={{
          height: "64px", backgroundColor: t.topbar, borderBottom: `1px solid ${t.border}`,
          display: "flex", alignItems: "center", padding: "0 28px", gap: "16px",
          position: "sticky", top: 0, zIndex: 100, boxShadow: isDark ? "0 1px 4px rgba(0,0,0,0.3)" : "0 1px 4px rgba(15,23,42,0.04)",
        }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "380px" }}>
            <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: t.textMuted }} />
            <input
              className="search-input"
              placeholder="Search companies, plans..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "8px 12px 8px 36px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "10px", fontSize: "0.875rem", color: t.textPrimary, backgroundColor: t.inputBg, transition: "border-color 0.18s,box-shadow 0.18s" }}
            />
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
            <button className="topbar-btn" style={{ width: "38px", height: "38px", borderRadius: "10px", border: `1.5px solid ${t.inputBorder}`, background: t.card, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: t.textSecondary, position: "relative" }}>
              <Bell size={17} />
              {globalStats.systemAlerts > 0 && (
                <span style={{ position: "absolute", top: "8px", right: "8px", width: "7px", height: "7px", borderRadius: "50%", background: t.alertDotBg, border: `1.5px solid ${t.card}` }} />
              )}
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "9px", padding: "5px 12px 5px 6px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "10px", background: t.card, cursor: "pointer" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: t.superadminBadgeBg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.72rem", fontWeight: "600" }}>
                {name.slice(0, 2).toUpperCase()}
              </div>
              <span style={{ fontSize: "0.83rem", fontWeight: "500", color: t.textPrimary }}>{name}</span>
            </div>
          </div>
        </div>

        <div className="sa-main" style={{ padding: "28px 28px 40px", flex: 1 }}>
          <div style={{ marginBottom: "24px", animation: "fadeUp 0.4s ease both 0.05s" }}>
            <p style={{ color: t.textSecondary, fontSize: "0.875rem", margin: "0 0 4px" }}>
              {greeting}, <strong style={{ color: t.superadminText }}>{name}</strong> 👋
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: t.superadminBadgeBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Shield size={16} color="#fff" />
              </div>
              <span style={{ fontSize: "0.78rem", fontWeight: "600", color: t.superadminText, textTransform: "uppercase", letterSpacing: "0.8px" }}>Superadmin</span>
            </div>
            <h1 className="sa-page-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.5rem,4vw,1.85rem)", fontWeight: "700", color: t.textPrimary, margin: 0, lineHeight: 1.2 }}>
              Control Panel
            </h1>
            <p style={{ color: t.textMuted, fontSize: "0.85rem", margin: "5px 0 0" }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          <div className="sa-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "16px", marginBottom: "24px" }}>
            {stats.map((stat, idx) => (
              <div key={idx} className="stat-card" style={{ backgroundColor: t.card, borderRadius: "14px", padding: "20px", border: `1px solid ${t.statBorder}`, boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.05)", animation: `fadeUp 0.4s ease both ${0.1 + idx * 0.07}s` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "11px", backgroundColor: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", color: stat.color }}>
                    {stat.icon}
                  </div>
                  <button style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted, padding: "2px" }}><MoreHorizontal size={16} /></button>
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <div style={{ fontSize: "0.78rem", color: t.textMuted, fontWeight: "500", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.4px" }}>{stat.title}</div>
                  <div className="sa-stat-val" style={{ fontSize: "2rem", fontWeight: "700", color: t.textPrimary, lineHeight: 1, fontFamily: "'Playfair Display', serif" }}>
                    {loading ? <span style={{ display: "inline-block", width: "50px", height: "28px", background: t.skeletonBg, borderRadius: "6px" }} /> : (stat.count || 0)}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <ArrowUpRight size={13} style={{ color: stat.trendUp ? t.trendUp : t.trendDown }} />
                  <span style={{ fontSize: "0.75rem", color: stat.trendUp ? t.trendUp : t.trendDown, fontWeight: "500" }}>{stat.trend}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: t.card, borderRadius: "14px", border: `1px solid ${t.border}`, boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.05)", overflow: "hidden", animation: "fadeUp 0.4s ease both 0.38s" }}>
            <div className="sa-head-row" style={{ padding: "18px 22px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
              <div>
                <h2 style={{ fontSize: "1rem", fontWeight: "600", color: t.textPrimary, margin: "0 0 2px" }}>Company Management</h2>
                <p style={{ fontSize: "0.78rem", color: t.textMuted, margin: 0 }}>{filtered.length} {filtered.length === 1 ? "company" : "companies"} registered</p>
              </div>
              <div className="sa-search-inner sa-table-search" style={{ position: "relative" }}>
                <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: t.textMuted }} />
                <input
                  className="search-input"
                  placeholder="Filter companies..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ padding: "8px 12px 8px 32px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "9px", fontSize: "0.82rem", color: t.textPrimary, backgroundColor: t.inputBg, width: "220px", transition: "border-color 0.18s,box-shadow 0.18s" }}
                />
              </div>
            </div>

            <div className="sa-tbl-wrap" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "520px" }}>
                <thead>
                  <tr style={{ backgroundColor: t.tableHead }}>
                    {["#", "Company", "Subscribed On", "Plan", "Price", "Status"].map((h, i) => (
                      <th key={i} className={i === 2 || i === 4 ? "sa-tbl-hide" : ""} style={{ padding: "11px 18px", textAlign: "left", fontSize: "0.72rem", fontWeight: "600", color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: `1px solid ${t.border}`, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>{[30, 160, 100, 90, 80, 70].map((w, j) => (
                        <td key={j} className={j === 2 || j === 4 ? "sa-tbl-hide" : ""} style={{ padding: "14px 18px" }}>
                          <div style={{ height: "14px", width: `${w}px`, background: t.skeletonBg, borderRadius: "4px" }} />
                        </td>
                      ))}</tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan="6" style={{ padding: "40px", textAlign: "center", color: t.textMuted, fontSize: "0.875rem" }}>No companies found</td></tr>
                  ) : (
                    filtered.map((company, i) => (
                      <tr key={company._id} className="company-row" style={{ borderBottom: `1px solid ${t.border}` }}>
                        <td style={{ padding: "13px 18px", fontSize: "0.82rem", color: t.textMuted, fontWeight: "500" }}>{String(i + 1).padStart(2, "0")}</td>
                        <td style={{ padding: "13px 18px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: `hsl(${(company.company_name?.charCodeAt(0) || 65) * 5 % 360},55%,${isDark ? "45%" : "55%"})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.75rem", fontWeight: "600", flexShrink: 0 }}>
                              {(company.company_name || "?").slice(0, 2).toUpperCase()}
                            </div>
                            <span style={{ fontSize: "0.875rem", fontWeight: "500", color: t.textPrimary }}>{company.company_name}</span>
                          </div>
                        </td>
                        <td className="sa-tbl-hide" style={{ padding: "13px 18px", fontSize: "0.855rem", color: t.textMuted }}>
                          {new Date(company.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td style={{ padding: "13px 18px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: "20px", fontSize: "0.72rem", fontWeight: "600", backgroundColor: t.planBadgeBg, color: t.planBadgeColor }}>
                            {company.pricing_plan?.plan_name || "N/A"}
                          </span>
                        </td>
                        <td className="sa-tbl-hide" style={{ padding: "13px 18px", fontSize: "0.855rem", color: t.textMuted }}>
                          ₹{company.pricing_plan?.price} / {company.pricing_plan?.billing_cycle}
                        </td>
                        <td style={{ padding: "13px 18px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 10px", borderRadius: "20px", fontSize: "0.72rem", fontWeight: "600", backgroundColor: company.is_active ? t.activeBadgeBg : t.inactiveBadgeBg, color: company.is_active ? t.activeBadgeColor : t.inactiveBadgeColor }}>
                            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: company.is_active ? t.activeBadgeColor : t.inactiveBadgeColor }} />
                            {company.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!loading && filtered.length > 0 && (
              <div style={{ padding: "12px 22px", borderTop: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                <span style={{ fontSize: "0.78rem", color: t.textMuted }}>Showing {filtered.length} of {companies.length} companies</span>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <Shield size={12} style={{ color: t.textMuted }} />
                  <span style={{ fontSize: "0.72rem", color: t.textMuted }}>Superadmin view</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperadminDashboardPage;