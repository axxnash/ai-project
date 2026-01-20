import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../api.js";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [interests, setInterests] = useState("");
  const [freeDays, setFreeDays] = useState("");
  const [freeTime, setFreeTime] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Adjust fields to match backend schema
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password,
          interests,
          free_days: freeDays,
          free_time: freeTime,
        }),
      });

      navigate("/login");
    } catch (err) {
      setError("Registration failed. Maybe email already exists.");
      console.error(err);
    }
  };

  return (
    <div className="card">
      <h1 className="form-title">Create your UPM account ✨</h1>
      <p className="form-subtitle">
        Tell us your interests and free time so AI can recommend the right events.
      </p>

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="form-grid">
          <div className="form-group">
            <label className="label">Full Name</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ali bin Abu"
              required
            />
          </div>

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

          <div className="form-group">
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

          <div className="form-group">
            <label className="label">Interests (comma separated)</label>
            <input
              className="input"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="AI, volunteering, leadership"
            />
          </div>

          <div className="form-group">
            <label className="label">Free Days</label>
            <input
              className="input"
              value={freeDays}
              onChange={(e) => setFreeDays(e.target.value)}
              placeholder="Mon, Wed, Fri"
            />
          </div>

          <div className="form-group">
            <label className="label">Free Time Window</label>
            <input
              className="input"
              value={freeTime}
              onChange={(e) => setFreeTime(e.target.value)}
              placeholder="2pm - 6pm"
            />
          </div>
        </div>

        {error && (
          <div className="mt-2" style={{ color: "#f97373", fontSize: "0.85rem" }}>
            {error}
          </div>
        )}

        <div className="flex-between mt-4">
          <button type="submit" className="btn btn-primary">
            Register
          </button>
          <span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#38bdf8" }}>
              Login
            </Link>
          </span>
        </div>
      </form>
    </div>
  );
}
