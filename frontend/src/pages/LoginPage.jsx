import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../api.js";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // 🔁 Adjust endpoint + response keys to match backend
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      // Suppose backend returns: { access_token, role }
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role || "user");

      if (data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Login failed. Check your email/password.");
      console.error(err);
    }
  };

  return (
    <div className="card">
      <h1 className="form-title">Welcome back 👋</h1>
      <p className="form-subtitle">
        Log in to see personalised UPM event recommendations.
      </p>

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="form-group">
          <label className="label">UPM Email</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@student.upm.edu.my"
            required
          />
        </div>

        <div className="form-group mt-2">
          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        {error && (
          <div className="mt-2" style={{ color: "#f97373", fontSize: "0.85rem" }}>
            {error}
          </div>
        )}

        <div className="flex-between mt-4">
          <button type="submit" className="btn btn-primary">
            Login
          </button>
          <span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
            No account?{" "}
            <Link to="/register" style={{ color: "#38bdf8" }}>
              Register
            </Link>
          </span>
        </div>
      </form>
    </div>
  );
}
