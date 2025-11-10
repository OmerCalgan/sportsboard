'use client';

import React from 'react';

export default function EventCardSkeleton() {
  return (
    <div className="bg-surface rounded-xl border border-primary/20 overflow-hidden animate-pulse">
      {/* Header */}
      <div className="bg-dark-bg/50 px-6 py-3 flex justify-between items-center border-b border-primary/10">
        <div className="h-4 w-24 bg-dark-bg rounded"></div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-dark-bg rounded-full"></div>
          <div className="h-3 w-16 bg-dark-bg rounded"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-4">
        {/* Event Name */}
        <div className="h-6 w-3/4 bg-dark-bg rounded"></div>

        {/* Teams and Score */}
        <div className="bg-dark-bg/30 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <div className="h-5 w-32 bg-dark-bg rounded"></div>
            <div className="h-8 w-12 bg-dark-bg rounded"></div>
          </div>
          <div className="flex justify-center">
            <div className="h-px w-full bg-primary/10"></div>
          </div>
          <div className="flex justify-between items-center">
            <div className="h-5 w-32 bg-dark-bg rounded"></div>
            <div className="h-8 w-12 bg-dark-bg rounded"></div>
          </div>
        </div>

        {/* Event Details */}
        <div className="space-y-2 pt-2">
          <div className="h-4 w-48 bg-dark-bg rounded"></div>
          <div className="h-4 w-40 bg-dark-bg rounded"></div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-primary/5 px-6 py-2">
        <div className="h-3 w-32 bg-dark-bg rounded mx-auto"></div>
      </div>
    </div>
  );
}
