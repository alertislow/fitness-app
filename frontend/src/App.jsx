
import React from "react"
import Exercises from "./pages/Exercises"
import ExerciseList from "./pages/ExerciseList";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";



export default function App(){
  return (
    // <div>
    //   <h1>Fitness Tracker</h1>
    //   {/* <Exercises/> */}
    //   <ExerciseList />
    // </div>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}
