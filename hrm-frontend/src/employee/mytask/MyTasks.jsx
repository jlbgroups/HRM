import React, { useState, useEffect } from "react";
import Sidebar from "../../layouts/sidebar";
import MobileTopBar from "../MobileTopBar";
import { ClipboardList, Calendar, User, AlertCircle, CheckCircle, Clock, Loader2 } from "lucide-react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "https://hrm-backend-vvqg.onrender.com";

const STATUS_OPTIONS = [
  { value: "pending",     label: "Pending",     bg: "#FEF3C7", color: "#92400E" },
  { value: "in_progress", label: "In Progress", bg: "#DBEAFE", color: "#1E40AF" },
  { value: "completed",   label: "Completed",   bg: "#D1FAE5", color: "#065F46" },
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

  const [isOpen, setIsOpen]       = useState(width > 768);
  const [tasks, setTasks]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [updating, setUpdating]   = useState(null);
  const [error, setError]         = useState("");
  const [filter, setFilter]       = useState("all");

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
    } catch (err) {
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

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F9FAFB", fontFamily: "'DM Sans', sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap'); @keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <MobileTopBar isOpen={isOpen} setIsOpen={setIsOpen} />
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
        <div style={{ marginLeft: `${sidebarWidth}px`, flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: "44px", height: "44px", border: "3px solid #E5E7EB", borderTop: "3px solid #4F46E5", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
            <p style={{ color: "#6B7280", fontWeight: "500", fontSize: "0.9rem" }}>Loading your tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F9FAFB", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin   { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        .mt-stat-card { transition: transform 0.18s, box-shadow 0.18s; }
        .mt-stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(15,23,42,0.10) !important; }
        .filter-tab:hover { background: #EEF2FF !important; color: #4F46E5 !important; }
        .task-card:hover  { box-shadow: 0 4px 16px rgba(15,23,42,0.08) !important; }
        .action-btn:hover { opacity: 0.85; transform: translateY(-1px); }
        .filter-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      <MobileTopBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div
        style={{
          marginLeft: `${sidebarWidth}px`,
          flex: 1,
          transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
          padding: isMobile ? "76px 16px 32px" : "28px 28px 40px",
          minWidth: 0,
        }}
      >
        <div style={{ marginBottom: "28px", animation: "fadeUp 0.4s ease both 0.05s" }}>
          <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "0 0 4px" }}>
            {greeting}, <strong style={{ color: "#4F46E5" }}>{name}</strong> 👋
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.4rem, 4vw, 1.85rem)", fontWeight: "700", color: "#111827", margin: 0, lineHeight: 1.2 }}>
            My Tasks
          </h1>
          <p style={{ color: "#9CA3AF", fontSize: "0.85rem", margin: "5px 0 0" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2,1fr)" : isTablet ? "repeat(2,1fr)" : "repeat(4,1fr)",
            gap: "16px",
            marginBottom: "24px",
            animation: "fadeUp 0.4s ease both 0.1s",
          }}
        >
          {[
            { label: "Total Tasks",  val: counts.all,         icon: <ClipboardList size={20} />, color: "#4F46E5", bg: "#EEF2FF" },
            { label: "Pending",      val: counts.pending,     icon: <Clock size={20} />,         color: "#D97706", bg: "#FFFBEB" },
            { label: "In Progress",  val: counts.in_progress, icon: <Loader2 size={20} />,       color: "#0891B2", bg: "#ECFEFF" },
            { label: "Completed",    val: counts.completed,   icon: <CheckCircle size={20} />,   color: "#059669", bg: "#ECFDF5" },
          ].map((stat, i) => (
            <div key={i} className="mt-stat-card" style={{ backgroundColor: "#fff", borderRadius: "14px", padding: isMobile ? "16px" : "20px", border: "1px solid #F1F3F9", boxShadow: "0 2px 8px rgba(15,23,42,0.05)", animation: `fadeUp 0.4s ease both ${0.1 + i * 0.07}s` }}>
              <div style={{ width: isMobile ? "36px" : "42px", height: isMobile ? "36px" : "42px", borderRadius: "11px", backgroundColor: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", color: stat.color, marginBottom: isMobile ? "10px" : "14px" }}>
                {stat.icon}
              </div>
              <div style={{ fontSize: "0.72rem", color: "#9CA3AF", fontWeight: "500", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.4px" }}>{stat.label}</div>
              <div style={{ fontSize: isMobile ? "1.5rem" : "1.8rem", fontWeight: "700", color: "#111827", lineHeight: 1, fontFamily: "'Playfair Display', serif" }}>{stat.val}</div>
            </div>
          ))}
        </div>

        <div style={{ backgroundColor: "#fff", borderRadius: "14px", border: "1px solid #F1F3F9", boxShadow: "0 2px 8px rgba(15,23,42,0.05)", animation: "fadeUp 0.4s ease both 0.3s" }}>
          <div style={{ padding: isMobile ? "14px 16px" : "18px 20px", borderBottom: "1px solid #F1F3F9", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <ClipboardList size={15} color="#4F46E5" />
              </div>
              <span style={{ fontSize: "0.95rem", fontWeight: "600", color: "#111827" }}>Task List</span>
            </div>

            <div className="filter-scroll" style={{ display: "flex", gap: "6px", overflowX: "auto", WebkitOverflowScrolling: "touch", msOverflowStyle: "none", scrollbarWidth: "none", maxWidth: isMobile ? "100%" : "unset", width: isMobile ? "100%" : "auto" }}>
              {[
                { key: "all",         label: "All" },
                { key: "pending",     label: "Pending" },
                { key: "in_progress", label: "In Progress" },
                { key: "completed",   label: "Completed" },
              ].map(tab => (
                <button
                  key={tab.key}
                  className="filter-tab"
                  onClick={() => setFilter(tab.key)}
                  style={{
                    padding: "6px 14px", borderRadius: "8px", border: "none", cursor: "pointer",
                    fontSize: "0.78rem", fontWeight: "600", fontFamily: "'DM Sans', sans-serif",
                    background: filter === tab.key ? "#1E1B4B" : "#F3F4F6",
                    color:      filter === tab.key ? "#fff"     : "#6B7280",
                    transition: "all 0.15s", whiteSpace: "nowrap", flexShrink: 0,
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "16px 20px 0", padding: "10px 13px", borderRadius: "8px", background: "#FEE2E2", color: "#991B1B", fontSize: "0.82rem", fontWeight: "500" }}>
              <AlertCircle size={14} />{error}
            </div>
          )}

          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 20px" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <ClipboardList size={22} color="#9CA3AF" />
              </div>
              <p style={{ color: "#9CA3AF", fontSize: "0.9rem", fontWeight: "500" }}>No tasks found.</p>
            </div>
          ) : (
            <div style={{ padding: isMobile ? "12px" : "16px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {filtered.map((task) => {
                const st         = statusMap[task.status] || statusMap.pending;
                const deadline   = new Date(task.deadline);
                const overdue    = deadline < new Date() && task.status !== "completed";
                const isUpdating = updating === task._id;

                return (
                  <div key={task._id} className="task-card" style={{ padding: isMobile ? "14px" : "16px", borderRadius: "11px", border: "1px solid #F1F3F9", background: "#FAFAFA", transition: "box-shadow 0.15s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "#111827", marginBottom: "4px" }}>{task.title}</div>
                        {task.description && (
                          <p style={{ fontSize: "0.82rem", color: "#6B7280", lineHeight: "1.55", margin: "0 0 10px", wordBreak: "break-word" }}>{task.description}</p>
                        )}
                        <div style={{ display: "flex", gap: "12px", fontSize: "0.75rem", color: "#6B7280", flexWrap: "wrap" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <User size={11} />
                            {task.assigned_by?.name || "—"}
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: "4px", color: overdue ? "#DC2626" : "#6B7280" }}>
                            {overdue ? <AlertCircle size={11} /> : <Calendar size={11} />}
                            {deadline.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                            {overdue && " · Overdue"}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", flexShrink: 0 }}>
                        <span style={{ fontSize: "0.7rem", fontWeight: "600", padding: "3px 10px", borderRadius: "20px", background: st.bg, color: st.color, whiteSpace: "nowrap" }}>
                          {st.label}
                        </span>

                        {task.status !== "completed" && (
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                            {task.status === "pending" && (
                              <button
                                className="action-btn"
                                onClick={() => handleStatusChange(task._id, "in_progress")}
                                disabled={isUpdating}
                                style={{ padding: "5px 11px", borderRadius: "7px", border: "1.5px solid #BFDBFE", background: "#EFF6FF", color: "#1E40AF", fontSize: "0.73rem", fontWeight: "600", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s", whiteSpace: "nowrap" }}
                              >
                                {isUpdating ? "..." : "Start"}
                              </button>
                            )}
                            <button
                              className="action-btn"
                              onClick={() => handleStatusChange(task._id, "completed")}
                              disabled={isUpdating}
                              style={{ padding: "5px 11px", borderRadius: "7px", border: "1.5px solid #A7F3D0", background: "#ECFDF5", color: "#065F46", fontSize: "0.73rem", fontWeight: "600", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s", whiteSpace: "nowrap" }}
                            >
                              {isUpdating ? "..." : "Mark Complete"}
                            </button>
                          </div>
                        )}

                        {task.status === "completed" && (
                          <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", color: "#059669", fontWeight: "500" }}>
                            <CheckCircle size={13} /> Done
                          </span>
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
  );
};

export default MyTasks;