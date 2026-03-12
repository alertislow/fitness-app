import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

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

function formatTime(sec){
const m = Math.floor(sec/60)
const s = sec%60
return `${m}:${s.toString().padStart(2,"0")}`
}

useEffect(()=>{

const timer = setInterval(()=>{

setTimeLeft(prev=>{

if(prev>1) return prev-1

nextPhase()
return 0

})

},1000)

return ()=>clearInterval(timer)

},[phase])

function nextPhase(){

if(phase==="prepare"){
setPhase("work")
setTimeLeft(workTime)
}

else if(phase==="work"){
setPhase("rest")
setTimeLeft(restTime)
}

else if(phase==="rest"){

if(currentSet>=totalSets){
setPhase("done")
return
}

setCurrentSet(currentSet+1)
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
<button onClick={()=>navigate("/dashboard")}>
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

<div style={{display:"flex",gap:"20px",justifyContent:"center"}}>

<button onClick={skip}>
Skip
</button>

<button onClick={endWorkout}>
End Workout
</button>

</div>

</div>

)

}