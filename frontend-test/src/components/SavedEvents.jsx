import { useState, useEffect } from 'react';
import { eventsAPI, savedEventsAPI } from '../services/api';
import './SavedEvents.css';

const SavedEvents = () => {
  const [savedEvents, setSavedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'calendar'
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadSavedEvents();
  }, []);

  const loadSavedEvents = async () => {
    try {
      setLoading(true);
      const [savedRes, eventsRes] = await Promise.all([
        savedEventsAPI.list(),
        eventsAPI.list()
      ]);
      
      const savedEventIds = new Set(savedRes.data.saved_event_ids || []);
      const allEvents = eventsRes.data;
      
      // Filter events to only show saved ones
      const saved = allEvents.filter(event => savedEventIds.has(event.id));
      setSavedEvents(saved);
    } catch (err) {
      setError('Failed to load saved events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (eventId) => {
    try {
      await savedEventsAPI.unsave(eventId);
      // Update local state
      setSavedEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (err) {
      console.error('Failed to unsave event', err);
      alert('Failed to unsave event. Please try again.');
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

  const formatDateShort = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return savedEvents.filter(event => {
      const eventDate = new Date(event.start_datetime).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  if (loading) {
    return (
      <div className="loading">
        <span>Loading saved events...</span>
      </div>
    );
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="saved-events">
      <h1>My Saved Events</h1>
      {savedEvents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📌</div>
          <h2>No saved events yet</h2>
          <p>Start saving events you're interested in to see them here!</p>
          <a href="/" className="btn-link">Browse Events</a>
        </div>
      ) : (
        <>
          <div className="view-controls">
            <p className="saved-count">{savedEvents.length} {savedEvents.length === 1 ? 'event' : 'events'} saved</p>
            <div className="view-toggle">
              <button
                onClick={() => setViewMode('grid')}
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              >
                📋 Grid
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`view-btn ${viewMode === 'calendar' ? 'active' : ''}`}
              >
                📅 Calendar
              </button>
            </div>
          </div>
          
          {viewMode === 'grid' ? (
            <div className="events-grid">
            {savedEvents.map((event) => (
              <div key={event.id} className="event-card">
                <div className="event-header">
                  <h2>{event.title}</h2>
                  <button
                    onClick={() => handleUnsave(event.id)}
                    className="btn-unsave"
                    title="Remove from saved"
                  >
                    ✕
                  </button>
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
          ) : (
            <div className="calendar-view">
              <div className="calendar-header">
                <button onClick={() => navigateMonth(-1)} className="calendar-nav-btn">‹</button>
                <h2 className="calendar-month">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <button onClick={() => navigateMonth(1)} className="calendar-nav-btn">›</button>
                <button onClick={goToToday} className="calendar-today-btn">Today</button>
              </div>
              
              <div className="calendar-weekdays">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="calendar-weekday">{day}</div>
                ))}
              </div>
              
              <div className="calendar-grid">
                {getCalendarDays().map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="calendar-day empty"></div>;
                  }
                  
                  const dayEvents = getEventsForDate(date);
                  const isToday = date.toDateString() === new Date().toDateString();
                  
                  const truncateText = (text, maxLength) => {
                    if (text.length <= maxLength) return text;
                    return text.substring(0, maxLength - 3) + '...';
                  };
                  
                  return (
                    <div
                      key={date.toISOString()}
                      className={`calendar-day ${isToday ? 'today' : ''} ${dayEvents.length > 0 ? 'has-events' : ''}`}
                    >
                      <div className="calendar-day-number">{date.getDate()}</div>
                      {dayEvents.length > 0 && (
                        <div className="calendar-events">
                          {dayEvents.slice(0, 2).map(event => (
                            <div key={event.id} className="calendar-event-name" title={event.title}>
                              {truncateText(event.title, 15)}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="calendar-event-more">+{dayEvents.length - 2} more</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="calendar-events-list">
                {savedEvents
                  .filter(event => {
                    const eventDate = new Date(event.start_datetime);
                    return eventDate.getMonth() === currentMonth.getMonth() &&
                           eventDate.getFullYear() === currentMonth.getFullYear();
                  })
                  .sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime))
                  .map(event => (
                    <div key={event.id} className="calendar-event-item">
                      <div className="calendar-event-date">
                        {formatDateShort(event.start_datetime)}
                      </div>
                      <div className="calendar-event-content">
                        <h3>{event.title}</h3>
                        <p>{event.location}</p>
                        <div className="calendar-event-time">
                          {new Date(event.start_datetime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - {new Date(event.end_datetime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <button
                        onClick={() => handleUnsave(event.id)}
                        className="btn-unsave-small"
                        title="Remove from saved"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SavedEvents;
