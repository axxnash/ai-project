import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            UPM Event Recommender
          </Link>
          <div className="nav-links">
            {user && (
              <>
                <Link to="/">Events</Link>
                {user.role === 'student' && (
                  <>
                    <Link to="/recommendations">Recommendations</Link>
                    <Link to="/saved">Saved Events</Link>
                    <Link to="/profile">Profile</Link>
                  </>
                )}
                {user.role === 'admin' && (
                  <Link to="/events/create">Create Event</Link>
                )}
                <span className="nav-user">Welcome, {user.email}</span>
                <button onClick={handleLogout} className="btn-logout">
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
