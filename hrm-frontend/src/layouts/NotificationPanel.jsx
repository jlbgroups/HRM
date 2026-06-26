import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Bell, CheckCheck, Trash2, X, Info, AlertTriangle,
  CheckCircle, MessageSquare, FileText, Clock
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "https://hrm-backend-vvqg.onrender.com";

const POLL_INTERVAL = 30000; // 30 seconds

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function getTypeIcon(type) {
  const s = { width: 16, height: 16, flexShrink: 0 };
  switch ((type || "").toLowerCase()) {
    case "warning":    return <AlertTriangle style={s} color="#F59E0B" />;
    case "success":    return <CheckCircle  style={s} color="#10B981" />;
    case "ticket":
    case "support":    return <MessageSquare style={s} color="#6366F1" />;
    case "policy":     return <FileText     style={s} color="#8B5CF6" />;
    case "leave":      return <Clock        style={s} color="#0EA5E9" />;
    default:           return <Info         style={s} color="#6366F1" />;
  }
}

function getTypeColor(type) {
  switch ((type || "").toLowerCase()) {
    case "warning": return "rgba(245,158,11,0.12)";
    case "success": return "rgba(16,185,129,0.12)";
    case "ticket":
    case "support": return "rgba(99,102,241,0.12)";
    case "policy":  return "rgba(139,92,246,0.12)";
    case "leave":   return "rgba(14,165,233,0.12)";
    default:        return "rgba(99,102,241,0.10)";
  }
}

const NotificationPanel = ({ isDark, sidebarExpanded }) => {
  const [open, setOpen]             = useState(false);
  const [notifications, setNotifs]  = useState([]);
  const [unread, setUnread]         = useState(0);
  const [loading, setLoading]       = useState(false);
  const panelRef                    = useRef(null);
  const bellRef                     = useRef(null);

  const token = localStorage.getItem("token");

  const fetchUnread = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/notifications/unread-count`, {
        headers: { "x-auth-token": token },
      });
      const data = await res.json();
      if (data.success) setUnread(data.count);
    } catch (_) {}
  }, [token]);

  const fetchNotifs = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/notifications`, {
        headers: { "x-auth-token": token },
      });
      const data = await res.json();
      if (data.success) setNotifs(data.data || []);
    } catch (_) {}
    setLoading(false);
  }, [token]);

  // initial + poll
  useEffect(() => {
    fetchUnread();
    const id = setInterval(fetchUnread, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchUnread]);

  // fetch full list when panel opens
  useEffect(() => {
    if (open) {
      fetchNotifs();
    }
  }, [open, fetchNotifs]);

  // close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        bellRef.current  && !bellRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const markAllRead = async () => {
    if (!token) return;
    try {
      await fetch(`${API}/api/notifications/mark-all-read`, {
        method: "PUT",
        headers: { "x-auth-token": token },
      });
      setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnread(0);
    } catch (_) {}
  };

  const clearAll = async () => {
    if (!token) return;
    try {
      await fetch(`${API}/api/notifications/clear-all`, {
        method: "DELETE",
        headers: { "x-auth-token": token },
      });
      setNotifs([]);
      setUnread(0);
    } catch (_) {}
  };

  const markOne = async (id) => {
    if (!token) return;
    try {
      await fetch(`${API}/api/notifications/${id}/read`, {
        method: "PUT",
        headers: { "x-auth-token": token },
      });
      setNotifs(prev =>
        prev.map(n => n._id === id ? { ...n, is_read: true } : n)
      );
      setUnread(prev => Math.max(0, prev - 1));
    } catch (_) {}
  };

  const bg     = isDark ? "#161B27" : "#ffffff";
  const border = isDark ? "#1E2535" : "#E5E7EB";
  const text   = isDark ? "#F3F4F6" : "#111827";
  const muted  = isDark ? "#9CA3AF" : "#6B7280";
  const hover  = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";

  return (
    <>
      {/* Styles */}
      <style>{`
        @keyframes npSlideIn {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes npBellRing {
          0%,100% { transform: rotate(0); }
          15%  { transform: rotate(14deg); }
          30%  { transform: rotate(-12deg); }
          45%  { transform: rotate(10deg); }
          60%  { transform: rotate(-8deg); }
          75%  { transform: rotate(5deg); }
        }
        .np-bell-ring { animation: npBellRing 0.6s ease; }
        .np-item:hover { background: ${hover} !important; }
        .np-btn-icon:hover { opacity: 0.75; }
        .np-scroll::-webkit-scrollbar { width: 4px; }
        .np-scroll::-webkit-scrollbar-track { background: transparent; }
        .np-scroll::-webkit-scrollbar-thumb { background: ${isDark ? "#2D3748" : "#E5E7EB"}; border-radius: 4px; }
      `}</style>

      {/* Bell Button */}
      <button
        ref={bellRef}
        onClick={() => setOpen(o => !o)}
        title="Notifications"
        style={{
          position: "relative",
          width: sidebarExpanded ? "34px" : "34px",
          height: "34px",
          borderRadius: "8px",
          border: "none",
          background: open
            ? (isDark ? "rgba(99,102,241,0.18)" : "rgba(99,102,241,0.10)")
            : "transparent",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: open ? "#818CF8" : (isDark ? "#9CA3AF" : "#6B7280"),
          transition: "background 0.15s, color 0.15s",
          flexShrink: 0,
        }}
      >
        <Bell
          size={18}
          className={unread > 0 ? "np-bell-ring" : ""}
          key={unread} /* re-trigger animation when count changes */
        />
        {unread > 0 && (
          <span style={{
            position: "absolute",
            top: "4px",
            right: "4px",
            minWidth: "16px",
            height: "16px",
            borderRadius: "8px",
            background: "#EF4444",
            color: "#fff",
            fontSize: "0.6rem",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 3px",
            lineHeight: 1,
            border: `2px solid ${bg}`,
          }}>
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          ref={panelRef}
          style={{
            position: "fixed",
            top: "0",
            left: sidebarExpanded ? "255px" : "68px",
            width: "340px",
            height: "100vh",
            background: bg,
            borderRight: `1px solid ${border}`,
            boxShadow: isDark
              ? "4px 0 24px rgba(0,0,0,0.5)"
              : "4px 0 24px rgba(15,23,42,0.12)",
            zIndex: 999,
            display: "flex",
            flexDirection: "column",
            fontFamily: "'DM Sans', sans-serif",
            animation: "npSlideIn 0.22s ease both",
          }}
        >
          {/* Header */}
          <div style={{
            padding: "18px 18px 14px",
            borderBottom: `1px solid ${border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: "700", color: text }}>
                Notifications
              </h3>
              {unread > 0 && (
                <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#6366F1", fontWeight: 500 }}>
                  {unread} unread
                </p>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {notifications.length > 0 && (
                <>
                  <button
                    className="np-btn-icon"
                    onClick={markAllRead}
                    title="Mark all read"
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "#6366F1", display: "flex", alignItems: "center",
                      gap: "4px", fontSize: "0.75rem", fontWeight: 600,
                      padding: "5px 8px", borderRadius: "7px",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    <CheckCheck size={15} /> All read
                  </button>
                  <button
                    className="np-btn-icon"
                    onClick={clearAll}
                    title="Clear all"
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: isDark ? "#6B7280" : "#9CA3AF", display: "flex",
                      alignItems: "center", padding: "5px 6px", borderRadius: "7px",
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </>
              )}
              <button
                className="np-btn-icon"
                onClick={() => setOpen(false)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: isDark ? "#6B7280" : "#9CA3AF", display: "flex",
                  alignItems: "center", padding: "5px 6px", borderRadius: "7px",
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="np-scroll" style={{ flex: 1, overflowY: "auto" }}>
            {loading ? (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "48px 20px", flexDirection: "column", gap: "12px",
              }}>
                <div style={{
                  width: 28, height: 28,
                  border: `3px solid ${isDark ? "#1E2535" : "#EEF2FF"}`,
                  borderTop: "3px solid #6366F1",
                  borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <p style={{ color: muted, fontSize: "0.8rem", margin: 0 }}>Loading…</p>
              </div>
            ) : notifications.length === 0 ? (
              <div style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                padding: "60px 24px", gap: "12px",
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: isDark ? "#1E2535" : "#EEF2FF",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Bell size={24} color={isDark ? "#374151" : "#C7D2FE"} />
                </div>
                <p style={{ color: muted, fontSize: "0.875rem", margin: 0, textAlign: "center" }}>
                  You're all caught up!<br />
                  <span style={{ fontSize: "0.8rem" }}>No notifications yet</span>
                </p>
              </div>
            ) : (
              <ul style={{ listStyle: "none", margin: 0, padding: "8px 0" }}>
                {notifications.map((n) => (
                  <li
                    key={n._id}
                    className="np-item"
                    onClick={() => !n.is_read && markOne(n._id)}
                    style={{
                      display: "flex",
                      gap: "12px",
                      padding: "12px 16px",
                      cursor: n.is_read ? "default" : "pointer",
                      borderBottom: `1px solid ${border}`,
                      transition: "background 0.12s",
                      background: n.is_read ? "transparent" : (isDark ? "rgba(99,102,241,0.05)" : "rgba(99,102,241,0.03)"),
                    }}
                  >
                    {/* Icon */}
                    <div style={{
                      width: 34, height: 34, borderRadius: "9px", flexShrink: 0,
                      background: getTypeColor(n.type),
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {getTypeIcon(n.type)}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        margin: "0 0 3px",
                        fontSize: "0.82rem",
                        fontWeight: n.is_read ? "400" : "600",
                        color: text,
                        lineHeight: 1.4,
                        wordBreak: "break-word",
                      }}>
                        {n.message}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{
                          fontSize: "0.68rem",
                          fontWeight: 500,
                          textTransform: "uppercase",
                          letterSpacing: "0.4px",
                          color: "#6366F1",
                          background: isDark ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.08)",
                          padding: "2px 6px",
                          borderRadius: "4px",
                        }}>
                          {n.type}
                        </span>
                        <span style={{ fontSize: "0.7rem", color: muted }}>
                          {timeAgo(n.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Unread dot */}
                    {!n.is_read && (
                      <div style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: "#6366F1", flexShrink: 0, marginTop: "6px",
                      }} />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: "10px 16px",
            borderTop: `1px solid ${border}`,
            flexShrink: 0,
          }}>
            <p style={{
              margin: 0, fontSize: "0.72rem", color: muted, textAlign: "center",
            }}>
              Refreshes every 30 seconds automatically
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationPanel;
