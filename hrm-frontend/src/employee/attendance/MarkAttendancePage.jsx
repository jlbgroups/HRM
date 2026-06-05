import React, { useState, useEffect } from "react";
import Sidebar from "../../layouts/sidebar";
import MobileTopBar from "../MobileTopBar";
import {
  CheckCircle, LogOut, MapPin, Clock, ArrowUpRight, Timer,
} from "lucide-react";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";

function MarkAttendance() {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [hasOpenSession, setHasOpenSession] = useState(false);
  const [marked, setMarked] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [dayCheckIn, setDayCheckIn] = useState(null);
  const [dayCheckOut, setDayCheckOut] = useState(null);

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
    statusNotMarkedBg: isDark ? "#1E2535" : "#F3F4F6",
    statusNotMarkedText: isDark ? "#9CA3AF" : "#6B7280",
    statusCheckedInBg: isDark ? "#064E3B" : "#ECFDF5",
    statusCheckedInText: isDark ? "#6EE7B7" : "#059669",
    statusCheckedOutBg: isDark ? "#1E1B4B" : "#EEF2FF",
    statusCheckedOutText: isDark ? "#818CF8" : "#4F46E5",
    clockIconBg: isDark ? "#1E1B4B" : "#EEF2FF",
    clockIconColor: isDark ? "#818CF8" : "#4F46E5",
    checkInBtnBg: "#4F46E5",
    checkOutBtnBg: "#059669",
    locationColor: "#059669",
  };

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile && !isOpen) setIsOpen(true);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isOpen]);

  const sidebarWidth = isMobile ? 0 : (isOpen ? 255 : 68);

  const getStatus = () => {
    if (!marked) return "NOT_MARKED";
    if (hasOpenSession) return "CHECKED_IN";
    return "CHECKED_OUT";
  };
  const attendanceStatus = getStatus();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchToday = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://hrm-backend-vvqg.onrender.com/api/attendance/today", {
        headers: { "x-auth-token": token },
      });
      const d = res.data;
      setMarked(d.marked || false);
      setHasOpenSession(d.hasOpenSession || false);
      setSessions(d.sessions || []);
      setDayCheckIn(d.check_in || null);
      setDayCheckOut(d.check_out || null);
    } catch (err) {
      console.error("Error fetching today attendance:", err);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => { fetchToday(); }, []);

  const handleAttendance = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const res = await axios.post(
        "https://hrm-backend-vvqg.onrender.com/api/attendance/mark",
        { status: "present" },
        { headers: { "x-auth-token": token } }
      );
      if (res.data.success) await fetchToday();
    } catch (error) {
      alert(error.response?.data?.msg || "Error marking attendance");
    } finally {
      setLoading(false);
    }
  };

  const calcDuration = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return null;
    const toSec = (t) => {
      const [h, m, s] = t.split(":").map(Number);
      return h * 3600 + m * 60 + (s || 0);
    };
    const diff = toSec(checkOut) - toSec(checkIn);
    if (diff <= 0) return "< 1 min";
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const totalWorked = () => {
    const toSec = (t) => {
      if (!t) return 0;
      const [h, m, s] = t.split(":").map(Number);
      return h * 3600 + m * 60 + (s || 0);
    };
    const totalSec = sessions
      .filter((s) => s.check_in && s.check_out)
      .reduce((acc, s) => acc + Math.max(0, toSec(s.check_out) - toSec(s.check_in)), 0);
    if (totalSec === 0) return "0m";
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const statusConfig = {
    NOT_MARKED: { label: "Not Marked", color: t.statusNotMarkedText, bg: t.statusNotMarkedBg, dot: t.textMuted },
    CHECKED_IN: { label: "Checked In", color: t.statusCheckedInText, bg: t.statusCheckedInBg, dot: t.statusCheckedInText },
    CHECKED_OUT: { label: "Checked Out", color: t.statusCheckedOutText, bg: t.statusCheckedOutBg, dot: t.statusCheckedOutText },
  };
  const status = statusConfig[attendanceStatus];

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: t.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse   { 0%,100% { opacity:1; } 50% { opacity:0.35; } }
        @keyframes spin    { to { transform:rotate(360deg); } }
        .att-btn { transition:opacity .18s,transform .18s,box-shadow .18s; border:none; cursor:pointer; }
        .att-btn:hover:not(:disabled) { opacity:.88; transform:translateY(-2px); box-shadow:0 8px 20px rgba(0,0,0,.13); }
        .att-btn:disabled { opacity:.38; cursor:not-allowed; transform:none !important; box-shadow:none !important; }
        .sess-row:hover { background:${t.rowHover} !important; }
        * { box-sizing:border-box; }
        @media (max-width: 768px) {
          .att-main      { padding: 72px 14px 32px !important; }
          .att-layout    { flex-direction: column !important; gap: 14px !important; }
          .att-card-col  { flex: none !important; width: 100% !important; }
          .att-sessions-col { flex: none !important; width: 100% !important; min-width: 0 !important; }
          .att-session-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .att-session-wrap table { min-width: 520px; }
          .att-summary-grid { grid-template-columns: repeat(2,1fr) !important; }
          .att-time-display { font-size: 2rem !important; }
          .att-clock-card   { padding: 20px !important; }
          .att-btn-row      { gap: 8px !important; }
          .att-page-heading { font-size: 1.45rem !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .att-main   { padding: 28px 20px 40px !important; }
          .att-layout { flex-wrap: wrap; }
          .att-card-col { flex: 0 0 320px !important; }
          .att-sessions-col { flex: 1 1 300px !important; min-width: 0 !important; }
        }
      `}</style>

      <MobileTopBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="att-main" style={{
        marginLeft: `${sidebarWidth}px`,
        flex: 1,
        transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
        padding: "28px 28px 40px",
        minWidth: 0,
      }}>
        <div style={{ marginBottom: "24px", animation: "fadeUp 0.4s ease both 0.05s" }}>
          <p style={{ color: t.textSecondary, fontSize: "0.875rem", margin: "0 0 4px" }}>Daily Tracking</p>
          <h1 className="att-page-heading" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.85rem", fontWeight: "700", color: t.textPrimary, margin: 0, lineHeight: 1.2 }}>
            Mark Attendance
          </h1>
          <p style={{ color: t.textMuted, fontSize: "0.85rem", margin: "5px 0 0" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {pageLoading ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: t.textMuted }}>
            <div style={{ width: "20px", height: "20px", border: "2px solid #E5E7EB", borderTop: "2px solid #4F46E5", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <span style={{ fontSize: "0.875rem", fontWeight: "500" }}>Loading attendance…</span>
          </div>
        ) : (
          <div className="att-layout" style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
            <div className="att-card-col" style={{ flex: "0 0 310px", animation: "fadeUp 0.4s ease both 0.1s" }}>
              <div className="att-clock-card" style={{ backgroundColor: t.card, borderRadius: "14px", padding: "28px", border: `1px solid ${t.border}`, boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.05)", marginBottom: "14px", textAlign: "center" }}>
                <div style={{ width: "52px", height: "52px", borderRadius: "14px", backgroundColor: t.clockIconBg, display: "flex", alignItems: "center", justifyContent: "center", color: t.clockIconColor, margin: "0 auto 14px" }}>
                  <Clock size={24} />
                </div>

                <div className="att-time-display" style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.6rem", fontWeight: "700", color: t.textPrimary, letterSpacing: "1px", lineHeight: 1, marginBottom: "14px" }}>
                  {currentTime.toLocaleTimeString()}
                </div>

                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 14px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: "600", backgroundColor: status.bg, color: status.color, marginBottom: "20px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: status.dot, animation: attendanceStatus === "CHECKED_IN" ? "pulse 1.5s ease infinite" : "none" }} />
                  {status.label}
                </span>

                <div style={{ height: "1px", background: t.border, margin: "0 0 18px" }} />

                <div className="att-btn-row" style={{ display: "flex", gap: "10px" }}>
                  <button
                    className="att-btn"
                    onClick={handleAttendance}
                    disabled={loading || attendanceStatus === "CHECKED_IN"}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", padding: "11px 8px", borderRadius: "10px", fontWeight: "600", fontSize: "0.855rem", backgroundColor: t.checkInBtnBg, color: "#fff", fontFamily: "'DM Sans',sans-serif" }}
                  >
                    <CheckCircle size={15} />
                    {loading && attendanceStatus !== "CHECKED_IN" ? "Wait…" : "Check In"}
                  </button>
                  <button
                    className="att-btn"
                    onClick={handleAttendance}
                    disabled={loading || attendanceStatus !== "CHECKED_IN"}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", padding: "11px 8px", borderRadius: "10px", fontWeight: "600", fontSize: "0.855rem", backgroundColor: t.checkOutBtnBg, color: "#fff", fontFamily: "'DM Sans',sans-serif" }}
                  >
                    <LogOut size={15} />
                    {loading && attendanceStatus === "CHECKED_IN" ? "Wait…" : "Check Out"}
                  </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", marginTop: "12px", fontSize: "0.75rem" }}>
                  <MapPin size={12} style={{ color: t.locationColor }} />
                  <span style={{ color: t.locationColor, fontWeight: "500" }}>Location Verified</span>
                </div>
              </div>
              {marked && (
                <div style={{ backgroundColor: t.card, borderRadius: "14px", padding: "16px 18px", border: `1px solid ${t.border}`, boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.05)", marginBottom: "14px" }}>
                  <div style={{ fontSize: "0.68rem", fontWeight: "600", color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "12px" }}>
                    Today's Summary
                  </div>
                  <div className="att-summary-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px" }}>
                    {[
                      { label: "First In", value: dayCheckIn || "—", color: t.clockIconColor, bg: t.clockIconBg },
                      { label: "Last Out", value: dayCheckOut || (hasOpenSession ? "Active" : "—"), color: hasOpenSession ? t.statusCheckedInText : t.statusNotMarkedText, bg: hasOpenSession ? t.statusCheckedInBg : t.statusNotMarkedBg },
                      { label: "Sessions", value: sessions.length, color: t.clockIconColor, bg: t.clockIconBg },
                      { label: "Worked", value: totalWorked(), color: t.statusCheckedInText, bg: t.statusCheckedInBg },
                    ].map((item, i) => (
                      <div key={i} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "0.78rem", fontWeight: "700", color: item.color, backgroundColor: item.bg, borderRadius: "8px", padding: "5px 3px", marginBottom: "4px" }}>
                          {item.value}
                        </div>
                        <div style={{ fontSize: "0.65rem", color: t.textMuted }}>{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {attendanceStatus === "CHECKED_OUT" && (
                <div style={{ backgroundColor: t.card, borderRadius: "14px", padding: "13px 16px", border: `1px solid ${t.border}`, boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.05)", display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: t.clockIconBg, color: t.clockIconColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <ArrowUpRight size={15} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.8rem", fontWeight: "600", color: t.textSecondary, marginBottom: "2px" }}>You can Check In again</div>
                    <div style={{ fontSize: "0.72rem", color: t.textMuted }}>Multiple sessions allowed per day.</div>
                  </div>
                </div>
              )}
            </div>
            {sessions.length > 0 && (
              <div className="att-sessions-col" style={{ flex: 1, minWidth: 0, animation: "fadeUp 0.4s ease both 0.18s" }}>
                <div style={{ backgroundColor: t.card, borderRadius: "14px", border: `1px solid ${t.border}`, boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.05)", overflow: "hidden" }}>
                  <div style={{ padding: "14px 18px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: t.clockIconBg, color: t.clockIconColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Timer size={15} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: "0.9rem", fontWeight: "600", color: t.textPrimary, margin: 0 }}>Session History</h2>
                      <p style={{ fontSize: "0.72rem", color: t.textMuted, margin: 0 }}>
                        {sessions.length} session{sessions.length !== 1 ? "s" : ""} today
                      </p>
                    </div>
                    <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 11px", borderRadius: "20px", fontSize: "0.73rem", fontWeight: "600", backgroundColor: t.statusCheckedInBg, color: t.statusCheckedInText }}>
                      <Clock size={11} />{totalWorked()} worked
                    </span>
                  </div>
                  <div className="att-session-wrap">
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ backgroundColor: t.tableHead }}>
                          {["#", "Check In", "Check Out", "Duration", "Status"].map((h, i) => (
                            <th key={i} style={{ padding: "9px 14px", textAlign: "left", fontSize: "0.68rem", fontWeight: "600", color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: `1px solid ${t.border}`, whiteSpace: "nowrap" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sessions.map((session, i) => {
                          const sessionOpen = !session.check_out;
                          const duration = calcDuration(session.check_in, session.check_out);
                          return (
                            <tr key={session._id} className="sess-row" style={{ borderBottom: `1px solid ${t.border}` }}>
                              <td style={{ padding: "11px 14px", fontSize: "0.78rem", color: t.textMuted, fontWeight: "500" }}>
                                {String(i + 1).padStart(2, "0")}
                              </td>
                              <td style={{ padding: "11px 14px" }}>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "0.84rem", fontWeight: "500", color: t.textPrimary }}>
                                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: t.clockIconColor, flexShrink: 0 }} />
                                  {session.check_in}
                                </span>
                              </td>
                              <td style={{ padding: "11px 14px" }}>
                                {sessionOpen ? (
                                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "0.78rem", fontWeight: "600", color: t.statusCheckedInText }}>
                                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: t.statusCheckedInText, animation: "pulse 1.5s ease infinite" }} />
                                    Active
                                  </span>
                                ) : (
                                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "0.84rem", fontWeight: "500", color: t.textSecondary }}>
                                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: t.textMuted, flexShrink: 0 }} />
                                    {session.check_out}
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: "11px 14px", fontSize: "0.82rem", color: t.textMuted, fontWeight: "500" }}>
                                {sessionOpen ? "—" : (duration || "< 1 min")}
                              </td>
                              <td style={{ padding: "11px 14px" }}>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 9px", borderRadius: "20px", fontSize: "0.68rem", fontWeight: "600", backgroundColor: sessionOpen ? t.statusCheckedInBg : t.statusNotMarkedBg, color: sessionOpen ? t.statusCheckedInText : t.textMuted }}>
                                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: sessionOpen ? t.statusCheckedInText : t.textMuted }} />
                                  {sessionOpen ? "Active" : "Done"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ padding: "10px 16px", borderTop: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
                    <span style={{ fontSize: "0.73rem", color: t.textMuted }}>
                      {sessions.length} session{sessions.length !== 1 ? "s" : ""} today
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={11} style={{ color: t.textMuted }} />
                      <span style={{ fontSize: "0.68rem", color: t.textMuted }}>Updated just now</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MarkAttendance;