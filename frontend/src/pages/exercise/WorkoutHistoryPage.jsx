import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getWorkoutHistory, updateWorkoutSet, deleteWorkoutSet } from "../../api/workoutApi.js" // 從後端抓 workout history、更新 set、刪除 set
import { getExerciseList } from "../../api/exerciseAPI.js"; // 用來顯示 exercise name

export default function WorkoutHistoryPage(){
  const navigate = useNavigate()
  const [history, setHistory] = useState([]);  //儲存進DB
  const [exerciseList, setExerciseList] = useState([]); // 儲存 exercise list 用來對照名稱
  const [selectedDate, setSelectedDate] = useState(null);
  const [editSet, setEditSet] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    async function loadData() {
      try {
        const historyRes = await getWorkoutHistory();
        // 🔥 1. fetch exercise list
        const exerciseRes = await fetch("http://localhost:8000/exercise/list", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const exerciseData = await exerciseRes.json();

        // 存進 state（這行很重要）
        setExerciseList(exerciseData);
        // 原本的 history
        setHistory(historyRes.data);
      } catch (error) {
        if (error.message === "No token") {
          navigate("/login"); // 導頁到登入頁面
        }   
        console.error("Load failed:", error);
      }
    }
    loadData();
  }, []);

  // 🔥 建立 exerciseId → name 對照表（效能更好）
  const exerciseMap = React.useMemo(() => {
    return exerciseList.reduce((acc, ex) => {
      acc[ex.id] = ex.name;
      return acc;
    }, {});
  }, [exerciseList]);

  // 將資料依日期分組
  const groupedByDate = history.reduce((acc, item) => {
    const date = new Date(item.date).toLocaleDateString();
    if (!acc[date]) acc[date] = {};

    // 依照 exercise_id 分組，這樣同一天的不同 exercise 就不會混在一起
    const exId = item.exercise_id; 
    if (!acc[date][exId]) acc[date][exId] = [];
    acc[date][exId].push(item);
    return acc;
  }, {});
  

   // 優化：編輯完成後直接更新單組資料
  const handleSave = async () => {
    // 🔒 開啟鎖定，防止重複點擊
    setIsProcessing(true);
    try {
      await updateWorkoutSet(editSet.id, {
        exercise_id: editSet.exercise_id,
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
    } finally {
      // 🔓 無論成功失敗，最後都要解鎖
      setIsProcessing(false); 
    }
  };
  // 刪除訓練紀錄 + 重排同組後面的 set_number
  const handleDelete = async (setToDelete) => {
    if (!window.confirm("確定要刪除這組嗎？")) return;
    // 🔒 開啟鎖定，防止重複點擊
    setIsProcessing(true);

    try {
      // 1. 先執行刪除資料庫動作
      await deleteWorkoutSet(setToDelete.id);
      // 獲取當前所有的紀錄，並找出「同天、同動作、序號在大於被刪除者」的資料
      const deletedIndex = setToDelete.set_number;
      // 使用與分組顯示一致的日期格式 (toLocaleDateString)
      const targetDateStr = new Date(setToDelete.date).toLocaleDateString();
      // 2. 找出「同天、同動作、序號較大」的資料
      const needUpdateSets = history.filter(item => {
        const itemDateStr = new Date(item.date).toLocaleDateString();
        return (
          item.exercise_id === setToDelete.exercise_id &&
          itemDateStr === targetDateStr && // 確保日期精確匹配
          item.set_number > deletedIndex
        );
      });
      console.log("確定要更新的清單:", needUpdateSets);
      // 3. 更新資料庫 (只傳後端需要的 4 個欄位)
      await Promise.all(
        needUpdateSets.map(item => 
          updateWorkoutSet(item.id, {
            exercise_id: item.exercise_id,
            set_number: item.set_number - 1,
            weight: item.weight,
            reps: item.reps
          })
        )
      );

      // 4. 一次性更新前端 State (確保 UI 同步)
      setHistory((prev) => {
        return prev
          .filter((item) => item.id !== setToDelete.id) // 移除被刪除的那筆
          .map((item) => {
            const itemDateStr = new Date(item.date).toLocaleDateString();
            // 只有同組且序號在後面的才需要 -1
            if (
              item.exercise_id === setToDelete.exercise_id &&
              itemDateStr === targetDateStr &&
              item.set_number > deletedIndex
            ) {
              return { ...item, set_number: item.set_number - 1 };
            }
            return item;
          })
          // .sort((a, b) => a.set_number - b.set_number); // 排序
      });

      setEditSet(null);
      // alert("刪除並重排成功！");
    } catch (err) {
      console.error("刪除失敗:", err);
      alert("刪除失敗，請檢查網路。");
    }finally {
    // 🔓 無論成功失敗，最後都要解鎖
    setIsProcessing(false); 
    }
  };
  return (
    <div style={{ padding: "20px" }}>
      <button onClick={() => navigate("/dashboard")}>
        ← Back
      </button>

      <h1>Workout History</h1>

      {/* 1️⃣ 日期列表 */}
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
              <strong>{date}</strong>
            </div>
          ))}
        </>
      )}

      {/* 2️⃣ 當天 exercise + sets */}
      {selectedDate && !editSet && (
        <>
          <button onClick={() => setSelectedDate(null)} style={{ marginBottom: "10px" }}>
            Back to Dates
          </button>

          {Object.keys(groupedByDate[selectedDate]).map((exerciseId) => {
            const sets = groupedByDate[selectedDate][exerciseId];
            const exerciseName =
              exerciseMap[exerciseId] || "Unknown Exercise";
            const totalVolume = sets.reduce(
              (sum, set) => sum + set.weight * set.reps,
              0
            );
            return (
            <div
              key={exerciseId}
              style={{
                border: "1px solid #aaa",
                padding: "10px",
                marginBottom: "15px",
                borderRadius: "8px",
              }}
            >
              <h3>{exerciseName}</h3>
              <div style={{ fontSize: "14px", color: "#555" }}>
                Total: {totalVolume.toLocaleString()} kg
              </div>
              {sets
                .sort((a, b) => a.set_number - b.set_number)
                .map((set) => (
                  <div
                    key={set.id}
                    style={{
                      padding: "8px",
                      borderBottom: "1px solid #eee",
                      cursor: "pointer",
                    }}
                    onClick={() => setEditSet(set)}
                  >
                    Set {set.set_number} — {set.weight} kg × {set.reps}
                  </div>
                ))}
            </div>
          );
        })}
        </>
      )}

      {/* 3️⃣ 編輯畫面（獨立） */}
      {editSet && (
        <div style={{ border: "1px solid #ddd", padding: "10px", borderRadius: "8px" }}>
          <h3>Edit Set</h3>

          <div>
            <strong>Exercise:</strong>{" "}
            {exerciseMap[editSet.exercise_id] || "Unknown"}
          </div>

          <div>
            <strong>Set Number:</strong> {editSet.set_number}
          </div>

          <div>
            <label>
              Weight:
              <input
                type="number"
                value={editSet.weight}
                onChange={(e) =>
                  setEditSet({ ...editSet, weight: Number(e.target.value) })
                }
              />
            </label>
          </div>

          <div>
            <label>
              Reps:
              <input
                type="number"
                value={editSet.reps}
                onChange={(e) =>
                  setEditSet({ ...editSet, reps: Number(e.target.value) })
                }
              />
            </label>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button 
              onClick={handleSave}
              disabled={isProcessing} // 處理中禁用
              style={{ marginRight: "10px" }}>
                {isProcessing ? "Saving..." : "Save"}
            </button>

            <button 
              onClick={() => setEditSet(null)}
              disabled={isProcessing}>
                Cancel
            </button>

            <button
              onClick={() => handleDelete(editSet)}
              disabled={isProcessing} // 處理中禁用
              style={{
                marginLeft: "auto",
                background: isProcessing ? "#ccc" : "red", // 變灰色
                color: "white",
                border: "none",
                padding: "5px 10px",
                borderRadius: "5px",
                cursor: isProcessing ? "not-allowed" : "pointer", // 滑鼠變成禁用圖示
              }}
            >
              {isProcessing ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}