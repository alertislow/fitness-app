import React, { useEffect, useState } from "react";

export default function ExerciseList() {
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/exercises")
      .then((res) => res.json())
      .then((data) => setExercises(data));
  }, []);

  const deleteExercise = async (id) => {
    await fetch(`http://127.0.0.1:8000/exercises/${id}`, {
      method: "DELETE",
    });

    setExercises(exercises.filter((ex) => ex.id !== id));
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2 style={{ marginBottom: "20px" }}>Exercises</h2>

      {exercises.length === 0 ? (
        <p>No exercises yet.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, 220px)",
            gap: "20px",
          }}
        >
          {exercises.map((ex) => (
            <div
              key={ex.id}
              style={{
                border: "1px solid #e5e5e5",
                borderRadius: "12px",
                padding: "16px",
                backgroundColor: "white",
                boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
              }}
            >
              <h3 style={{ marginBottom: "10px" }}>{ex.name}</h3>

              <p style={{ color: "#666", fontSize: "14px" }}>
                {ex.description}
              </p>

              <p style={{ marginTop: "10px", fontSize: "13px" }}>
                Body Part ID: {ex.body_part_id}
              </p>

              <button
                onClick={() => deleteExercise(ex.id)}
                style={{
                  marginTop: "15px",
                  width: "100%",
                  padding: "8px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "#ef4444",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}