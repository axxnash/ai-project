import { useState, useEffect } from 'react';
import { recommendationsAPI, savedEventsAPI } from '../services/api';
import './Recommendations.css';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [savedEventIds, setSavedEventIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recRes, savedRes] = await Promise.all([
        recommendationsAPI.get(),
        savedEventsAPI.list()
      ]);
      setRecommendations(recRes.data);
      setSavedEventIds(new Set(savedRes.data.saved_event_ids || []));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load recommendations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (eventId) => {
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

  const getScoreColor = (score) => {
    if (score >= 0.8) return '#28a745';
    if (score >= 0.6) return '#ffc107';
    return '#17a2b8';
  };

  if (loading) {
    return (
      <div className="loading">
        <span>Loading recommendations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recommendations">
        <div className="error">{error}</div>
        {error.includes('Create profile first') && (
          <a href="/profile" className="btn-link">Go to Profile</a>
        )}
      </div>
    );
  }

  return (
    <div className="recommendations">
      <h1>Personalized Recommendations</h1>
      {recommendations.length === 0 ? (
        <div className="empty-state">
          <p>No recommendations available. Make sure you've set up your profile with interests and availability.</p>
          <a href="/profile" className="btn-link">Set Up Profile</a>
        </div>
      ) : (
        <div className="recommendations-grid">
          {recommendations.map((rec) => {
            const event = rec.event;
            return (
              <div key={event.id} className="recommendation-card">
                <div className="recommendation-header">
                  <div className="score-badge" style={{ backgroundColor: getScoreColor(rec.score) }}>
                    Match: {(rec.score * 100).toFixed(0)}%
                  </div>
                  <button
                    onClick={() => handleSave(event.id)}
                    className={`btn-save ${savedEventIds.has(event.id) ? 'saved' : ''}`}
                    disabled={savedEventIds.has(event.id)}
                  >
                    {savedEventIds.has(event.id) ? '✓ Saved' : 'Save'}
                  </button>
                </div>
                <h2>{event.title}</h2>
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
                <div className="why-box">
                  <strong>💡 Why recommended:</strong> {rec.why}
                </div>
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
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Recommendations;
