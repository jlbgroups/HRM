import React, { useState, useEffect } from "react";
import {
  Users, Building2, CheckCircle2, CalendarRange,
  ArrowUpRight, Clock, Search, Bell, MoreHorizontal
} from "lucide-react";
import axios from "axios";
import Sidebar from "../../layouts/sidebar";
import MobileTopBar from "../../employee/MobileTopBar";

const Dashboard = () => {
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [statsData, setStatsData] = useState({
    totalEmployees: 0,
    presentToday: 0,
    pendingLeaves: 0,
    totalCompanies: 0,
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const name = localStorage.getItem("name") || "Admin";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { "x-auth-token": token };
        const [sumRes, empRes] = await Promise.all([
          axios.get("https://hrm-backend-vvqg.onrender.com/api/dashboard/summary", { headers }),
          axios.get("https://hrm-backend-vvqg.onrender.com/api/employees", { headers }),
        ]);
        setStatsData(sumRes.data.data || {});
        setEmployees(empRes.data.data || []);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { title: "Total Users",     count: statsData.totalEmployees, icon: <Users size={19} />,        color: "#4F46E5", bg: "#EEF2FF", trend: "+4 this month",   trendUp: true },
    { title: "Present Today",   count: statsData.presentToday,   icon: <CheckCircle2 size={19} />, color: "#059669", bg: "#ECFDF5", trend: "On track",        trendUp: true },
    { title: "Pending Leaves",  count: statsData.pendingLeaves,  icon: <CalendarRange size={19} />,color: "#D97706", bg: "#FFFBEB", trend: "Needs review",    trendUp: false },
    { title: "Companies",       count: statsData.totalCompanies, icon: <Building2 size={19} />,    color: "#0891B2", bg: "#ECFEFF", trend: "Active accounts", trendUp: true },
  ];

  const filteredEmployees = employees.filter(
    (e) =>
      e.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.email?.toLowerCase().includes(search.toLowerCase())
  );

  const sidebarWidth = isMobile ? 0 : isOpen ? 255 : 68;

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F9FAFB", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .stat-card { transition: transform 0.18s, box-shadow 0.18s; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(15,23,42,0.10) !important; }
        .emp-row { transition: background 0.12s; }
        .emp-row:hover { background: #F5F7FF !important; }
        .search-input:focus { outline: none; border-color: #4F46E5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.10); }
        .topbar-btn:hover { background: #F3F4F6 !important; }
        * { box-sizing: border-box; }
        @media (max-width: 768px) {
          .dash-topbar        { display: none !important; }
          .dash-main          { padding: 72px 14px 32px !important; }
          .dash-stats-grid    { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
          .dash-stat-card     { padding: 14px !important; }
          .dash-stat-val      { font-size: 1.5rem !important; }
          .dash-h1            { font-size: 1.45rem !important; }
          .dash-table-header  { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
          .dash-search-inp    { width: 100% !important; }
          .dash-table-wrap    { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .dash-table-wrap table { min-width: 520px; }
          .dash-col-email     { display: none !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .dash-main       { padding: 24px 20px 32px !important; }
          .dash-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      <MobileTopBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div style={{
        marginLeft: `${sidebarWidth}px`,
        flex: 1,
        transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        minWidth: 0,
      }}>
        <div className="dash-topbar" style={{
          height: "64px", backgroundColor: "#fff",
          borderBottom: "1px solid #F1F3F9",
          display: "flex", alignItems: "center",
          padding: "0 28px", gap: "16px",
          position: "sticky", top: 0, zIndex: 100,
          boxShadow: "0 1px 4px rgba(15,23,42,0.04)",
        }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "380px" }}>
            <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
            <input  aria-label="Search dashboard" className="search-input" placeholder="Search anything..."
              style={{ width: "100%", padding: "8px 12px 8px 36px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "0.875rem", color: "#374151", backgroundColor: "#F9FAFB" }} />
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
            <button   aria-label="View notifications"   title="Notifications" className="topbar-btn" style={{ width: "38px", height: "38px", borderRadius: "10px", border: "1.5px solid #E5E7EB", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6B7280", position: "relative" }}>
              <Bell size={17} />
              <span style={{ position: "absolute", top: "8px", right: "8px", width: "7px", height: "7px", borderRadius: "50%", background: "#EF4444", border: "1.5px solid #fff" }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "9px", padding: "5px 12px 5px 6px", border: "1.5px solid #E5E7EB", borderRadius: "10px", background: "#fff", cursor: "pointer" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #4F46E5, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.72rem", fontWeight: "600" }}>
                {name.slice(0, 2).toUpperCase()}
              </div>
              <span style={{ fontSize: "0.83rem", fontWeight: "500", color: "#374151" }}>{name}</span>
            </div>
          </div>
        </div>
        <main className="dash-main" style={{ padding: "28px 28px 40px", flex: 1 }}>
          <div style={{ marginBottom: "24px", animation: "fadeUp 0.4s ease both 0.05s" }}>
            <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "0 0 4px" }}>
              {greeting}, <strong style={{ color: "#4F46E5" }}>{name}</strong> 👋
            </p>
            <h1 className="dash-h1" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.85rem", fontWeight: "700", color: "#111827", margin: 0, lineHeight: 1.2 }}>
              Admin Dashboard
            </h1>
            <p style={{ color: "#9CA3AF", fontSize: "0.85rem", margin: "5px 0 0" }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="dash-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "24px" }}>
            {stats.map((stat, idx) => (
              <div key={idx} className="stat-card dash-stat-card" style={{ backgroundColor: "#fff", borderRadius: "14px", padding: "18px", border: "1px solid #F1F3F9", boxShadow: "0 2px 8px rgba(15,23,42,0.05)", animation: `fadeUp 0.4s ease both ${0.1 + idx * 0.07}s` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", color: stat.color }}>
                    {stat.icon}
                  </div>
                  <button  aria-label={`More options for ${stat.title}`}  title={`More options for ${stat.title}`} style={{ background: "none", border: "none", cursor: "pointer", color: "#D1D5DB", padding: "2px" }}>
                    <MoreHorizontal size={15} />
                  </button>
                </div>
                <div style={{ fontSize: "0.75rem", color: "#9CA3AF", fontWeight: "500", marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                  {stat.title}
                </div>
                <div className="dash-stat-val" style={{ fontSize: "2rem", fontWeight: "700", color: "#111827", lineHeight: 1, fontFamily: "'Playfair Display', serif", marginBottom: "8px" }}>
                  {loading
                    ? <span style={{ display: "inline-block", width: "50px", height: "28px", background: "#F3F4F6", borderRadius: "5px" }} />
                    : stat.count || 0}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <ArrowUpRight size={12} style={{ color: stat.trendUp ? "#059669" : "#D97706" }} />
                  <span style={{ fontSize: "0.73rem", color: stat.trendUp ? "#059669" : "#D97706", fontWeight: "500" }}>{stat.trend}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ backgroundColor: "#fff", borderRadius: "14px", border: "1px solid #F1F3F9", boxShadow: "0 2px 8px rgba(15,23,42,0.05)", overflow: "hidden", animation: "fadeUp 0.4s ease both 0.38s" }}>
            <div className="dash-table-header" style={{ padding: "16px 20px", borderBottom: "1px solid #F1F3F9", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
              <div>
                <h2 style={{ fontSize: "0.95rem", fontWeight: "600", color: "#111827", margin: "0 0 2px" }}>Employee Directory</h2>
                <p style={{ fontSize: "0.75rem", color: "#9CA3AF", margin: 0 }}>
                  {filteredEmployees.length} {filteredEmployees.length === 1 ? "record" : "records"} found
                </p>
              </div>
              <div style={{ position: "relative", flex: isMobile ? "1 1 100%" : "0 0 auto" }}>
                <Search size={13} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
                <input
                  className="search-input dash-search-inp"
                  placeholder="Search employees..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ padding: "8px 12px 8px 30px", border: "1.5px solid #E5E7EB", borderRadius: "9px", fontSize: "0.82rem", color: "#374151", backgroundColor: "#F9FAFB", width: "220px" }}
                />
              </div>
            </div>

            <div className="dash-table-wrap">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#FAFBFF" }}>
                    {["#", "Employee", "Email", "Status"].map((h, i) => (
                      <th key={i} className={i === 2 ? "dash-col-email" : ""} style={{ padding: "10px 18px", textAlign: "left", fontSize: "0.68rem", fontWeight: "600", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #F1F3F9", whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {[30, 130, 180, 70].map((w, j) => (
                          <td key={j} className={j === 2 ? "dash-col-email" : ""} style={{ padding: "13px 18px" }}>
                            <div style={{ height: "13px", width: `${w}px`, background: "#F3F4F6", borderRadius: "4px" }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ padding: "44px", textAlign: "center", color: "#9CA3AF", fontSize: "0.875rem" }}>
                        No employees found
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp, i) => (
                      <tr key={i} className="emp-row" style={{ borderBottom: "1px solid #F9FAFB" }}>
                        <td style={{ padding: "12px 18px", fontSize: "0.8rem", color: "#9CA3AF", fontWeight: "500" }}>
                          {String(i + 1).padStart(2, "0")}
                        </td>
                        <td style={{ padding: "12px 18px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                            <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: `hsl(${(emp.name?.charCodeAt(0) || 65) * 5 % 360}, 55%, 55%)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.72rem", fontWeight: "600", flexShrink: 0 }}>
                              {(emp.name || "?").slice(0, 2).toUpperCase()}
                            </div>
                            <span style={{ fontSize: "0.855rem", fontWeight: "500", color: "#111827", whiteSpace: "nowrap" }}>{emp.name}</span>
                          </div>
                        </td>
                        <td className="dash-col-email" style={{ padding: "12px 18px", fontSize: "0.84rem", color: "#6B7280" }}>{emp.email}</td>
                        <td style={{ padding: "12px 18px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 10px", borderRadius: "20px", fontSize: "0.7rem", fontWeight: "600", backgroundColor: "#ECFDF5", color: "#059669", whiteSpace: "nowrap" }}>
                            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#059669" }} />
                            Active
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!loading && filteredEmployees.length > 0 && (
              <div style={{ padding: "10px 20px", borderTop: "1px solid #F1F3F9", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
                <span style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>
                  Showing {filteredEmployees.length} of {employees.length} employees
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Clock size={11} style={{ color: "#9CA3AF" }} />
                  <span style={{ fontSize: "0.7rem", color: "#9CA3AF" }}>Updated just now</span>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;