import React, { useState, useEffect } from "react";
import { userApi } from "../services/api";
import { User } from "../types";
import { useNavigate } from "react-router-dom";

const UserProfilePage: React.FC = () => {
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

const modernInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px",
  borderRadius: "10px",
  border: "1px solid #e0e0e0",
  fontSize: "14px",
  outline: "none",
  backgroundColor: "#fafafa",
};

const modernButtonStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px",
  borderRadius: "10px",
  border: "none",
  background: "linear-gradient(90deg, #4e73df, #1cc88a)",
  color: "white",
  fontSize: "16px",
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
};
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await userApi.getUser();
      setUserData(response.data);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setMessage(null);
    setError(null);

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All password fields are required");
      return;
    }

    if (newPassword.length < 6) {
      setError(
        "New password must be at least 6 characters"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (currentPassword === newPassword) {
      setError(
        "New password must be different from current password"
      );
      return;
    }

    try {
      setPasswordLoading(true);

      const res =
        await userApi.changePassword({
          currentPassword,
          newPassword,
        });

      setMessage(res.data.message);

      // Clear fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to change password"
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px",
        }}
      >
        <p>Loading profile...</p>
      </div>
    );
  }

  
    return (
  <div
    style={{
      minHeight: "100vh",
      background: "#f4f6f9",
      display: "flex",
      justifyContent: "center",
      padding: "40px 20px",
    }}
  >
    <div
      style={{
        width: "100%",
        maxWidth: "500px",
      }}
    >
      {/* Profile Header Card */}
      <div
        style={{
          background: "white",
          borderRadius: "20px",
          padding: "40px 30px",
          textAlign: "center",
          boxShadow: "0 15px 40px rgba(0,0,0,0.08)",
          marginBottom: "30px",
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: "110px",
            height: "110px",
            borderRadius: "50%",
            background: "#e9ecef",
            margin: "0 auto 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "40px",
            fontWeight: "bold",
            color: "#555",
          }}
        >
          {userData?.name?.charAt(0).toUpperCase()}
        </div>

        <h2 style={{ marginBottom: "5px" }}>
          {userData?.name}
        </h2>

        <p style={{ color: "#888", marginBottom: "20px" }}>
          {userData?.email}
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
          <span
            style={{
              padding: "6px 15px",
              borderRadius: "20px",
              fontSize: "13px",
              backgroundColor: userData?.is_verified ? "#e6f7ee" : "#ffe6e6",
              color: userData?.is_verified ? "#28a745" : "#dc3545",
              fontWeight: 600,
            }}
          >
            {userData?.is_verified ? "Verified" : "Not Verified"}
          </span>

          <span
            style={{
              padding: "6px 15px",
              borderRadius: "20px",
              fontSize: "13px",
              backgroundColor: userData?.is_active ? "#e6f7ee" : "#ffe6e6",
              color: userData?.is_active ? "#28a745" : "#dc3545",
              fontWeight: 600,
            }}
          >
            {userData?.is_active ? "Active" : "Inactive"}
         
          </span>
          <button
          onClick={() => navigate("/change-password")}
  style={{
    padding: "10px 25px",
    borderRadius: "50px",
    border: "none",
    background: "linear-gradient(90deg, #e12c26, #ba1cc8)",
    color: "white",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 5px 15px rgba(0,0,0,0.15)",
  }}
>
✎ Update Password
</button>

        </div>
      </div>
    </div>
  </div>
);

}
export default UserProfilePage;
