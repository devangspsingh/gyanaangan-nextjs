'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
    Calendar,
    MapPin,
    Video,
    Clock,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Ticket,
    ArrowRight
} from 'lucide-react';
import eventService from '@/services/eventService';
import { useAuth } from '@/context/AuthContext';

import EventCard from './EventCard';

const MyRegistrationsClient = () => {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [registrations, setRegistrations] = useState([]);
    const [activeTab, setActiveTab] = useState('upcoming');

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push('/login?redirect=/event/my-registrations');
                return;
            }
            fetchRegistrations();
        }
    }, [authLoading, user, activeTab]);

    const fetchRegistrations = async () => {
        setLoading(true);
        try {
            let response;
            if (activeTab === 'upcoming') {
                response = await eventService.getMyUpcomingRegistrations();
            } else if (activeTab === 'past') {
                response = await eventService.getMyPastRegistrations();
            } else {
                response = await eventService.getMyRegistrations();
            }

            if (response.error) {
                toast.error('Failed to load registrations');
            } else {
                setRegistrations(response.data.results || response.data);
            }
        } catch (error) {
            console.error('Error fetching registrations:', error);
            toast.error('An error occurred while loading registrations');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'REGISTERED':
            case 'CONFIRMED':
                return <Badge className="bg-green-500">Confirmed</Badge>;
            case 'WAITLIST':
                return <Badge variant="secondary" className="bg-yellow-500 text-white">Waitlist</Badge>;
            case 'CANCELLED':
                return <Badge variant="destructive">Cancelled</Badge>;
            case 'PENDING':
                return <Badge variant="outline">Pending</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (authLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="space-y-4">
                    <Skeleton className="h-12 w-48" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">My Registrations</h1>
                <p className="text-muted-foreground">Manage your event registrations and tickets</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList>
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="past">Past</TabsTrigger>
                    <TabsTrigger value="all">All Registrations</TabsTrigger>
                </TabsList>

                <div className="min-h-[400px]">
                    {loading ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {[...Array(3)].map((_, i) => (
                                <Card key={i} className="overflow-hidden">
                                    <Skeleton className="h-40 w-full" />
                                    <CardHeader>
                                        <Skeleton className="h-6 w-3/4 mb-2" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </CardHeader>
                                    <CardContent>
                                        <Skeleton className="h-4 w-full mb-2" />
                                        <Skeleton className="h-4 w-full" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : registrations.length === 0 ? (
                        <div className="text-center py-12 border rounded-lg bg-muted/10">
                            <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No registrations found</h3>
                            <p className="text-muted-foreground mb-4">
                                {activeTab === 'upcoming'
                                    ? "You don't have any upcoming events."
                                    : activeTab === 'past'
                                        ? "You haven't attended any events yet."
                                        : "You haven't registered for any events yet."}
                            </p>
                            <Button asChild>
                                <Link href="/event">Browse Events</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {registrations.map((reg) => (
                                <EventCard
                                    key={reg.id}
                                    event={reg.event_details}
                                    showRegistrationStatus={true}
                                    registrationStatus={reg.status}
                                    registrationNumber={reg.registration_number}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </Tabs>
        </div>
    );
};

export default MyRegistrationsClient;
