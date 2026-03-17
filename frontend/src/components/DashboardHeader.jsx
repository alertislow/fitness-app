import React from "react";
import { useNavigate } from "react-router-dom";
import { logoutAPI } from "../api/authAPI";

export default function DashboardHeader() {
  const navigate = useNavigate();

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
    <div style={{
      display: "flex",
      justifyContent: "flex-end",
      padding: "10px 20px",
      backgroundColor: "#f5f5f5"
    }}>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}