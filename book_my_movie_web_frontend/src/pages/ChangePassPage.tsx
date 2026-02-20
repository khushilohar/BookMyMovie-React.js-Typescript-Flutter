import React, { useState } from "react";
import { userApi } from "../services/api";
import { useNavigate } from "react-router-dom";

const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // States for password visibility toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await userApi.changePassword({
        currentPassword,
        newPassword,
      });

      setMessage(res.data.message);

      setTimeout(() => {
        navigate("/profile");
      }, 1500);

    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to change password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f6f9",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "450px",
          background: "white",
          padding: "30px",
          borderRadius: "20px",
          boxShadow: "0 15px 40px rgba(0,0,0,0.08)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "25px" }}>
          Change Password
        </h2>

        <form onSubmit={handleChangePassword}>
          {/* Current Password */}
          <div style={inputWrapperStyle}>
            <input
              type={showCurrent ? "text" : "password"}
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              style={eyeButtonStyle}
              aria-label={showCurrent ? "Hide password" : "Show password"}
            >
              {showCurrent ? "🙈" : "👁️"}
            </button>
          </div>

          {/* New Password */}
          <div style={inputWrapperStyle}>
            <input
              type={showNew ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              style={eyeButtonStyle}
              aria-label={showNew ? "Hide password" : "Show password"}
            >
              {showNew ? "🙈" : "👁️"}
            </button>
          </div>

          {/* Confirm Password */}
          <div style={inputWrapperStyle}>
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              style={eyeButtonStyle}
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? "🙈" : "👁️"}
            </button>
          </div>

          {message && <p style={{ color: "green", marginBottom: "15px" }}>{message}</p>}
          {error && <p style={{ color: "red", marginBottom: "15px" }}>{error}</p>}

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

/* ---------- Styles ---------- */
const inputWrapperStyle: React.CSSProperties = {
  position: "relative",
  marginBottom: "15px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px",
  paddingRight: "45px", // make room for the eye icon
  borderRadius: "10px",
  border: "1px solid #ddd",
  background: "#fafafa",
  fontSize: "16px",
  boxSizing: "border-box",
};

const eyeButtonStyle: React.CSSProperties = {
  position: "absolute",
  right: "12px",
  top: "50%",
  transform: "translateY(-50%)",
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: "20px",
  color: "#777",
  padding: "5px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px",
  borderRadius: "10px",
  border: "none",
  background: "linear-gradient(90deg, #e12c26, #ba1cc8)",
  color: "white",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: "16px",
  marginTop: "10px",
};

export default ChangePasswordPage;