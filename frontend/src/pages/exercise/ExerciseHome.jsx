import React from "react";
import { useNavigate } from "react-router-dom";

export default function ExerciseHome() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "20px" }}>
      <h1>Exercise</h1>
      <p>Select body part to start workout</p>

      <button onClick={() => navigate("/exercise/body-part")}>
        Select Body Part
      </button>
    </div>
  );
}