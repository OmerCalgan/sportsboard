'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import axios from 'axios';
import { Trophy, Radio, Users, AlertCircle, Calendar } from 'lucide-react';
import EventCard from '@/components/EventCard';
import EventCardSkeleton from '@/components/EventCardSkeleton';
import { io, Socket } from 'socket.io-client';

interface Event {
  _id: string;
  sport: string;
  eventName: string;
  location: string;
  eventTime: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  status: string;
}

export default function Home() {
  const { user, loading: authLoading, token } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [, setSocket] = useState<Socket | null>(null);

  // Fetch events when user is authenticated
  useEffect(() => {
    const fetchEvents = async () => {
      if (!user || !token) return;
      
      setEventsLoading(true);
      setEventsError(null);
      
      try {
        const response = await axios.get('/events', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
        setEventsError('Failed to load events. Please try again later.');
      } finally {
        setEventsLoading(false);
      }
    };

    fetchEvents();
  }, [user, token]);

  // Setup Socket.IO connection for real-time updates
  useEffect(() => {
    if (!user || !token) return;

    // Connect to the Socket.IO server
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001', {
      withCredentials: true,
    });

    // Store socket instance
    setSocket(newSocket);

    // Listen for score update events
    newSocket.on('scoreUpdated', (updatedEvent: Event) => {
      console.log('Received score update:', updatedEvent);
      
      // Update the event in the local state
      setEvents((prevEvents) => 
        prevEvents.map((event) => 
          event._id === updatedEvent._id 
            ? { ...event, scoreA: updatedEvent.scoreA, scoreB: updatedEvent.scoreB, status: updatedEvent.status }
            : event
        )
      );
    });

    // Connection event handlers for debugging
    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    // Cleanup function to disconnect socket when component unmounts
    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [user, token]);

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-display font-bold text-text-main mb-4 uppercase tracking-wider">
            Welcome to SportsBoard
          </h1>
          <p className="text-xl text-text-muted">
            Your ultimate sports event management platform
          </p>
        </div>

        {/* Main Content Area */}
        {authLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : user ? (
          <>
            {/* Events Section for Logged-in Users */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-display font-bold text-text-main uppercase tracking-wider">
                    Live & Upcoming Events
                  </h2>
                  <p className="text-text-muted mt-2">
                    Stay updated with all the latest sports action
                  </p>
                </div>
                {user.role === 'admin' && (
                  <Link
                    href="/admin/events"
                    className="bg-primary text-dark-bg font-bold px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2"
                  >
                    <Calendar className="w-5 h-5" />
                    Manage Events
                  </Link>
                )}
              </div>

              {/* Events Loading State */}
              {eventsLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, index) => (
                    <EventCardSkeleton key={index} />
                  ))}
                </div>
              )}

              {/* Events Error State */}
              {eventsError && !eventsLoading && (
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 text-center">
                  <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-red-400 mb-2">Error Loading Events</h3>
                  <p className="text-text-muted">{eventsError}</p>
                </div>
              )}

              {/* Events Empty State */}
              {!eventsLoading && !eventsError && events.length === 0 && (
                <div className="bg-surface rounded-xl border border-primary/20 p-12 text-center">
                  <Trophy className="w-16 h-16 text-primary/50 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-text-main mb-2">
                    No Events Scheduled Yet
                  </h3>
                  <p className="text-text-muted max-w-md mx-auto">
                    No events have been scheduled yet. Check back later for upcoming sports events!
                  </p>
                  {user.role === 'admin' && (
                    <Link
                      href="/admin/events"
                      className="inline-block mt-6 bg-primary text-dark-bg font-bold px-6 py-3 rounded-lg hover:bg-primary-hover transition-colors"
                    >
                      Create First Event
                    </Link>
                  )}
                </div>
              )}

              {/* Events Grid */}
              {!eventsLoading && !eventsError && events.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <EventCard key={event._id} event={event} />
                  ))}
                </div>
              )}
            </div>

            {/* User Info Card */}
            <div className="bg-surface/50 rounded-lg p-6 mb-12 border border-primary/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-muted">Logged in as</p>
                  <p className="text-xl font-semibold text-text-main">{user.email}</p>
                  <p className="text-sm text-primary capitalize">Role: {user.role}</p>
                </div>
                <div className="text-right">
                  <p className="text-text-muted text-sm">Account Status</p>
                  <p className="text-primary font-semibold">Active</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Not Logged In - Show CTA */
          <div className="py-12">
            <div className="bg-surface rounded-lg shadow-2xl p-8 max-w-md mx-auto border border-primary/20">
              <h2 className="text-2xl font-semibold text-text-main mb-4">
                Get Started Today
              </h2>
              <p className="text-text-muted mb-6">
                Join SportsBoard to manage your sports events, track scores, and connect with teams.
              </p>
              <div className="space-x-4">
                <Link
                  href="/register"
                  className="inline-block bg-primary text-dark-bg font-bold px-6 py-3 rounded-md hover:bg-primary-hover transition-all transform hover:scale-105"
                >
                  Sign Up Free
                </Link>
                <Link
                  href="/login"
                  className="inline-block bg-surface border border-primary text-primary px-6 py-3 rounded-md hover:bg-primary/10 transition-all"
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-display font-bold text-center text-text-main mb-8 uppercase tracking-wider">
            Platform Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-surface p-6 rounded-lg shadow-xl border border-primary/20 transition-transform hover:scale-105 hover:border-primary/40">
              <Trophy size={48} className="text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-text-main">Track Events</h3>
              <p className="text-text-muted">
                Keep track of all your sports events in one place with real-time updates.
              </p>
            </div>
            <div className="bg-surface p-6 rounded-lg shadow-xl border border-primary/20 transition-transform hover:scale-105 hover:border-primary/40">
              <Radio size={48} className="text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-text-main">Live Scores</h3>
              <p className="text-text-muted">
                Get instant updates on scores and match statistics as they happen.
              </p>
            </div>
            <div className="bg-surface p-6 rounded-lg shadow-xl border border-primary/20 transition-transform hover:scale-105 hover:border-primary/40">
              <Users size={48} className="text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-text-main">Team Management</h3>
              <p className="text-text-muted">
                Organize teams, manage rosters, and coordinate with players effortlessly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
