import React, { useState, useEffect } from "react";
import Sidebar from "../../layouts/sidebar";
import MobileTopBar from "../MobileTopBar";
import { ClipboardList, Calendar, User, AlertCircle, CheckCircle, Clock, Loader2, ChevronDown, X } from "lucide-react";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";

const API = import.meta.env.VITE_API_URL || "https://hrm-backend-vvqg.onrender.com";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", bg: "#FEF3C7", color: "#92400E", darkBg: "#451A03", darkColor: "#FCD34D" },
  { value: "in_progress", label: "In Progress", bg: "#DBEAFE", color: "#1E40AF", darkBg: "#1E1B4B", darkColor: "#818CF8" },
  { value: "completed", label: "Completed", bg: "#D1FAE5", color: "#065F46", darkBg: "#064E3B", darkColor: "#6EE7B7" },
];

const TaskDetailDrawer = ({ task, onClose, onStatusChange, updating, isDark }) => {
  if (!task) return null;
  const statusMap = Object.fromEntries(STATUS_OPTIONS.map(s => [s.value, s]));
  const st = statusMap[task.status] || statusMap.pending;
  const deadline = new Date(task.deadline);
  const overdue = deadline < new Date() && task.status !== "completed";
  const isUpdating = updating === task._id;

  const badgeBg = isDark ? st.darkBg : st.bg;
  const badgeColor = isDark ? st.darkColor : st.color;

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: isDark ? "rgba(0,0,0,0.7)" : "rgba(15,23,42,0.45)", zIndex: 200, backdropFilter: "blur(2px)" }} />
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: isDark ? "#161B27" : "#fff", zIndex: 201,
        borderRadius: "20px 20px 0 0",
        padding: "0",
        maxHeight: "80vh", overflowY: "auto",
        animation: "slideUp 0.28s cubic-bezier(0.32,0.72,0,1) both",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
        borderTop: isDark ? "1px solid #1E2535" : "none",
      }}>
        <div style={{ position: "sticky", top: 0, background: isDark ? "#161B27" : "#fff", borderBottom: `1px solid ${isDark ? "#1E2535" : "#F1F3F9"}`, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: "20px 20px 0 0" }}>
          <span style={{ fontWeight: "700", fontSize: "0.95rem", color: isDark ? "#F3F4F6" : "#111827" }}>Task Details</span>
          <button onClick={onClose} style={{ background: isDark ? "#1E2535" : "#F3F4F6", border: "none", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={16} color={isDark ? "#9CA3AF" : "#6B7280"} />
          </button>
        </div>

        <div style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
            <h2 style={{ fontSize: "1.05rem", fontWeight: "700", color: isDark ? "#F3F4F6" : "#111827", margin: 0, lineHeight: 1.4 }}>{task.title}</h2>
            <span style={{ fontSize: "0.7rem", fontWeight: "700", padding: "4px 12px", borderRadius: "20px", background: badgeBg, color: badgeColor, whiteSpace: "nowrap", flexShrink: 0 }}>
              {st.label}
            </span>
          </div>

          {task.description && (
            <p style={{ fontSize: "0.875rem", color: isDark ? "#9CA3AF" : "#4B5563", lineHeight: "1.65", margin: "0 0 20px", background: isDark ? "#1E2535" : "#F9FAFB", padding: "12px", borderRadius: "10px" }}>
              {task.description}
            </p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: isDark ? "#1E2535" : "#F9FAFB", borderRadius: "10px" }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: isDark ? "#1E1B4B" : "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <User size={14} color={isDark ? "#818CF8" : "#4F46E5"} />
              </div>
              <div>
                <div style={{ fontSize: "0.68rem", color: isDark ? "#6B7280" : "#9CA3AF", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.4px" }}>Assigned by</div>
                <div style={{ fontSize: "0.85rem", fontWeight: "600", color: isDark ? "#F3F4F6" : "#111827" }}>{task.assigned_by?.name || "—"}</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: overdue ? (isDark ? "#2D0F0F" : "#FFF1F2") : (isDark ? "#1E2535" : "#F9FAFB"), borderRadius: "10px" }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: overdue ? (isDark ? "#7F1D1D" : "#FFE4E6") : (isDark ? "#064E3B" : "#ECFDF5"), display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Calendar size={14} color={overdue ? "#F87171" : (isDark ? "#34D399" : "#059669")} />
              </div>
              <div>
                <div style={{ fontSize: "0.68rem", color: overdue ? "#F87171" : (isDark ? "#6B7280" : "#9CA3AF"), fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.4px" }}>{overdue ? "Overdue" : "Deadline"}</div>
                <div style={{ fontSize: "0.85rem", fontWeight: "600", color: overdue ? "#F87171" : (isDark ? "#F3F4F6" : "#111827") }}>
                  {deadline.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </div>
              </div>
            </div>
          </div>

          {task.status === "completed" ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "14px", background: isDark ? "#064E3B" : "#ECFDF5", borderRadius: "12px", color: isDark ? "#6EE7B7" : "#059669", fontWeight: "700", fontSize: "0.875rem" }}>
              <CheckCircle size={18} /> Task Completed
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {task.status === "pending" && (
                <button
                  onClick={() => onStatusChange(task._id, "in_progress")}
                  disabled={isUpdating}
                  style={{
                    width: "100%", padding: "13px", borderRadius: "12px",
                    border: "none", background: isDark ? "#1E1B4B" : "#EFF6FF",
                    color: isDark ? "#818CF8" : "#1E40AF", fontSize: "0.875rem", fontWeight: "700",
                    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  }}
                >
                  {isUpdating ? <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} /> : null}
                  {isUpdating ? "Updating..." : "Start Task"}
                </button>
              )}
              <button
                onClick={() => onStatusChange(task._id, "completed")}
                disabled={isUpdating}
                style={{
                  width: "100%", padding: "13px", borderRadius: "12px",
                  border: "none", background: isDark ? "#111827" : "#111827",
                  color: "#fff", fontSize: "0.875rem", fontWeight: "700",
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                }}
              >
                {isUpdating ? <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} /> : <CheckCircle size={16} />}
                {isUpdating ? "Updating..." : "Mark as Complete"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const MobileTaskCard = ({ task, onOpen, isDark }) => {
  const statusMap = Object.fromEntries(STATUS_OPTIONS.map(s => [s.value, s]));
  const st = statusMap[task.status] || statusMap.pending;
  const deadline = new Date(task.deadline);
  const overdue = deadline < new Date() && task.status !== "completed";
  const badgeBg = isDark ? st.darkBg : st.bg;
  const badgeColor = isDark ? st.darkColor : st.color;

  return (
    <div
      onClick={() => onOpen(task)}
      style={{
        padding: "14px 16px", borderRadius: "12px",
        border: `1px solid ${isDark ? "#1E2535" : "#F1F3F9"}`, background: isDark ? "#161B27" : "#fff",
        display: "flex", alignItems: "center", gap: "12px",
        cursor: "pointer", transition: "box-shadow 0.15s, transform 0.15s",
        boxShadow: isDark ? "0 1px 4px rgba(0,0,0,0.3)" : "0 1px 4px rgba(15,23,42,0.05)",
      }}
    >
      <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: badgeBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {task.status === "completed" ? <CheckCircle size={16} color={badgeColor} /> : task.status === "in_progress" ? <Loader2 size={16} color={badgeColor} /> : <Clock size={16} color={badgeColor} />}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "0.875rem", fontWeight: "600", color: isDark ? "#F3F4F6" : "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: "3px" }}>
          {task.title}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "0.72rem", color: overdue ? "#F87171" : (isDark ? "#6B7280" : "#9CA3AF"), display: "flex", alignItems: "center", gap: "3px" }}>
            {overdue ? <AlertCircle size={10} /> : <Calendar size={10} />}
            {deadline.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            {overdue ? " · Overdue" : ""}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flexShrink: 0 }}>
        <span style={{ fontSize: "0.65rem", fontWeight: "700", padding: "3px 9px", borderRadius: "20px", background: badgeBg, color: badgeColor }}>
          {st.label}
        </span>
        <ChevronDown size={14} color={isDark ? "#6B7280" : "#9CA3AF"} />
      </div>
    </div>
  );
};

const DesktopTaskCard = ({ task, onStatusChange, updating, isDark }) => {
  const statusMap = Object.fromEntries(STATUS_OPTIONS.map(s => [s.value, s]));
  const st = statusMap[task.status] || statusMap.pending;
  const deadline = new Date(task.deadline);
  const overdue = deadline < new Date() && task.status !== "completed";
  const isUpdating = updating === task._id;
  const badgeBg = isDark ? st.darkBg : st.bg;
  const badgeColor = isDark ? st.darkColor : st.color;

  return (
    <div style={{
      padding: "16px 20px", borderRadius: "12px",
      border: `1px solid ${isDark ? "#1E2535" : "#F1F3F9"}`, background: isDark ? "#161B27" : "#FAFAFA",
      transition: "box-shadow 0.15s",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "0.9rem", fontWeight: "600", color: isDark ? "#F3F4F6" : "#111827", marginBottom: "4px" }}>{task.title}</div>
          {task.description && (
            <p style={{ fontSize: "0.82rem", color: isDark ? "#9CA3AF" : "#6B7280", lineHeight: "1.6", margin: "0 0 10px", wordBreak: "break-word" }}>{task.description}</p>
          )}
          <div style={{ display: "flex", gap: "14px", fontSize: "0.75rem", color: isDark ? "#6B7280" : "#6B7280", flexWrap: "wrap" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <User size={11} />{task.assigned_by?.name || "—"}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px", color: overdue ? (isDark ? "#F87171" : "#DC2626") : (isDark ? "#6B7280" : "#6B7280") }}>
              {overdue ? <AlertCircle size={11} /> : <Calendar size={11} />}
              {deadline.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              {overdue && " · Overdue"}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", flexShrink: 0 }}>
          <span style={{ fontSize: "0.7rem", fontWeight: "700", padding: "4px 12px", borderRadius: "20px", background: badgeBg, color: badgeColor }}>
            {st.label}
          </span>

          {task.status !== "completed" && (
            <div style={{ display: "flex", gap: "6px" }}>
              {task.status === "pending" && (
                <button
                  onClick={() => onStatusChange(task._id, "in_progress")}
                  disabled={isUpdating}
                  style={{
                    padding: "5px 12px", borderRadius: "8px",
                    border: `1.5px solid ${isDark ? "#2D3748" : "#BFDBFE"}`, background: isDark ? "#1E1B4B" : "#EFF6FF",
                    color: isDark ? "#818CF8" : "#1E40AF", fontSize: "0.73rem", fontWeight: "700",
                    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                    transition: "all 0.15s", whiteSpace: "nowrap",
                  }}
                >
                  {isUpdating ? "..." : "Start"}
                </button>
              )}
              <button
                onClick={() => onStatusChange(task._id, "completed")}
                disabled={isUpdating}
                style={{
                  padding: "5px 12px", borderRadius: "8px",
                  border: `1.5px solid ${isDark ? "#2D3748" : "#A7F3D0"}`, background: isDark ? "#064E3B" : "#ECFDF5",
                  color: isDark ? "#6EE7B7" : "#065F46", fontSize: "0.73rem", fontWeight: "700",
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.15s", whiteSpace: "nowrap",
                }}
              >
                {isUpdating ? "..." : "Mark Complete"}
              </button>
            </div>
          )}

          {task.status === "completed" && (
            <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", color: isDark ? "#6EE7B7" : "#059669", fontWeight: "600" }}>
              <CheckCircle size={13} /> Done
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const MyTasks = () => {
  const { isDark } = useTheme();
  const width = window.innerWidth;
  const isMobile = width <= 768;
  const isTablet = width > 768 && width <= 1024;

  const [isOpen, setIsOpen] = useState(width > 768);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedTask, setSelectedTask] = useState(null);

  const name = localStorage.getItem("name") || "Employee";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
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
    statIconBg1: isDark ? "#1E1B4B" : "#EEF2FF",
    statIconBg2: isDark ? "#451A03" : "#FFFBEB",
    statIconBg3: isDark ? "#1E1B4B" : "#ECFEFF",
    statIconBg4: isDark ? "#064E3B" : "#ECFDF5",
    statIconColor1: isDark ? "#818CF8" : "#4F46E5",
    statIconColor2: isDark ? "#FCD34D" : "#D97706",
    statIconColor3: isDark ? "#818CF8" : "#0891B2",
    statIconColor4: isDark ? "#6EE7B7" : "#059669",
    filterActiveBg: isDark ? "#1E1B4B" : "#1E1B4B",
    filterActiveText: "#fff",
    filterInactiveBg: isDark ? "#1E2535" : "#F3F4F6",
    filterInactiveText: isDark ? "#9CA3AF" : "#6B7280",
  };

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
      if (selectedTask?._id === taskId) {
        setSelectedTask(prev => ({ ...prev, status: res.data.data.status }));
      }
      if (newStatus === "completed") setSelectedTask(null);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to update status.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setUpdating(null);
    }
  };

  const counts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === "pending").length,
    in_progress: tasks.filter(t => t.status === "in_progress").length,
    completed: tasks.filter(t => t.status === "completed").length,
  };

  const filtered = filter === "all" ? tasks : tasks.filter(t => t.status === filter);

  const statCards = [
    { label: "Total", val: counts.all, icon: <ClipboardList size={isMobile ? 16 : 20} />, bg: t.statIconBg1, color: t.statIconColor1 },
    { label: "Pending", val: counts.pending, icon: <Clock size={isMobile ? 16 : 20} />, bg: t.statIconBg2, color: t.statIconColor2 },
    { label: "In Progress", val: counts.in_progress, icon: <Loader2 size={isMobile ? 16 : 20} />, bg: t.statIconBg3, color: t.statIconColor3 },
    { label: "Completed", val: counts.completed, icon: <CheckCircle size={isMobile ? 16 : 20} />, bg: t.statIconBg4, color: t.statIconColor4 },
  ];

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", backgroundColor: t.bg, fontFamily: "'DM Sans', sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Playfair+Display:wght@700&display=swap'); @keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <MobileTopBar isOpen={isOpen} setIsOpen={setIsOpen} />
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
        <div style={{ marginLeft: `${sidebarWidth}px`, flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: "44px", height: "44px", border: "3px solid #E5E7EB", borderTop: "3px solid #4F46E5", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
            <p style={{ color: t.textMuted, fontWeight: "500", fontSize: "0.9rem" }}>Loading your tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: t.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin    { to   { transform: rotate(360deg); } }
        @keyframes slideUp { from { transform:translateY(100%); } to { transform:translateY(0); } }
        * { box-sizing: border-box; }
        .mt-stat-card { transition: transform 0.18s, box-shadow 0.18s; }
        .mt-stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(15,23,42,0.15) !important; }
        .filter-tab:hover { background: ${isDark ? "#1E2535" : "#EEF2FF"} !important; color: ${isDark ? "#818CF8" : "#4F46E5"} !important; }
        .task-card:hover  { box-shadow: 0 4px 16px rgba(15,23,42,0.08) !important; }
        .action-btn:hover { opacity: 0.85; transform: translateY(-1px); }
        .filter-scroll::-webkit-scrollbar { display: none; }
        .mobile-task-row { transition: box-shadow 0.15s, transform 0.1s; }
        .mobile-task-row:active { transform: scale(0.985); box-shadow: none !important; }
      `}</style>

      <MobileTopBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      {isMobile && selectedTask && (
        <TaskDetailDrawer
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onStatusChange={handleStatusChange}
          updating={updating}
          isDark={isDark}
        />
      )}

      <div style={{
        marginLeft: `${sidebarWidth}px`,
        flex: 1,
        transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
        padding: isMobile ? "76px 14px 32px" : isTablet ? "28px 20px 40px" : "28px 28px 40px",
        minWidth: 0,
      }}>
        <div style={{ marginBottom: isMobile ? "20px" : "28px", animation: "fadeUp 0.4s ease both 0.05s" }}>
          <p style={{ color: t.textSecondary, fontSize: "0.8rem", margin: "0 0 2px" }}>
            {greeting}, <strong style={{ color: "#4F46E5" }}>{name}</strong> 👋
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? "1.5rem" : "clamp(1.4rem, 4vw, 1.85rem)", fontWeight: "700", color: t.textPrimary, margin: 0, lineHeight: 1.2 }}>
            My Tasks
          </h1>
          <p style={{ color: t.textMuted, fontSize: "0.78rem", margin: "4px 0 0" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: isMobile ? "10px" : "16px",
          marginBottom: isMobile ? "18px" : "24px",
          animation: "fadeUp 0.4s ease both 0.1s",
        }}>
          {statCards.map((stat, i) => (
            <div key={i} className="mt-stat-card" style={{
              backgroundColor: t.card, borderRadius: isMobile ? "12px" : "14px",
              padding: isMobile ? "12px 10px" : "20px",
              border: `1px solid ${t.border}`,
              boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.05)",
              animation: `fadeUp 0.4s ease both ${0.1 + i * 0.07}s`,
              textAlign: isMobile ? "center" : "left",
            }}>
              <div style={{
                width: isMobile ? "30px" : "42px", height: isMobile ? "30px" : "42px",
                borderRadius: isMobile ? "8px" : "11px",
                backgroundColor: stat.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: stat.color,
                margin: isMobile ? "0 auto 8px" : "0 0 14px",
              }}>
                {stat.icon}
              </div>
              <div style={{ fontSize: isMobile ? "0.6rem" : "0.72rem", color: t.textMuted, fontWeight: "600", marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                {stat.label}
              </div>
              <div style={{ fontSize: isMobile ? "1.35rem" : "1.8rem", fontWeight: "700", color: t.textPrimary, lineHeight: 1, fontFamily: "'Playfair Display', serif" }}>
                {stat.val}
              </div>
            </div>
          ))}
        </div>

        <div style={{ backgroundColor: t.card, borderRadius: "14px", border: `1px solid ${t.border}`, boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.05)", animation: "fadeUp 0.4s ease both 0.3s" }}>
          <div style={{
            padding: isMobile ? "12px 14px" : "18px 20px",
            borderBottom: `1px solid ${t.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: t.statIconBg1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ClipboardList size={14} color={t.statIconColor1} />
              </div>
              <span style={{ fontSize: isMobile ? "0.875rem" : "0.95rem", fontWeight: "700", color: t.textPrimary }}>Task List</span>
              {isMobile && (
                <span style={{ fontSize: "0.72rem", color: t.textMuted, background: t.inputBg, padding: "2px 8px", borderRadius: "20px", fontWeight: "600" }}>
                  {filtered.length}
                </span>
              )}
            </div>

            <div className="filter-scroll" style={{
              display: "flex", gap: "5px",
              overflowX: "auto", WebkitOverflowScrolling: "touch",
              msOverflowStyle: "none", scrollbarWidth: "none",
              width: isMobile ? "100%" : "auto",
            }}>
              {[
                { key: "all", label: isMobile ? "All" : "All" },
                { key: "pending", label: "Pending" },
                { key: "in_progress", label: isMobile ? "Active" : "In Progress" },
                { key: "completed", label: "Done" },
              ].map(tab => (
                <button
                  key={tab.key}
                  className="filter-tab"
                  onClick={() => setFilter(tab.key)}
                  style={{
                    padding: isMobile ? "5px 12px" : "6px 14px",
                    borderRadius: "8px", border: "none", cursor: "pointer",
                    fontSize: "0.75rem", fontWeight: "700",
                    fontFamily: "'DM Sans', sans-serif",
                    background: filter === tab.key ? t.filterActiveBg : t.filterInactiveBg,
                    color: filter === tab.key ? t.filterActiveText : t.filterInactiveText,
                    transition: "all 0.15s", whiteSpace: "nowrap", flexShrink: 0,
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "12px 14px 0", padding: "10px 13px", borderRadius: "8px", background: isDark ? "#2D0F0F" : "#FEE2E2", color: isDark ? "#F87171" : "#991B1B", fontSize: "0.82rem", fontWeight: "600" }}>
              <AlertCircle size={14} />{error}
            </div>
          )}

          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: isMobile ? "36px 20px" : "48px 20px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: t.skeletonBg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <ClipboardList size={20} color={t.textMuted} />
              </div>
              <p style={{ color: t.textMuted, fontSize: "0.875rem", fontWeight: "600" }}>No tasks found.</p>
            </div>
          ) : (
            <div style={{ padding: isMobile ? "10px" : "16px 20px", display: "flex", flexDirection: "column", gap: isMobile ? "8px" : "10px" }}>
              {filtered.map(task =>
                isMobile ? (
                  <MobileTaskCard key={task._id} task={task} onOpen={setSelectedTask} isDark={isDark} />
                ) : (
                  <DesktopTaskCard key={task._id} task={task} onStatusChange={handleStatusChange} updating={updating} isDark={isDark} />
                )
              )}
            </div>
          )}
        </div>

        {isMobile && filtered.length > 0 && (
          <p style={{ textAlign: "center", color: t.textMuted, fontSize: "0.72rem", marginTop: "20px", fontWeight: "500" }}>
            Tap a task to see details
          </p>
        )}
      </div>
    </div>
  );
};

export default MyTasks;