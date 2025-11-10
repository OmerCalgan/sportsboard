'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Trophy, Users, Clock } from 'lucide-react';

interface EventCardProps {
  event: {
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
  };
}

export default function EventCard({ event }: EventCardProps) {
  // Format date and time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  const { date, time } = formatDateTime(event.eventTime);

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Canlı':
        return (
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
              <div className="relative w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-green-400 font-semibold uppercase text-xs tracking-wider">
              LIVE
            </span>
          </div>
        );
      case 'Bitti':
        return (
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span className="text-gray-400 font-semibold uppercase text-xs tracking-wider">
              FINISHED
            </span>
          </div>
        );
      case 'Planlandı':
        return (
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-yellow-400 font-semibold uppercase text-xs tracking-wider">
              SCHEDULED
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  // Determine winner for finished games
  const getWinner = () => {
    if (event.status !== 'Bitti') return null;
    if (event.scoreA > event.scoreB) return 'teamA';
    if (event.scoreB > event.scoreA) return 'teamB';
    return 'draw';
  };

  const winner = getWinner();

  return (
    <Link href={`/events/${event._id}`} className="block group">
      <div className="bg-surface rounded-xl border border-primary/20 hover:border-primary/40 transition-all duration-300 overflow-hidden hover:shadow-lg hover:shadow-primary/10 transform hover:-translate-y-1">
        {/* Header with Sport and Status */}
        <div className="bg-dark-bg/50 px-6 py-3 flex justify-between items-center border-b border-primary/10">
          <div className="flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              {event.sport}
            </span>
          </div>
          {getStatusBadge(event.status)}
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-4">
          {/* Event Name */}
          <h3 className="text-xl font-display font-bold text-text-main group-hover:text-primary transition-colors">
            {event.eventName}
          </h3>

          {/* Teams and Score */}
          <div className="bg-dark-bg/30 rounded-lg p-4 space-y-3">
            {/* Team A */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-text-muted" />
                <span 
                  className={`font-medium ${
                    winner === 'teamA' ? 'text-primary' : 'text-text-main'
                  }`}
                >
                  {event.teamA}
                </span>
              </div>
              <span 
                className={`text-2xl font-bold ${
                  winner === 'teamA' ? 'text-primary' : 
                  event.status === 'Canlı' ? 'text-green-400' : 
                  'text-text-main'
                }`}
              >
                {event.scoreA}
              </span>
            </div>

            {/* VS Divider */}
            <div className="flex items-center justify-center">
              <div className="flex-1 h-px bg-primary/20"></div>
              <span className="px-3 text-xs text-text-muted uppercase tracking-wider">VS</span>
              <div className="flex-1 h-px bg-primary/20"></div>
            </div>

            {/* Team B */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-text-muted" />
                <span 
                  className={`font-medium ${
                    winner === 'teamB' ? 'text-primary' : 'text-text-main'
                  }`}
                >
                  {event.teamB}
                </span>
              </div>
              <span 
                className={`text-2xl font-bold ${
                  winner === 'teamB' ? 'text-primary' : 
                  event.status === 'Canlı' ? 'text-green-400' : 
                  'text-text-main'
                }`}
              >
                {event.scoreB}
              </span>
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-2 pt-2">
            {/* Location */}
            <div className="flex items-center space-x-2 text-sm text-text-muted">
              <MapPin className="w-4 h-4" />
              <span>{event.location}</span>
            </div>

            {/* Date and Time */}
            <div className="flex items-center space-x-2 text-sm text-text-muted">
              <Calendar className="w-4 h-4" />
              <span>{date}</span>
              <Clock className="w-4 h-4 ml-2" />
              <span>{time}</span>
            </div>
          </div>

          {/* Draw indicator */}
          {winner === 'draw' && event.status === 'Bitti' && (
            <div className="text-center text-sm text-yellow-400 font-medium pt-2">
              Match ended in a draw
            </div>
          )}
        </div>

        {/* Hover Action Hint */}
        <div className="bg-primary/5 px-6 py-2 text-center">
          <span className="text-xs text-text-muted group-hover:text-primary transition-colors">
            Click to view details →
          </span>
        </div>
      </div>
    </Link>
  );
}
