//只放運動紀錄的 CRUD
// saveWorkoutSet(data)
// getWorkoutHistory()
// updateWorkoutSet(id, data)
// deleteWorkoutSet(id)
import { API_BASE_URL } from './config';

// 新增儲存訓練紀錄的 API 呼叫
export async function saveWorkoutSet(data){
  const token = localStorage.getItem("token")
  if(!token){
    throw new Error("No token")
  }
  const res = await fetch(`${API_BASE_URL}/workout/set`,{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization":`Bearer ${token}` // 從 localStorage 獲取 JWT token，並在 Authorization header 中帶上 Bearer token
    },
    body:JSON.stringify(data)
  })
  if (!res.ok) throw new Error("Request failed")
  return res.json()
}
// 獲取訓練歷史紀錄的 API 呼叫
export async function getWorkoutHistory(){
  const token = localStorage.getItem("token")
  if(!token){
      throw new Error("No token")
  }
  const res = await fetch(`${API_BASE_URL}/workout/history`,{
    headers:{
    "Authorization":`Bearer ${token}`
    }
  })
  if (!res.ok) throw new Error("Request failed")
  return res.json()
}
// 更新訓練紀錄的 API 呼叫
export async function updateWorkoutSet(id,data){
  const token = localStorage.getItem("token")
  if(!token){
    throw new Error("No token")
  }
  const res = await fetch(`${API_BASE_URL}/workout/set/${id}`,{
    method:"PUT",
    headers:{
    "Content-Type":"application/json",
    "Authorization":`Bearer ${token}`
    },
    body:JSON.stringify(data)
  })
  if (!res.ok) throw new Error("Request failed")

  return res.json()
}
// 刪除單一訓練紀錄的 API 呼叫
export async function deleteWorkoutSet(id){
  const token = localStorage.getItem("token")
  if(!token){
    throw new Error("No token")
  }
  const res = await fetch(`${API_BASE_URL}/workout/set/${id}`,{
    method:"DELETE",
    headers:{
    "Authorization":`Bearer ${token}`
    }
  })
  if (!res.ok) throw new Error("刪除單組紀錄失敗")
  return res.json()
}

// 刪除整個動作全部組數的 API 呼叫
export async function deleteAllSets(exerciseId, date){
  const token = localStorage.getItem("token")
  if(!token){
    throw new Error("No token")
  }
  // 使用 encodeURIComponent 處理日期字串，避免 2026/04/15 的斜線搞亂 URL 路徑
  const safeDate = encodeURIComponent(date);
 // 改為 Query Parameter 的寫法： ?date=...
  const res = await fetch(`${API_BASE_URL}/workout/set/deleteAll/${exerciseId}?date=${safeDate}`,{
    method:"DELETE",
    headers:{
    "Authorization":`Bearer ${token}`
    }
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "刪除整組動作紀錄失敗");
  }
  return res.json()
}

