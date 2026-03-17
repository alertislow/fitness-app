
import React from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import BodyPartList from "./pages/exercise/BodyPartList";
import ExerciseList from "./pages/exercise/ExerciseList";
import WorkoutSetupPage from "./pages/exercise/WorkoutSetupPage";
import WorkoutTimerPage from "./pages/exercise/WorkoutTimerPage";
import WorkoutHistoryPage from "./pages/exercise/WorkoutHistoryPage";
import UserSetting from "./pages/UserSetting";


export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/exercise/body-part" element={<BodyPartList />} />
        <Route path="/exercise/body-part/:id" element={<ExerciseList />} />
        <Route path="/exercise/workout/:name" element={<WorkoutSetupPage />} /> 
        <Route path="/exercise/timer/:name" element={<WorkoutTimerPage />} />
        <Route path="/workout-history" element={<WorkoutHistoryPage />} />
        <Route path="/settings" element={<UserSetting />} />
      </Routes>
    </BrowserRouter> 
  )
}
