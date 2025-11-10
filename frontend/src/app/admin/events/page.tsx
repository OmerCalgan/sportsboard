'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Trash2, Edit, Plus, X, Check } from 'lucide-react';

interface Event {
  _id?: string;
  sport: string;
  eventName: string;
  location: string;
  eventTime: string;
  teamA: string;
  teamB: string;
  scoreA?: number;
  scoreB?: number;
  status?: string;
}

export default function EventsManagementPage() {
  const { token } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState<Event>({
    sport: '',
    eventName: '',
    location: '',
    eventTime: '',
    teamA: '',
    teamB: '',
    scoreA: 0,
    scoreB: 0,
    status: 'Planlandı',
  });

  // Fetch all events
  const fetchEvents = async () => {
    try {
      const response = await axios.get('/events', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(response.data);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'scoreA' || name === 'scoreB' ? parseInt(value) || 0 : value,
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      sport: '',
      eventName: '',
      location: '',
      eventTime: '',
      teamA: '',
      teamB: '',
      scoreA: 0,
      scoreB: 0,
      status: 'Planlandı',
    });
    setEditingEvent(null);
    setShowForm(false);
    setError('');
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      if (editingEvent) {
        // Update existing event
        await axios.patch(
          `/events/${editingEvent._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccessMessage('Event updated successfully!');
      } else {
        // Create new event
        await axios.post(
          '/events',
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccessMessage('Event created successfully!');
      }
      
      resetForm();
      fetchEvents();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to save event');
      } else {
        setError('Failed to save event');
      }
    }
  };

  // Handle edit
  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      sport: event.sport,
      eventName: event.eventName,
      location: event.location,
      eventTime: event.eventTime.split('.')[0], // Format for datetime-local input
      teamA: event.teamA,
      teamB: event.teamB,
      scoreA: event.scoreA || 0,
      scoreB: event.scoreB || 0,
      status: event.status || 'Planlandı',
    });
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      await axios.delete(`/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccessMessage('Event deleted successfully!');
      fetchEvents();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch {
      setError('Failed to delete event');
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planlandı': return 'text-yellow-400';
      case 'Canlı': return 'text-green-400';
      case 'Bitti': return 'text-gray-400';
      default: return 'text-text-muted';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-900/20 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg flex items-center">
          <Check className="w-5 h-5 mr-2" />
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Add Event Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-text-main">Events Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center px-4 py-2 bg-primary text-dark-bg font-bold rounded-lg hover:bg-primary-hover transition-colors"
        >
          {showForm ? (
            <>
              <X className="w-5 h-5 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-5 h-5 mr-2" />
              Add Event
            </>
          )}
        </button>
      </div>

      {/* Event Form */}
      {showForm && (
        <div className="bg-surface rounded-xl p-6 border border-primary/20">
          <h3 className="text-xl font-semibold text-text-main mb-4">
            {editingEvent ? 'Edit Event' : 'Create New Event'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  Sport
                </label>
                <input
                  type="text"
                  name="sport"
                  value={formData.sport}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-dark-bg border border-primary/30 rounded-md text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Football, Basketball"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  Event Name
                </label>
                <input
                  type="text"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-dark-bg border border-primary/30 rounded-md text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Championship Final"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-dark-bg border border-primary/30 rounded-md text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Stadium Name, City"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  Event Time
                </label>
                <input
                  type="datetime-local"
                  name="eventTime"
                  value={formData.eventTime}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-dark-bg border border-primary/30 rounded-md text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  Team A
                </label>
                <input
                  type="text"
                  name="teamA"
                  value={formData.teamA}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-dark-bg border border-primary/30 rounded-md text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Team/Player A"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  Team B
                </label>
                <input
                  type="text"
                  name="teamB"
                  value={formData.teamB}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-dark-bg border border-primary/30 rounded-md text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Team/Player B"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  Score A
                </label>
                <input
                  type="number"
                  name="scoreA"
                  value={formData.scoreA}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 bg-dark-bg border border-primary/30 rounded-md text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  Score B
                </label>
                <input
                  type="number"
                  name="scoreB"
                  value={formData.scoreB}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 bg-dark-bg border border-primary/30 rounded-md text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-dark-bg border border-primary/30 rounded-md text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Planlandı">Planlandı (Scheduled)</option>
                  <option value="Canlı">Canlı (Live)</option>
                  <option value="Bitti">Bitti (Finished)</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-primary/30 text-text-main rounded-lg hover:bg-surface transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-dark-bg font-bold rounded-lg hover:bg-primary-hover transition-colors"
              >
                {editingEvent ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events Table */}
      <div className="bg-surface rounded-xl overflow-hidden border border-primary/20">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-bg">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                  Sport
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                  Teams
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/10">
              {events.length === 0 ? (
                <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-text-muted">
                  No events found. Click &quot;Add Event&quot; to create one.
                </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event._id} className="hover:bg-dark-bg/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-main">
                      {event.sport}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-main">
                      <div>
                        <div className="font-medium">{event.eventName}</div>
                        <div className="text-text-muted text-xs">{event.location}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-main">
                      <div>
                        <div>{event.teamA}</div>
                        <div className="text-text-muted">vs</div>
                        <div>{event.teamB}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-main">
                      {event.scoreA} - {event.scoreB}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                      {formatDate(event.eventTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getStatusColor(event.status || '')}`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(event)}
                          className="text-primary hover:text-primary-hover transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(event._id!)}
                          className="text-red-400 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
