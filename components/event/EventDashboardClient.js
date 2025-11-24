'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
    Users,
    Calendar,
    Settings,
    UserPlus,
    Trash2,
    Edit,
    BarChart3,
    Eye,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Clock,
    Download,
    Search
} from 'lucide-react';
import eventService from '@/services/eventService';

import { useAuth } from '@/context/AuthContext';

const EventDashboardClient = ({ slug }) => {
    const router = useRouter();
    const { loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [event, setEvent] = useState(null);
    const [stats, setStats] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [manualParticipants, setManualParticipants] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');

    // Manual Participant Dialog State
    const [addParticipantOpen, setAddParticipantOpen] = useState(false);
    const [newParticipantData, setNewParticipantData] = useState({
        full_name: '',
        email: '',
        phone_number: '',
        college_name: '',
        registration_number: ''
    });
    const [addingParticipant, setAddingParticipant] = useState(false);

    useEffect(() => {

        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // Fetch event details
                const eventResponse = await eventService.getEventBySlug(slug);
                if (eventResponse.error) {
                    toast.error(eventResponse.message || 'Failed to load event');
                    router.push('/event');
                    return;
                }

                // Check permissions (must be admin of the organization)
                if (!eventResponse.data.organization_details.user_is_admin) {
                    toast.error('Access Denied', {
                        description: 'You do not have permission to access this dashboard.'
                    });
                    router.push(`/event/${slug}`);
                    return;
                }

                setEvent(eventResponse.data);

                // Fetch dashboard stats
                const statsResponse = await eventService.getEventDashboard(slug);
                if (!statsResponse.error) {
                    setStats(statsResponse.data);
                }

                // Fetch registrations
                const registrationsResponse = await eventService.getEventRegistrations(slug);
                if (!registrationsResponse.error) {
                    setRegistrations(registrationsResponse.data.results || registrationsResponse.data);
                }

                // Fetch manual participants
                const manualParticipantsResponse = await eventService.getManualParticipants(slug);
                if (!manualParticipantsResponse.error) {
                    setManualParticipants(manualParticipantsResponse.data.results || manualParticipantsResponse.data);
                }

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        if (!authLoading) {
            fetchDashboardData();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug, authLoading]);

    const handleAttendance = async (registrationId, status) => {
        try {
            const response = await eventService.markAttendance(slug, [registrationId], status);
            if (response.error) {
                toast.error(response.message || 'Failed to update attendance');
            } else {
                toast.success(`Attendance marked as ${status}`);
                // Refresh registrations
                const registrationsResponse = await eventService.getEventRegistrations(slug);
                if (!registrationsResponse.error) {
                    setRegistrations(registrationsResponse.data.results || registrationsResponse.data);
                }
            }
        } catch (error) {
            console.error('Error marking attendance:', error);
            toast.error('An error occurred while updating attendance');
        }
    };

    const handleAddManualParticipant = async () => {
        if (!newParticipantData.full_name || !newParticipantData.email) {
            toast.error('Name and Email are required');
            return;
        }

        setAddingParticipant(true);
        try {
            const response = await eventService.addManualParticipant(slug, newParticipantData);
            if (response.error) {
                toast.error(response.message || 'Failed to add participant');
            } else {
                toast.success('Participant added successfully');
                setAddParticipantOpen(false);
                setNewParticipantData({
                    full_name: '',
                    email: '',
                    phone_number: '',
                    college_name: '',
                    registration_number: ''
                });
                // Refresh manual participants
                const manualParticipantsResponse = await eventService.getManualParticipants(slug);
                if (!manualParticipantsResponse.error) {
                    setManualParticipants(manualParticipantsResponse.data.results || manualParticipantsResponse.data);
                }
            }
        } catch (error) {
            console.error('Error adding participant:', error);
            toast.error('An error occurred while adding participant');
        } finally {
            setAddingParticipant(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'REGISTERED':
            case 'CONFIRMED':
                return <Badge className="bg-green-500">Registered</Badge>;
            case 'WAITLIST':
                return <Badge variant="secondary" className="bg-yellow-500 text-white">Waitlist</Badge>;
            case 'CANCELLED':
                return <Badge variant="destructive">Cancelled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getAttendanceBadge = (status) => {
        switch (status) {
            case 'PRESENT':
                return <Badge className="bg-green-500">Present</Badge>;
            case 'ABSENT':
                return <Badge variant="destructive">Absent</Badge>;
            default:
                return <Badge variant="outline">Pending</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="space-y-4">
                    <Skeleton className="h-12 w-64" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Event not found</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">{event.title} Dashboard</h1>
                        <p className="text-muted-foreground mt-1">Manage registrations and participants</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline">
                            <Link href={`/event/${slug}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Public Page
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href={`/event/${slug}/edit`}>
                                <Settings className="h-4 w-4 mr-2" />
                                Edit Event
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="registrations">
                        <Users className="h-4 w-4 mr-2" />
                        Registrations ({registrations.length})
                    </TabsTrigger>
                    <TabsTrigger value="manual">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Manual Participants ({manualParticipants.length})
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.total_registrations || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    {event.max_participants ? `${event.max_participants} max capacity` : 'Unlimited capacity'}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
                                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.confirmed_registrations || 0}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Waitlist</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.waitlist_count || 0}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Present</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.present_count || 0}</div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Event Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label className="text-muted-foreground">Date</Label>
                                    <p className="font-medium">
                                        {new Date(event.start_datetime).toLocaleDateString()} - {new Date(event.end_datetime).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Time</Label>
                                    <p className="font-medium">
                                        {new Date(event.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(event.end_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Registration Status</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        {event.is_registration_open ? (
                                            <Badge className="bg-green-500">Open</Badge>
                                        ) : (
                                            <Badge variant="destructive">Closed</Badge>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Visibility</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        {event.is_published ? (
                                            <Badge variant="default">Published</Badge>
                                        ) : (
                                            <Badge variant="secondary">Draft</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Registrations Tab */}
                <TabsContent value="registrations" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold">Registrations</h2>
                            <p className="text-muted-foreground">Manage event attendees</p>
                        </div>
                        {/* <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button> */}
                    </div>

                    <div className="rounded-md border">
                        <div className="p-4">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search registrations..." className="pl-8" />
                            </div>
                        </div>
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">User</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Registered At</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Attendance</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {registrations.map((reg) => (
                                        <tr key={reg.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{reg.user_details.full_name}</span>
                                                    <span className="text-xs text-muted-foreground">{reg.user_details.college_name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle">
                                                {getStatusBadge(reg.status)}
                                            </td>
                                            <td className="p-4 align-middle">
                                                {new Date(reg.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 align-middle">
                                                {getAttendanceBadge(reg.attendance_status)}
                                            </td>
                                            <td className="p-4 align-middle">
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 w-8 p-0 text-green-600"
                                                        onClick={() => handleAttendance(reg.id, 'PRESENT')}
                                                        title="Mark Present"
                                                    >
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 w-8 p-0 text-red-600"
                                                        onClick={() => handleAttendance(reg.id, 'ABSENT')}
                                                        title="Mark Absent"
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {registrations.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-4 text-center text-muted-foreground">
                                                No registrations found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabsContent>

                {/* Manual Participants Tab */}
                <TabsContent value="manual" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold">Manual Participants</h2>
                            <p className="text-muted-foreground">Add participants manually (offline/external)</p>
                        </div>
                        <Button onClick={() => setAddParticipantOpen(true)}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Participant
                        </Button>
                    </div>

                    <div className="rounded-md border">
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Phone</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">College</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Reg. No</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {manualParticipants.map((participant) => (
                                        <tr key={participant.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle font-medium">{participant.full_name}</td>
                                            <td className="p-4 align-middle">{participant.email}</td>
                                            <td className="p-4 align-middle">{participant.phone_number || '-'}</td>
                                            <td className="p-4 align-middle">{participant.college_name || '-'}</td>
                                            <td className="p-4 align-middle">{participant.registration_number || '-'}</td>
                                        </tr>
                                    ))}
                                    {manualParticipants.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-4 text-center text-muted-foreground">
                                                No manual participants added yet
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Add Manual Participant Dialog */}
            <Dialog open={addParticipantOpen} onOpenChange={setAddParticipantOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Manual Participant</DialogTitle>
                        <DialogDescription>Add a participant who registered offline or externally</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="full_name">Full Name *</Label>
                            <Input
                                id="full_name"
                                value={newParticipantData.full_name}
                                onChange={(e) => setNewParticipantData({ ...newParticipantData, full_name: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={newParticipantData.email}
                                onChange={(e) => setNewParticipantData({ ...newParticipantData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                value={newParticipantData.phone_number}
                                onChange={(e) => setNewParticipantData({ ...newParticipantData, phone_number: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="college">College Name</Label>
                            <Input
                                id="college"
                                value={newParticipantData.college_name}
                                onChange={(e) => setNewParticipantData({ ...newParticipantData, college_name: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="reg_no">Registration Number</Label>
                            <Input
                                id="reg_no"
                                value={newParticipantData.registration_number}
                                onChange={(e) => setNewParticipantData({ ...newParticipantData, registration_number: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddParticipantOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddManualParticipant} disabled={addingParticipant}>
                            {addingParticipant ? 'Adding...' : 'Add Participant'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default EventDashboardClient;
