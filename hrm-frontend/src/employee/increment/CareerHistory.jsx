import React, { useState, useEffect } from "react";
import Sidebar from "../../layouts/sidebar";
import MobileTopBar from "../../employee/MobileTopBar";
import { TrendingUp, Award, Calendar, DollarSign, Briefcase, Clock } from "lucide-react";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";

function CareerHistory() {
  const { isDark } = useTheme();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState(null);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const name = localStorage.getItem("name") || "Employee";
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
    currentCardBg: "linear-gradient(135deg, #4F46E5, #7C3AED)",
    promotionBorder: isDark ? "#8B5CF6" : "#8B5CF6",
    incrementBorder: isDark ? "#059669" : "#059669",
    timelineBg: isDark ? "#1E2535" : "#E5E7EB",
    cardBg: isDark ? "#1E2535" : "#F9FAFB",
    errorBg: isDark ? "#2D0F0F" : "#FEE2E2",
    errorText: isDark ? "#F87171" : "#DC2626",
    promotionText: isDark ? "#A78BFA" : "#8B5CF6",
    incrementText: isDark ? "#34D399" : "#059669",
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
  const API_URL = import.meta.env.VITE_API_URL || "https://hrm-backend-vvqg.onrender.com";

  const fetchEmployeeData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/employees/me`, {
        headers: { "x-auth-token": token },
      });
      setEmployee(res.data.data);
    } catch (error) {
      console.error("Error fetching employee:", error);
      setError("Could not load employee data");
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/increment/my-history`, {
        headers: { "x-auth-token": token },
      });
      
      const sortedHistory = (res.data.data || []).sort((a, b) => 
        new Date(b.effective_date) - new Date(a.effective_date)
      );
      setHistory(sortedHistory);
    } catch (error) {
      console.error("Error fetching history:", error);
      if (error.response?.status !== 404) {
        setError("Failed to load career history");
      }
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
    fetchHistory();
  }, []);

  const getTimelineIcon = (type) => {
    return type === "promotion" ? <Award size={24} /> : <TrendingUp size={24} />;
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: t.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .timeline-dot { transition: transform 0.2s; }
        .timeline-card:hover .timeline-dot { transform: scale(1.2); }
        .history-card { transition: box-shadow 0.2s, transform 0.15s; }
        .history-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); transform: translateY(-2px); }
        @media (max-width: 768px) {
          .career-topbar { display: none !important; }
          .career-main { padding: 72px 14px 32px !important; }
          .career-current { flex-direction: column !important; gap: 12px !important; }
          .career-page-title { font-size: 1.45rem !important; }
        }
      `}</style>

      <MobileTopBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div style={{ marginLeft: `${sidebarWidth}px`, flex: 1, transition: "margin-left 0.25s", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <div className="career-topbar" style={{ height: "64px", backgroundColor: t.topbar, borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", padding: "0 28px", position: "sticky", top: 0, zIndex: 100, boxShadow: isDark ? "0 1px 4px rgba(0,0,0,0.3)" : "0 1px 4px rgba(15,23,42,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "9px", marginLeft: "auto", padding: "5px 12px 5px 6px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "10px", background: t.card }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #4F46E5, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.72rem", fontWeight: "600" }}>
              {name.slice(0, 2).toUpperCase()}
            </div>
            <span style={{ fontSize: "0.83rem", fontWeight: "500", color: t.textPrimary }}>{name}</span>
          </div>
        </div>

        <main className="career-main" style={{ padding: "28px 28px 40px", flex: 1 }}>
          <div style={{ marginBottom: "24px", animation: "fadeUp 0.4s ease both" }}>
            <p style={{ color: t.textSecondary, fontSize: "0.875rem", margin: "0 0 4px" }}>
              {greeting}, <strong style={{ color: "#4F46E5" }}>{name}</strong> 👋
            </p>
            <h1 className="career-page-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.85rem", fontWeight: "700", color: t.textPrimary, margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
              <Briefcase size={28} /> Career History
            </h1>
            <p style={{ color: t.textMuted, fontSize: "0.85rem", marginTop: "6px" }}>Track your salary increments and promotions</p>
          </div>

          {employee ? (
            <div style={{
              background: t.currentCardBg,
              borderRadius: "16px",
              padding: "24px",
              marginBottom: "28px",
              color: "#fff",
              animation: "fadeUp 0.4s ease 0.05s both"
            }}>
              <h2 style={{ fontSize: "0.9rem", fontWeight: "500", opacity: 0.9, marginBottom: "12px" }}>Current Position</h2>
              <div className="career-current" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>Designation</div>
                  <div style={{ fontSize: "1.3rem", fontWeight: "700" }}>{employee.designation || "Not Assigned"}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>Current Salary</div>
                  <div style={{ fontSize: "1.3rem", fontWeight: "700" }}>₹{employee.salary?.toLocaleString() || "0"}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>Employee Name</div>
                  <div style={{ fontSize: "1rem", fontWeight: "600" }}>{employee.name || "N/A"}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>Employee ID</div>
                  <div style={{ fontSize: "1rem", fontWeight: "600" }}>{employee.employee_id || "N/A"}</div>
                </div>
              </div>
            </div>
          ) : (
            !error && (
              <div style={{
                background: t.currentCardBg,
                borderRadius: "16px",
                padding: "24px",
                marginBottom: "28px",
                color: "#fff",
                textAlign: "center"
              }}>
                Loading employee data...
              </div>
            )
          )}

          <div style={{ backgroundColor: t.card, borderRadius: "14px", border: `1px solid ${t.border}`, padding: "28px", animation: "fadeUp 0.4s ease 0.1s both", boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.05)" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px", color: t.textPrimary }}>
              <Calendar size={18} /> Career Timeline
            </h2>
            
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px", color: t.textMuted }}>Loading...</div>
            ) : error ? (
              <div style={{ textAlign: "center", padding: "40px", color: t.errorText }}>
                {error}
              </div>
            ) : history.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: t.textMuted }}>
                No career history available yet
              </div>
            ) : (
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "28px", top: "8px", bottom: "8px", width: "2px", background: t.timelineBg }}></div>
                
                {history.map((record, index) => {
                  const isPromotion = record.type === "promotion";
                  const borderColor = isPromotion ? t.promotionBorder : t.incrementBorder;
                  const iconColor = isPromotion ? t.promotionText : t.incrementText;
                  
                  return (
                    <div key={record._id || index} style={{ position: "relative", marginBottom: "24px", paddingLeft: "60px" }}>
                      <div className="timeline-dot" style={{
                        position: "absolute",
                        left: "16px",
                        top: "0",
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: t.card,
                        border: `2px solid ${borderColor}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1
                      }}>
                        {isPromotion ? <Award size={14} color={iconColor} /> : <TrendingUp size={14} color={iconColor} />}
                      </div>
                      
                      <div className="history-card" style={{
                        background: t.cardBg,
                        borderRadius: "10px",
                        padding: "16px",
                        border: `1px solid ${t.border}`,
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
                          <h3 style={{ fontSize: "1rem", fontWeight: "600", margin: 0, color: t.textPrimary }}>
                            {isPromotion ? "🎉 Promotion" : "📈 Salary Increment"}
                          </h3>
                          <span style={{ fontSize: "0.7rem", color: t.textMuted, background: t.inputBg, padding: "3px 10px", borderRadius: "20px" }}>
                            <Clock size={10} style={{ display: "inline", marginRight: "4px" }} />
                            {new Date(record.effective_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                          </span>
                        </div>
                        
                        {isPromotion ? (
                          <div>
                            <div style={{ marginBottom: "8px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                                <Briefcase size={14} style={{ color: t.textMuted }} />
                                <span style={{ fontSize: "0.85rem", color: t.textSecondary }}>
                                  From: <span style={{ textDecoration: "line-through", color: t.textMuted }}>{record.old_designation || "N/A"}</span>
                                </span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <Award size={14} style={{ color: t.promotionText }} />
                                <span style={{ fontSize: "0.85rem", color: t.textSecondary }}>
                                  To: <strong style={{ color: t.promotionText }}>{record.new_designation || "N/A"}</strong>
                                </span>
                              </div>
                            </div>
                            
                            {record.new_salary && record.old_salary && record.new_salary !== record.old_salary && (
                              <div style={{ marginTop: "12px", paddingTop: "8px", borderTop: `1px solid ${t.border}` }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                                  <DollarSign size={14} style={{ color: t.textMuted }} />
                                  <span style={{ fontSize: "0.85rem", color: t.textSecondary }}>
                                    Previous Salary: <span style={{ textDecoration: "line-through", color: t.textMuted }}>₹{record.old_salary?.toLocaleString()}</span>
                                  </span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <TrendingUp size={14} style={{ color: t.incrementText }} />
                                  <span style={{ fontSize: "0.85rem", color: t.textSecondary }}>
                                    New Salary: <strong style={{ color: t.incrementText }}>₹{record.new_salary?.toLocaleString()}</strong>
                                  </span>
                                </div>
                                <div style={{ fontSize: "0.7rem", color: t.textMuted, marginTop: "6px" }}>
                                  Increase: ₹{(record.new_salary - record.old_salary).toLocaleString()} 
                                  ({(((record.new_salary - record.old_salary) / record.old_salary) * 100).toFixed(1)}%)
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                              <DollarSign size={14} style={{ color: t.textMuted }} />
                              <span style={{ fontSize: "0.85rem", color: t.textSecondary }}>
                                Previous: <span style={{ textDecoration: "line-through", color: t.textMuted }}>₹{record.old_salary?.toLocaleString()}</span>
                              </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                              <TrendingUp size={14} style={{ color: t.incrementText }} />
                              <span style={{ fontSize: "0.85rem", color: t.textSecondary }}>
                                New: <strong style={{ color: t.incrementText }}>₹{record.new_salary?.toLocaleString()}</strong>
                              </span>
                            </div>
                            {record.old_salary && record.new_salary && (
                              <div style={{ fontSize: "0.7rem", color: t.textMuted, marginTop: "6px" }}>
                                Increase: ₹{(record.new_salary - record.old_salary).toLocaleString()} 
                                ({(((record.new_salary - record.old_salary) / record.old_salary) * 100).toFixed(1)}%)
                              </div>
                            )}
                          </div>
                        )}
                        
                        {record.remarks && (
                          <div style={{ marginTop: "12px", paddingTop: "8px", borderTop: `1px solid ${t.border}`, fontSize: "0.75rem", color: t.textMuted }}>
                            📝 {record.remarks}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default CareerHistory;