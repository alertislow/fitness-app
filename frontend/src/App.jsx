
import React from "react"
import Exercises from "./pages/Exercises"
import ExerciseList from "./pages/ExerciseList";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
// import Dashboard from "./pages/Dashboard";

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
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<h1>Dashboard</h1>} />
      </Routes>
    </BrowserRouter>
  )
}
