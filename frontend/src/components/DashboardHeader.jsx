import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logoutAPI } from "../api/authAPI";
import "../styles/DashboardHeader.css";

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
    // 使用專門的 class 以避開 index.css 的全域裁切限制
    <header className="dashboard-header-container">
      {/* 左側標題 */}
      <h2 className="header-logo">Fitness Dashboard</h2>

      {/* 右側 Avatar 區域 */}
      <div className="avatar-wrapper">
        <div
          className="user-avatar-btn"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          U
        </div>

        {/* 下拉選單 Dropdown Menu */}
        {menuOpen && (
          <>
            {/* 點擊空白處關閉選單的透明遮罩 */}
            <div className="menu-overlay" onClick={() => setMenuOpen(false)} />
            
            <div className="settings-dropdown">
              <div
                className="dropdown-item"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/settings");
                }}
              >
                <span className="icon">⚙️</span> Settings
              </div>

              <div
                className="dropdown-item logout"
                onClick={handleLogout}
              >
                <span className="icon">🚪</span> Logout
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}