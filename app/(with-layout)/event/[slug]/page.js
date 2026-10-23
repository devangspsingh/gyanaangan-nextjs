import React from 'react';
import { notFound } from 'next/navigation';
import EventDetailClient from '@/components/event/EventDetailClient';
import { getEventBySlug } from '@/services/eventService';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { data, error } = await getEventBySlug(slug);

  if (error || !data) {
    notFound();
  }

  return {
    title: `${data.title || slug} | Gyan Aangan`,
    description: data.description || 'View event details and register',
    openGraph: {
      title: data.title || slug,
      description: data.description || 'View event details and register',
      images: data.cover_image ? [data.cover_image] : [],
    },
  };
}

const EventDetailPage = async ({ params }) => {
  const { slug } = await params;
  const { data, error } = await getEventBySlug(slug);

  if (error || !data) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      <EventDetailClient slug={slug} initialData={data} />
    </div>
  );
};

export default EventDetailPage;
