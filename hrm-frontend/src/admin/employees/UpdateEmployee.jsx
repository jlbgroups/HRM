import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Users, Search, Bell, ShieldCheck, UserCheck,
} from "lucide-react";
import Sidebar from "../../layouts/sidebar";
import MobileTopBar from "../../employee/MobileTopBar";

const API = import.meta.env.VITE_API_URL || "https://hrm-backend-vvqg.onrender.com";

function UpdateEmployee() {
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");

  const name = localStorage.getItem("name") || "Admin";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const headers = {
    "x-auth-token": localStorage.getItem("token"),
    "Content-Type": "application/json",
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

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handlePositionChange = async (employeeId, newPosition) => {
    setUpdatingId(employeeId);
    try {
      await axios.patch(
        `${API}/api/employees/${employeeId}/position`,
        { position: newPosition },
        { headers }
      );
      showToast(`Position updated to ${newPosition} successfully.`);
      setEmployees((prev) =>
        prev.map((emp) =>
          emp._id === employeeId ? { ...emp, position: newPosition } : emp
        )
      );
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to update position.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = employees.filter((emp) =>
    emp.name?.toLowerCase().includes(search.toLowerCase()) ||
    emp.email?.toLowerCase().includes(search.toLowerCase()) ||
    emp.department_id?.department_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F9FAFB", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');

        * { box-sizing: border-box; }

        @keyframes fadeUp  { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }

        .search-input:focus { outline: none; border-color: #4F46E5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.10); }
        .topbar-btn:hover { background: #F3F4F6 !important; }

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
        }
        .pos-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .emp-row:hover { background: #FAFBFF !important; }

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
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background-color: #F9FAFB;
          border-bottom: 1px solid #F1F3F9;
        }

        .emp-table td {
          border-bottom: 1px solid #F9FAFB;
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

        @media (max-width: 480px) {
          .ue-main { padding: 72px 8px 24px !important; }

          .emp-table {
            min-width: 580px;
          }

          .emp-table th,
          .emp-table td {
            padding: 10px 10px;
            font-size: 0.77rem;
          }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .ue-main { padding: 24px 20px 36px !important; }

          .emp-table {
            min-width: 680px;
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
          height: "64px", backgroundColor: "#fff",
          borderBottom: "1px solid #F1F3F9", alignItems: "center",
          padding: "0 28px", gap: "16px", position: "sticky", top: 0,
          zIndex: 100, boxShadow: "0 1px 4px rgba(15,23,42,0.04)",
        }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "380px" }}>
            <Search size={15} aria-hidden="true" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
            <label htmlFor="topbar-search" style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}>Search</label>
            <input
              id="topbar-search"
              className="search-input"
              type="search"
              placeholder="Search anything..."
              style={{ width: "100%", padding: "8px 12px 8px 36px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "0.875rem", color: "#374151", backgroundColor: "#F9FAFB" }}
            />
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
            <button className="topbar-btn" aria-label="Notifications" style={{ width: "38px", height: "38px", borderRadius: "10px", border: "1.5px solid #E5E7EB", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6B7280", position: "relative" }}>
              <Bell size={17} aria-hidden="true" />
              <span aria-label="You have new notifications" style={{ position: "absolute", top: "8px", right: "8px", width: "7px", height: "7px", borderRadius: "50%", background: "#EF4444", border: "1.5px solid #fff" }} />
            </button>
            <div aria-label={`Logged in as ${name}`} style={{ display: "flex", alignItems: "center", gap: "9px", padding: "5px 12px 5px 6px", border: "1.5px solid #E5E7EB", borderRadius: "10px", background: "#fff", cursor: "pointer" }}>
              <div aria-hidden="true" style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #4F46E5, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.72rem", fontWeight: "600" }}>
                {name.slice(0, 2).toUpperCase()}
              </div>
              <span style={{ fontSize: "0.83rem", fontWeight: "500", color: "#374151" }}>{name}</span>
            </div>
          </div>
        </div>

        <main className="ue-main" style={{ padding: "28px 28px 40px", flex: 1 }}>
          <div style={{ marginBottom: "28px", animation: "fadeUp 0.4s ease both 0.05s" }}>
            <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "0 0 4px" }}>
              {greeting}, <strong style={{ color: "#4F46E5" }}>{name}</strong> 👋
            </p>
            <h1 className="ue-h1" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.85rem", fontWeight: "700", color: "#111827", margin: 0, lineHeight: 1.2 }}>
              Manage Positions
            </h1>
            <p style={{ color: "#6B7280", fontSize: "0.85rem", margin: "5px 0 0" }}>
              <time dateTime={new Date().toISOString().split("T")[0]}>
                {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </time>
            </p>
          </div>

          <div style={{ backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #F1F3F9", boxShadow: "0 2px 8px rgba(15,23,42,0.05)", overflow: "hidden", animation: "fadeUp 0.4s ease both 0.15s" }}>
            <div className="card-header" style={{ padding: "20px 28px", borderBottom: "1px solid #F1F3F9", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div aria-hidden="true" style={{ width: "40px", height: "40px", borderRadius: "11px", background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#4F46E5", flexShrink: 0 }}>
                  <Users size={19} />
                </div>
                <div>
                  <h2 style={{ fontSize: "1rem", fontWeight: "600", color: "#111827", margin: "0 0 2px" }}>Employee Positions</h2>
                  <p style={{ fontSize: "0.78rem", color: "#6B7280", margin: 0 }}>Promote or demote employees between roles</p>
                </div>
              </div>
              <div className="search-wrap" style={{ position: "relative", minWidth: "220px" }}>
                <Search size={14} aria-hidden="true" style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
                <input
                  type="search"
                  className="search-input"
                  placeholder="Search employees..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px 8px 32px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "0.83rem", color: "#374151", backgroundColor: "#F9FAFB" }}
                />
              </div>
            </div>

            {loading ? (
              <div style={{ padding: "60px", textAlign: "center", color: "#9CA3AF", fontSize: "0.9rem" }}>
                Loading employees...
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: "60px", textAlign: "center", color: "#9CA3AF", fontSize: "0.9rem" }}>
                No employees found.
              </div>
            ) : (
              <div className="table-scroll-wrapper">
                <table className="emp-table">
                  <thead>
                    <tr>
                      {["Employee", "Department", "Joined", "Current Position", "Update Position"].map((col) => (
                        <th key={col}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((emp) => (
                      <tr key={emp._id} className="emp-row" style={{ transition: "background 0.15s" }}>
                        <td className="emp-name-cell">
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "linear-gradient(135deg, #4F46E5, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.72rem", fontWeight: "600", flexShrink: 0 }}>
                              {emp.name?.slice(0, 2).toUpperCase()}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: "600", color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{emp.name}</p>
                              <p style={{ margin: 0, fontSize: "0.75rem", color: "#9CA3AF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "160px" }}>{emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: "0.85rem", color: "#374151" }}>
                          {emp.department_id?.department_name || "—"}
                        </td>
                        <td style={{ fontSize: "0.83rem", color: "#6B7280" }}>
                          {emp.joining_date ? new Date(emp.joining_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                        </td>
                        <td>
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: "5px",
                            padding: "4px 12px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: "600",
                            background: emp.position === "manager" ? "#EEF2FF" : "#F0FDF4",
                            color: emp.position === "manager" ? "#4F46E5" : "#16A34A",
                          }}>
                            {emp.position === "manager" ? <ShieldCheck size={12} aria-hidden="true" /> : <UserCheck size={12} aria-hidden="true" />}
                            {emp.position === "manager" ? "Manager" : "Employee"}
                          </span>
                        </td>
                        <td className="emp-actions-cell">
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            <button
                              className="pos-btn"
                              disabled={emp.position === "manager" || updatingId === emp._id}
                              onClick={() => handlePositionChange(emp._id, "manager")}
                              style={{ background: emp.position === "manager" ? "#E5E7EB" : "#EEF2FF", color: emp.position === "manager" ? "#9CA3AF" : "#4F46E5" }}
                            >
                              {updatingId === emp._id ? "Saving..." : "Make Manager"}
                            </button>
                            <button
                              className="pos-btn"
                              disabled={emp.position === "employee" || updatingId === emp._id}
                              onClick={() => handlePositionChange(emp._id, "employee")}
                              style={{ background: emp.position === "employee" ? "#E5E7EB" : "#FEF2F2", color: emp.position === "employee" ? "#9CA3AF" : "#DC2626" }}
                            >
                              {updatingId === emp._id ? "Saving..." : "Remove Manager"}
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