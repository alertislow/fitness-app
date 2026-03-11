import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://127.0.0.1:8000/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.access_token);
      navigate("/dashboard");
      console.log(email, password);
    } catch (err) {
      setError("Invalid email or password");
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", textAlign: "center" }}>
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <input style={{margin: "10px auto"}}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />
        <input style={{margin: "10px auto"}}
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