import React from "react";
import { useNavigate } from "react-router-dom";

export default function UserDashboard() {
  const navigate = useNavigate();

  const goToExercise = () => {
    navigate("/exercise");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>User Dashboard</h1>

      <div
        style={{
          border: "1px solid #ddd",
          padding: "20px",
          borderRadius: "10px",
          width: "250px",
        }}
      >
        <h2>Exercise</h2>
        <p>Start your workout today!</p>

        <button onClick={() => navigate("/exercise")}>
          Start Workout
        </button>
      </div>
    </div>
  );
}