'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Minus, Calendar, MapPin, Trophy, Radio, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { io, Socket } from 'socket.io-client';
import { use } from 'react';

interface Event {
  _id: string;
  eventName: string;
  sport: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  eventTime: string;
  location: string;
  status: 'Canlı' | 'Bitti' | 'Planlandı';
}

export default function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [, setSocket] = useState<Socket | null>(null);

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        const res = await fetch(`${apiUrl}/api/events/${resolvedParams.id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch event');
        }
        const data = await res.json();
        setEvent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [resolvedParams.id]);

  // Socket.IO connection for real-time updates
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    const newSocket = io(apiUrl);
    setSocket(newSocket);

    newSocket.on('scoreUpdated', (updatedEvent: Event) => {
      if (updatedEvent._id === resolvedParams.id) {
        setEvent(updatedEvent);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [resolvedParams.id]);

  // Admin functions to update event
  const updateScore = async (team: 'A' | 'B', delta: number) => {
    if (!event || updating) return;
    
    setUpdating(true);
    const newScore = team === 'A' 
      ? Math.max(0, event.scoreA + delta)
      : Math.max(0, event.scoreB + delta);

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const res = await fetch(`${apiUrl}/api/events/${event._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          [team === 'A' ? 'scoreA' : 'scoreB']: newScore
        })
      });

      if (!res.ok) {
        throw new Error('Failed to update score');
      }
    } catch (err) {
      console.error('Error updating score:', err);
    } finally {
      setUpdating(false);
    }
  };

  const updateStatus = async (newStatus: 'Canlı' | 'Bitti' | 'Planlandı') => {
    if (!event || updating) return;
    
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const res = await fetch(`${apiUrl}/api/events/${event._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        throw new Error('Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Canlı':
        return <Radio className="w-4 h-4 animate-pulse" />;
      case 'Bitti':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Canlı':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Bitti':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-dark-bg pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href="/"
            className="inline-flex items-center text-primary hover:text-primary-hover transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Events
          </Link>
          <div className="bg-surface rounded-xl border border-red-500/20 p-8 text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-2">Error</h1>
            <p className="text-text-muted">{error || 'Event not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.eventTime);

  return (
    <div className="min-h-screen bg-dark-bg pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/"
          className="inline-flex items-center text-primary hover:text-primary-hover transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Events
        </Link>

        {/* Event Header */}
        <div className="bg-surface rounded-xl border border-primary/20 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-display font-bold text-text-main uppercase tracking-wider">
              {event.eventName}
            </h1>
            <span className={`px-3 py-1.5 rounded-full text-sm font-medium border flex items-center gap-2 ${getStatusColor(event.status)}`}>
              {getStatusIcon(event.status)}
              {event.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-text-muted">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              <span className="font-medium">Sport:</span> {event.sport}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="font-medium">Location:</span> {event.location}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="font-medium">Time:</span> {eventDate.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Scoreboard */}
        <div className="bg-surface rounded-xl border border-primary/20 p-8 mb-8">
          <h2 className="text-2xl font-display font-bold text-primary text-center mb-8 uppercase tracking-wider">
            Live Scoreboard
          </h2>
          
          <div className="grid grid-cols-3 items-center gap-4">
            {/* Team A */}
            <div className="text-center">
              <h3 className="text-xl font-semibold text-text-main mb-4">{event.teamA}</h3>
              <div className="text-6xl font-display font-bold text-primary">
                {event.scoreA}
              </div>
            </div>

            {/* VS Divider */}
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-text-muted uppercase">
                VS
              </div>
            </div>

            {/* Team B */}
            <div className="text-center">
              <h3 className="text-xl font-semibold text-text-main mb-4">{event.teamB}</h3>
              <div className="text-6xl font-display font-bold text-primary">
                {event.scoreB}
              </div>
            </div>
          </div>

          {/* Winner Display (if game is finished) */}
          {event.status === 'Bitti' && (
            <div className="mt-8 text-center">
              <div className="inline-block bg-primary/20 border border-primary/30 rounded-lg px-6 py-3">
                <p className="text-lg font-semibold text-primary">
                  🏆 Winner: {event.scoreA > event.scoreB ? event.teamA : event.scoreB > event.scoreA ? event.teamB : 'Draw'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Admin Control Panel */}
        {user?.role === 'admin' && (
          <div className="bg-surface rounded-xl border border-yellow-500/20 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold text-yellow-400 uppercase tracking-wider">
                Admin Control Panel
              </h2>
              {updating && (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400"></div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Score Controls */}
              <div>
                <h3 className="text-lg font-semibold text-text-main mb-4">Score Controls</h3>
                
                <div className="space-y-4">
                  {/* Team A Controls */}
                  <div className="flex items-center justify-between bg-dark-bg rounded-lg p-4">
                    <span className="font-medium text-text-main">{event.teamA}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateScore('A', -1)}
                        disabled={updating || event.scoreA === 0}
                        className="bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-md transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-2xl font-bold text-primary w-12 text-center">
                        {event.scoreA}
                      </span>
                      <button
                        onClick={() => updateScore('A', 1)}
                        disabled={updating}
                        className="bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-md transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Team B Controls */}
                  <div className="flex items-center justify-between bg-dark-bg rounded-lg p-4">
                    <span className="font-medium text-text-main">{event.teamB}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateScore('B', -1)}
                        disabled={updating || event.scoreB === 0}
                        className="bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-md transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-2xl font-bold text-primary w-12 text-center">
                        {event.scoreB}
                      </span>
                      <button
                        onClick={() => updateScore('B', 1)}
                        disabled={updating}
                        className="bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-md transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Controls */}
              <div>
                <h3 className="text-lg font-semibold text-text-main mb-4">Status Control</h3>
                
                <div className="bg-dark-bg rounded-lg p-4">
                  <p className="text-sm text-text-muted mb-3">Current Status: <span className="font-semibold text-primary">{event.status}</span></p>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => updateStatus('Planlandı')}
                      disabled={updating || event.status === 'Planlandı'}
                      className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      Set as Planned
                    </button>
                    <button
                      onClick={() => updateStatus('Canlı')}
                      disabled={updating || event.status === 'Canlı'}
                      className="bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2"
                    >
                      <Radio className="w-4 h-4" />
                      Set as Live
                    </button>
                    <button
                      onClick={() => updateStatus('Bitti')}
                      disabled={updating || event.status === 'Bitti'}
                      className="bg-gray-500 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Set as Finished
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-sm text-yellow-400">
                <strong>Admin Note:</strong> Changes made here will be broadcast in real-time to all users viewing this event.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
