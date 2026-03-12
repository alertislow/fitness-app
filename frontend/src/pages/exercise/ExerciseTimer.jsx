// 運動timer，舊版目前保留，後續可重構

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ExercisePage() {
  const { id } = useParams(); // 運動子項 id
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState({
    sets: 5,
    reps: 10,
    weight: 100,
    exerciseTime: 90, // 秒
    restTime: 120,    // 秒
  });

  // 可從後端取得上次設定
  useEffect(() => {
    // fetch(`/api/exercises/${id}/last-setting`)
    //   .then(res => res.json())
    //   .then(data => setSettings(data));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings({ ...settings, [name]: Number(value) });
  };

  const startExercise = () => {
    navigate("/exercise-timer", { state: { ...settings, exerciseId: id } });
  };

  return (
    <div>
      <h2>運動設定</h2>
      <label>組數: <input type="number" name="sets" value={settings.sets} onChange={handleChange} /></label>
      <label>次數: <input type="number" name="reps" value={settings.reps} onChange={handleChange} /></label>
      <label>重量: <input type="number" name="weight" value={settings.weight} onChange={handleChange} /></label>
      <label>運動時間(秒): <input type="number" name="exerciseTime" value={settings.exerciseTime} onChange={handleChange} /></label>
      <label>休息時間(秒): <input type="number" name="restTime" value={settings.restTime} onChange={handleChange} /></label>
      <button onClick={startExercise}>開始運動</button>
    </div>
  );
}