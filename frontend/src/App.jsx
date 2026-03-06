
import React from "react"
import Exercises from "./pages/Exercises"
import ExerciseList from "./pages/ExerciseList";

export default function App(){
  return (
    <div>
      <h1>Fitness Tracker</h1>
      {/* <Exercises/> */}
      <ExerciseList />
    </div>
  )
}
