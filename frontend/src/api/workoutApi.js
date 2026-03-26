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
// 刪除訓練紀錄的 API 呼叫
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
  if (!res.ok) throw new Error("Request failed")
  
  return res.json()
}

