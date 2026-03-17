import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getWorkoutHistory } from "../../api/workoutApi.js"

export default function WorkoutHistoryPage(){
  const navigate = useNavigate()
  const [history, setHistory] = useState([]);
  useEffect(() => {
    async function loadHistory() {
      try {
        const response = await getWorkoutHistory(); // 從後端抓資料
        if (response && response.data) {
          setHistory(response.data);
        }
      } catch (error) {
        console.error("Failed to load workout history:", error);
      }
    }
    loadHistory();
  }, []);

  return (
    <div style={{padding:"20px"}}>
      <h1>Workout History</h1>
      {history.length === 0 && <p>No workouts yet</p>}

      {history.map((set,index)=>(
        <div 
          key={set.id || index} 
          style={{
            border:"1px solid #ddd",
            padding:"10px",
            marginBottom:"10px",
            borderRadius:"8px"
          }}
        >
          <strong>{set.exercise}</strong>
          <div>
            Set {set.set_number}
          </div>
          <div>
            {set.weight} kg × {set.reps}
          </div>
          <div style={{ fontSize: "12px", color: "#555" }}>
            {new Date(set.date).toLocaleString()}
          </div>
        </div>
      ))}

      <button onClick={()=>navigate("/dashboard")} style={{padding:"10px 20px"}}>
        Back
      </button>
    </div>
  )
}