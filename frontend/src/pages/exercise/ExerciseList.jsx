import React from "react";
import { useParams, useNavigate } from "react-router-dom";

const exerciseData = {
  1: ["槓鈴臥推", "上斜啞鈴推舉", "蝴蝶機夾胸"],
  2: ["深蹲", "腿推", "腿屈伸", "硬舉"],
  3: ["杠鈴划船","滑輪下拉","引體向上" ],
  4: ["槓鈴肩推", "側平舉", "後三角肌飛鳥"],
  5: ["杠鈴彎舉", "錘式彎舉"],
  6: ["cable 三頭下壓", "仰臥肱三頭伸展"],
  7: ["棒式", "卷腹", "斜板抬腿"]
};

export default function ExerciseList() {

  const { id } = useParams();
  const navigate = useNavigate();

  const exercises = exerciseData[id] || [];

  return (
    <div style={{ padding: "20px" }}>
      {/* 返回按鈕 */}
      <button onClick={() => navigate("/exercise/body-part")}>
        ← Back
      </button>
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