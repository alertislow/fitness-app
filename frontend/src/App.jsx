
import React from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
// import ExerciseHome from "./pages/exercise/ExerciseHome";
import BodyPartList from "./pages/exercise/BodyPartList";
import ExerciseList from "./pages/exercise/ExerciseList";
import WorkoutSetupPage from "./pages/exercise/WorkoutSetupPage";

export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* <Route path="/exercise" element={<ExerciseHome />} /> */}
        <Route path="/exercise/body-part" element={<BodyPartList />} />
        <Route path="/exercise/body-part/:id" element={<ExerciseList />} />
        <Route path="/exercise/workout/:name" element={<WorkoutSetupPage />} /> 
      </Routes>
    </BrowserRouter> 
  )
}
