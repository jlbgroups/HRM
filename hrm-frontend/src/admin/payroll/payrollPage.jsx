import React, { useState, useEffect } from "react";
import Sidebar from "../../layouts/sidebar";
import MobileTopBar from "../../employee/MobileTopBar";
import { DollarSign, CheckCircle2, Download, Bell, Search, Clock, Users, TrendingUp, X } from "lucide-react";
import axios from "axios";

function Payroll() {
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [search, setSearch] = useState("");

  const [selectedEmp, setSelectedEmp] = useState("");
  const [salary, setSalary] = useState("");
  const [deductions, setDeductions] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const sidebarWidth = isMobile ? 0 : isOpen ? 255 : 68;

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("https://hrm-backend-vvqg.onrender.com/api/payroll", {
        headers: { "x-auth-token": token },
      });
      setPayrollData(res.data.data || []);
    } catch (err) {
      console.error("Error fetching payroll:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayroll(); }, []);

  const handleDownload = async (payrollId, employeeName) => {
    if (!payrollId) { alert("No payment record found to download."); return; }
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`https://hrm-backend-vvqg.onrender.com/api/payroll/download/${payrollId}`, {
        headers: { "x-auth-token": token },
      });
      const data = res.data.data;
      const emp = data.employee_id;
      const content = `
-----------------------------------------
PAYSLIP: ${data.company_name || "Company"}
-----------------------------------------
Employee Name : ${emp?.name || "N/A"}
Reference ID  : EMP-${emp?._id || "N/A"}
Payment Date  : ${new Date(data.pay_date).toLocaleDateString()}
Department    : ${emp?.department_id?.department_name || "General"}
-----------------------------------------
Earnings:
Base Salary   : ₹${parseFloat(data.salary).toLocaleString()}
Bonus         : ₹${parseFloat(data.bonus || 0).toLocaleString()}

Deductions:
Total Deduct. : ₹${parseFloat(data.deductions || 0).toLocaleString()}
-----------------------------------------
NET SALARY    : ₹${parseFloat(data.net_salary).toLocaleString()}
-----------------------------------------
This is a computer-generated document.
`;
      const element = document.createElement("a");
      const file = new Blob([content], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = `Payslip_${employeeName.replace(/\s+/g, "_")}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (err) {
      alert(err.response?.data?.error || "Could not download payslip");
    }
  };

  const handleRunPayroll = async (e) => {
    e.preventDefault();
    if (!selectedEmp) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "https://hrm-backend-vvqg.onrender.com/api/payroll/generate",
        { employee_id: selectedEmp, salary: parseFloat(salary), deductions: parseFloat(deductions) },
        { headers: { "x-auth-token": token } }
      );
      setShowModal(false);
      setSelectedEmp(""); setSalary(""); setDeductions("0");
      fetchPayroll();
    } catch (err) {
      alert(err.response?.data?.error || "Error generating payroll");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPayout = payrollData.reduce((acc, curr) => acc + (parseFloat(curr.last_net_salary) || 0), 0);
  const paidCount = payrollData.filter((p) => p.pay_date).length;
  const pendingCount = payrollData.filter((p) => !p.pay_date).length;

  const filtered = payrollData.filter((p) =>
    (p.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F9FAFB", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(40px); } to { opacity:1; transform:translateY(0); } }
        .stat-card { transition: transform 0.18s, box-shadow 0.18s; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(15,23,42,0.10) !important; }
        .pay-row { transition: background 0.12s; }
        .pay-row:hover { background: #F5F7FF !important; }
        .search-input:focus { outline: none; border-color: #4F46E5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.10); }
        .topbar-btn:hover { background: #F3F4F6 !important; }
        .form-input { width: 100%; padding: 9px 13px; border: 1.5px solid #E5E7EB; border-radius: 9px; font-size: 0.875rem; color: #374151; background: #F9FAFB; font-family: inherit; transition: border-color 0.18s, box-shadow 0.18s; outline: none; }
        .form-input:focus { border-color: #4F46E5; box-shadow: 0 0 0 3px rgba(79,70,229,0.10); }
        * { box-sizing: border-box; }
        .modal-bg   { position:fixed; inset:0; background:rgba(15,23,42,0.5); display:flex; align-items:flex-end; justify-content:center; z-index:2000; padding:0; }
        .modal-sheet { background:#fff; border-radius:18px 18px 0 0; width:100%; max-height:92vh; overflow-y:auto; padding:24px 20px 32px; animation:slideUp .25s ease both; }
        @media (min-width:600px) {
          .modal-bg    { align-items:center; padding:16px; }
          .modal-sheet { border-radius:16px; max-width:480px; padding:28px; animation:fadeUp .2s ease both; }
        }
        @media (max-width: 768px) {
          .pay-topbar       { display: none !important; }
          .pay-main         { padding: 72px 14px 32px !important; }
          .pay-page-head    { flex-direction: column !important; align-items: stretch !important; gap: 12px !important; }
          .pay-h1           { font-size: 1.45rem !important; }
          .pay-process-btn  { width: 100% !important; justify-content: center !important; }
          .pay-stats-grid   { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
          .pay-stat-card    { padding: 14px !important; }
          .pay-stat-val     { font-size: 1.3rem !important; }
          .pay-table-header { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
          .pay-search-inp   { width: 100% !important; }
          .pay-table-wrap   { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .pay-table-wrap table { min-width: 580px; }
          .pay-modal-grid   { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .pay-main       { padding: 24px 20px 32px !important; }
          .pay-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      <MobileTopBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div style={{
        marginLeft: `${sidebarWidth}px`, flex: 1,
        transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column", minHeight: "100vh", minWidth: 0,
      }}>
        <div className="pay-topbar" style={{
          height: "64px", backgroundColor: "#fff", borderBottom: "1px solid #F1F3F9",
          display: "flex", alignItems: "center", padding: "0 28px", gap: "16px",
          position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 4px rgba(15,23,42,0.04)",
        }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "380px" }}>
            <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6B7280" }} />
            <input className="search-input" placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)}
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

        <main className="pay-main" style={{ padding: "28px 28px 40px", flex: 1 }}>
          <div className="pay-page-head" style={{ marginBottom: "24px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", animation: "fadeUp 0.4s ease both 0.05s" }}>
            <div>
              <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "0 0 4px" }}>
                {greeting}, <strong style={{ color: "#4F46E5" }}>{name}</strong> 👋
              </p>
              <h1 className="pay-h1" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.85rem", fontWeight: "700", color: "#111827", margin: 0, lineHeight: 1.2 }}>
                Payroll Management
              </h1>
              <p style={{ color: "#6B7280", fontSize: "0.85rem", margin: "5px 0 0" }}>
                {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            <button className="pay-process-btn" onClick={() => setShowModal(true)} style={{
              display: "flex", alignItems: "center", gap: "7px",
              padding: "10px 18px", backgroundColor: "#4F46E5", color: "#fff",
              border: "none", borderRadius: "10px", fontSize: "0.875rem",
              fontWeight: "600", cursor: "pointer", fontFamily: "inherit",
              boxShadow: "0 2px 8px rgba(79,70,229,0.25)", whiteSpace: "nowrap", alignSelf: "flex-start",
            }}>
              <DollarSign size={15} /> Process Payment
            </button>
          </div>

          <div className="pay-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "24px" }}>
            {[
              { title: "Total Payout",     count: `₹${totalPayout.toLocaleString()}`, icon: <TrendingUp size={19} />,    color: "#4F46E5", bg: "#EEF2FF", trend: "Current cycle",    trendUp: true },
              { title: "Total Employees",  count: payrollData.length,                  icon: <Users size={19} />,          color: "#059669", bg: "#ECFDF5", trend: "Staff on record",  trendUp: true },
              { title: "Paid",             count: paidCount,                            icon: <CheckCircle2 size={19} />,   color: "#059669", bg: "#ECFDF5", trend: "Processed",        trendUp: true },
              { title: "Pending",          count: pendingCount,                         icon: <Clock size={19} />,          color: "#D97706", bg: "#FFFBEB", trend: "Awaiting payment", trendUp: false },
            ].map((stat, idx) => (
              <div key={idx} className="stat-card pay-stat-card" style={{ backgroundColor: "#fff", borderRadius: "14px", padding: "18px", border: "1px solid #F1F3F9", boxShadow: "0 2px 8px rgba(15,23,42,0.05)", animation: `fadeUp 0.4s ease both ${0.1 + idx * 0.07}s` }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", color: stat.color, marginBottom: "12px" }}>
                  {stat.icon}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#6B7280", fontWeight: "500", marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.4px" }}>{stat.title}</div>
                <div className="pay-stat-val" style={{ fontSize: typeof stat.count === "string" && stat.count.startsWith("₹") ? "1.4rem" : "2rem", fontWeight: "700", color: "#111827", lineHeight: 1, fontFamily: "'Playfair Display', serif", marginBottom: "6px" }}>
                  {loading ? <span style={{ display: "inline-block", width: "50px", height: "28px", background: "#F3F4F6", borderRadius: "5px" }} /> : stat.count}
                </div>
                <div style={{ fontSize: "0.73rem", color: stat.trendUp ? "#059669" : "#D97706", fontWeight: "500" }}>{stat.trend}</div>
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: "#fff", borderRadius: "14px", border: "1px solid #F1F3F9", boxShadow: "0 2px 8px rgba(15,23,42,0.05)", overflow: "hidden", animation: "fadeUp 0.4s ease both 0.35s" }}>
            <div className="pay-table-header" style={{ padding: "16px 20px", borderBottom: "1px solid #F1F3F9", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
              <div>
                <h2 style={{ fontSize: "0.95rem", fontWeight: "600", color: "#111827", margin: "0 0 2px" }}>Payroll Records</h2>
                <p style={{ fontSize: "0.75rem", color: "#6B7280", margin: 0 }}>{filtered.length} {filtered.length === 1 ? "employee" : "employees"} found</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: isMobile ? "1 1 100%" : "0 0 auto", flexWrap: "wrap" }}>
                {isMobile && (
                  <div style={{ position: "relative", flex: "1 1 100%" }}>
                    <Search size={13} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#6B7280" }} />
                    <input className="search-input pay-search-inp" placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)}
                      style={{ padding: "8px 12px 8px 30px", border: "1.5px solid #E5E7EB", borderRadius: "9px", fontSize: "0.82rem", color: "#374151", backgroundColor: "#F9FAFB", width: "100%" }} />
                  </div>
                )}
                <span style={{ fontSize: "0.72rem", fontWeight: "600", color: "#4F46E5", backgroundColor: "#EEF2FF", padding: "4px 12px", borderRadius: "20px", whiteSpace: "nowrap" }}>
                  Live Records
                </span>
              </div>
            </div>

            <div className="pay-table-wrap">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#FAFBFF" }}>
                    {["#", "Employee", "Net Salary", "Status", "Payment Date", "Payslip"].map((h, i) => (
                      <th key={i} style={{ padding: "10px 18px", textAlign: i === 5 ? "right" : "left", fontSize: "0.68rem", fontWeight: "600", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #F1F3F9", whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {[30, 140, 90, 70, 100, 50].map((w, j) => (
                          <td key={j} style={{ padding: "13px 18px" }}>
                            <div style={{ height: "13px", width: `${w}px`, background: "#F3F4F6", borderRadius: "4px", marginLeft: j === 5 ? "auto" : 0 }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: "44px", textAlign: "center", color: "#6B7280", fontSize: "0.875rem" }}>
                        No payroll records found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((pay, i) => (
                      <tr key={pay.employee_id} className="pay-row" style={{ borderBottom: "1px solid #F9FAFB" }}>
                        <td style={{ padding: "12px 18px", fontSize: "0.8rem", color: "#6B7280", fontWeight: "500" }}>{String(i + 1).padStart(2, "0")}</td>
                        <td style={{ padding: "12px 18px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                            <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: `hsl(${(pay.name?.charCodeAt(0) || 65) * 5 % 360}, 55%, 55%)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.72rem", fontWeight: "600", flexShrink: 0 }}>
                              {(pay.name || "?").slice(0, 2).toUpperCase()}
                            </div>
                            <span style={{ fontSize: "0.855rem", fontWeight: "500", color: "#111827", whiteSpace: "nowrap" }}>{pay.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 18px" }}>
                          <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "#111827", whiteSpace: "nowrap" }}>
                            ₹{parseFloat(pay.last_net_salary || 0).toLocaleString()}
                          </span>
                        </td>
                        <td style={{ padding: "12px 18px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 10px", borderRadius: "20px", fontSize: "0.7rem", fontWeight: "600", backgroundColor: pay.pay_date ? "#ECFDF5" : "#FFFBEB", color: pay.pay_date ? "#059669" : "#D97706", whiteSpace: "nowrap" }}>
                            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: pay.pay_date ? "#059669" : "#D97706" }} />
                            {pay.pay_date ? "Paid" : "Pending"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 18px", fontSize: "0.84rem", color: "#374151", whiteSpace: "nowrap" }}>
                          {pay.pay_date ? new Date(pay.pay_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                        </td>
                        <td style={{ padding: "12px 18px", textAlign: "right" }}>
                          <button aria-label={`Download payslip for ${pay.name}`}   title={`Download payslip for ${pay.name}`} onClick={() => handleDownload(pay.payroll_id, pay.name)} disabled={!pay.pay_date}
                            style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1.5px solid", borderColor: pay.pay_date ? "#E0E7FF" : "#F1F3F9", backgroundColor: pay.pay_date ? "#EEF2FF" : "#F9FAFB", color: pay.pay_date ? "#4F46E5" : "#D1D5DB", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: pay.pay_date ? "pointer" : "not-allowed" }}>
                            <Download size={13} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!loading && filtered.length > 0 && (
              <div style={{ padding: "10px 20px", borderTop: "1px solid #F1F3F9", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
                <span style={{ fontSize: "0.75rem", color: "#6B7280" }}>Showing {filtered.length} of {payrollData.length} records</span>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Clock size={11} style={{ color: "#6B7280" }} />
                  <span style={{ fontSize: "0.7rem", color: "#6B7280" }}>Updated just now</span>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {showModal && (
        <div className="modal-bg" onClick={() => setShowModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#111827", margin: "0 0 2px", fontFamily: "'Playfair Display', serif" }}>Process Payment</h2>
                <p style={{ fontSize: "0.77rem", color: "#6B7280", margin: 0 }}>Generate payroll for a staff member</p>
              </div>
              <button   aria-label="Close payroll modal"  title="Close" type="button" onClick={() => setShowModal(false)} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1.5px solid #E5E7EB", background: "#F9FAFB", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6B7280" }}>
                <X size={15} />
              </button>
            </div>
            <form onSubmit={handleRunPayroll}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>Select Staff Member</label>
                <select className="form-input" value={selectedEmp} onChange={(e) => setSelectedEmp(e.target.value)} required>
                  <option value="">— Choose Employee —</option>
                  {payrollData.map((emp) => (
                    <option key={emp.employee_id} value={emp.employee_id}>{emp.name}</option>
                  ))}
                </select>
              </div>
              <div className="pay-modal-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "22px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>Base Salary (₹)</label>
                  <input type="number" className="form-input" placeholder="0.00" value={salary} onChange={(e) => setSalary(e.target.value)} required />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>Deductions (₹)</label>
                  <input type="number" className="form-input" value={deductions} onChange={(e) => setDeductions(e.target.value)} />
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "10px", border: "1.5px solid #E5E7EB", borderRadius: "10px", background: "#fff", fontSize: "0.875rem", fontWeight: "500", color: "#374151", cursor: "pointer", fontFamily: "inherit" }}>
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: "10px", border: "none", borderRadius: "10px", background: "#4F46E5", fontSize: "0.875rem", fontWeight: "600", color: "#fff", cursor: isSubmitting ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: isSubmitting ? 0.7 : 1, boxShadow: "0 2px 8px rgba(79,70,229,0.25)" }}>
                  {isSubmitting ? "Processing..." : "Confirm & Pay"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payroll;