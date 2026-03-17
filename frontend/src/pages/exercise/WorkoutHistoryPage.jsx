import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getWorkoutHistory, updateWorkoutSet, deleteWorkoutSet } from "../../api/workoutApi.js"

export default function WorkoutHistoryPage(){
  const navigate = useNavigate()
  const [history, setHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [editSet, setEditSet] = useState(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        const response = await getWorkoutHistory(); // 從後端抓資料
        setHistory(response.data); 
        if (response && response.data) {
          setHistory(response.data);
        }
      } catch (error) {
        if (error.message === "No token") {
          navigate("/login"); // 導頁到登入頁面
        }   
        console.error("Failed to load workout history:", error);
      }
    }
    loadHistory();
  }, []);
  // 將資料依日期分組
  const groupedByDate = history.reduce((acc, item) => {
    const date = new Date(item.date).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});
  

   // 優化：編輯完成後直接更新單組資料
  const handleSave = async () => {
    try {
      await updateWorkoutSet(editSet.id, {
        exercise: editSet.exercise,
        set_number: editSet.set_number,
        weight: editSet.weight,
        reps: editSet.reps,
      });

      // 更新本地 state
      setHistory((prev) =>
        prev.map((item) => (item.id === editSet.id ? { ...item, weight: editSet.weight, reps: editSet.reps } : item))
      );
      setEditSet(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update");
    }
  };
  // 刪除訓練紀錄
  const handleDelete = async (setToDelete) => {
    if (!window.confirm("確定要刪除這組嗎？")) return;
    try {
      // 1️⃣ 先刪除
      await deleteWorkoutSet(setToDelete.id);

      // 2️⃣ 找出同一天 + 同 exercise 的資料
      const sameGroup = history
        .filter(
          (item) =>
            item.exercise === setToDelete.exercise &&
            new Date(item.date).toLocaleDateString() ===
              new Date(setToDelete.date).toLocaleDateString()
        )
        .sort((a, b) => a.set_number - b.set_number);

      // 3️⃣ 找出被刪的是第幾組
      const deletedSetNumber = setToDelete.set_number;

      // 4️⃣ 將後面的 set_number -1
      const needUpdate = sameGroup.filter(
        (item) => item.set_number > deletedSetNumber
      );

      for (let item of needUpdate) {
        await updateWorkoutSet(item.id, {
          exercise: item.exercise,
          set_number: item.set_number - 1, // 🔥 重排
          weight: item.weight,
          reps: item.reps,
        });
      }

      // 5️⃣ 更新本地 state（不用重新 GET）
      setHistory((prev) =>
        prev
          .filter((item) => item.id !== setToDelete.id) // 移除被刪的
          .map((item) => {
            if (
              item.exercise === setToDelete.exercise &&
              new Date(item.date).toLocaleDateString() ===
                new Date(setToDelete.date).toLocaleDateString() &&
              item.set_number > deletedSetNumber
            ) {
              return {
                ...item,
                set_number: item.set_number - 1,
              };
            }
            return item;
          })
      );
      setEditSet(null); // 關閉編輯視窗
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };
  return (
    <div style={{padding:"20px"}}>
      {/* 返回按鈕 */}
      <button onClick={() => navigate("/dashboard")}>
        ← Back
      </button>
      <h1>Workout History</h1>
      
      {/* 日期列表 */}
      {!selectedDate && (
        <>
          {Object.keys(groupedByDate).length === 0 && <p>No workouts yet</p>}
          {Object.keys(groupedByDate).map((date) => (
            <div
              key={date}
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
              onClick={() => setSelectedDate(date)}
            >
              <strong>{date}</strong> ({groupedByDate[date].length} sets)
            </div>
          ))}
        </>
      )}

      {/* 某天的條列式組別 */}
      {selectedDate && !editSet && (
        <>
          <button onClick={() => setSelectedDate(null)} style={{ marginBottom: "10px" }}>
            Back to Dates
          </button>
          {groupedByDate[selectedDate].map((set) => (
            <div
              key={set.id}
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
              onClick={() => setEditSet(set)}
            >
              <strong>{set.exercise}</strong>
              <div>Set {set.set_number}</div>
              <div>
                {set.weight} kg × {set.reps}
              </div>
            </div>


          ))}
        </>
      )}

      {/* 編輯單組 */}
      {editSet && (
        <div style={{ border: "1px solid #ddd", padding: "10px", borderRadius: "8px" }}>
          <h3>Edit Set</h3>
          <div>
            <strong>Exercise:</strong> {editSet.exercise}
          </div>
          <div>
            <strong>Set Number:</strong> {editSet.set_number}
          </div>
          <div>
            <label>
              Weight (kg):
              <input
                type="number"
                value={editSet.weight}
                onChange={(e) => setEditSet({ ...editSet, weight: Number(e.target.value) })}
              />
            </label>
          </div>
          <div>
            <label>
              Reps:
              <input
                type="number"
                value={editSet.reps}
                onChange={(e) => setEditSet({ ...editSet, reps: Number(e.target.value) })}
              />
            </label>
          </div>
          <div style={{ display: "flex"}}>
            <button onClick={handleSave} style={{ marginRight: "10px" }}>
              Save
            </button>
            <button onClick={() => setEditSet(null)}>Cancel</button>
            <button
              onClick={() => handleDelete(editSet)}
              style={{
                marginLeft: "auto",
                background: "red",
                color: "white",
                border: "none",
                padding: "5px 10px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </div>
          
        </div>
      )}
    
    </div>
  )
}