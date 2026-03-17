import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logoutAPI } from "../api/authAPI";

export default function DashboardHeader() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      // 如果有後端 logout API，可以呼叫
      await logoutAPI();
      // 清掉 token
      localStorage.removeItem("token");
      // 導回登入頁
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 20px",
        background: "#f5f5f5",
        borderBottom: "1px solid #ddd"
      }}
    >
      {/* 左側標題 */}
      <h2>Fitness Dashboard</h2>

      {/* 右側 Avatar */}
      <div style={{ position: "relative" }}>
        <div
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "#4CAF50",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          U
        </div>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "50px",
              background: "white",
              border: "1px solid #ddd",
              borderRadius: "8px",
              width: "150px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
            }}
          >
            <div
              style={{ padding: "10px", cursor: "pointer" }}
              onClick={() => navigate("/settings")}
            >
              ⚙️ Settings
            </div>

            <div
              style={{
                padding: "10px",
                cursor: "pointer",
                color: "red"
              }}
              onClick={handleLogout}
            >
              🚪 Logout
            </div>
          </div>
        )}
      </div>
    </div>
  );
}