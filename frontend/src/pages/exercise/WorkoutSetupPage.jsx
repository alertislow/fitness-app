import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { API_BASE_URL } from "../../api/config.js";

export default function WorkoutSetupPage() {
  const { exerciseId } = useParams(); // exercise_id
  const navigate = useNavigate();
  const location = useLocation();
  const { bodyPartId } = location.state || {}; // 用作返回按鈕
  const [exercise, setExercise] = useState(null);
  const storageKey = `workout_${exerciseId}`; // 每個動作獨立的儲存鍵

  // 預設值
  const [sets, setSets] = useState("5");
  const [reps, setReps] = useState("10");
  const [weight, setWeight] = useState("0");
  const [workTime, setWorkTime] = useState("90");
  const [restTime, setRestTime] = useState("120");

  // 載入localStorage記錄
  useEffect(() => {
    if (!exerciseId) return;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const data = JSON.parse(saved);
      setSets(String(data.sets));
      setReps(String(data.reps));
      setWeight(String(data.weight));
      setWorkTime(String(data.workTime));
      setRestTime(String(data.restTime));
    }
  }, [exerciseId, storageKey]);

  // 在 useEffect 中 fetch 該 exercise
  useEffect(() => {
    if (!exerciseId) return;
    fetch(`${API_BASE_URL}/exercise/${exerciseId}`)
      .then((res) => res.json())
      .then((data) => setExercise(data))
      .catch((err) => console.error(err));
  }, [exerciseId]);

  // 儲存設定
  const saveSettings = () => {
    const data = { sets, reps, weight, workTime, restTime };
    localStorage.setItem(storageKey, JSON.stringify(data));
  };

  const startWorkout = () => {
    saveSettings();
    navigate(`/exercise/timer/${exerciseId}`);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
      {/* 返回按鈕 */}
      <button onClick={() => navigate(`/exercise/body-part/${bodyPartId}`)}>
        ← Back
      </button>
      <h1>{exercise ? exercise.name : `Exercise ID: ${exerciseId}`}</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <label>
          組數:
          <input
            type="number"
            value={sets}
            onChange={(e) => setSets(e.target.value)}
            placeholder="未輸入值預設爲 5"
          />
        </label>

        <label>
          次數:
          <input
            type="number"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            placeholder="未輸入值預設爲 10"
          />
        </label>

        <label>
          重量 (kg):
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="未輸入值預設爲 0"
          />
        </label>

        <label>
          運動時間(秒):
          <input
            type="number"
            value={workTime}
            onChange={(e) => setWorkTime(e.target.value)}
            placeholder="未輸入值預設爲 90"
          />
        </label>

        <label>
          休息時間(秒):
          <input
            type="number"
            value={restTime}
            onChange={(e) => setRestTime(e.target.value)}
            placeholder="未輸入值預設爲 120"
          />
        </label>
      </div>

      <button
        onClick={startWorkout}
        style={{
          marginTop: "20px",
          padding: "10px",
          width: "100%",
          fontSize: "18px",
        }}
      >
        Start Workout
      </button>
    </div>
  );
}
