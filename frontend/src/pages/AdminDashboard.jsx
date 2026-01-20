import { useState } from "react";
import "../styles.css";

export default function AdminDashboard() {
  const [events, setEvents] = useState([
    {
      name: "AI Career Talk",
      date: "2025-10-12",
      time: "10:00",
      location: "UPM Auditorium",
      type: "Talk",
    },
    {
      name: "Volunteer Program",
      date: "2025-10-15",
      time: "14:00",
      location: "Faculty Hall",
      type: "Workshop",
    },
  ]);

  const [form, setForm] = useState({
    name: "",
    date: "",
    time: "",
    location: "",
    type: "Workshop",
    keywords: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setEvents([...events, form]);
    setForm({
      name: "",
      date: "",
      time: "",
      location: "",
      type: "Workshop",
      keywords: "",
    });
  };

  return (
    <div className="page">
      <h1>Admin Dashboard</h1>
      <p className="form-subtitle">UPM AI Campus Event Planner</p>

      {/* ADD EVENT */}
      <div className="card mt-6">
        <h2 className="form-title">Add New Event</h2>

        <form onSubmit={handleSubmit} className="form-grid mt-4">
          <div className="form-group">
            <label className="label">Event Name</label>
            <input
              className="input"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="AI Workshop"
              required
            />
          </div>

          <div className="form-group">
            <label className="label">Date</label>
            <input
              className="input"
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="label">Time</label>
            <input
              className="input"
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="label">Location</label>
            <input
              className="input"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="UPM Hall"
              required
            />
          </div>

          <div className="form-group">
            <label className="label">Event Type</label>
            <select
              className="select"
              name="type"
              value={form.type}
              onChange={handleChange}
            >
              <option>Workshop</option>
              <option>Talk</option>
              <option>Competition</option>
              <option>Seminar</option>
            </select>
          </div>

          <div className="form-group">
            <label className="label">Keywords</label>
            <input
              className="input"
              name="keywords"
              value={form.keywords}
              onChange={handleChange}
              placeholder="AI, technology, career"
            />
          </div>

          <div className="form-group">
            <button className="btn btn-primary mt-4" type="submit">
              Save Event
            </button>
          </div>
        </form>
      </div>

      {/* EVENT LIST */}
      <div className="card mt-6">
        <h2 className="form-title">Existing Events</h2>

        <div className="event-list mt-4">
          {events.map((e, i) => (
            <div key={i} className="event-card">
              <div>
                <div className="event-title">{e.name}</div>
                <div className="event-meta">
                  📅 {e.date} ⏰ {e.time}
                </div>
                <div className="event-meta">📍 {e.location}</div>
              </div>

              <span className="badge">{e.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
