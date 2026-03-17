import React from "react";
import { useNavigate } from "react-router-dom";

const bodyParts = [
  { id: 1, name: "胸" },
  { id: 2, name: "腿" },
  { id: 3, name: "背" },
  { id: 4, name: "肩" },
  { id: 5, name: "二頭" },
  { id: 6, name: "三頭" },
  { id: 7, name: "核心" }
];

export default function BodyPartList() {

  const navigate = useNavigate();

  const openBodyPart = (id) => {
    navigate(`/exercise/body-part/${id}`);
  };

  return (
    <div style={{ padding: "20px" }}>
    {/* 返回按鈕 */}
      <button onClick={() => navigate("/dashboard")}>
        ← Back
      </button>
      
      <h1>Select Body Part</h1>

      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "15px"
      }}>

        {bodyParts.map((part) => (
          <div
            key={part.id}
            onClick={() => openBodyPart(part.id)}
            style={{
              border: "1px solid #ddd",
              padding: "20px",
              width: "120px",
              borderRadius: "10px",
              cursor: "pointer",
              textAlign: "center"
            }}
          >
            {part.name}
          </div>
        ))}

      </div>

    </div>
  );
}