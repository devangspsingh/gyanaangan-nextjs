import React from 'react';
import EventCreateForm from '@/components/event/EventCreateForm';

export const metadata = {
  title: 'Create Event | Gyan Aangan',
  description: 'Create a new event for your organization',
};

const EventCreatePage = () => {
  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Create New Event</h1>
            <p className="text-muted-foreground mt-2">
              Fill in the details below to create an event for your organization
            </p>
          </div>
          <EventCreateForm />
        </div>
      </div>
    </div>
  );
};

export default EventCreatePage;
