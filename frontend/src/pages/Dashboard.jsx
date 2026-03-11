import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import UserDashboard from "./UserDashboard";
import AdminDashboard from "./AdminDashboard";
import { decodeToken } from "../utils/jwt"; // 自行實作解碼 token

export default function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  if (!token) return null;

  const user = decodeToken(token);
  console.log("Decoded user:", user); // 🔍 檢查 token payload

  if (!user || !user.role) {
    localStorage.removeItem("token");
    navigate("/login");
    return null;
  }

  return <div>{user.role === "admin" ? <AdminDashboard /> : <UserDashboard />}</div>;
}