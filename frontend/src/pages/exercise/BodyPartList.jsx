import React from "react";
import { useNavigate } from "react-router-dom";

const bodyParts = [
  { id: 1, name: "Chest" },
  { id: 2, name: "Legs" },
  { id: 3, name: "Back" },
  { id: 4, name: "Shoulders" },
  { id: 5, name: "Biceps" },
  { id: 6, name: "Triceps" },
  { id: 7, name: "Core" }
];

export default function BodyPartList() {

  const navigate = useNavigate();

  const openBodyPart = (id) => {
    navigate(`/exercise/body-part/${id}`);
  };

  return (
    <div style={{ padding: "20px" }}>

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