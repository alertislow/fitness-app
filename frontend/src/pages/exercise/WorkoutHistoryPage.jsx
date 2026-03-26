import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getWorkoutHistory, updateWorkoutSet, deleteWorkoutSet } from "../../api/workoutApi.js" // 從後端抓 workout history、更新 set、刪除 set
import { getExerciseList } from "../../api/exerciseAPI.js"; // 用來顯示 exercise name
import { WorkoutSummaryPieChart } from "../../components/WorkoutPieChart.jsx"; // 圖表元件
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // 基本樣式
import './CalendarCustom.css'; // 我們等一下要寫的自定義樣式

export default function WorkoutHistoryPage(){
  const navigate = useNavigate()
  const [history, setHistory] = useState([]);  //儲存進DB
  const [exerciseList, setExerciseList] = useState([]); // 儲存 exercise list 用來對照名稱
  const [selectedDate, setSelectedDate] = useState(null);
  const [editSet, setEditSet] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false); // 編輯與刪除的loading狀態
  const [expandedExId, setExpandedExId] = useState(null); // 用來控制同一天的 exercise 展開收合
  
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
      // console.log("確定要更新的清單:", needUpdateSets);
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

  // 1. 檢查日期是否有紀錄的函式
  const getTileContent = ({ date, view }) => {
    if (view === 'month') {
      // 轉換成跟 history 一致的日期格式
      const dateString = date.toLocaleDateString();
      if (groupedByDate[dateString]) {
        return <div className="workout-marker">💪</div>;
      }
    }
    return null;
  };

  return (
    <div className="history-container">
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
              <strong>{date}</strong>
            </div>
          ))}
        </>
      )}
      {/* 2. 顯示日曆 (僅在未選擇特定日期時顯示) */}
      {!selectedDate && !editSet && (
        <div className="calendar-wrapper">
          <Calendar
            onChange={(date) => setSelectedDate(date.toLocaleDateString())}
            value={new Date()}
            tileContent={getTileContent}
            // 限制只能看過去到現在
            maxDate={new Date()}
          />
        </div>
      )}
      {/* 3. 選中日期後顯示的詳細內容 (原本你寫好的摺疊列表+圓餅圖) */}
      {selectedDate && !editSet && (
        <div className="daily-detail">
          <>
            <button 
              onClick={() => {setSelectedDate(null); setExpandedExId(null);}} 
              style={{ marginBottom: "20px" }}
            >
              ← Back to Dates
            </button>

            {groupedByDate[selectedDate] ? (
              <>
              {/* 1. 摺疊動作清單 */}
              {Object.keys(groupedByDate[selectedDate]).map((exerciseId) => {
                const sets = groupedByDate[selectedDate][exerciseId];
                const exerciseName = exerciseMap[exerciseId] || "Unknown Exercise";
                const isExpanded = expandedExId === exerciseId; // 判斷是否展開
                const totalVolume = sets.reduce((sum, set) => sum + set.weight * set.reps,0);

                return (
                  <div
                    key={exerciseId}
                    style={{
                      border: "1px solid #444",
                      marginBottom: "10px",
                      borderRadius: "8px",
                      overflow: "hidden", // 確保圓角
                      backgroundColor: "#1a1a1a"
                    }}
                  >
                  {/* 標題欄：點擊切換展開/縮合 */}
                  <div 
                    onClick={() => setExpandedExId(isExpanded ? null : exerciseId)}
                    style={{
                      padding: "15px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      backgroundColor: isExpanded ? "#333" : "transparent",
                      transition: "background 0.3s"
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: "1.1rem" }}>{exerciseName}</strong>
                      <div style={{ fontSize: "12px", color: "#aaa" }}>
                        Total: {totalVolume.toLocaleString()} kg | {sets.length} Sets
                      </div>
                    </div>
                    <span>{isExpanded ? "▲" : "▼"}</span>
                  </div>
                  {/* 內容區：僅在 isExpanded 為 true 時顯示 */}
                  {isExpanded && (
                    <div style={{ padding: "10px", borderTop: "1px solid #444", backgroundColor: "#111" }}>
                      {sets
                        .sort((a, b) => a.set_number - b.set_number)
                        .map((set) => (
                          <div
                            key={set.id}
                            style={{
                              padding: "12px",
                              borderBottom: "1px solid #222",
                              display: "flex",
                              justifyContent: "space-between",
                              cursor: "pointer"
                            }}
                            onClick={() => setEditSet(set)}
                          >
                            <span>Set {set.set_number}</span>
                            <span>{set.weight} kg × {set.reps}</span>
                          </div>
                        ))}
                    </div>
                    )}
                  </div>
                );
              })}
              {/* 2. 圓餅圖分析 */}
                <hr style={{ border: "0.5px solid #444", margin: "30px 0" }} />
                <WorkoutSummaryPieChart 
                  dailyData={groupedByDate[selectedDate]} 
                  exerciseList={exerciseList} 
                />
              </>
            ) : (
                /* 3. 無資料時的顯示 */
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                  <p>該日期的記錄已全部刪除</p>
                </div>
              )}
          </>
        </div>
      )}
      
      {/* 編輯畫面（獨立） */}
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