import React, { useState, useEffect } from "react";
import Sidebar from "../../layouts/sidebar";
import MobileTopBar from "../MobileTopBar";
import { ClipboardList, Calendar, User, AlertCircle, CheckCircle, Clock, Loader2, ChevronRight } from "lucide-react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "https://hrm-backend-vvqg.onrender.com";

const STATUS_OPTIONS = [
  { value: "pending",     label: "Pending",     bg: "#FFF7ED", color: "#C2410C", dot: "#F97316" },
  { value: "in_progress", label: "In Progress", bg: "#EFF6FF", color: "#1D4ED8", dot: "#3B82F6" },
  { value: "completed",   label: "Completed",   bg: "#F0FDF4", color: "#15803D", dot: "#22C55E" },
];

const statusMap = Object.fromEntries(STATUS_OPTIONS.map(s => [s.value, s]));

const useWindowWidth = () => {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
};

const MyTasks = () => {
  const width = useWindowWidth();
  const isMobile = width <= 768;
  const isTablet = width > 768 && width <= 1024;

  const [isOpen, setIsOpen]     = useState(width > 768);
  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState(null);
  const [error, setError]       = useState("");
  const [filter, setFilter]     = useState("all");

  const name     = localStorage.getItem("name") || "Employee";
  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const token    = localStorage.getItem("token");
  const headers  = { "x-auth-token": token };

  const sidebarWidth = isMobile ? 0 : (isOpen ? 255 : 68);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API}/api/tasks/my-tasks`, { headers });
      setTasks(res.data.data || []);
    } catch {
      setError("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    setUpdating(taskId);
    try {
      const res = await axios.patch(`${API}/api/tasks/${taskId}/status`, { status: newStatus }, { headers });
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: res.data.data.status } : t));
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to update status.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setUpdating(null);
    }
  };

  const counts = {
    all:         tasks.length,
    pending:     tasks.filter(t => t.status === "pending").length,
    in_progress: tasks.filter(t => t.status === "in_progress").length,
    completed:   tasks.filter(t => t.status === "completed").length,
  };

  const filtered = filter === "all" ? tasks : tasks.filter(t => t.status === filter);

  const completionPct = counts.all > 0 ? Math.round((counts.completed / counts.all) * 100) : 0;

  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    @keyframes fadeUp   { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes spin     { to { transform: rotate(360deg); } }
    @keyframes shimmer  { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    @keyframes pulse    { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    .task-row {
      transition: box-shadow 0.2s, transform 0.2s, background 0.2s;
    }
    .task-row:hover {
      box-shadow: 0 6px 24px rgba(15,23,42,0.09);
      transform: translateY(-2px);
      background: #ffffff !important;
    }
    .filter-pill {
      transition: all 0.18s cubic-bezier(0.4,0,0.2,1);
    }
    .filter-pill:hover {
      transform: translateY(-1px);
    }
    .stat-card {
      transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s;
    }
    .stat-card:hover {
      transform: translateY(-4px) scale(1.01);
      box-shadow: 0 16px 40px rgba(15,23,42,0.12) !important;
    }
    .action-btn {
      transition: all 0.15s cubic-bezier(0.4,0,0.2,1);
    }
    .action-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    }
    .action-btn:active:not(:disabled) {
      transform: translateY(0);
    }
    .scroll-hide::-webkit-scrollbar { display: none; }
    .scroll-hide { -ms-overflow-style: none; scrollbar-width: none; }
    @media (max-width: 768px) {
      .stat-grid { grid-template-columns: repeat(2, 1fr) !important; }
      .header-row { flex-direction: column !important; align-items: flex-start !important; }
    }
  `;

  const LoadingScreen = () => (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8F9FF", fontFamily: "'Sora', sans-serif" }}>
      <style>{globalStyles}</style>
      <MobileTopBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <div style={{ marginLeft: `${sidebarWidth}px`, flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ position: "relative", width: "56px", height: "56px", margin: "0 auto 20px" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", border: "3px solid #E8EAFF", borderTop: "3px solid #4F46E5", animation: "spin 0.75s linear infinite" }} />
          </div>
          <p style={{ color: "#6B7280", fontWeight: "500", fontSize: "0.875rem", letterSpacing: "0.01em" }}>Loading your workspace…</p>
        </div>
      </div>
    </div>
  );

  if (loading) return <LoadingScreen />;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8F9FF", fontFamily: "'Sora', sans-serif" }}>
      <style>{globalStyles}</style>
      <MobileTopBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div
        style={{
          marginLeft: `${sidebarWidth}px`,
          flex: 1,
          transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
          padding: isMobile ? "76px 16px 40px" : "36px 32px 48px",
          minWidth: 0,
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

          <div style={{ marginBottom: "32px", animation: "fadeUp 0.45s ease both" }}>
            <p style={{ fontSize: "0.8rem", color: "#9CA3AF", fontWeight: "500", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: "6px" }}>
              {greeting}, <span style={{ color: "#4F46E5", fontWeight: "600" }}>{name}</span>
            </p>
            <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(1.75rem, 5vw, 2.4rem)", fontWeight: "400", color: "#0F172A", lineHeight: 1.15, marginBottom: "6px" }}>
              My Tasks
              <span style={{ fontStyle: "italic", color: "#4F46E5" }}> .</span>
            </h1>
            <p style={{ color: "#94A3B8", fontSize: "0.8rem", fontWeight: "400" }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: "14px", marginBottom: "28px" }}>
            {[
              { label: "Total",       val: counts.all,         icon: <ClipboardList size={18} />, accent: "#4F46E5", bg: "#EDEEFF", bar: "#4F46E5" },
              { label: "Pending",     val: counts.pending,     icon: <Clock size={18} />,         accent: "#EA580C", bg: "#FFF3EE", bar: "#EA580C" },
              { label: "In Progress", val: counts.in_progress, icon: <Loader2 size={18} />,       accent: "#2563EB", bg: "#EEF5FF", bar: "#2563EB" },
              { label: "Completed",   val: counts.completed,   icon: <CheckCircle size={18} />,   accent: "#16A34A", bg: "#EDFDF5", bar: "#16A34A" },
            ].map((s, i) => (
              <div key={i} className="stat-card" style={{ background: "#fff", borderRadius: "16px", padding: isMobile ? "16px" : "20px", border: "1px solid #EAECF5", boxShadow: "0 2px 10px rgba(15,23,42,0.04)", animation: `fadeUp 0.45s ease both ${0.05 + i * 0.08}s`, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: s.bar, borderRadius: "16px 16px 0 0", opacity: 0.7 }} />
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.accent, marginBottom: "14px" }}>
                  {s.icon}
                </div>
                <div style={{ fontSize: "0.68rem", color: "#9CA3AF", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "4px" }}>{s.label}</div>
                <div style={{ fontSize: isMobile ? "1.6rem" : "2rem", fontWeight: "700", color: "#0F172A", lineHeight: 1, fontFamily: "'Instrument Serif', serif" }}>{s.val}</div>
              </div>
            ))}
          </div>

          {counts.all > 0 && (
            <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #EAECF5", padding: isMobile ? "16px" : "20px 24px", marginBottom: "20px", animation: "fadeUp 0.45s ease both 0.35s", display: "flex", alignItems: "center", gap: isMobile ? "14px" : "20px", flexWrap: isMobile ? "wrap" : "nowrap" }}>
              <div style={{ flex: 1, minWidth: "160px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: "600", color: "#374151" }}>Overall Progress</span>
                  <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "#4F46E5" }}>{completionPct}%</span>
                </div>
                <div style={{ height: "6px", background: "#EEF2FF", borderRadius: "99px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${completionPct}%`, background: "linear-gradient(90deg, #6366F1, #4F46E5)", borderRadius: "99px", transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: "16px", flexShrink: 0, flexWrap: "wrap" }}>
                {STATUS_OPTIONS.map(s => (
                  <div key={s.value} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: s.dot }} />
                    <span style={{ fontSize: "0.72rem", color: "#6B7280", fontWeight: "500" }}>{s.label}</span>
                    <span style={{ fontSize: "0.72rem", fontWeight: "700", color: "#374151" }}>{counts[s.value]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ background: "#fff", borderRadius: "20px", border: "1px solid #EAECF5", boxShadow: "0 4px 20px rgba(15,23,42,0.05)", animation: "fadeUp 0.45s ease both 0.4s", overflow: "hidden" }}>
            <div style={{ padding: isMobile ? "16px" : "20px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "#EDEEFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ClipboardList size={15} color="#4F46E5" />
                </div>
                <span style={{ fontSize: "0.95rem", fontWeight: "600", color: "#0F172A" }}>
                  Task List
                  <span style={{ marginLeft: "8px", fontSize: "0.75rem", fontWeight: "600", padding: "2px 8px", borderRadius: "99px", background: "#EDEEFF", color: "#4F46E5" }}>{filtered.length}</span>
                </span>
              </div>

              <div className="scroll-hide" style={{ display: "flex", gap: "6px", overflowX: "auto", WebkitOverflowScrolling: "touch", width: isMobile ? "100%" : "auto" }}>
                {[
                  { key: "all",         label: "All",         count: counts.all },
                  { key: "pending",     label: "Pending",     count: counts.pending },
                  { key: "in_progress", label: "In Progress", count: counts.in_progress },
                  { key: "completed",   label: "Completed",   count: counts.completed },
                ].map(tab => (
                  <button
                    key={tab.key}
                    className="filter-pill"
                    onClick={() => setFilter(tab.key)}
                    style={{
                      padding: "7px 14px",
                      borderRadius: "99px",
                      border: filter === tab.key ? "1.5px solid #4F46E5" : "1.5px solid #E5E7EB",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      fontFamily: "'Sora', sans-serif",
                      background: filter === tab.key ? "#4F46E5" : "transparent",
                      color: filter === tab.key ? "#fff" : "#6B7280",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span style={{ marginLeft: "5px", opacity: filter === tab.key ? 0.8 : 0.6, fontSize: "0.68rem" }}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div style={{ margin: "16px 20px 0", padding: "11px 14px", borderRadius: "10px", background: "#FEF2F2", border: "1px solid #FECACA", color: "#991B1B", fontSize: "0.8rem", fontWeight: "500", display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertCircle size={14} strokeWidth={2.5} />
                {error}
              </div>
            )}

            {filtered.length === 0 ? (
              <div style={{ padding: "64px 24px", textAlign: "center" }}>
                <div style={{ width: "60px", height: "60px", borderRadius: "18px", background: "#F8F9FF", border: "1px solid #EAECF5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <ClipboardList size={24} color="#C7D2FE" />
                </div>
                <p style={{ color: "#94A3B8", fontSize: "0.875rem", fontWeight: "500" }}>No tasks found.</p>
                <p style={{ color: "#CBD5E1", fontSize: "0.78rem", marginTop: "4px" }}>Tasks assigned to you will appear here.</p>
              </div>
            ) : (
              <div style={{ padding: isMobile ? "14px" : "16px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                {filtered.map((task, idx) => {
                  const st         = statusMap[task.status] || statusMap.pending;
                  const deadline   = new Date(task.deadline);
                  const overdue    = deadline < new Date() && task.status !== "completed";
                  const isUpdating = updating === task._id;

                  return (
                    <div
                      key={task._id}
                      className="task-row"
                      style={{
                        padding: isMobile ? "14px 16px" : "16px 20px",
                        borderRadius: "14px",
                        border: `1px solid ${overdue ? "#FECACA" : "#F1F5F9"}`,
                        background: overdue ? "#FFFBFB" : "#FAFBFF",
                        animation: `fadeUp 0.4s ease both ${idx * 0.06}s`,
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div style={{ position: "absolute", left: 0, top: "20%", bottom: "20%", width: "3px", borderRadius: "0 3px 3px 0", background: st.dot }} />

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", paddingLeft: "8px" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "#0F172A" }}>{task.title}</span>
                            <span style={{ fontSize: "0.65rem", fontWeight: "700", padding: "2px 9px", borderRadius: "99px", background: st.bg, color: st.color, whiteSpace: "nowrap", letterSpacing: "0.02em" }}>
                              {st.label}
                            </span>
                          </div>

                          {task.description && (
                            <p style={{ fontSize: "0.8rem", color: "#64748B", lineHeight: "1.6", marginBottom: "10px", wordBreak: "break-word" }}>
                              {task.description}
                            </p>
                          )}

                          <div style={{ display: "flex", gap: "14px", fontSize: "0.72rem", color: "#94A3B8", flexWrap: "wrap", alignItems: "center" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: "500" }}>
                              <User size={11} strokeWidth={2.5} />
                              {task.assigned_by?.name || "—"}
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: "500", color: overdue ? "#DC2626" : "#94A3B8" }}>
                              {overdue ? <AlertCircle size={11} strokeWidth={2.5} /> : <Calendar size={11} strokeWidth={2.5} />}
                              {deadline.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                              {overdue && <span style={{ background: "#FEE2E2", color: "#DC2626", padding: "1px 7px", borderRadius: "99px", fontSize: "0.65rem", fontWeight: "700" }}>Overdue</span>}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", flexShrink: 0 }}>
                          {task.status === "completed" ? (
                            <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.75rem", color: "#15803D", fontWeight: "600", background: "#F0FDF4", padding: "5px 10px", borderRadius: "8px" }}>
                              <CheckCircle size={13} strokeWidth={2.5} /> Done
                            </span>
                          ) : (
                            <div style={{ display: "flex", gap: "7px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                              {task.status === "pending" && (
                                <button
                                  className="action-btn"
                                  onClick={() => handleStatusChange(task._id, "in_progress")}
                                  disabled={isUpdating}
                                  style={{
                                    padding: "6px 13px",
                                    borderRadius: "9px",
                                    border: "1.5px solid #BFDBFE",
                                    background: "#EFF6FF",
                                    color: "#1D4ED8",
                                    fontSize: "0.72rem",
                                    fontWeight: "600",
                                    cursor: isUpdating ? "wait" : "pointer",
                                    fontFamily: "'Sora', sans-serif",
                                    whiteSpace: "nowrap",
                                    opacity: isUpdating ? 0.6 : 1,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "5px",
                                  }}
                                >
                                  {isUpdating ? <><Loader2 size={11} style={{ animation: "spin 0.6s linear infinite" }} /> Working</> : <><ChevronRight size={11} /> Start</>}
                                </button>
                              )}
                              <button
                                className="action-btn"
                                onClick={() => handleStatusChange(task._id, "completed")}
                                disabled={isUpdating}
                                style={{
                                  padding: "6px 13px",
                                  borderRadius: "9px",
                                  border: "1.5px solid #BBF7D0",
                                  background: "#F0FDF4",
                                  color: "#15803D",
                                  fontSize: "0.72rem",
                                  fontWeight: "600",
                                  cursor: isUpdating ? "wait" : "pointer",
                                  fontFamily: "'Sora', sans-serif",
                                  whiteSpace: "nowrap",
                                  opacity: isUpdating ? 0.6 : 1,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "5px",
                                }}
                              >
                                {isUpdating ? <><Loader2 size={11} style={{ animation: "spin 0.6s linear infinite" }} /> Saving</> : <><CheckCircle size={11} /> Complete</>}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTasks;