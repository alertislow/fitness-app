import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from './config';

export default function BodyPartList() {
  const [bodyParts, setBodyParts] = useState([]);
  const navigate = useNavigate();

  const openBodyPart = (id) => {
    navigate(`/exercise/body-part/${id}`);
  };
  useEffect(() => {
    fetch(`${API_BASE_URL}/exercise/body-parts`)
      .then(res => res.json())
      .then(data => setBodyParts(data))
      .catch(err => console.error(err));
  }, []);

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