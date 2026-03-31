import axios from "axios";
import { API_BASE_URL } from "./config"; // 確保你有引入基礎路徑

export const getExerciseList = async () => {
  const token = localStorage.getItem("token");
  
  // 使用 axios 實例或完整路徑
  const response = await axios.get(`${API_BASE_URL}/exercise/list`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // axios 的資料是在 response.data 裡面
  return response.data; 
};