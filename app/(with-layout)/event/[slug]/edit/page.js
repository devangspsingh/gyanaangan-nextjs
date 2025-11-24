import React from 'react';
import EventEditForm from '@/components/event/EventEditForm';

export const metadata = {
  title: 'Edit Event | Gyan Aangan',
  description: 'Edit your event details',
};

const EventEditPage = async ({ params }) => {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Edit Event</h1>
            <p className="text-muted-foreground mt-2">
              Update the details of your event
            </p>
          </div>
          <EventEditForm slug={slug} />
        </div>
      </div>
    </div>
  );
};

export default EventEditPage;
