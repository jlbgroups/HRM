import React, { useState, useEffect } from "react";
import Sidebar from "../../layouts/sidebar";
import MobileTopBar from "../MobileTopBar";
import { Clock, Calendar, FileText, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";

const API = import.meta.env.VITE_API_URL || "https://hrm-backend-vvqg.onrender.com";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [statsData, setStatsData] = useState({
    attendanceToday: "Loading...",
    leaveBalance: "0 Days",
    upcomingHolidays: "0",
    payslipsCount: "0",
  });
  const [loading, setLoading] = useState(true);

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
    statIconBg1: isDark ? "#064E3B" : "#ECFDF5",
    statIconBg2: isDark ? "#1E1B4B" : "#EEF2FF",
    statIconBg3: isDark ? "#451A03" : "#FFFBEB",
    statIconBg4: isDark ? "#1E1B4B" : "#EEF2FF",
    statIconColor1: isDark ? "#34D399" : "#059669",
    statIconColor2: isDark ? "#818CF8" : "#4F46E5",
    statIconColor3: isDark ? "#FCD34D" : "#D97706",
    statIconColor4: isDark ? "#818CF8" : "#4F46E5",
    trendColor: isDark ? "#34D399" : "#059669",
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      if (!mobile && !isOpen) setIsOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const trueRole = localStorage.getItem("true_role");
        const employeeId = localStorage.getItem("employee_id");
        const params = new URLSearchParams();
        if (trueRole === "company_admin") {
          params.append("mode", "self");
          if (employeeId) params.append("employee_id", employeeId);
        }
        const summaryRes = await axios.get(
          `${API}/api/dashboard/summary?${params.toString()}`,
          { headers: { "x-auth-token": token } }
        );
        if (summaryRes.data.success) {
          const s = summaryRes.data.data;
          setStatsData({
            attendanceToday: s.attendanceToday || "Not Marked",
            leaveBalance: `${s.leaveBalance ?? 0} Days`,
            upcomingHolidays: String(s.upcomingHolidays || 0),
            payslipsCount: String(s.payslipsCount || 0),
          });
        }
      } catch (error) {
        console.error("Error fetching employee dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const stats = [
    {
      title: "Attendance Today",
      val: statsData.attendanceToday,
      icon: <Clock size={20} />,
      color: t.statIconColor1, bg: t.statIconBg1,
      sub: "Today's status",
    },
    {
      title: "Leave Balance",
      val: statsData.leaveBalance,
      icon: <Calendar size={20} />,
      color: t.statIconColor2, bg: t.statIconBg2,
      sub: "Remaining days",
    },
    {
      title: "Upcoming Holidays",
      val: statsData.upcomingHolidays,
      icon: <Star size={20} />,
      color: t.statIconColor3, bg: t.statIconBg3,
      sub: "This month",
    },
    {
      title: "Payslips Available",
      val: statsData.payslipsCount,
      icon: <FileText size={20} />,
      color: t.statIconColor4, bg: t.statIconBg4,
      sub: "Click to view",
      isClickable: true,
    },
  ];

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", backgroundColor: t.bg, fontFamily: "'DM Sans', sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap'); @keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <MobileTopBar isOpen={isOpen} setIsOpen={setIsOpen} />
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
        <div style={{ marginLeft: `${sidebarWidth}px`, flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: "44px", height: "44px", border: "3px solid #E5E7EB", borderTop: "3px solid #4F46E5", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
            <p style={{ color: t.textMuted, fontWeight: "500", fontSize: "0.9rem" }}>Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: t.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .emp-stat-card { transition: transform 0.18s, box-shadow 0.18s; }
        .emp-stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(15,23,42,0.15) !important; }
        * { box-sizing: border-box; }
        @media (max-width: 768px) {
          .emp-main { padding: 76px 16px 32px !important; }
          .emp-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .emp-stat-card { padding: 16px !important; }
          .emp-stat-val { font-size: 1.5rem !important; }
          .emp-stat-icon { width: 38px !important; height: 38px !important; margin-bottom: 10px !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .emp-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      <MobileTopBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div
        className="emp-main"
        style={{
          marginLeft: `${sidebarWidth}px`,
          flex: 1,
          transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
          padding: "28px 28px 40px",
        }}
      >
        <div style={{ marginBottom: "28px", animation: "fadeUp 0.4s ease both 0.05s" }}>
          <p style={{ color: t.textSecondary, fontSize: "0.875rem", margin: "0 0 4px" }}>
            {greeting}, <strong style={{ color: "#4F46E5" }}>{name}</strong> 👋
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.5rem, 4vw, 1.85rem)", fontWeight: "700", color: t.textPrimary, margin: 0, lineHeight: 1.2 }}>
            My Dashboard
          </h1>
          <p style={{ color: t.textMuted, fontSize: "0.85rem", margin: "5px 0 0" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        <div className="emp-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "16px" }}>
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="emp-stat-card"
              onClick={() => stat.isClickable && navigate("/employee/payroll")}
              style={{
                backgroundColor: t.card, borderRadius: "14px", padding: "20px",
                border: `1px solid ${t.border}`,
                boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.05)",
                animation: `fadeUp 0.4s ease both ${0.1 + idx * 0.07}s`,
                cursor: stat.isClickable ? "pointer" : "default",
              }}
            >
              <div className="emp-stat-icon" style={{ width: "42px", height: "42px", borderRadius: "11px", backgroundColor: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", color: stat.color, marginBottom: "14px" }}>
                {stat.icon}
              </div>
              <div style={{ fontSize: "0.78rem", color: t.textMuted, fontWeight: "500", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                {stat.title}
              </div>
              <div className="emp-stat-val" style={{ fontSize: "1.8rem", fontWeight: "700", color: t.textPrimary, lineHeight: 1, fontFamily: "'Playfair Display', serif", marginBottom: "8px" }}>
                {stat.val}
              </div>
              <div style={{ fontSize: "0.75rem", color: t.trendColor, fontWeight: "500" }}>
                {stat.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;