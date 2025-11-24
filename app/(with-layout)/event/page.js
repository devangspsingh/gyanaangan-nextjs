import React from 'react';
import EventListingClient from '@/components/event/EventListingClient';

export const metadata = {
  title: 'Events | Gyan Aangan',
  description: 'Discover and register for workshops, seminars, competitions, and more events hosted by various organizations.',
};

const EventsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <EventListingClient />
    </div>
  );
};

export default EventsPage;