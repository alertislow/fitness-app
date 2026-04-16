import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import tickSound from "/sounds/tick.mp3";
import startSound from "/sounds/swoosh-sound-effects.mp3";
import restSound from "/sounds/swoosh-2.mp3";
import finishSound from "/sounds/bababoi.mp3";
import { saveWorkoutSet } from "../../api/workoutApi.js"
import { API_BASE_URL } from '../../api/config.js';
import "../../styles/Timer.css";

export default function WorkoutTimerPage(){
  const { exerciseId } = useParams();  // exercise_id
   // exercise 資料
  const [exercise, setExercise] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const settings = JSON.parse(localStorage.getItem(`workout_${exerciseId}`)) || {};

  // 讀取設定，若沒有則使用預設值
  const totalSets = settings?.sets || 5;
  const reps = settings?.reps || 10;
  const weight = settings?.weight || 0;
  const workTime = settings?.workTime || 90;
  const restTime = settings?.restTime || 120;

  // 狀態管理
  const [phase,setPhase] = useState("prepare")
  const [timeLeft,setTimeLeft] = useState(3)
  const [currentSet,setCurrentSet] = useState(1)
  const [isPaused, setIsPaused] = useState(false); // 暫停狀態
  const [completedSets, setCompletedSets] = useState([]); // 儲存已完成的 sets，後續再一起call API 儲存到後端，而不是每組work都送一次 API（這樣效能更好）

  // 使用者全域設定：是否跳過最後一組休息
  const userSettings = JSON.parse(localStorage.getItem("user_settings")) || {};  
  const skipLastRest = userSettings.skipLastRest ?? true;

  // 音效物件
  const tick = new Audio(tickSound);
  const start = new Audio(startSound);
  const rest = new Audio(restSound);
  const finish = new Audio(finishSound);
  
  // --- 新增：計算當前階段總時長 (供圓圈進度計算) ---
  const totalPhaseTime = useMemo(() => {
    if (phase === "prepare") return 3;
    if (phase === "work") return workTime;
    if (phase === "rest") return restTime;
    return 1;
  }, [phase, workTime, restTime]);

  // --- 新增：圓圈 SVG 參數計算 ---
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timeLeft / totalPhaseTime) * circumference;

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
      await saveWorkoutSet(completedSets); //  傳整個 array
      setCompletedSets([]); // 清空
    } catch (err) {
      console.error("存儲 workout 失敗:", err);
    }
  };
  
  //格式化時間
  function formatTime(sec){
    const m = Math.floor(sec/60)
    const s = sec%60
    return `${m}:${s.toString().padStart(2,"0")}`
  }

//  計時器邏輯： Timer 依 phase 和 currentSet 變化而更新，並在 prepare 的最後3秒播放 tick 音效，在 work/rest 結束時自動切換 phase
  useEffect(()=>{
    if (!token) {
      navigate("/login");
      return;
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
    // 包含 phase, currentSet, isPaused, totalPhaseTime 以確保切換時計時器重置
}, [phase, currentSet, isPaused, totalPhaseTime])

  // 獲取動作資訊
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
      handleFinishSet({ reps,weight });
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

  // --- 重新倒數功能 (<<) ---
  const resetCurrentPhase = () => {
    setTimeLeft(totalPhaseTime);
    setIsPaused(false);
  };
  // 跳過，直接進下一組 (>>)
  function skip(){
    nextPhase()
    }

  async function endWorkout(){
    await handleFinishWorkout(); // 存資料
    navigate("/dashboard")
  }

  if(phase==="done"){
    return(
      <div className="timer-container" style={{textAlign:"center",padding:"40px"}}>
        <h1>Workout Complete 🎉</h1>
        <button 
          className="aero-btn-main"
          onClick={async () => {
            await handleFinishWorkout();
            navigate("/dashboard");
          }} 
          style={{padding:"10px 40px"}}
        >
        Back to Dashboard
        </button>
      </div>
    );
  }

const circleSize = 220

  return(
    <div className="timer-container" style={{textAlign:"center",padding:"40px"}}>
      <h1>{exercise ? exercise.name : `Exercise ID: ${exerciseId}`}</h1>
      <h2>Set {currentSet}/{totalSets}</h2>
      <div className="exercise-info" style={{marginBottom:"10px"}}>
        <strong>{weight} kg</strong>  
        <br/>
        {reps} reps
      </div>
      <h3 className="phase-title">{phase.toUpperCase()}</h3>
      {/* --- SVG 動態圓圈計時器 --- */}
      <div className="timer-circle-wrapper">
        <svg className="timer-svg" width="220" height="220">
          <circle className="timer-circle-bg" cx="110" cy="110" r={radius} />
          <circle
            className="timer-circle-progress"
            cx="110" cy="110" r={radius}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
              stroke: phase === "rest" ? "#2196F3" : "#4CAF50"
            }}
          />
        </svg>
        <div className="timer-text">
          {formatTime(timeLeft)}
        </div>
      </div>
      
      {/* --- 按鈕操作區 --- */}
      <div className="controls-group">
        
        <div className="main-controls">
          {/* 重置按鈕 << */}
          <button onClick={resetCurrentPhase} className="icon-btn">
            ⏮️
          </button>
           {/* --- 暫停/繼續按鈕 --- */}
          <button 
            onClick={() => setIsPaused(!isPaused)} 
            className="aero-btn-main"
            style={{ backgroundColor: isPaused ? "#4CAF50" : "#00a8ff" }}
          >
            {isPaused ? "▶️ 繼續" : "⏸️ 暫停"}
          </button>
          {/* 跳過按鈕 >> */}
          <button onClick={skip} className="icon-btn">
            ⏭️
          </button>
        </div>

        <button onClick={endWorkout} style={{padding:"10px 20px"}}>
          End Workout
        </button>
      </div>
    </div>
  )
}
