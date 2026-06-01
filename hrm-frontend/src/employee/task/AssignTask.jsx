import React, { useState, useEffect } from "react";
import Sidebar from "../../layouts/sidebar";
import MobileTopBar from "../MobileTopBar";
import { ClipboardList, User, Calendar, AlertCircle, CheckCircle, Plus, Users } from "lucide-react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "https://hrm-backend-vvqg.onrender.com";

const statusColors = {
  pending:     { bg: "#FEF3C7", color: "#92400E", label: "Pending" },
  in_progress: { bg: "#DBEAFE", color: "#1E40AF", label: "In Progress" },
  completed:   { bg: "#D1FAE5", color: "#065F46", label: "Completed" },
};

const AssignTask = () => {
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [team, setTeam]               = useState([]);
  const [tasks, setTasks]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [submitting, setSubmitting]   = useState(false);
  const [success, setSuccess]         = useState("");
  const [error, setError]             = useState("");

  const [form, setForm] = useState({
    assigned_to: "",
    title: "",
    description: "",
    deadline: "",
  });

  const name     = localStorage.getItem("name") || "Manager";
  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const token    = localStorage.getItem("token");
  const headers  = { "x-auth-token": token };

  const isMobile    = window.innerWidth <= 768;
  const sidebarWidth = isMobile ? 0 : (isOpen ? 255 : 68);

  const fetchData = async () => {
    try {
      const [teamRes, tasksRes] = await Promise.all([
        axios.get(`${API}/api/tasks/my-team`, { headers }),
        axios.get(`${API}/api/tasks/assigned`, { headers }),
      ]);
      setTeam(teamRes.data.data || []);
      setTasks(tasksRes.data.data || []);
    } catch (err) {
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess("");
    setError("");
    try {
      await axios.post(`${API}/api/tasks/assign`, form, { headers });
      setSuccess("Task assigned successfully.");
      setForm({ assigned_to: "", title: "", description: "", deadline: "" });
      fetchData();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to assign task.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F9FAFB", fontFamily: "'DM Sans', sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap'); @keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <MobileTopBar isOpen={isOpen} setIsOpen={setIsOpen} />
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
        <div style={{ marginLeft: `${sidebarWidth}px`, flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: "44px", height: "44px", border: "3px solid #E5E7EB", borderTop: "3px solid #4F46E5", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
            <p style={{ color: "#6B7280", fontWeight: "500", fontSize: "0.9rem" }}>Loading your team...</p>
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
        input, select, textarea { font-family: 'DM Sans', sans-serif; }
        input:focus, select:focus, textarea:focus { outline: none; border-color: #4F46E5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.10) !important; }
        .at-card { transition: transform 0.18s, box-shadow 0.18s; }
        .at-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(15,23,42,0.09) !important; }
        .submit-btn:hover:not(:disabled) { background: #312E81 !important; transform: translateY(-1px); }
        .submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        .task-row:hover { background: #F5F3FF !important; }
        ::placeholder { color: #CBD5E1; }
        @media (max-width: 768px) {
          .at-main { padding: 76px 16px 32px !important; }
          .at-grid  { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <MobileTopBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div
        className="at-main"
        style={{
          marginLeft: `${sidebarWidth}px`,
          flex: 1,
          transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
          padding: "28px 28px 40px",
        }}
      >
        <div style={{ marginBottom: "28px", animation: "fadeUp 0.4s ease both 0.05s" }}>
          <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "0 0 4px" }}>
            {greeting}, <strong style={{ color: "#4F46E5" }}>{name}</strong> 👋
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.5rem, 4vw, 1.85rem)", fontWeight: "700", color: "#111827", margin: 0, lineHeight: 1.2 }}>
            Assign Task
          </h1>
          <p style={{ color: "#9CA3AF", fontSize: "0.85rem", margin: "5px 0 0" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "16px", marginBottom: "24px", animation: "fadeUp 0.4s ease both 0.1s" }}>
          {[
            { label: "Team Members", val: team.length,  icon: <Users size={20} />,        color: "#4F46E5", bg: "#EEF2FF" },
            { label: "Tasks Assigned", val: tasks.length, icon: <ClipboardList size={20} />, color: "#059669", bg: "#ECFDF5" },
          ].map((stat, i) => (
            <div key={i} className="at-card" style={{ backgroundColor: "#fff", borderRadius: "14px", padding: "20px", border: "1px solid #F1F3F9", boxShadow: "0 2px 8px rgba(15,23,42,0.05)" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "11px", backgroundColor: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", color: stat.color, marginBottom: "14px" }}>
                {stat.icon}
              </div>
              <div style={{ fontSize: "0.78rem", color: "#9CA3AF", fontWeight: "500", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.4px" }}>{stat.label}</div>
              <div style={{ fontSize: "1.8rem", fontWeight: "700", color: "#111827", lineHeight: 1, fontFamily: "'Playfair Display', serif" }}>{stat.val}</div>
            </div>
          ))}
        </div>

        <div className="at-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            <div style={s.card}>
              <div style={s.cardHeader}>
                <div style={{ ...s.cardIconWrap, background: "#EEF2FF" }}><Plus size={16} color="#4F46E5" /></div>
                <h2 style={s.cardTitle}>New Task</h2>
              </div>

              {success && (
                <div style={s.alertSuccess}>
                  <CheckCircle size={14} />
                  {success}
                </div>
              )}
              {error && (
                <div style={s.alertError}>
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={s.field}>
                  <label style={s.label}>Assign to</label>
                  <select name="assigned_to" value={form.assigned_to} onChange={handleChange} required style={s.input}>
                    <option value="">Select team member</option>
                    {team.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name}{emp.designation_id?.designation_name ? ` — ${emp.designation_id.designation_name}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={s.field}>
                  <label style={s.label}>Task title</label>
                  <input type="text" name="title" placeholder="e.g. Complete monthly report" value={form.title} onChange={handleChange} required style={s.input} />
                </div>

                <div style={s.field}>
                  <label style={s.label}>Description</label>
                  <textarea name="description" placeholder="Describe the task in detail..." value={form.description} onChange={handleChange} rows={4} style={{ ...s.input, resize: "vertical", lineHeight: "1.6" }} />
                </div>

                <div style={s.field}>
                  <label style={s.label}>Deadline</label>
                  <input type="date" name="deadline" value={form.deadline} onChange={handleChange} required min={new Date().toISOString().split("T")[0]} style={s.input} />
                </div>

                <button type="submit" className="submit-btn" disabled={submitting} style={s.submitBtn}>
                  {submitting ? "Assigning..." : "Assign Task"}
                </button>
              </form>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            <div style={s.card}>
              <div style={s.cardHeader}>
                <div style={{ ...s.cardIconWrap, background: "#ECFDF5" }}><Users size={16} color="#059669" /></div>
                <h2 style={s.cardTitle}>Your Team ({team.length})</h2>
              </div>
              {team.length === 0 ? (
                <p style={s.empty}>No team members found under your management.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {team.map((emp) => (
                    <div key={emp._id} style={s.memberRow}>
                      <div style={s.avatar}>{emp.name?.[0]?.toUpperCase()}</div>
                      <div style={{ flex: 1, overflow: "hidden" }}>
                        <div style={s.memberName}>{emp.name}</div>
                        <div style={s.memberSub}>
                          {emp.designation_id?.designation_name || "—"}
                          {emp.department_id?.department_name ? ` · ${emp.department_id.department_name}` : ""}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={s.card}>
              <div style={s.cardHeader}>
                <div style={{ ...s.cardIconWrap, background: "#EEF2FF" }}><ClipboardList size={16} color="#4F46E5" /></div>
                <h2 style={s.cardTitle}>Assigned Tasks ({tasks.length})</h2>
              </div>
              {tasks.length === 0 ? (
                <p style={s.empty}>No tasks assigned yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {tasks.map((task) => {
                    const st       = statusColors[task.status] || statusColors.pending;
                    const deadline = new Date(task.deadline);
                    const overdue  = deadline < new Date() && task.status !== "completed";
                    return (
                      <div key={task._id} className="task-row" style={s.taskRow}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                          <span style={s.taskTitle}>{task.title}</span>
                          <span style={{ ...s.badge, background: st.bg, color: st.color }}>{st.label}</span>
                        </div>
                        {task.description && <p style={s.taskDesc}>{task.description}</p>}
                        <div style={s.taskMeta}>
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <User size={11} />{task.assigned_to?.name || "—"}
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: "4px", color: overdue ? "#DC2626" : "#6B7280" }}>
                            {overdue ? <AlertCircle size={11} /> : <Calendar size={11} />}
                            {deadline.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                            {overdue && " · Overdue"}
                          </span>
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
    </div>
  );
};

const s = {
  card: {
    backgroundColor: "#fff",
    borderRadius: "14px",
    padding: "20px",
    border: "1px solid #F1F3F9",
    boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
    animation: "fadeUp 0.4s ease both 0.15s",
  },
  cardHeader: {
    display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px",
  },
  cardIconWrap: {
    width: "30px", height: "30px", borderRadius: "8px",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  cardTitle: {
    fontSize: "0.95rem", fontWeight: "600", color: "#111827", letterSpacing: "-0.1px", margin: 0,
  },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "0.82rem", fontWeight: "500", color: "#374151", letterSpacing: "0.1px" },
  input: {
    width: "100%", padding: "11px 13px",
    border: "1.5px solid #E5E7EB", borderRadius: "9px",
    fontSize: "0.9rem", color: "#111827", backgroundColor: "#fff",
    transition: "border-color 0.18s, box-shadow 0.18s",
  },
  submitBtn: {
    padding: "12px", background: "#1E1B4B", color: "#fff",
    border: "none", borderRadius: "9px", fontSize: "0.9rem",
    fontWeight: "600", cursor: "pointer",
    transition: "background 0.2s, transform 0.15s",
    fontFamily: "'DM Sans', sans-serif", marginTop: "4px",
  },
  alertSuccess: {
    display: "flex", alignItems: "center", gap: "8px",
    padding: "10px 13px", borderRadius: "8px",
    background: "#D1FAE5", color: "#065F46",
    fontSize: "0.82rem", fontWeight: "500", marginBottom: "4px",
  },
  alertError: {
    display: "flex", alignItems: "center", gap: "8px",
    padding: "10px 13px", borderRadius: "8px",
    background: "#FEE2E2", color: "#991B1B",
    fontSize: "0.82rem", fontWeight: "500", marginBottom: "4px",
  },
  memberRow: {
    display: "flex", alignItems: "center", gap: "12px",
    padding: "10px 12px", borderRadius: "9px",
    border: "1px solid #F1F3F9", background: "#FAFAFA",
    transition: "background 0.15s",
  },
  avatar: {
    width: "36px", height: "36px", borderRadius: "50%",
    background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", fontSize: "0.85rem", fontWeight: "600", flexShrink: 0,
  },
  memberName: { fontSize: "0.875rem", fontWeight: "500", color: "#111827" },
  memberSub:  { fontSize: "0.75rem", color: "#6B7280", marginTop: "2px" },
  taskRow: {
    padding: "11px 13px", borderRadius: "9px",
    border: "1px solid #F1F3F9", background: "#FAFAFA",
    transition: "background 0.15s", cursor: "default",
  },
  taskTitle: { fontSize: "0.875rem", fontWeight: "500", color: "#111827" },
  taskDesc:  { fontSize: "0.8rem", color: "#6B7280", marginTop: "5px", lineHeight: "1.5" },
  taskMeta: {
    display: "flex", gap: "14px", marginTop: "8px",
    fontSize: "0.75rem", color: "#6B7280", alignItems: "center",
  },
  badge: {
    fontSize: "0.7rem", fontWeight: "600", padding: "3px 9px",
    borderRadius: "20px", whiteSpace: "nowrap", flexShrink: 0,
  },
  empty: {
    fontSize: "0.85rem", color: "#9CA3AF", textAlign: "center", padding: "16px 0",
  },
};

export default AssignTask;