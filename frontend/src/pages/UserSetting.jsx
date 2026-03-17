import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function UserSetting() {
  const navigate = useNavigate();

  // 預設為 true
  const [skipLastRest, setSkipLastRest] = useState(true);
  
  const toggleSkipLastRest = () => {
      const newValue = !skipLastRest;
      setSkipLastRest(newValue);
      const settings = JSON.parse(localStorage.getItem("user_settings")) || {};
      settings.skipLastRest = newValue;
      localStorage.setItem("user_settings", JSON.stringify(settings));
    };

  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem("user_settings")) || {};
    setSkipLastRest(settings.skipLastRest ?? true);
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      
      {/* 返回按鈕 */}
      <button onClick={() => navigate("/dashboard")}>
        ← Back
      </button>

      {/* Setting Card */}
      <div
        style={{
          border: "1px solid #ddd",
          padding: "20px",
          borderRadius: "10px",
          marginTop: "20px",
          maxWidth: "400px"
        }}
      >
        <h2>Settings</h2>

        <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <input
            type="checkbox"
            checked={skipLastRest}
            onChange={toggleSkipLastRest}
          />
          Skip last rest period
        </label>

      </div>
    </div>
  );
}