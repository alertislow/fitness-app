import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function WorkoutTimerPage() {

  const { name } = useParams();
  const navigate = useNavigate();

  const storageKey = `workout_${name}`;
  const settings = JSON.parse(localStorage.getItem(storageKey));

  const totalSets = settings?.sets || 5;
  const workTime = settings?.workTime || 90;
  const restTime = settings?.restTime || 120;

  const [phase, setPhase] = useState("prepare");
  const [timeLeft, setTimeLeft] = useState(3);
  const [currentSet, setCurrentSet] = useState(1);

  useEffect(() => {

    const timer = setInterval(() => {

      setTimeLeft((prev) => {

        if (prev > 1) return prev - 1;

        nextPhase();
        return 0;

      });

    }, 1000);

    return () => clearInterval(timer);

  }, [phase]);

  const nextPhase = () => {

    if (phase === "prepare") {
      setPhase("work");
      setTimeLeft(workTime);
    }

    else if (phase === "work") {
      setPhase("rest");
      setTimeLeft(restTime);
    }

    else if (phase === "rest") {

      if (currentSet >= totalSets) {
        setPhase("done");
        return;
      }

      setCurrentSet(currentSet + 1);
      setPhase("work");
      setTimeLeft(workTime);

    }

  };

  const skip = () => {
    nextPhase();
  };

  const endWorkout = () => {
    navigate("/dashboard");
  };

  if (phase === "done") {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <h1>Workout Complete 🎉</h1>
        <button onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", padding: "40px" }}>

      <h1>{name}</h1>

      <h2>
        Set {currentSet} / {totalSets}
      </h2>

      <h3>{phase.toUpperCase()}</h3>

      <div
        style={{
          fontSize: "60px",
          margin: "30px"
        }}
      >
        {timeLeft}
      </div>

      <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>

        <button onClick={skip}>
          Skip
        </button>

        <button onClick={endWorkout}>
          End Workout
        </button>

      </div>

    </div>
  );
}