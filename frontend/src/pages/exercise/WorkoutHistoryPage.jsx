import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getWorkoutHistory, updateWorkoutSet, deleteWorkoutSet, saveWorkoutSet } from "../../api/workoutApi.js" // 從後端抓 workout history、更新 set、刪除 set
// import { getExerciseList } from "../../api/exerciseAPI.js"; // 用來顯示 exercise name
import { WorkoutSummaryPieChart } from "../../components/WorkoutPieChart.jsx"; // 圖表元件
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // 基本樣式
import '../../styles/CalendarCustom.css'; // 日曆自定義樣式
import { API_BASE_URL } from '../../api/config.js';

export default function WorkoutHistoryPage(){
  const navigate = useNavigate()
  const [history, setHistory] = useState([]);  //儲存進DB
  const [exerciseList, setExerciseList] = useState([]); // 儲存 exercise list 用來對照名稱
  const [selectedDate, setSelectedDate] = useState(null);
  const [editSet, setEditSet] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false); // 編輯與刪除的loading狀態
  const [expandedExId, setExpandedExId] = useState(null); // 用來控制同一天的 exercise 展開收合
  const [activeDates, setActiveDates] = useState([]); // 儲存 API 回傳的日期陣列
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);  
  const [allExercises, setAllExercises] = useState([]); // 存放所有可選動作

  useEffect(() => {
    async function loadData() {
      try {
        const historyRes = await getWorkoutHistory();
        // 🔥 1. fetch exercise list
        const exerciseRes = await fetch(`${API_BASE_URL}/exercise/list`, {
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
    const date = item.date.includes('/') ? item.date : new Date(item.date).toLocaleDateString();
    if (!acc[date]) acc[date] = {};

    // 依照 exercise_id 分組，這樣同一天的不同 exercise 就不會混在一起
    const exId = item.exercise_id; 
    if (!acc[date][exId]) acc[date][exId] = [];
    acc[date][exId].push(item);
    return acc;
  }, {});
  
  const handleSave = async () => {
    setIsProcessing(true);
    try {
      if (editSet.isNew) {
        // 直接把目前的 selectedDate 傳過去，不用再做 replaceAll 之類的轉換
        // 因為後端我們已經加了 .replace('-', '/') 的相容處理
        const payload = [{
          exercise_id: editSet.exercise_id,
          reps: editSet.reps,
          weight: editSet.weight,   
          date: selectedDate
        }];

        await saveWorkoutSet(payload);
      } else {
        // 編輯邏輯
        await updateWorkoutSet(editSet.id, {
          exercise_id: editSet.exercise_id,
          set_number: editSet.set_number,
          weight: editSet.weight,
          reps: editSet.reps,
        });
      }
      // 🔥 關鍵點：不管新增還是編輯成功，直接重新呼叫一次初始化時的撈取邏輯
      const refreshRes = await getWorkoutHistory();
      setHistory(refreshRes.data); // 這會觸發重新渲染，且格式會跟原本撈取時一致

      setEditSet(null); 
    } catch (err) {
      console.error("儲存失敗:", err);
      alert("儲存失敗，請檢查網路");
    } finally {
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
      // 刪除並重排成功後，再次撈取最新資料確保與後端完全同步（這步很重要，尤其是當多個使用者可能同時編輯同一天的紀錄時）
      const refreshRes = await getWorkoutHistory();
      setHistory(refreshRes.data);
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

  // 點擊空白處的 + 號，可直接新增記錄
  const openExerciseSelector = async () => {
    // 1. 撈取所有動作清單 (如果你還沒撈過)
    if (allExercises.length === 0) {
      const res = await fetch(`${API_BASE_URL}/exercise/list`);
      const data = await res.json();
      setAllExercises(data);
    }
    setIsSelectorOpen(true);
  };

  // 獲取日期
  useEffect(() => {
      const fetchActiveDates = async () => {
        try{
          const res = await fetch(`${API_BASE_URL}/workout/active-dates`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          const data = await res.json();
          // data 格式會是 ["2026-03-26", "2026-03-28"]
          setActiveDates(data); 
        } catch (error) {
          console.error("無法取得運動日期:", error);
        }
      };
      fetchActiveDates();
  }, []);

  // 修改日曆內容判定
  const getTileContent = ({ date, view }) => {
    // 1. 安全檢查：如果 activeDates 還沒載入，先不渲染內容
    if (!activeDates || !Array.isArray(activeDates)) return null;

    if (view === 'month') {
      // 使用穩定的 YYYY-MM-DD 格式
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      // 直接在陣列中尋找，效能極佳
      if (activeDates.includes(dateString)) {
        return (
          <div className="workout-marker">
            <span role="img" aria-label="muscle">💪</span>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="history-container" style={{ padding: "20px"}}>
      <button className="aero-back-btn" onClick={() => navigate("/dashboard")}>
        ← Back
      </button>   
      
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>Workout History</h1>

      {/* 2. 顯示日曆 (僅在未選擇特定日期時顯示) */}
      {!selectedDate && !editSet && (
        <div className="calendar-wrapper aero-card">
          <Calendar
            onChange={(date) => setSelectedDate(date.toLocaleDateString())}
            value={new Date()}
            tileContent={getTileContent}
            // 限制只能看過去到現在
            maxDate={new Date()}
          />
        </div>
      )}
      {/* 3. 選中日期後顯示的詳細內容 (摺疊列表+圓餅圖) */}
      {selectedDate && !editSet && (
        <div className="daily-detail">
          <>
            <button 
              onClick={() => {setSelectedDate(null); setExpandedExId(null);}} 
              style={{ marginBottom: "15px" }}
            >
              ← Back to Dates
            </button>
            <h2 style={{ fontSize: "1.2rem", color: "#005a9e", marginBottom: "15px" }}>
              Date: {selectedDate}
            </h2>

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
                    className="aero-card"
                    style={{
                      marginBottom: "15px",
                      // borderRadius: "8px",
                      overflow: "hidden", // 確保圓角
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
                      backgroundColor: isExpanded ? "rgba(255,255,255,0.3)" : "transparent",
                      transition: "background 0.3s"
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: "1.1rem", display: "block" }}>{exerciseName}</strong>
                      <div style={{ fontSize: "13px", opacity: 0.8}}>
                        Total: {totalVolume.toLocaleString()} kg | {sets.length} Sets
                      </div>
                    </div>
                    <span style={{ fontSize: "1.2rem" }}>{isExpanded ? "▲" : "▼"}</span>
                  </div>
                  {/* 內容區：僅在 isExpanded 為 true 時顯示 */}
                  {isExpanded && (
                    <div style={{ padding: "10px", borderTop: "1px solid rgba(255,255,255,0.3)" }}>
                      {sets
                        .sort((a, b) => a.set_number - b.set_number)
                        .map((set) => (
                          <div
                            key={set.id}
                            className="set-row"
                            onClick={() => setEditSet(set)}
                            style={{
                              padding: "12px",
                              borderBottom: "1px solid rgba(0,0,0,0.05)",
                              display: "flex",
                              justifyContent: "space-between",
                              cursor: "pointer"
                            }}
                          >
                            <span>Set {set.set_number}</span>
                            <span style={{ fontWeight: "bold" }}>{set.weight} kg × {set.reps}</span>
                          </div>
                        ))}
                        {/* 小 + 號按鈕，用來新增該動作的下一組 ExerciseSelectorModal */}
                        <button 
                          className="add-set-btn"
                          onClick={(e) => {
                            e.stopPropagation(); // 防止觸發摺疊
                            // 1. 從目前的 history 找出當天、該動作的所有組數
                            const currentSets = groupedByDate[selectedDate]?.[exerciseId] || [];
                            // 2. 計算下一組應該是第幾組
                            const nextSetNum = currentSets.length > 0 
                              ? Math.max(...currentSets.map(s => s.set_number)) + 1 
                              : 1;
                              // 3. 找出最後一組的重量/次數（自動帶入）
                            const lastSet = currentSets.length > 0 
                              ? [...currentSets].sort((a, b) => b.set_number - a.set_number)[0]
                              : null;
                            setEditSet({
                              exercise_id: Number(exerciseId),
                              set_number: nextSetNum,
                              weight: lastSet ? lastSet.weight : 0, // 若是編輯自動帶入上一組重量，否則預設0讓用戶輸入
                              reps: lastSet ? lastSet.reps : 0,     
                              isNew: true // 標記為新增
                            });
                            setIsSelectorOpen(false);
                          }}
                          style={{ width: "100%", color: "#005a9e", marginTop: "10px", backgroundColor: "rgba(255,255,255,0.2)", border: "1px dashed #00a8ff", borderRadius: "5px" }}
                        >
                          + Add Set {sets.length + 1}
                        </button>
                    </div>
                    )}
                  </div>
                );
              })}

              {/* 新增全新動作按鈕 */}
              <button onClick={openExerciseSelector} style={{ width: "100%", padding: "12px", borderRadius: "8px", marginBottom: "20px" }}>
                + Add Another Exercise
              </button>
              {/* 2. 圓餅圖分析 */}
                {/* <hr style={{ border: "0.5px solid #444", margin: "30px 0" }} /> */}
                <div className="aero-card" style={{ padding: "20px" }}>
                  <WorkoutSummaryPieChart 
                    dailyData={groupedByDate[selectedDate]} 
                    exerciseList={exerciseList} 
                  />
                </div>
              </>
            ) : (
                /* 3. 無資料時的顯示 (大 + 號)*/
                <div style={{ textAlign: "center", marginTop: "30px" }}>
                  <p>No workout yet on {selectedDate}</p>
                  <button 
                    onClick={openExerciseSelector}
                    className="big-plus-btn"
                    // style={{
                    //   width: "70px", height: "70px", borderRadius: "50%",
                    //   backgroundColor: "#007bff", color: "white", fontSize: "30px",
                    //   border: "none", cursor: "pointer", marginTop: "20px"
                    // }}
                  >
                    +
                  </button>
                </div>
              )}
          </>
        </div>
      )}
      
      

      {/* 編輯畫面（獨立） */}
      {editSet && (
        <div className="aero-card" style={{ padding: "25px", marginTop: "20px", borderRadius: "8px" }}>
          <h3 style={{ marginTop: 0 }}>Edit Set</h3>
          <p><strong>Exercise:</strong> {exerciseMap[editSet.exercise_id] || "Unknown"}</p>
          <p><strong>Set Number:</strong> {editSet.set_number}</p>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Weight(kg):</label>
              <input
                type="number"
                value={editSet.weight}
                style={{ width: "100%" }}
                onChange={(e) =>
                  setEditSet({ ...editSet, weight: Number(e.target.value) })
                }
              />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Reps:</label>
              <input
                type="number"
                value={editSet.reps}
                style={{ width: "100%" }}
                onChange={(e) =>
                  setEditSet({ ...editSet, reps: Number(e.target.value) })
                }
              />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button 
              onClick={handleSave}
              disabled={isProcessing} // 處理中禁用
            > 
              {isProcessing ? "Saving..." : "Save"}
            </button>

            <button 
              onClick={() => setEditSet(null)}
              style={{ background: "#eee", color: "#333", border: "1px solid #ccc" }}
              disabled={isProcessing}>
                Cancel
            </button>

            <button
              onClick={() => handleDelete(editSet)}
              disabled={isProcessing} // 處理中禁用
              // style={{
              //   marginLeft: "auto",
              //   background: isProcessing ? "#ccc" : "red", // 變灰色
              //   color: "white",
              //   border: "none",
              //   padding: "5px 10px",
              //   borderRadius: "5px",
              //   cursor: isProcessing ? "not-allowed" : "pointer", // 滑鼠變成禁用圖示
              // }}
              style={{ marginLeft: "auto", background: "linear-gradient(to bottom, #ff4d4d, #cc0000)", border: "none",borderRadius: "5px", cursor: isProcessing ? "not-allowed" : "pointer", }}
            >
              {isProcessing ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      )}
      {isSelectorOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center',backdropFilter: "blur(5px)" }}>
          <div className="aero-card" style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', width: '85%', maxHeight: '70vh', overflowY: 'auto' }}>
            <h3>Select Exercise</h3>
            {allExercises.map(ex => (
              <button 
                key={ex.id} 
                onClick={() => {
                  setEditSet({ exercise_id: ex.id, set_number: 1, weight: 0, reps: 0, isNew: true });
                  setIsSelectorOpen(false);
                }}
                style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '8px', textAlign: 'left', background: "rgba(0, 168, 255, 0.1)", border: "1px solid #00a8ff", borderRadius: "5px", cursor: "pointer" }}
              >
                {ex.name}
              </button>
            ))}
            <button onClick={() => setIsSelectorOpen(false)} style={{ marginTop: '10px', width: '100%',background: "#eee", color: "#333" }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}