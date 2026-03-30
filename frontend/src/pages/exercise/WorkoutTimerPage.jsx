import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import tickSound from "/sounds/tick.mp3";
import startSound from "/sounds/swoosh-sound-effects.mp3";
import restSound from "/sounds/swoosh-2.mp3";
import finishSound from "/sounds/bababoi.mp3";
import { saveWorkoutSet } from "../../api/workoutApi.js"
import { API_BASE_URL } from '../../api/config.js';

export default function WorkoutTimerPage(){
  const { exerciseId } = useParams();  // exercise_id
   // exercise 資料
  const [exercise, setExercise] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const settings = JSON.parse(localStorage.getItem(`workout_${exerciseId}`)) || {};

  // 從設定讀取參數，若沒有則使用預設值
  const totalSets = settings?.sets || 5;
  const reps = settings?.reps || 10;
  const weight = settings?.weight || 0;
  const workTime = settings?.workTime || 90;
  const restTime = settings?.restTime || 120;

  const [phase,setPhase] = useState("prepare")
  const [timeLeft,setTimeLeft] = useState(3)
  const [currentSet,setCurrentSet] = useState(1)
  const [isPaused, setIsPaused] = useState(false); // 暫停狀態

  // 讀取是否跳過最後一組休息的設定
  const userSettings = JSON.parse(localStorage.getItem("user_settings")) || {};
  const skipLastRest = userSettings.skipLastRest ?? true;

  const tick = new Audio(tickSound);
  const start = new Audio(startSound);
  const rest = new Audio(restSound);
  const finish = new Audio(finishSound);
  
  // 儲存已完成的 sets，後續再一起call API 儲存到後端，而不是每組work都送一次 API（這樣效能更好）
  const [completedSets, setCompletedSets] = useState([]);

  const handleFinishSet = (setData) => {
    setCompletedSets(prev => [
      ...prev,
      {
        exercise_id: Number(exerciseId),
        reps: setData.reps,
        weight: setData.weight
      }
    ]);
  };
  const handleFinishWorkout = async () => {
    try {
      console.log("sending sets:", completedSets); // 🔍 debug

      await saveWorkoutSet(completedSets); // 🔥 傳整個 array

      // alert("Workout saved!");
      setCompletedSets([]); // 清空
    } catch (err) {
      console.error("存儲 workout 失敗:", err);
    }
  };
  
  function formatTime(sec){
    const m = Math.floor(sec/60)
    const s = sec%60
    return `${m}:${s.toString().padStart(2,"0")}`
  }

// Timer 依 phase 和 currentSet 變化而更新，並在 prepare 的最後3秒播放 tick 音效，在 work/rest 結束時自動切換 phase
  useEffect(()=>{
    if (!token) {
      navigate("/login");
    }
    const timer = setInterval(()=>{
      // 如果暫停中，就跳過這秒的邏輯
      if (isPaused) return;
      setTimeLeft(prev=>{
        // 音效播放邏輯
        // Prepare 階段最後 3 秒
        if (phase === "prepare" && prev <= 3 && prev > 0) {
          tick.play();
        }
        // Work 或 Rest 階段最後 5 秒 (排除 prepare 避免重複)
        if ((phase === "work" || phase === "rest") && prev <= 5 && prev > 1) {
          tick.play();
        }
        // 階段切換邏輯 ---
        if(prev<=1){
          nextPhase()
          return 0
        } 
        return prev-1
      })
    },1000)
    return () => clearInterval(timer)
    // 包含 phase, currentSet, isPaused 以確保切換時計時器重置
}, [phase, currentSet, isPaused])

  // 在 useEffect 中 fetch 該 exercise
  useEffect(() => {
    fetch(`${API_BASE_URL}/exercise/${exerciseId}`)
      .then(res => res.json())
      .then(data => setExercise(data))
      .catch(err => console.error(err));
  }, [exerciseId]);

  function nextPhase(){
    if(phase==="prepare"){
      start.play();
      setPhase("work");
      setTimeLeft(workTime);
    } else if(phase==="work"){
      // 儲存剛完成的 set（但還沒 call API）
      handleFinishSet({
        reps: reps,
        weight: weight
      });
      // 判斷最後一組 work
      if (currentSet === totalSets && skipLastRest) {
        setPhase("done"); // 直接結束，不進 rest
        finish.play();
        return;
      }
      rest.play()
      setPhase("rest")
      setTimeLeft(restTime)
    } else if(phase==="rest"){
      // 正常 rest 結束，進下一組
      if(currentSet>=totalSets){
        setPhase("done")
        finish.play();
        return
      }
      // 其他組休息結束，進入下一組
      start.play()
      setCurrentSet(prev => prev + 1)
      setPhase("work")
      setTimeLeft(workTime)
    }
  }

  function skip(){
    nextPhase()
    }

  async function endWorkout(){
    await handleFinishWorkout(); // 🔥 存資料
    navigate("/dashboard")
  }

  if(phase==="done"){
    return(
      <div style={{textAlign:"center",padding:"40px"}}>
        <h1>Workout Complete 🎉</h1>
        <button onClick={async () => {
            await handleFinishWorkout();
            navigate("/dashboard");
          }} 
          style={{padding:"10px 20px"}}
        >
        Back to Dashboard
        </button>
      </div>
    )
  }

const circleSize = 220

  return(
    <div style={{textAlign:"center",padding:"40px"}}>
      <h1>{exercise ? exercise.name : `Exercise ID: ${exerciseId}`}</h1>
      <h2>Set {currentSet}/{totalSets}</h2>
      <div style={{marginBottom:"10px"}}>
        <strong>{weight} kg</strong>  
        <br/>
        {reps} reps
      </div>
      <h3>{phase.toUpperCase()}</h3>
      <div style={{
        width:circleSize,
        height:circleSize,
        borderRadius:"50%",
        border:"10px solid #4CAF50",
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
        fontSize:"40px",
        margin:"30px auto"
      }}>
        {formatTime(timeLeft)}
      </div>
      <div style={{display:"flex",gap:"20px",justifyContent:"center", flexDirection:"column", alignItems:"center"}}>
        {/* --- 暫停/繼續按鈕 --- */}
        <button 
          onClick={() => setIsPaused(!isPaused)} 
          style={{
            padding: "10px 40px", 
            fontSize: "18px", 
            backgroundColor: isPaused ? "#4CAF50" : "#f44336", // 暫停時綠色(繼續)，執行時紅色(暫停)
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          {isPaused ? "▶️ 繼續" : "⏸️ 暫停"}
        </button>

        <button onClick={skip} style={{padding:"10px 20px"}}>
          Skip
        </button>

        <button onClick={endWorkout} style={{padding:"10px 20px"}}>
          End Workout
        </button>
      </div>
    </div>
  )
}
