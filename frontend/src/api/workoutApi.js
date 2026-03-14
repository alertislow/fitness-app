const API_URL = "http://localhost:8000"
// 新增儲存訓練紀錄的 API 呼叫
export async function saveWorkoutSet(data){
  const token = localStorage.getItem("token")
  if(!token){
      navigate("/login")
      return
  }
  const res = await fetch(`${API_URL}/workout/set`,{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      Authorization:`Bearer ${token}`
    },
    body:JSON.stringify(data)
  })
  return res.json()
}
// 獲取訓練歷史紀錄的 API 呼叫
export async function getWorkoutHistory(){
  const token = localStorage.getItem("token")
  if(!token){
      navigate("/login")
      return
  }
  const res = await fetch(`${API_URL}/workout/history`,{
    headers:{
    Authorization:`Bearer ${token}`
    }
  })
  return res.json()
}
// 更新訓練紀錄的 API 呼叫
export async function updateWorkoutSet(id,data){
  const token = localStorage.getItem("token")
  if(!token){
      navigate("/login")
      return
  }
  const res = await fetch(`${API_URL}/workout/set/${id}`,{
    method:"PUT",
    headers:{
    "Content-Type":"application/json",
    Authorization:`Bearer ${token}`
    },
    body:JSON.stringify(data)
  })
  return res.json()
}
// 刪除訓練紀錄的 API 呼叫
export async function deleteWorkoutSet(id){
  const token = localStorage.getItem("token")
  if(!token){
      navigate("/login")
      return
  }
  const res = await fetch(`${API_URL}/workout/set/${id}`,{
    method:"DELETE",
    headers:{
    Authorization:`Bearer ${token}`
    }
  })
  return res.json()
}