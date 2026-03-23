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
    }
  };
  // 刪除訓練紀錄 + 重排同組後面的 set_number
  const handleDelete = async (setToDelete) => {
    if (!window.confirm("確定要刪除這組嗎？")) return;
    try {
      // 刪除
      await deleteWorkoutSet(setToDelete.id);
      // 找出被刪的是第幾組
      const deletedSetNumber = setToDelete.set_number;

      // 找出同一天 + 同 exercise 的資料
      const sameGroup = history
        .filter(
          (item) =>
            item.exercise_id === setToDelete.exercise_id &&
            new Date(item.date).toLocaleDateString() ===
              new Date(setToDelete.date).toLocaleDateString()
        )
        .sort((a, b) => a.set_number - b.set_number);

      // 找需要重排的，將後面的 set_number -1
      const needUpdate = sameGroup.filter(
        (item) => item.set_number > deletedSetNumber
      );
      // 更新DB
      for (let item of needUpdate) {
        await updateWorkoutSet(item.id, {
          exercise_id: item.exercise_id,
          set_number: item.set_number - 1, // 🔥 重排
          weight: item.weight,
          reps: item.reps,
        });
      }

      // 更新前端 state（不用重新 GET）
      setHistory((prev) =>
        prev
          .filter((item) => item.id !== setToDelete.id) // 移除被刪的
          .map((item) => {
            if (
              item.exercise_id === setToDelete.exercise_id &&
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

          <div style={{ display: "flex" }}>
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
  );
}