import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ExerciseList() {
  const { id } = useParams();  // body part id
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);

  // 根據 body part id 獲取 exercise list
  useEffect(() => {
  fetch("http://localhost:8000/exercise/list")
    .then(res => res.json())
    .then(data => {
      // 過濾該 body part
      const filtered = data.filter(e => e.body_part_id === Number(id));
      setExercises(filtered);
    })
    .catch(err => console.error(err));
  }, [id]);
  const openExercise = (exerciseId) => {
      navigate(`/exercise/workout/${exerciseId}`);
    };

  return (
    <div style={{ padding: "20px" }}>
      {/* 返回按鈕 */}
      <button onClick={() => navigate("/exercise/body-part")}>
        ← Back
      </button>
      <h1>Exercises</h1>

      {exercises.map((exercise) => (
        <div
          key={exercise.id}
          onClick={() => openExercise(exercise.id)}
          style={{
            border: "1px solid #ddd",
            padding: "15px",
            marginBottom: "10px",
            borderRadius: "10px",
            cursor: "pointer"
          }}
        >
          {exercise.name}
        </div>
      ))}
    </div>
  );
}