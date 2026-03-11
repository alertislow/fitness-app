export function decodeToken(token) {
  try {
    if (!token) return null;

    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (err) {
    console.error("Token decode error:", err);
    return null;
  }
}