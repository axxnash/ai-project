import { useState, useEffect } from 'react';
import { profileAPI } from '../services/api';
import './Profile.css';

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState({
    interests: [''],
    availability: [{ day: 'Mon', start: '09:00', end: '17:00' }],
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await profileAPI.get();
      if (response.data.exists) {
        setProfile({
          interests: response.data.interests.length > 0 
            ? response.data.interests 
            : [''],
          availability: response.data.availability.length > 0
            ? response.data.availability
            : [{ day: 'Mon', start: '09:00', end: '17:00' }],
        });
      }
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInterestChange = (index, value) => {
    const newInterests = [...profile.interests];
    newInterests[index] = value;
    setProfile({ ...profile, interests: newInterests });
  };

  const addInterest = () => {
    setProfile({
      ...profile,
      interests: [...profile.interests, ''],
    });
  };

  const removeInterest = (index) => {
    if (profile.interests.length > 1) {
      const newInterests = profile.interests.filter((_, i) => i !== index);
      setProfile({ ...profile, interests: newInterests });
    }
  };

  const handleSlotChange = (day, slotIndex, field, value) => {
    const newAvailability = [...profile.availability];
    let foundIndex = 0;
    for (let i = 0; i < newAvailability.length; i++) {
      if (newAvailability[i].day === day) {
        if (foundIndex === slotIndex) {
          newAvailability[i] = { ...newAvailability[i], [field]: value };
          break;
        }
        foundIndex++;
      }
    }
    setProfile({ ...profile, availability: newAvailability });
  };

  const addSlot = (day) => {
    setProfile({
      ...profile,
      availability: [...profile.availability, { day, start: '09:00', end: '17:00' }],
    });
  };

  const removeSlot = (day, slotIndex) => {
    const newAvailability = [...profile.availability];
    const daySlots = newAvailability.filter(s => s.day === day);
    if (daySlots.length > 1) {
      let foundIndex = 0;
      const filtered = newAvailability.filter((s) => {
        if (s.day === day) {
          if (foundIndex === slotIndex) {
            foundIndex++;
            return false;
          }
          foundIndex++;
        }
        return true;
      });
      setProfile({ ...profile, availability: filtered });
    }
  };

  const getSlotsForDay = (day) => {
    return profile.availability.filter(s => s.day === day);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    const interests = profile.interests.filter(i => i.trim());
    if (interests.length === 0) {
      setError('At least one interest is required');
      setSaving(false);
      return;
    }

    try {
      await profileAPI.upsert({
        interests: interests,
        availability: profile.availability,
      });
      setSuccess('Profile saved successfully!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <span>Loading profile...</span>
      </div>
    );
  }

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="profile">
      <div className="form-card">
        <h1>Student Profile</h1>
        <p className="profile-description">
          Set your interests and availability to get personalized event recommendations.
        </p>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="section">
            <h2>Interests</h2>
            {profile.interests.map((interest, index) => (
              <div key={index} className="interest-row">
                <input
                  type="text"
                  value={interest}
                  onChange={(e) => handleInterestChange(index, e.target.value)}
                  placeholder="e.g., Technology, Sports, Music"
                  className="interest-input"
                />
                {profile.interests.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeInterest(index)}
                    className="btn-remove"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addInterest} className="btn-add">
              + Add Interest
            </button>
          </div>

          <div className="section">
            <h2>Availability</h2>
            <p className="section-hint">Set your available time slots for each day of the week</p>
            <div className="availability-grid">
              {days.map(day => {
                const daySlots = getSlotsForDay(day);
                return (
                  <div key={day} className="day-group">
                    <div className="day-header">
                      <span className="day-name">{day}</span>
                      <button
                        type="button"
                        onClick={() => addSlot(day)}
                        className="btn-add-slot"
                        title={`Add time slot for ${day}`}
                      >
                        +
                      </button>
                    </div>
                    {daySlots.length === 0 ? (
                      <div className="no-slots">
                        <span>No slots</span>
                        <button
                          type="button"
                          onClick={() => addSlot(day)}
                          className="btn-add-slot-small"
                        >
                          Add
                        </button>
                      </div>
                    ) : (
                      <div className="slots-list">
                        {daySlots.map((slot, slotIndex) => (
                          <div key={slotIndex} className="slot-item">
                            <div className="time-group">
                              <input
                                type="time"
                                value={slot.start}
                                onChange={(e) => handleSlotChange(day, slotIndex, 'start', e.target.value)}
                                className="time-input-small"
                              />
                              <span className="time-separator-small">→</span>
                              <input
                                type="time"
                                value={slot.end}
                                onChange={(e) => handleSlotChange(day, slotIndex, 'end', e.target.value)}
                                className="time-input-small"
                              />
                            </div>
                            {daySlots.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeSlot(day, slotIndex)}
                                className="btn-remove-slot"
                                title="Remove this slot"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
