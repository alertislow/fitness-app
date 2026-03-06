import React, { useEffect, useState } from "react";

export default function ExerciseList() {
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/exercises") // 後端 GET API
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched exercises:", data); // 🔹 這裡加 log
        setExercises(data); // 更新 state
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h2>Exercises</h2>
      {exercises.length === 0 ? (
        <p>No exercises yet.</p>
      ) : (
        <ul>
          {exercises.map((ex) => (
            <li key={ex.id}>
              <strong>{ex.name}</strong>: {ex.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
