import React, { useState, useEffect, useMemo, useRef } from "react";
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

  // 讀取設定，若沒有則使用預設值
  const settings = JSON.parse(localStorage.getItem(`workout_${exerciseId}`)) || {};
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
  const [isPiPSupported] = useState('documentPictureInPicture' in window);

  // 使用者全域設定：是否跳過最後一組休息
  const userSettings = JSON.parse(localStorage.getItem("user_settings")) || {};  
  const skipLastRest = userSettings.skipLastRest ?? true;

  // Refs 通知欄
  const pipWindowRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // 音效：使用 useMemo 確保音效物件只被建立一次
  const sounds = useMemo(() => ({
    tick: new Audio(tickSound),
    start: new Audio(startSound),
    rest: new Audio(restSound),
    finish: new Audio(finishSound)
  }), []);


  // --- 計算當前階段總時長 (供圓圈進度計算) ---
  const totalPhaseTime = useMemo(() => {
    if (phase === "prepare") return 3;
    if (phase === "work") return workTime;
    if (phase === "rest") return restTime;
    return 1;
  }, [phase, workTime, restTime]);

  // 圓圈 SVG 參數計算 ---
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timeLeft / totalPhaseTime) * circumference;
  
  //格式化時間
  function formatTime(sec){
    const m = Math.floor(sec/60)
    const s = sec%60
    return `${m}:${s.toString().padStart(2,"0")}`
  }

// --- 獲取動作資訊 ---
  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetch(`${API_BASE_URL}/exercise/${exerciseId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setExercise(data))
      .catch(err => console.error(err));
  }, [exerciseId, token, navigate]);

//  主計時器邏輯
  useEffect(()=>{
    timerIntervalRef.current = setInterval(()=>{
      // 如果暫停中，就跳過這秒的邏輯
      if (isPaused) return;
      setTimeLeft(prev=>{
        // Prepare 階段最後 3 秒
        if (phase === "prepare" && prev <= 3 && prev > 0) {
          sounds.tick.play();
        }
        // Work 或 Rest 階段最後 5 秒 (排除 prepare 避免重複)
        if ((phase === "work" || phase === "rest") && prev <= 5 && prev > 1) {
          sounds.tick.play();
        }
        // 階段切換邏輯 ---
        if(prev<=1){
          nextPhase()
          return 0
        } 
        return prev-1
      })
    },1000)
    return () => clearInterval(timerIntervalRef.current)
    // 包含 phase, currentSet, isPaused, totalPhaseTime 以確保切換時計時器重置
}, [phase, currentSet, isPaused, totalPhaseTime])

 // --- PiP 更新邏輯 ---
  // 當 timeLeft 或其他狀態改變時，更新 PiP 視窗內容
  useEffect(() => {
    if (pipWindowRef.current) {
      const pipDoc = pipWindowRef.current.document;
      const timeEl = pipDoc.getElementById("pip-time");
      const phaseEl = pipDoc.getElementById("pip-phase");
      const setEl = pipDoc.getElementById("pip-set");
      const pauseBtn = pipDoc.getElementById("pip-pause-btn");

      if (timeEl) timeEl.innerText = formatTime(timeLeft);
      if (phaseEl) phaseEl.innerText = phase.toUpperCase();
      if (setEl) setEl.innerText = `Set ${currentSet}/${totalSets}`;
      if (pauseBtn) pauseBtn.innerText = isPaused ? "▶️" : "⏸️";
    }
  }, [timeLeft, phase, currentSet, isPaused]);

  // --- 開啟 Picture-in-Picture 視窗 ---
  const togglePiP = async () => {
    if (pipWindowRef.current) {
      pipWindowRef.current.close();
      return;
    }

    try {
      const pipWindow = await window.documentPictureInPicture.requestWindow({
        width: 280,
        height: 200,
      });

      // 複製樣式到 PiP 視窗
      [...document.styleSheets].forEach((styleSheet) => {
        try {
          const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join("");
          const style = document.createElement("style");
          style.textContent = cssRules;
          pipWindow.document.head.appendChild(style);
        } catch (e) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.type = styleSheet.type;
          link.media = styleSheet.media;
          link.href = styleSheet.href;
          pipWindow.document.head.appendChild(link);
        }
      });

      // 注入 HTML 結構 (採用 Aero 風格)
      pipWindow.document.body.innerHTML = `
        <div class="pip-container" style="padding:15px; text-align:center; background: #e3f2fd; height: 100vh; font-family: sans-serif;">
          <div id="pip-phase" style="font-weight:bold; color:#0078d4; margin-bottom:5px;">${phase.toUpperCase()}</div>
          <div id="pip-time" style="font-size: 3rem; font-weight: bold; margin: 10px 0; color: #333;">${formatTime(timeLeft)}</div>
          <div id="pip-set" style="font-size: 0.9rem; color: #666;">Set ${currentSet}/${totalSets}</div>
          <div style="margin-top: 15px; display: flex; justify-content: center; gap: 10px;">
            <button id="pip-reset-btn" class="icon-btn" style="cursor:pointer; border:none; background:none; font-size:1.5rem;">⏮️</button>
            <button id="pip-pause-btn" class="aero-btn-main" style="cursor:pointer; border-radius:50%; width:45px; height:45px; display:flex; align-items:center; justify-content:center; border:none; background:#00a8ff; color:white;">${isPaused ? "▶️" : "⏸️"}</button>
            <button id="pip-next-btn" class="icon-btn" style="cursor:pointer; border:none; background:none; font-size:1.5rem;">⏭️</button>
          </div>
        </div>
      `;

      // 綁定事件
      pipWindow.document.getElementById("pip-pause-btn").onclick = () => setIsPaused(p => !p);
      pipWindow.document.getElementById("pip-reset-btn").onclick = () => resetCurrentPhase();
      pipWindow.document.getElementById("pip-next-btn").onclick = () => skip();

      pipWindow.onpagehide = () => { pipWindowRef.current = null; };
      pipWindowRef.current = pipWindow;
    } catch (err) {
      console.error("PiP 啟動失敗", err);
    }
  };

  // 階段轉換邏輯
  function nextPhase(){
    if(phase==="prepare"){
      sounds.start.play();
      setPhase("work");
      setTimeLeft(workTime);
    } else if(phase==="work"){
      // 儲存剛完成的 set（但還沒 call API）
      handleFinishSet({ reps,weight });
      // 判斷最後一組 work
      if (currentSet === totalSets && skipLastRest) {
        setPhase("done"); // 直接結束，不進 rest
        sounds.finish.play();
        if (pipWindowRef.current) pipWindowRef.current.close();
        return;
      }
      sounds.rest.play()
      setPhase("rest")
      setTimeLeft(restTime)
    } else if(phase==="rest"){
      // 正常 rest 結束，進下一組
      if(currentSet>=totalSets){
        setPhase("done")
        sounds.finish.play();
        if (pipWindowRef.current) pipWindowRef.current.close();
        return
      }
      // 其他組休息結束，進入下一組
      sounds.start.play()
      setCurrentSet(prev => prev + 1)
      setPhase("work")
      setTimeLeft(workTime)
    }
  }

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

  // --- 重新倒數功能 (<<) ---
  const resetCurrentPhase = () => {
    setTimeLeft(totalPhaseTime);
    setIsPaused(false);
  };
  // 跳過，直接進下一組 (>>)
  function skip(){
    nextPhase();
  };

  async function endWorkout(){
    if (pipWindowRef.current) pipWindowRef.current.close();
    await handleFinishWorkout(); // 存資料
    navigate("/dashboard");
  };

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

// const circleSize = 220

  return(
    <div className="timer-container" style={{textAlign:"center",padding:"40px"}}>
      <h1>{exercise ? exercise.name : `Exercise ID: ${exerciseId}`}</h1>
      {/* PiP 啟動按鈕 (Aero 風格) */}
      {isPiPSupported && (
        <button 
          onClick={togglePiP} 
          className="pip-toggle-btn"
          style={{ 
            marginBottom: '20px', 
            background: 'rgba(255,255,255,0.3)', 
            border: '1px solid #fff', 
            padding: '5px 15px', 
            borderRadius: '20px',
            cursor: 'pointer'
          }}
        >
          📺 開啟懸浮計時器
        </button>
      )}
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
          <button onClick={resetCurrentPhase} className="icon-btn" title="Reset Set">
            ⏮️
          </button>
           {/* --- 暫停/繼續按鈕 --- */}
          <button 
            onClick={() => setIsPaused(!isPaused)} 
            className="aero-btn-main"
            style={{ backgroundColor: isPaused ? "#4CAF50" : "#00a8ff" }}
            title={isPaused ? "Continue" : "Pause"}
          >
            {isPaused ? "▶️ 繼續" : "⏸️ 暫停"}
          </button>
          {/* 跳過按鈕 >> */}
          <button onClick={skip} className="icon-btn" title="Skip Phase">
            ⏭️
          </button>
        </div>

        <button onClick={endWorkout} className="end-workout-btn" title="End Workout">
          End Workout
        </button>
      </div>
    </div>
  )
}
