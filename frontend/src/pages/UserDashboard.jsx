import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "../components/DashboardHeader"; // 頁首

export default function UserDashboard() {
  const navigate = useNavigate();
  // 開始運動
  const goToExercise = () => {
    navigate("/exercise/body-part");
  };
  // Settings last rest skip, 預設為 true 
  const [skipLastRest, setSkipLastRest] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("user_settings");
    if (saved) {
      const settings = JSON.parse(saved);
      setSkipLastRest(settings.skipLastRest ?? true);
    }
  }, []);
  // 切換是否跳過最後一組休息
  const toggleSkipLastRest = () => {
    const newValue = !skipLastRest;
    setSkipLastRest(newValue);
    localStorage.setItem("user_settings", JSON.stringify({ skipLastRest: newValue }));
  };

  return (
    <div>
      {/* Header */}
      <DashboardHeader />
      <div style={{ padding: "20px" }}>
        <h1>User Dashboard</h1>
        {/* Exercise */}
        <div
          style={{
            border: "1px solid #ddd",
            padding: "20px",
            borderRadius: "10px",
            marginBottom:"20px"
          }}
        >
          <h2>Exercise</h2>
          <p>Start your workout today!</p>

          <button onClick={() => navigate("/exercise/body-part")} style={{padding:"10px 20px"}}>
            Start Workout
          </button>
        </div>

        {/* WorkOut History */}
        <div style={{
          border:"1px solid #ddd",
          padding:"20px",
          borderRadius:"10px",
          marginBottom:"20px"
        }}>
          <h2>Workout History</h2>
          <p>View your past workouts</p>

          <button onClick={()=>navigate("/workout-history")} style={{padding:"10px 20px"}}>
            View History
          </button>
        </div>

        {/* Setting */}
        <div style={{
          border: "1px solid #ddd",
          padding: "20px",
          borderRadius: "10px",
          marginTop: "20px"
        }}>
          <h2>Settings</h2>
          <label>
            <input
              type="checkbox"
              checked={skipLastRest}
              onChange={toggleSkipLastRest}
            />
            Skip last rest period
          </label>
        </div>
      </div>
    </div>
  );
}