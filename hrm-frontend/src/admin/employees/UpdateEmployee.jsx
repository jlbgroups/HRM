import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Users, Search, Bell, ShieldCheck, UserCheck, Trash2, PauseCircle, PlayCircle,
} from "lucide-react";
import Sidebar from "../../layouts/sidebar";
import MobileTopBar from "../../employee/MobileTopBar";
import { useTheme } from "../../context/ThemeContext";

const API = import.meta.env.VITE_API_URL || "https://hrm-backend-vvqg.onrender.com";

function UpdateEmployee() {
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const { isDark } = useTheme();

  const name = localStorage.getItem("name") || "Admin";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const headers = {
    "x-auth-token": localStorage.getItem("token"),
    "Content-Type": "application/json",
  };

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
    tableHead: isDark ? "#111827" : "#F9FAFB",
    rowHover: isDark ? "#1E2535" : "#FAFBFF",
    skeletonBg: isDark ? "#1E2535" : "#F3F4F6",
    iconAccentBg: isDark ? "#1E1B4B" : "#EEF2FF",
    managerBadgeBg: isDark ? "#1E1B4B" : "#EEF2FF",
    managerBadgeText: isDark ? "#818CF8" : "#4F46E5",
    empBadgeBg: isDark ? "#052E16" : "#F0FDF4",
    empBadgeText: isDark ? "#4ADE80" : "#16A34A",
    makeManagerBg: isDark ? "#1E1B4B" : "#EEF2FF",
    makeManagerText: isDark ? "#818CF8" : "#4F46E5",
    removeManagerBg: isDark ? "#2D0F0F" : "#FEF2F2",
    removeManagerText: isDark ? "#F87171" : "#DC2626",
    disabledBg: isDark ? "#1E2535" : "#E5E7EB",
    disabledText: isDark ? "#4B5563" : "#9CA3AF",
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setIsOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarWidth = isMobile ? 0 : isOpen ? 255 : 68;

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/employees`, { headers });
      setEmployees(res.data.data || []);
    } catch (err) {
      showToast("Could not load employees", "error");
    } finally {
      setLoading(false);
    }
  };

  // Delete employee
  const handleDeleteEmployee = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    setUpdatingId(id);
    try {
      await axios.delete(`${API}/api/employees/${id}`, { headers });
      showToast("Employee deleted successfully.");
      setEmployees(prev => prev.filter(e => e._id !== id));
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to delete employee.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  // Toggle activation status
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    setUpdatingId(id);
    try {
      await axios.patch(`${API}/api/employees/${id}`, { status: newStatus }, { headers });
      showToast(`Employee ${newStatus}`);
      setEmployees(prev => prev.map(e => e._id === id ? { ...e, status: newStatus } : e));
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to update status.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  // Assign manager
  const handleAssignManager = async (id, managerId) => {
    setUpdatingId(id);
    try {
      await axios.patch(`${API}/api/employees/${id}`, { manager_id: managerId }, { headers });
      showToast("Manager assigned successfully.");
      setEmployees(prev => prev.map(e => e._id === id ? { ...e, manager_id: managerId } : e));
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to assign manager.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const managers = employees.filter(e => e.position === "manager");

  const filtered = employees.filter((emp) =>
    emp.name?.toLowerCase().includes(search.toLowerCase()) ||
    emp.email?.toLowerCase().includes(search.toLowerCase()) ||
    emp.department_id?.department_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: t.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');

        * { box-sizing: border-box; }
        @keyframes fadeUp  { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }

        .ue-search-input:focus { outline: none; border-color: #4F46E5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.10); }
        .topbar-btn:hover { background: ${isDark ? "#1E2535" : "#F3F4F6"} !important; }

        .pos-btn {
          border: none;
          border-radius: 8px;
          padding: 6px 14px;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, opacity 0.15s;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .pos-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .emp-row:hover { background: ${t.rowHover} !important; }

        .ue-topbar { display: flex; }

        .table-scroll-wrapper {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .emp-table {
          width: 100%;
          min-width: 700px;
          border-collapse: collapse;
        }

        .emp-table th,
        .emp-table td {
          padding: 13px 20px;
          white-space: nowrap;
        }

        .emp-table th {
          text-align: left;
          font-size: 0.72rem;
          font-weight: 700;
          color: ${t.textMuted};
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background-color: ${t.tableHead};
          border-bottom: 1px solid ${t.border};
        }

        .emp-table td {
          border-bottom: 1px solid ${t.border};
        }

        .emp-name-cell { white-space: normal; min-width: 160px; }
        .emp-actions-cell { min-width: 210px; }

        @media (max-width: 768px) {
          .ue-topbar { display: none !important; }
          .ue-main { padding: 76px 12px 32px !important; }
          .ue-h1 { font-size: 1.4rem !important; }
          .card-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
          .card-header .search-wrap {
            width: 100% !important;
            min-width: unset !important;
          }
          .emp-table th,
          .emp-table td {
            padding: 11px 12px;
            font-size: 0.8rem;
          }
          .pos-btn {
            padding: 5px 10px;
            font-size: 0.74rem;
          }
        }
      `}</style>

      {toast && (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            position: "fixed", top: "20px", right: "20px",
            background: toast.type === "error" ? "#EF4444" : "#059669",
            color: "#fff", padding: "12px 20px", borderRadius: "12px",
            fontWeight: "500", fontSize: "0.875rem", zIndex: 9999,
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)", animation: "slideIn 0.2s ease both",
            maxWidth: "320px",
          }}
        >
          {toast.message}
        </div>
      )}

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
        <div className="ue-topbar" style={{
          height: "64px", backgroundColor: t.topbar,
          borderBottom: `1px solid ${t.border}`, alignItems: "center",
          padding: "0 28px", gap: "16px", position: "sticky", top: 0,
          zIndex: 100, boxShadow: isDark ? "0 1px 4px rgba(0,0,0,0.3)" : "0 1px 4px rgba(15,23,42,0.04)",
        }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "380px" }}>
            <Search size={15} aria-hidden="true" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: t.textMuted }} />
            <input
              className="ue-search-input"
              type="search"
              placeholder="Search anything..."
              style={{ width: "100%", padding: "8px 12px 8px 36px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "10px", fontSize: "0.875rem", color: t.textPrimary, backgroundColor: t.inputBg }}
            />
          </div>
        </div>

        <main className="ue-main" style={{ padding: "28px 28px 40px", flex: 1 }}>
          <div style={{ marginBottom: "28px", animation: "fadeUp 0.4s ease both 0.05s" }}>
            <h1 className="ue-h1" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.85rem", fontWeight: "700", color: t.textPrimary, margin: 0 }}>
              Manage Employees
            </h1>
          </div>

          <div style={{ backgroundColor: t.card, borderRadius: "16px", border: `1px solid ${t.border}`, overflow: "hidden", animation: "fadeUp 0.4s ease both 0.15s" }}>
            <div className="card-header" style={{ padding: "20px 28px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div aria-hidden="true" style={{ width: "40px", height: "40px", borderRadius: "11px", background: t.iconAccentBg, display: "flex", alignItems: "center", justifyContent: "center", color: "#4F46E5" }}>
                  <Users size={19} />
                </div>
                <div>
                  <h2 style={{ fontSize: "1rem", fontWeight: "600", color: t.textPrimary, margin: 0 }}>Employee Directory</h2>
                </div>
              </div>
              <div className="search-wrap" style={{ position: "relative", minWidth: "220px" }}>
                <input
                  type="search"
                  className="ue-search-input"
                  placeholder="Search employees..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px 8px 32px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "10px", fontSize: "0.83rem", color: t.textPrimary, backgroundColor: t.inputBg }}
                />
              </div>
            </div>

            {loading ? (
              <div style={{ padding: "60px", textAlign: "center", color: t.textMuted }}>Loading...</div>
            ) : (
              <div className="table-scroll-wrapper">
                <table className="emp-table">
                  <thead>
                    <tr>
                      {["Employee", "Department", "Joined", "Current Position", "Manager", "Actions"].map((col) => (
                        <th key={col}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((emp) => (
                      <tr key={emp._id} className="emp-row">
                        <td className="emp-name-cell">
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "linear-gradient(135deg, #4F46E5, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.72rem", fontWeight: "600" }}>
                              {emp.name?.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: "600", color: t.textPrimary }}>{emp.name}</p>
                              <p style={{ margin: 0, fontSize: "0.75rem", color: t.textMuted }}>{emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: "0.85rem", color: t.textSecondary }}>{emp.department_id?.department_name || "—"}</td>
                        <td style={{ fontSize: "0.83rem", color: t.textSecondary }}>{emp.joining_date ? new Date(emp.joining_date).toLocaleDateString("en-IN") : "—"}</td>
                        <td>
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: "5px",
                            padding: "4px 12px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: "600",
                            background: emp.position === "manager" ? t.managerBadgeBg : t.empBadgeBg,
                            color: emp.position === "manager" ? t.managerBadgeText : t.empBadgeText,
                          }}>
                            {emp.position === "manager" ? <ShieldCheck size={12} /> : <UserCheck size={12} />}
                            {emp.position === "manager" ? "Manager" : "Employee"}
                          </span>
                        </td>
                        <td>
                          <select
                            value={emp.manager_id || ""}
                            onChange={(e) => handleAssignManager(emp._id, e.target.value)}
                            disabled={updatingId === emp._id}
                            style={{ ...inputBase, appearance: "none", cursor: updatingId === emp._id ? "not-allowed" : "pointer", color: emp.manager_id ? t.textPrimary : t.textMuted }}
                          >
                            <option value="">{emp.manager_id ? "Change manager" : "Assign manager"}</option>
                            {managers.map(m => (
                              <option key={m._id} value={m._id}>{m.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="emp-actions-cell">
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              className="pos-btn"
                              disabled={updatingId === emp._id}
                              onClick={() => handleToggleStatus(emp._id, emp.status)}
                              style={{ background: emp.status === "active" ? t.makeManagerBg : t.removeManagerBg, color: emp.status === "active" ? t.makeManagerText : t.removeManagerText }}
                            >
                              {emp.status === "active" ? <PauseCircle size={12} /> : <PlayCircle size={12} />}
                              {emp.status === "active" ? "Suspend" : "Activate"}
                            </button>
                            <button
                              className="pos-btn"
                              disabled={updatingId === emp._id}
                              onClick={() => handleDeleteEmployee(emp._id)}
                              style={{ background: t.removeManagerBg, color: t.removeManagerText }}
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default UpdateEmployee;