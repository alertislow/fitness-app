const API_URL = "http://localhost:8000"; 

// ---------------------------
// Token 管理
// ---------------------------
export function getToken() {
  return localStorage.getItem("token");
}

export function logout() {
  localStorage.removeItem("token");
}

// ---------------------------
// 登入
// ---------------------------
export async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Login failed");
  }

  const data = await res.json();
  localStorage.setItem("token", data.access_token); // 存 JWT
  return data;
}

// ---------------------------
// 註冊
// ---------------------------
export async function register(email, password) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Register failed");
  }

  return res.json();
}