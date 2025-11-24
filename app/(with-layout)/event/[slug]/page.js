import React from 'react';
import EventDetailClient from '@/components/event/EventDetailClient';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return {
    title: `${slug} | Gyan Aangan`,
    description: 'View event details and register',
  };
}

const EventDetailPage = async ({ params }) => {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      <EventDetailClient slug={slug} />
    </div>
  );
};

export default EventDetailPage;
