import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar: React.FC = () => {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false); // Toast visibility

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      setShowToast(true); // Show toast
      setTimeout(() => {
        setShowToast(false);
        navigate("/signin");
      }, 2000); // Redirect after 2 seconds
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toast animation keyframes – right to left slide */}
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>

      <nav style={navbar}>
        {/* LEFT SECTION */}
        <div style={left}>
          <Link to="/" style={logo}>
            book<span style={{ color: "#f84464" }}>my</span>movie
          </Link>
        </div>

        {/* CENTER MENU */}
        <div style={menu}>
          <Link to="/movies" style={menuLink}>
            Movies
          </Link>
          {token && (
            <>
              <Link to="/bookings" style={menuLink}>
                My Bookings
              </Link>
              <Link to="/profile" style={menuLink}>
                Profile
              </Link>
            </>
          )}
        </div>

        {/* RIGHT SECTION */}
        <div style={right}>
          {token ? (
            <>
              <span style={welcome}>Hi, {user?.name}</span>
              <button
                onClick={handleLogout}
                disabled={loading}
                style={logoutBtn}
              >
                {loading ? "Logging out..." : "Logout"}
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" style={signInBtn}>
                Sign in
              </Link>
              <Link to="/signup" style={signUpBtn}>
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Toast Notification – top right, slide in from right */}
      {showToast && (
        <div style={toastStyle}>
          👋 Logged out successfully! 
        </div>
      )}
    </>
  );
};

/* ---------- Styles ---------- */
const navbar: React.CSSProperties = {
  height: "64px",
  backgroundColor: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 32px",
  borderBottom: "1px solid #eee",
  position: "sticky",
  top: 0,
  zIndex: 1000,
};

const left: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "24px",
};

const logo: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: "bold",
  textDecoration: "none",
  color: "#000",
};

const menu: React.CSSProperties = {
  display: "flex",
  gap: "18px",
};

const menuLink: React.CSSProperties = {
  textDecoration: "none",
  color: "#333",
  fontSize: "14px",
  fontWeight: 500,
};

const right: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const signInBtn: React.CSSProperties = {
  padding: "6px 14px",
  backgroundColor: "#f84464",
  color: "#fff",
  textDecoration: "none",
  borderRadius: "4px",
  fontSize: "14px",
};

const signUpBtn: React.CSSProperties = {
  padding: "6px 14px",
  border: "1px solid #f84464",
  color: "#f84464",
  textDecoration: "none",
  borderRadius: "4px",
  fontSize: "14px",
};

const logoutBtn: React.CSSProperties = {
  padding: "8px 14px",
  background: "linear-gradient(90deg, #e12c26, #ba1cc8)",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

const welcome: React.CSSProperties = {
  fontSize: "14px",
  color: "#333",
};

const toastStyle: React.CSSProperties = {
  position: "fixed",
  top: "20px",
  right: "20px",
  
  background: "linear-gradient(90deg, #82c0f2, #1c66c8)",
  color: "#fff",
  padding: "14px 24px",
  borderRadius: "8px 20px 8px 20px",
  fontSize: "14px",
  fontWeight: 500,
  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
  animation: "slideInRight 0.4s ease",
  zIndex: 9999,
};

export default Navbar;