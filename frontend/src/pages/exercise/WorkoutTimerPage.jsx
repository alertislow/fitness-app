import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import tickSound from "/sounds/tick.mp3";
import startSound from "/sounds/swoosh-sound-effects.mp3";
import restSound from "/sounds/swoosh-2.mp3";
import finishSound from "/sounds/bababoi.mp3";

export default function WorkoutTimerPage(){

  const { name } = useParams()
  const navigate = useNavigate()

  const settings = JSON.parse(localStorage.getItem(`workout_${name}`))

  const totalSets = settings?.sets || 5
  const reps = settings?.reps || 10
  const weight = settings?.weight || 0
  const workTime = settings?.workTime || 90
  const restTime = settings?.restTime || 120

  const [phase,setPhase] = useState("prepare")
  const [timeLeft,setTimeLeft] = useState(3)
  const [currentSet,setCurrentSet] = useState(1)

  // 讀取是否跳過最後一組休息的設定
  const userSettings = JSON.parse(localStorage.getItem("user_settings")) || {};
  const skipLastRest = userSettings.skipLastRest ?? true;

  const tick = new Audio(tickSound);
  const start = new Audio(startSound);
  const rest = new Audio(restSound);
  const finish = new Audio(finishSound);

  function formatTime(sec){
  const m = Math.floor(sec/60)
  const s = sec%60
  return `${m}:${s.toString().padStart(2,"0")}`
  }

  useEffect(()=>{
    const timer = setInterval(()=>{
      setTimeLeft(prev=>{
        if (phase === "prepare" && prev <= 3 && prev > 0) {
          tick.play();
        }
        if(prev<=1){
          nextPhase()
          return 0
        } 
        return prev-1
      })
    },1000)
    return () => clearInterval(timer)
}, [phase, currentSet])

  function nextPhase(){
    if(phase==="prepare"){
      start.play()
      setPhase("work")
      setTimeLeft(workTime)
    }
    else if(phase==="work"){
      // 判斷最後一組 work
      if (currentSet === totalSets && skipLastRest) {
        finish.play();
        setPhase("done"); // 直接結束，不進 rest
        return;
      }
      rest.play()
      setPhase("rest")
      setTimeLeft(restTime)
    }
    else if(phase==="rest"){
      // 正常 rest 結束，進下一組
      if(currentSet>=totalSets){
        setPhase("done")
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

  function endWorkout(){
  navigate("/dashboard")
  }

  if(phase==="done"){
   return(
    <div style={{textAlign:"center",padding:"40px"}}>
    <h1>Workout Complete 🎉</h1>
    <button onClick={()=>navigate("/dashboard")} style={{padding:"10px 20px"}}>
    Back to Dashboard
    </button>
    </div>
   )
  }

const circleSize = 220

return(

  <div style={{textAlign:"center",padding:"40px"}}>

    <h1>{name}</h1>

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