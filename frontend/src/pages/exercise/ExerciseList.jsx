import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getExerciseList } from "../../api/exerciseAPI.js";

export default function ExerciseList() {
  const { id } = useParams();  // body part id
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);

  // 根據 body part id 獲取 exercise list
  useEffect(() => {
    const loadExercises = async () => {
        try {
          // 直接使用 API 函式
          const data = await getExerciseList();
          
          // 過濾對應部位
          const filtered = data.filter(e => e.body_part_id === Number(id));
          setExercises(filtered);
        } catch (err) {
          console.error("載入動作列表失敗:", err);
        }
      };
      loadExercises();
    }, [id]); // 當部位 ID 改變時重新執行
    const openExercise = (exercise) => {
      navigate(`/exercise/workout-setup/${exercise.id}`, { state: { bodyPartId: id } });
    };

  return (
    <div style={{ padding: "20px" }}>
      {/* 返回按鈕 */}
      <button onClick={() => navigate("/exercise/body-part")}>
        ← Back
      </button>
      <h1>Exercises</h1>

      {exercises.length > 0 ? (
        exercises.map((exercise) => (
        <div
          key={exercise.id}
          onClick={() => openExercise(exercise)}
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
      ))
    ):(
      <p>Loading exercises...</p>
    )}
    </div>
  );
}