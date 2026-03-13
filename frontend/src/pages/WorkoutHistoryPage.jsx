import React from "react";
import { useNavigate } from "react-router-dom";

export default function WorkoutHistoryPage(){

  const navigate = useNavigate()

  const history = JSON.parse(localStorage.getItem("workout_history")) || []

  return(

    <div style={{padding:"20px"}}>

      <h1>Workout History</h1>

      {history.length === 0 && (
        <p>No workouts yet</p>
      )}

      {history.map((set,index)=>(
        <div key={index} style={{
          border:"1px solid #ddd",
          padding:"10px",
          marginBottom:"10px",
          borderRadius:"8px"
        }}>
          <strong>{set.exercise}</strong>

          <div>
            Set {set.set}
          </div>

          <div>
            {set.weight} kg × {set.reps}
          </div>

        </div>
      ))}

      <button onClick={()=>navigate("/dashboard")} style={{padding:"10px 20px"}}>
        Back
      </button>

    </div>
  )
}