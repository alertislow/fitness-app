import React from "react";
import { useParams, useNavigate } from "react-router-dom";

const exerciseData = {
  1: ["Bench Press", "Incline Dumbbell Press", "Chest Fly"],
  2: ["Squat", "Leg Press", "Leg Extension"],
  3: ["Pull Up", "Lat Pulldown", "Barbell Row"],
  4: ["Shoulder Press", "Lateral Raise", "Rear Delt Fly"],
  5: ["Barbell Curl", "Hammer Curl"],
  6: ["Triceps Pushdown", "Skullcrusher"],
  7: ["Plank", "Crunch", "Leg Raise"]
};

export default function ExerciseList() {

  const { id } = useParams();
  const navigate = useNavigate();

  const exercises = exerciseData[id] || [];

  return (
    <div style={{ padding: "20px" }}>

      <h1>Exercises</h1>

      {exercises.map((exercise, index) => (
        <div
          key={index}
          onClick={() => navigate(`/exercise/workout/${exercise}`)}
          style={{
            border: "1px solid #ddd",
            padding: "15px",
            marginBottom: "10px",
            borderRadius: "10px",
            cursor: "pointer"
          }}
        >
          {exercise}
        </div>
      ))}

    </div>
  );
}