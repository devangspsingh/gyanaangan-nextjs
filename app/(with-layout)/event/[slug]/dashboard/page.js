import EventDashboardClient from '@/components/event/EventDashboardClient';

export const metadata = {
    title: 'Event Dashboard | GyanAangan',
    description: 'Manage your event registrations and participants',
};

export default function EventDashboardPage({ params }) {
    return <EventDashboardClient slug={params.slug} />;
}
