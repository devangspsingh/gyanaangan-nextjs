import React, { Suspense } from 'react';
import EventListingClient from '@/components/event/EventListingClient';

export const metadata = {
  title: 'Events | Gyan Aangan',
  description: 'Discover and register for workshops, seminars, competitions, and more events hosted by various organizations.',
};

const EventsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Suspense fallback={<div className="container mx-auto py-12 text-center text-gray-400">Loading events...</div>}>
        <EventListingClient />
      </Suspense>
    </div>
  );
};

export default EventsPage;