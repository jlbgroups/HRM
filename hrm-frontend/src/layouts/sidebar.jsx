import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, UserPlus, Clock, Palmtree, CalendarRange,
  Wallet, LogOut, Building2, CreditCard, HeadphonesIcon,
  UserCog, Globe, Menu, UserCircle, ChevronRight,
  ClipboardList, Mail, ArrowLeftRight, X,
} from "lucide-react";

const ALL_MENU_ITEMS = [
  { name: "Admin Dashboard",     path: "/dashboard",                   icon: <LayoutDashboard size={17} />, roles: ["company_admin"] },
  { name: "Super Control Panel", path: "/superadmin-dashboard",        icon: <LayoutDashboard size={17} />, roles: ["super_admin", "software_owner"] },
  { name: "My Dashboard",        path: "/employee-dashboard",          icon: <LayoutDashboard size={17} />, roles: ["employee"] },
  { name: "Add Employee",        path: "/add-employee",                icon: <UserPlus size={17} />,        roles: ["company_admin"] },
  { name: "Employee Attendance", path: "/admin-attendance",            icon: <Clock size={17} />,           roles: ["company_admin"] },
  { name: "My Attendance",       path: "/attendance",                  icon: <Clock size={17} />,           roles: ["employee"] },
  { name: "Holidays",            path: "/holidays",                    icon: <Palmtree size={17} />,        roles: ["company_admin", "employee"] },
  { name: "Leaves",              path: "/leaves",                      icon: <CalendarRange size={17} />,   roles: ["company_admin", "employee"] },
  { name: "Appreciations",       path: "/appreciations",               icon: <LayoutDashboard size={17} />, roles: ["employee"] },
  { name: "Employee Policies",   path: "/employeePolicies",            icon: <ClipboardList size={17} />,   roles: ["employee"] },
  { name: "Employee Letters",    path: "/employeeLetters",             icon: <Mail size={17} />,            roles: ["employee"] },
  { name: "Payroll",             path: "/payroll",                     icon: <Wallet size={17} />,          roles: ["company_admin"] },
  { name: "Departments",         path: "/departments",                 icon: <Building2 size={17} />,       roles: ["company_admin"] },
  { name: "Designations",        path: "/designations",                icon: <UserPlus size={17} />,        roles: ["company_admin"] },
  { name: "Profile",             path: "/profile",                     icon: <UserCircle size={17} />,      roles: ["employee"] },
  { name: "Transactions",        path: "/transactions",                icon: <CreditCard size={17} />,      roles: ["super_admin", "software_owner"] },
  { name: "Companies",           path: "/superadmin/companiespage",    icon: <Building2 size={17} />,       roles: ["super_admin", "software_owner"] },
  { name: "Add Super Admin",     path: "/add-superadmin",              icon: <UserCog size={17} />,         roles: ["super_admin", "software_owner"] },
  { name: "Pricing Plans",       path: "/superadmin/pricing",          icon: <CreditCard size={17} />,      roles: ["super_admin", "software_owner"] },
  { name: "Website Settings",    path: "/superadmin/website-settings", icon: <Globe size={17} />,           roles: ["software_owner"] },
  { name: "Appreciation",        path: "/appreciation",                icon: <UserPlus size={17} />,        roles: ["company_admin"] },
  { name: "Letters",             path: "/letter",                      icon: <ClipboardList size={17} />,   roles: ["company_admin"] },
  { name: "Policies",            path: "/policy",                      icon: <Mail size={17} />,            roles: ["company_admin"] },
];

const ROLE_LABELS = {
  company_admin:  "Company Admin",
  super_admin:    "Super Admin",
  software_owner: "Software Owner",
  employee:       "Employee",
};

const SB_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
  .sb-nav-link  { transition: background 0.15s, color 0.15s; }
  .sb-nav-link:hover { background: rgba(99,102,241,0.08) !important; color: #4F46E5 !important; }
  .sb-nav-link:hover .sb-icon { color: #4F46E5 !important; }
  .sb-toggle:hover  { background: rgba(99,102,241,0.08) !important; }
  .sb-logout:hover  { background: #fef2f2 !important; color: #dc2626 !important; }
  .sb-scroll::-webkit-scrollbar       { width: 4px; }
  .sb-scroll::-webkit-scrollbar-track { background: transparent; }
  .sb-scroll::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 4px; }
  @keyframes badgePulse { 0%,100%{opacity:1} 50%{opacity:0.55} }
  .preview-badge { animation: badgePulse 2.5s ease-in-out infinite; }
  .view-tab { transition: all 0.2s ease; }
  .view-tab:hover { opacity: 0.85; }
  .sb-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.45);
    z-index: 999;
    backdrop-filter: blur(2px);
  }
  @media (max-width: 768px) {
    .sb-overlay.active { display: block; }
  }
`;

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
};

const UserAvatar = ({ size = 36, initials, avatarUrl, showBadge = false }) => {
  const [imgError, setImgError] = useState(false);
  useEffect(() => { setImgError(false); }, [avatarUrl]);

  const showImage = avatarUrl && !imgError;

  return (
    <div
      aria-hidden="true"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
        border: showImage ? "2px solid #E0E7FF" : "none",
      }}
    >
      {showImage ? (
        <img
          src={avatarUrl}
          alt={initials}
          onError={() => setImgError(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            borderRadius: "50%",
          }}
        />
      ) : (
        <div style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: size <= 36 ? "0.8rem" : "1rem",
          fontWeight: "600",
          borderRadius: "50%",
        }}>
          {initials}
        </div>
      )}
      {showBadge && (
        <span
          aria-label="Viewing as employee"
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background: "#10B981",
            border: "2px solid #fff",
          }}
        />
      )}
    </div>
  );
};

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate  = useNavigate();
  const isMobile  = useIsMobile();

  const trueRole = localStorage.getItem("true_role");
  const name     = localStorage.getItem("name") || "Administrator";
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem("avatar") || "");

  useEffect(() => {
    const syncAvatar = () => {
      setAvatarUrl(localStorage.getItem("avatar") || "");
    };
    window.addEventListener("storage", syncAvatar);
    return () => window.removeEventListener("storage", syncAvatar);
  }, []);

  const [viewMode, setViewMode] = useState(() => localStorage.getItem("role"));

  const initials = useMemo(
    () => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
    [name]
  );

  const trueRoleLabel = ROLE_LABELS[trueRole] || trueRole;
  const isAdminViewingAsEmployee = trueRole === "company_admin" && viewMode === "employee";

  const menuItems = useMemo(
    () => ALL_MENU_ITEMS.filter(item => item.roles.includes(viewMode)),
    [viewMode]
  );

  const sidebarVisible  = isMobile ? isOpen : true;
  const sidebarExpanded = isMobile ? true   : isOpen;

  const handleViewSwitch = useCallback(() => {
    const next = viewMode === "company_admin" ? "employee" : "company_admin";
    localStorage.setItem("role", next);
    setViewMode(next);
    navigate(next === "employee" ? "/employee-dashboard" : "/dashboard");
    if (isMobile) setIsOpen(false);
  }, [viewMode, navigate, isMobile, setIsOpen]);

  const handleLogout = useCallback(() => {
    localStorage.clear();
    window.location.href = "/";
  }, []);

  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, [setIsOpen]);

  const handleNavClick = useCallback(() => {
    if (isMobile) setIsOpen(false);
  }, [isMobile, setIsOpen]);

  return (
    <>
      <style>{SB_STYLES}</style>
      <div
        className={`sb-overlay${isMobile && isOpen ? " active" : ""}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      <nav
        id="sidebar-nav"
        aria-label="Main navigation"
        style={{
          width: sidebarExpanded ? "255px" : "68px",
          height: "100vh",
          position: "fixed",
          left: isMobile ? (isOpen ? "0" : "-280px") : "0",
          top: 0,
          zIndex: 1000,
          backgroundColor: "#fff",
          borderRight: "1px solid #F1F3F9",
          boxShadow: isMobile && isOpen
            ? "4px 0 24px rgba(15,23,42,0.15)"
            : "2px 0 16px rgba(15,23,42,0.06)",
          display: "flex",
          flexDirection: "column",
          transition: isMobile
            ? "left 0.28s cubic-bezier(0.4,0,0.2,1)"
            : "width 0.25s cubic-bezier(0.4,0,0.2,1)",
          overflow: "hidden",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div style={{
          padding: sidebarExpanded ? "18px 16px 14px" : "18px 0 14px",
          borderBottom: "1px solid #F1F3F9",
          display: "flex",
          alignItems: "center",
          justifyContent: sidebarExpanded ? "space-between" : "center",
          gap: "10px",
          flexShrink: 0,
        }}>
          {sidebarExpanded && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "hidden" }}>
              <div
                aria-hidden="true"
                style={{
                  width: "34px", height: "34px", borderRadius: "9px",
                  background: "linear-gradient(135deg, #1E1B4B, #4F46E5)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontFamily: "'Playfair Display', serif",
                  fontSize: "1.1rem", fontWeight: "700", flexShrink: 0,
                }}
              >S</div>
              <span style={{ fontSize: "1rem", fontWeight: "600", color: "#111827", letterSpacing: "-0.2px", whiteSpace: "nowrap" }}>
                Shnoor
              </span>
            </div>
          )}
          <button
            className="sb-toggle"
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
            aria-expanded={isOpen}
            aria-controls="sidebar-nav"
            onClick={isMobile ? () => setIsOpen(false) : handleToggle}
            style={{
              width: "34px", height: "34px", borderRadius: "8px",
              border: "none", background: "transparent", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#6B7280", flexShrink: 0,
            }}
          >
            {isMobile
              ? <X size={19} aria-hidden="true" />
              : <Menu size={19} aria-hidden="true" style={{ transform: isOpen ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.25s" }} />
            }
          </button>
        </div>
        <div style={{
          padding: sidebarExpanded ? "12px 14px" : "12px 0",
          borderBottom: "1px solid #F1F3F9",
          display: "flex",
          alignItems: "center",
          justifyContent: sidebarExpanded ? "flex-start" : "center",
          gap: "10px",
          flexShrink: 0,
        }}>
          <UserAvatar
            size={36}
            initials={initials}
            avatarUrl={avatarUrl}
            showBadge={isAdminViewingAsEmployee}
          />

          {sidebarExpanded && (
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: "0.82rem", fontWeight: "600", color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {name}
              </div>
              <div style={{ fontSize: "0.7rem", color: "#6366F1", fontWeight: "500" }}>
                {trueRoleLabel}
              </div>
            </div>
          )}
        </div>
        {trueRole === "company_admin" && (
          <div style={{
            padding: sidebarExpanded ? "10px 12px" : "10px 6px",
            borderBottom: "1px solid #F1F3F9",
            flexShrink: 0,
          }}>
            {sidebarExpanded ? (
              <div>
                {isAdminViewingAsEmployee && (
                  <div
                    className="preview-badge"
                    aria-live="polite"
                    style={{
                      fontSize: "0.64rem", fontWeight: "600", color: "#059669",
                      textTransform: "uppercase", letterSpacing: "0.6px",
                      marginBottom: "7px",
                      display: "flex", alignItems: "center", gap: "5px",
                    }}
                  >
                    <span aria-hidden="true" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10B981", display: "inline-block" }} />
                    Viewing as Employee
                  </div>
                )}
                <div
                  role="group"
                  aria-label="View mode switcher"
                  style={{ display: "flex", background: "#F3F4F6", borderRadius: "10px", padding: "3px", gap: "2px" }}
                >
                  {[
                    { mode: "company_admin", label: "Admin" },
                    { mode: "employee",      label: "Employee" },
                  ].map(({ mode, label }) => {
                    const active = viewMode === mode;
                    return (
                      <button
                        key={mode}
                        className="view-tab"
                        aria-pressed={active}
                        onClick={() => { if (!active) handleViewSwitch(); }}
                        style={{
                          flex: 1, padding: "7px 6px", borderRadius: "8px", border: "none",
                          background: active ? (mode === "employee" ? "#4F46E5" : "#1E1B4B") : "transparent",
                          color: active ? "#fff" : "#6B7280",
                          fontSize: "0.75rem", fontWeight: "600",
                          cursor: active ? "default" : "pointer",
                          fontFamily: "'DM Sans', sans-serif",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <button
                className="sb-toggle"
                onClick={handleViewSwitch}
                aria-label={viewMode === "company_admin" ? "Switch to Employee View" : "Switch to Admin View"}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "8px 0", borderRadius: "9px", border: "none",
                  background: isAdminViewingAsEmployee ? "rgba(79,70,229,0.10)" : "transparent",
                  color: isAdminViewingAsEmployee ? "#4F46E5" : "#9CA3AF",
                  cursor: "pointer",
                }}
              >
                <ArrowLeftRight size={17} aria-hidden="true" />
              </button>
            )}
          </div>
        )}
        <div className="sb-scroll" style={{ flex: 1, overflowY: "auto", padding: sidebarExpanded ? "10px" : "10px 6px" }}>
          {sidebarExpanded && (
            <p style={{ fontSize: "0.65rem", fontWeight: "600", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.8px", padding: "4px 8px 8px", margin: 0 }}>
              Navigation
            </p>
          )}
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="sb-nav-link"
                    title={!sidebarExpanded ? item.name : undefined}
                    aria-current={isActive ? "page" : undefined}
                    onClick={handleNavClick}
                    style={{
                      display: "flex", alignItems: "center", gap: "10px",
                      padding: sidebarExpanded ? "9px 10px" : "9px 0",
                      justifyContent: sidebarExpanded ? "flex-start" : "center",
                      borderRadius: "9px", textDecoration: "none",
                      background: isActive ? "linear-gradient(135deg,#EEF2FF,#E0E7FF)" : "transparent",
                      color: isActive ? "#4338CA" : "#374151",
                      fontWeight: isActive ? "600" : "400",
                      fontSize: "0.855rem", position: "relative",
                    }}
                  >
                    {isActive && (
                      <span aria-hidden="true" style={{
                        position: "absolute", left: 0, top: "20%", bottom: "20%",
                        width: "3px", borderRadius: "0 3px 3px 0", background: "#4F46E5",
                      }} />
                    )}
                    <span className="sb-icon" aria-hidden="true" style={{ color: isActive ? "#4F46E5" : "#6B7280", flexShrink: 0, display: "flex" }}>
                      {item.icon}
                    </span>
                    {sidebarExpanded && <span style={{ whiteSpace: "nowrap" }}>{item.name}</span>}
                    {sidebarExpanded && isActive && <ChevronRight size={13} aria-hidden="true" style={{ marginLeft: "auto", color: "#4F46E5" }} />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <div style={{ padding: sidebarExpanded ? "12px 10px" : "12px 6px", borderTop: "1px solid #F1F3F9", flexShrink: 0 }}>
          <button
            className="sb-logout"
            onClick={handleLogout}
            aria-label="Log out of your account"
            style={{
              width: "100%", display: "flex", alignItems: "center",
              justifyContent: sidebarExpanded ? "flex-start" : "center",
              gap: "10px", padding: sidebarExpanded ? "9px 10px" : "9px 0",
              borderRadius: "9px", border: "none",
              background: "transparent", color: "#6B7280",
              fontSize: "0.855rem", fontWeight: "500", cursor: "pointer",
              transition: "background 0.15s, color 0.15s",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <LogOut size={17} aria-hidden="true" style={{ flexShrink: 0 }} />
            {sidebarExpanded && <span>Logout</span>}
          </button>
        </div>
      </nav>
    </>
  );
};

export default React.memo(Sidebar);