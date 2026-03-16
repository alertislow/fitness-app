import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken,login } from "../api/authAPI";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password); // 會自動存 token
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
      console.error(err);
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
          required
        />
        <br />
        <input 
          style={{margin: "10px auto"}}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />
        <button type="submit" style={{ margin: "10px auto" }}>Login</button>
      </form>
      <button onClick={() => navigate('/register')} style={{ margin: "10px auto" }}>Register</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}