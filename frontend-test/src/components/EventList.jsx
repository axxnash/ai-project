import { useState, useEffect } from 'react';
import { eventsAPI, savedEventsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './EventList.css';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [savedEventIds, setSavedEventIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsRes, savedRes] = await Promise.all([
        eventsAPI.list(),
        user?.role === 'student' ? savedEventsAPI.list() : Promise.resolve({ data: { saved_event_ids: [] } })
      ]);
      setEvents(eventsRes.data);
      setSavedEventIds(new Set(savedRes.data.saved_event_ids || []));
    } catch (err) {
      setError('Failed to load events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (eventId) => {
    if (user?.role !== 'student') return;
    try {
      await savedEventsAPI.save(eventId);
      setSavedEventIds(new Set([...savedEventIds, eventId]));
    } catch (err) {
      console.error('Failed to save event', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <span>Loading events...</span>
      </div>
    );
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="event-list">
      <h1>All Events</h1>
      {events.length === 0 ? (
        <div className="empty-state">No events available</div>
      ) : (
        <div className="events-grid">
          {events.map((event) => (
            <div key={event.id} className="event-card">
              <div className="event-header">
                <h2>{event.title}</h2>
                {user?.role === 'student' && (
                  <button
                    onClick={() => handleSave(event.id)}
                    className={`btn-save ${savedEventIds.has(event.id) ? 'saved' : ''}`}
                    disabled={savedEventIds.has(event.id)}
                  >
                    {savedEventIds.has(event.id) ? '✓ Saved' : 'Save'}
                  </button>
                )}
              </div>
              <p className="event-description">{event.description}</p>
              {event.ai_keywords && (
                <div className="ai-tags">
                  {event.ai_keywords.split(',').filter(k => k.trim()).map((keyword, idx) => (
                    <span key={idx} className="ai-tag">
                      {keyword.trim()}
                    </span>
                  ))}
                </div>
              )}
              <div className="event-details">
                <div className="detail-item">
                  <strong>📍 Location:</strong> {event.location}
                </div>
                <div className="detail-item">
                  <strong>🕐 Start:</strong> {formatDate(event.start_datetime)}
                </div>
                <div className="detail-item">
                  <strong>🕑 End:</strong> {formatDate(event.end_datetime)}
                </div>
                {event.ai_event_type && (
                  <div className="detail-item">
                    <strong>📋 Type:</strong> {event.ai_event_type}
                  </div>
                )}
                {event.ai_summary && (
                  <div className="detail-item">
                    <strong>📝 Summary:</strong> {event.ai_summary}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;
