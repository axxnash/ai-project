export default function UserDashboard() {
    return (
      <div className="card">
        <h1>🎯 Your Recommended Events</h1>
        <p style={{ color: "#cbd5f5", marginBottom: "1rem" }}>
          Events are ranked based on your interests and availability.
        </p>
  
        <div className="event">
          <div>
            <strong>Career Talk on AI</strong>
            <p style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
              12 Oct · 2–4pm · DK Serdang
            </p>
          </div>
          <div className="score high">85%</div>
        </div>
  
        <div className="event">
          <div>
            <strong>Leadership Workshop</strong>
            <p style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
              15 Oct · 10–12pm · Seminar Room A
            </p>
          </div>
          <div className="score mid">60%</div>
        </div>
  
        <div className="event">
          <div>
            <strong>Sports Day</strong>
            <p style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
              20 Oct · 9am · Stadium
            </p>
          </div>
          <div className="score low">30%</div>
        </div>
      </div>
    );
  }
  