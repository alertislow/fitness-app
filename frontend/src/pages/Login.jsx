import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getToken,login } from "../api/authAPI";
import { API_BASE_URL } from '../api/config.js';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // 定義 loading 狀態
  const navigate = useNavigate();

  // 異步喚醒函式，獨立出來方便重複呼叫
  const warmup = async () => {
    try {
      await fetch(`${API_BASE_URL}/ping`);
      console.log("Backend warming up...");
    } catch (e) {
      console.log("Still waking up...");
    }
  };
  useEffect(() => {
    warmup(); // 頁面載入即預熱
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true); // 開始登入，進入 loading 狀態
    setError(""); // 清空舊錯誤訊息
    try {
      await login(email, password); // 會自動存 token
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
      console.error(err);
    } finally {
      setIsLoading(false); // 結束 loading
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", textAlign: "center" }}>
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <input 
          style={{margin: "10px auto"}}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={warmup}  // 聚焦時再次觸發預熱
          required
        />
        <br />
        <input 
          style={{margin: "10px auto"}}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={warmup}
          required
        />
        <br />
        {/* 修改按鈕顯示文字，提供使用者反饋 */}
        <button type="submit" style={{ margin: "10px auto" }} disabled={isLoading}>
          {isLoading ? "伺服器喚醒中，請稍候..." : "Login"}
        </button>
      </form>

      <button onClick={() => navigate('/register')} style={{ margin: "10px auto" }}>Register</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      
      {/* 提示訊息幫助緩解等待焦慮 */}
      {isLoading && <p style={{ fontSize: "0.8rem", color: "#666" }}>首次連線可能需要 30 秒啟動，請耐心等待 💪</p>}
    </div>
  );
}