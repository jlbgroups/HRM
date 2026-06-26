import { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { Clock, Mail, Phone } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';

const API = import.meta.env.VITE_API_URL || "https://hrm-backend-vvqg.onrender.com";

const Login                = lazy(() => import("./auth/Login"));
const Register             = lazy(() => import("./auth/Register"));
const Holidays             = lazy(() => import("./common_moduls/HolidayPages"));
const AdminDashboardPage   = lazy(() => import("./admin/dashboard/AdminDashboardPage"));
const EmployeeDashboard    = lazy(() => import("./employee/dashboard/EmployeeDashboardPage"));
const AdminAttendancePage  = lazy(() => import("./admin/attendence/AdminAttendancePage"));
const AddEmployee          = lazy(() => import("./admin/employees/AddEmployeePage"));
const UpdateEmployee       = lazy(() => import("./admin/employees/UpdateEmployee"));
const DepartmentsPage      = lazy(() => import("./admin/department/DepartmentsPage"));
const Leaves               = lazy(() => import("./common_moduls/leaves/LeavesPage"));
const Payroll              = lazy(() => import("./admin/payroll/payrollPage"));
const Designations         = lazy(() => import("../src/Designations"));
const AdminSupportPage     = lazy(() => import("./admin/supports/AdminSupportPage"));
const AppreciationPage     = lazy(() => import("./admin/appreciation/AppreciationPage"));
const LetterPage           = lazy(() => import("./admin/letter/LetterPage"));
const PolicyPage           = lazy(() => import("./admin/policy/PolicyPage"));
const Profile              = lazy(() => import("./employee/profile/Profile"));
const MarkAttendance       = lazy(() => import("./employee/attendance/MarkAttendancePage"));
const Appreciations        = lazy(() => import("./employee/appreciations/EmployeeAppreciations"));
const EmployeeLetters      = lazy(() => import("./employee/employeeLetters/EmployeeLetters"));
const EmployeePolicies     = lazy(() => import("./employee/employeePolicies/EmployeePolicies"));
const SuperadminDashboard  = lazy(() => import("./superadmin/saas/SuperadminDashboardPage"));
const AddSuperadminPage    = lazy(() => import("./superadmin/saas/AddSuperadminPage"));
const TransactionsPage     = lazy(() => import("./superadmin/TransactionsPage"));
const PricingPage          = lazy(() => import("./superadmin/saas/PricingPage"));
const CompaniesPage        = lazy(() => import("./superadmin/CompaniesPage"));
const WebsiteSettingsPage  = lazy(() => import("./superadmin/saas/WebsiteSettingsPage"));
const Home                 = lazy(() => import("./pages/Home"));
const Features             = lazy(() => import("./pages/Features"));
const Pricing              = lazy(() => import("./pages/Pricing"));
const Contact              = lazy(() => import("./pages/Contact"));
const AssignTask           = lazy(() => import("./employee/task/AssignTask"));
const MyTasks              = lazy(() => import("./employee/mytask/MyTasks"));
const AdvanceRequests      = lazy(() => import("./admin/AdvanceRequests/AdvanceRequests"));
const IncrementPromotion   = lazy(() => import("./admin/IncrementPromotion/IncrementPromotion"));
const SalaryAdvance        = lazy(() => import("./employee/prepayment/SalaryAdvance"));
const CareerHistory        = lazy(() => import("./employee/increment/CareerHistory"));
const EmployeePayslips     = lazy(() => import("./employee/employeePayslip/Payslips"));

const AdminWarnings        = lazy(() => import("./admin/employeeOffboardings/Adminwarnings"));
const AdminResignations    = lazy(() => import("./admin/employeeOffboardings/Adminresignations"));
const AdminComplaints      = lazy(() => import("./admin/employeeOffboardings/Admincomplaints"));
const EmployeeWarnings     = lazy(() => import("./employee/offboarding/Employeewarnings"));
const EmployeeResignation  = lazy(() => import("./employee/offboarding/Employeeresignation"));
const EmployeeComplaints   = lazy(() => import("./employee/offboarding/Employeecomplaints"));

const PageLoader = () => (
  <div style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "#F9FAFB",
    fontFamily: "'DM Sans', sans-serif",
  }}>
    <div style={{ textAlign: "center" }}>
      <div style={{
        width: 40,
        height: 40,
        border: "3px solid #EEF2FF",
        borderTop: "3px solid #4F46E5",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
        margin: "0 auto 16px",
      }} />
      <p style={{ fontSize: "0.875rem", color: "#9CA3AF", margin: 0 }}>Loading...</p>
    </div>
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

const TrialExpiredPage = () => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0F1219 0%, #161B27 100%)",
      fontFamily: "'DM Sans', sans-serif",
      color: "#F3F4F6",
      padding: "20px",
    }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={{
        maxWidth: "480px",
        width: "100%",
        background: "#161B27",
        borderRadius: "16px",
        border: "1px solid #1E2535",
        padding: "40px 32px",
        textAlign: "center",
        boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
        animation: "fadeUp 0.5s ease both",
      }}>
        <div style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          background: "rgba(239, 68, 68, 0.1)",
          border: "2px solid #EF4444",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
          color: "#EF4444",
        }}>
          <Clock size={32} />
        </div>
        <h2 style={{
          fontSize: "1.75rem",
          fontWeight: "700",
          marginBottom: "16px",
          fontFamily: "'Playfair Display', serif",
        }}>Trial Period Expired</h2>
        <p style={{
          color: "#9CA3AF",
          fontSize: "0.95rem",
          lineHeight: "1.6",
          marginBottom: "28px",
        }}>
          Your 15-day trial period has ended. To continue using the HRM portal, please contact our administrator to upgrade your account.
        </p>

        <div style={{
          background: "#0F1219",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "32px",
          textAlign: "left",
          border: "1px solid #1E2535",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "14px",
          }}>
            <Mail size={18} style={{ color: "#818CF8" }} />
            <div>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#6B7280", textTransform: "uppercase", fontWeight: 600 }}>Email Address</p>
              <a href="mailto:lakshman@levroxen.com" style={{ margin: 0, fontSize: "0.9rem", color: "#F3F4F6", textDecoration: "none", fontWeight: 500 }}>lakshman@levroxen.com</a>
            </div>
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}>
            <Phone size={18} style={{ color: "#818CF8" }} />
            <div>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#6B7280", textTransform: "uppercase", fontWeight: 600 }}>Phone Number</p>
              <a href="tel:8688456559" style={{ margin: 0, fontSize: "0.9rem", color: "#F3F4F6", textDecoration: "none", fontWeight: 500 }}>8688456559</a>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: "12px",
            background: "#4F46E5",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            fontSize: "0.95rem",
            fontWeight: "600",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onMouseOver={(e) => e.target.style.background = "#4338CA"}
          onMouseOut={(e) => e.target.style.background = "#4F46E5"}
        >
          Logout / Sign In
        </button>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");
  const [trialExpired, setTrialExpired] = useState(() => {
    return localStorage.getItem("trial_expired") === "true";
  });

  useEffect(() => {
    if (!token || (role !== "company_admin" && role !== "employee")) {
      return;
    }

    const checkTrial = async () => {
      try {
        const res = await axios.get(`${API}/api/saas/my-trial`, {
          headers: { "x-auth-token": token }
        });
        if (res.data.success && res.data.data) {
          const expired = res.data.data.is_expired;
          setTrialExpired(expired);
          localStorage.setItem("trial_expired", expired ? "true" : "false");
        }
      } catch (err) {
        console.error("Failed to verify trial status", err);
        if (err.response?.status === 403 && err.response?.data?.code === "TRIAL_EXPIRED") {
          setTrialExpired(true);
          localStorage.setItem("trial_expired", "true");
        }
      }
    };

    checkTrial();
  }, [token, role]);

  if (!token) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(role)) {
    const fallback = role === "employee" ? "/employee-dashboard" : "/dashboard";
    return <Navigate to={fallback} replace />;
  }

  if ((role === "company_admin" || role === "employee") && trialExpired) {
    return <TrialExpiredPage />;
  }

  return children;
};

const HomeRedirect = () => {
  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");

  if (!token) return <Home />;
  if (role === "employee")      return <Navigate to="/employee-dashboard" replace />;
  if (role === "company_admin") return <Navigate to="/dashboard" replace />;
  return <Navigate to="/superadmin-dashboard" replace />;
};

function App() {
  return (
      <ThemeProvider>
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />

          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing"  element={<Pricing />} />
          <Route path="/contact"  element={<Contact />} />

          <Route path="/employee-dashboard" element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <EmployeeDashboard />
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={["company_admin"]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          } />

          <Route path="/admin-attendance" element={
            <ProtectedRoute allowedRoles={["company_admin"]}>
              <AdminAttendancePage />
            </ProtectedRoute>
          } />

          <Route path="/add-employee" element={
            <ProtectedRoute allowedRoles={["company_admin"]}>
              <AddEmployee />
            </ProtectedRoute>
          } />

          <Route path="/update-employee" element={
            <ProtectedRoute allowedRoles={["company_admin"]}>
              <UpdateEmployee />
            </ProtectedRoute>
          } />

          <Route path="/departments" element={
            <ProtectedRoute allowedRoles={["company_admin"]}>
              <DepartmentsPage />
            </ProtectedRoute>
          } />

          <Route path="/holidays" element={
            <ProtectedRoute allowedRoles={["employee", "company_admin"]}>
              <Holidays />
            </ProtectedRoute>
          } />

          <Route path="/leaves" element={
            <ProtectedRoute allowedRoles={["employee", "company_admin"]}>
              <Leaves />
            </ProtectedRoute>
          } />

          <Route path="/payroll" element={
            <ProtectedRoute allowedRoles={["company_admin"]}>
              <Payroll />
            </ProtectedRoute>
          } />

          <Route path="/designations" element={
            <ProtectedRoute allowedRoles={["company_admin"]}>
              <Designations />
            </ProtectedRoute>
          } />

          <Route path="/support" element={
            <ProtectedRoute allowedRoles={["company_admin"]}>
              <AdminSupportPage />
            </ProtectedRoute>
          } />

          <Route path="/appreciation" element={
            <ProtectedRoute allowedRoles={["company_admin"]}>
              <AppreciationPage />
            </ProtectedRoute>
          } />

          <Route path="/letter" element={
            <ProtectedRoute allowedRoles={["company_admin"]}>
              <LetterPage />
            </ProtectedRoute>
          } />

          <Route path="/policy" element={
            <ProtectedRoute allowedRoles={["company_admin"]}>
              <PolicyPage />
            </ProtectedRoute>
          } />

          <Route path="/admin/advance-requests" element={
            <ProtectedRoute allowedRoles={["company_admin"]}>
              <AdvanceRequests />
            </ProtectedRoute>
          } />

          <Route path="/admin/increment-promotion" element={
            <ProtectedRoute allowedRoles={["company_admin"]}>
              <IncrementPromotion />
            </ProtectedRoute>
          } />

          <Route path="/admin/warnings" element={
            <ProtectedRoute allowedRoles={["company_admin"]}>
              <AdminWarnings />
            </ProtectedRoute>
          } />

          <Route path="/admin/resignations" element={
            <ProtectedRoute allowedRoles={["company_admin"]}>
              <AdminResignations />
            </ProtectedRoute>
          } />

          <Route path="/admin/complaints" element={
            <ProtectedRoute allowedRoles={["company_admin"]}>
              <AdminComplaints />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <Profile />
            </ProtectedRoute>
          } />

          <Route path="/attendance" element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <MarkAttendance />
            </ProtectedRoute>
          } />

          <Route path="/employeePolicies" element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <EmployeePolicies />
            </ProtectedRoute>
          } />

          <Route path="/employeeLetters" element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <EmployeeLetters />
            </ProtectedRoute>
          } />

          <Route path="/appreciations" element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <Appreciations />
            </ProtectedRoute>
          } />

          <Route path="/assign-task" element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <AssignTask />
            </ProtectedRoute>
          } />

          <Route path="/employee/salary-advance" element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <SalaryAdvance />
            </ProtectedRoute>
          } />

          <Route path="/employee/career-history" element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <CareerHistory />
            </ProtectedRoute>
          } />

          <Route path="/employee/payslips" element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <EmployeePayslips />
            </ProtectedRoute>
          } />

          <Route path="/employee/warnings" element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <EmployeeWarnings />
            </ProtectedRoute>
          } />

          <Route path="/employee/resignation" element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <EmployeeResignation />
            </ProtectedRoute>
          } />

          <Route path="/employee/complaints" element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <EmployeeComplaints />
            </ProtectedRoute>
          } />

          <Route path="/my-tasks" element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <MyTasks />
            </ProtectedRoute>
          } />

          <Route path="/superadmin-dashboard" element={
            <ProtectedRoute allowedRoles={["super_admin", "software_owner"]}>
              <SuperadminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/superadmin/website-settings" element={
            <ProtectedRoute allowedRoles={["super_admin", "software_owner"]}>
              <WebsiteSettingsPage />
            </ProtectedRoute>
          } />

          <Route path="/superadmin/companiespage" element={
            <ProtectedRoute allowedRoles={["super_admin", "software_owner"]}>
              <CompaniesPage />
            </ProtectedRoute>
          } />

          <Route path="/superadmin/pricing" element={
            <ProtectedRoute allowedRoles={["super_admin", "software_owner"]}>
              <PricingPage />
            </ProtectedRoute>
          } />

          <Route path="/transactions" element={
            <ProtectedRoute allowedRoles={["super_admin", "software_owner"]}>
              <TransactionsPage />
            </ProtectedRoute>
          } />

          <Route path="/add-superadmin" element={
            <ProtectedRoute allowedRoles={["super_admin", "software_owner"]}>
              <AddSuperadminPage />
            </ProtectedRoute>
          } />
        </Routes>
      </Suspense>
    </Router>
    </ThemeProvider>
  );
}

export default App;