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

// --- Refs 用於核心計時與背景活性 ---
  const endTimeRef = useRef(null); // 絕對目標結束時間
  const audioCtxRef = useRef(null); // Web Audio 上下文
  const silentNodeRef = useRef(null); // 無聲脈衝節點
  const isTransitioningRef = useRef(false); // 防止重複觸發切換的開關

  // 使用者全域設定：是否跳過最後一組休息
  const userSettings = JSON.parse(localStorage.getItem("user_settings")) || {};  
  const skipLastRest = userSettings.skipLastRest ?? true;


  // 音效：使用 useMemo 確保音效物件只被建立一次
  const sounds = useMemo(() => ({
    tick: new Audio(tickSound),
    start: new Audio(startSound),
    rest: new Audio(restSound),
    finish: new Audio(finishSound)
  }), []);

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
      if (completedSets.length > 0) {
        await saveWorkoutSet(completedSets); //  傳整個 array
        setCompletedSets([]); // 清空
      }
    } catch (err) {
      console.error("存儲 workout 失敗:", err);
    }
  };

  // --- 階段切換與通知邏輯 ---
  const sendPhaseNotification = (currentPhase, endTimestamp) => {
    if ("Notification" in window && Notification.permission === "granted") {
      const timeStr = new Date(endTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      try {
        new Notification("健身計時器", {
          body: `${currentPhase.toUpperCase()} 進行中，將於 ${timeStr} 結束`,
          tag: "workout-timer",
          silent: true // 避免通知聲干擾音樂，我們使用自定義音效
        });
      } catch (e) {
      console.error("通知發送失敗", e);
      }
    }
  };

  // --- 核心：Web Audio 無聲脈衝引擎 (防止背景睡著) ---
  const startSilentEngine = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    // 每秒播放一個 0.001 秒的極低增益無聲音訊
    const playPulse = () => {
      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();
      gain.gain.value = 0.00001;
      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      osc.start();
      osc.stop(audioCtxRef.current.currentTime + 0.001);
    };
    if (!silentNodeRef.current) {
      silentNodeRef.current = setInterval(playPulse, 1000);
    }
  };

  const stopSilentEngine = () => {
    if (silentNodeRef.current) {
      clearInterval(silentNodeRef.current);
      silentNodeRef.current = null;
    }
  };

  // 更新 endTimeRef，準確執行背景計時
  const startNewPhase = (duration, phaseName) => {
    const targetTime = Date.now() + duration * 1000;
    endTimeRef.current = targetTime;
    setTimeLeft(duration);
    isTransitioningRef.current = false; // 開啟開關，允許下一次切換
    sendPhaseNotification(phaseName, targetTime);
  };

   // 階段轉換邏輯
  const handleNextPhase = () => {
    if (isTransitioningRef.current) return; // 如果正在切換中，直接擋掉
    isTransitioningRef.current = true; // 鎖上開關

    if(phase==="prepare"){
      sounds.start.play();
      setPhase("work");
      startNewPhase(workTime, "work");
    } else if(phase==="work"){
      // 儲存剛完成的 set（但還沒 call API）
      handleFinishSet({ reps, weight });
      // 判斷最後一組 work
      if (currentSet === totalSets && skipLastRest) {
        setPhase("done"); // 直接結束，不進 rest
        sounds.finish.play();
        stopSilentEngine();
      } else {
        sounds.rest.play()
        setPhase("rest")
        startNewPhase(restTime, "rest");
      }
    } else if(phase==="rest"){
      // 正常 rest 結束，進下一組
      if(currentSet>=totalSets){
        setPhase("done")
        sounds.finish.play();
        stopSilentEngine();
      } else {
         // 其他組休息結束，進入下一組
        sounds.start.play()
        setCurrentSet(prev => prev + 1)
        setPhase("work")
        startNewPhase(workTime, "work");
      }
    }
  };

  // --- 生命週期 ---
  useEffect(() => {
    // --- 初始化通知權限 ---
    // if ("Notification" in window && Notification.permission === "default") Notification.requestPermission();
    // --- 初始化計時 ---
    startNewPhase(3, "prepare");
   // startSilentEngine(); // 開始時啟動引擎
    return () => stopSilentEngine();
  }, []);


  // --- 主計時邏輯 (時間補償演算法) ---
  useEffect(() => {
    if (isPaused || phase === "done") return;
    const tick = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000));

      // 檢查 Tik-Tik 聲觸發 (最後 5 秒，每秒觸發一次)
      if (remaining <= 5 && remaining > 0 && remaining !== timeLeft) {
        sounds.tick.play().catch(() => {}); // catch 避免瀏覽器限制報錯
      }

      if (remaining <= 0 && !isTransitioningRef.current) {
        handleNextPhase();
      } else {
        setTimeLeft(remaining);
      }
    };

    const timer = setInterval(tick, 500); // 高頻檢查確保準確
    return () => clearInterval(timer);
  }, [phase, isPaused, timeLeft, currentSet]);

  // --- 處理視窗喚醒 (回到前台立即同步) ---
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && endTimeRef.current && !isPaused) {
        setTimeLeft(Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000)));
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isPaused]);


  
  // --- 暫停切換 ---
  const togglePause = () => {
    if (!isPaused) {
      // 紀錄暫停時還剩幾秒
      const remainingMs = endTimeRef.current - Date.now();
      endTimeRef.current = remainingMs; // 暫時存剩餘毫秒數
      stopSilentEngine();
    } else {
      // 恢復時，重新計算結束時間戳
      endTimeRef.current = Date.now() + endTimeRef.current;
      //startSilentEngine();
      sendPhaseNotification(phase, endTimeRef.current);
    }
    setIsPaused(!isPaused);
  };

  // --- 重新倒數功能 (<<) ---
  const resetCurrentPhase = () => {
    isTransitioningRef.current = false;
    const duration = phase === "prepare" ? 3 : (phase === "work" ? workTime : restTime);
    startNewPhase(duration, phase);
    setIsPaused(false);
    //startSilentEngine();
  };

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


  async function endWorkout(){
    stopSilentEngine();
    await handleFinishWorkout(); // 存資料
    navigate("/dashboard");
  };

  if(phase==="done"){
    return(
      <div className="timer-container" style={{textAlign:"center",padding:"40px"}}>
        <h1>Workout Complete 🎉</h1>
        <button 
          className="aero-btn-main"
          onClick={endWorkout} 
          style={{padding:"10px 40px"}}
        >
        Back to Dashboard
        </button>
      </div>
    );
  }

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
          <button onClick={resetCurrentPhase} className="icon-btn" title="Reset">⏮️</button>
           {/* --- 暫停/繼續按鈕 --- */}
          <button 
            onClick={togglePause} 
            className="aero-btn-main"
            style={{ backgroundColor: isPaused ? "#4CAF50" : "#00a8ff" }}
          >
            {isPaused ? "▶️ 繼續" : "⏸️ 暫停"}
          </button>
          {/* 跳過按鈕 >> */}
          <button onClick={handleNextPhase} className="icon-btn" title="Skip">⏭️</button>
        </div>

        <button onClick={endWorkout} className="end-workout-btn">End Workout</button>
      </div>
    </div>
  )
}
