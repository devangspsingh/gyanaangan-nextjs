'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  Globe,
  Mail,
  Phone,
  User,
  Building2,
  Tag,
  Edit,
  Settings,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Share2,
  Ticket,
  Trophy,
  FileText,
  Shield,
} from 'lucide-react';
import eventService from '@/services/eventService';
import organizationService from '@/services/organizationService';

import { useAuth } from '@/context/AuthContext';

const EventDetailClient = ({ slug }) => {
  const router = useRouter();
  const { loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [permissions, setPermissions] = useState({ is_admin: false });
  const [registering, setRegistering] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      setLoading(true);
      try {
        const response = await eventService.getEventBySlug(slug);
        if (response.error) {
          toast.error('Failed to load event details');
          router.push('/event');
          return;
        }
        setEvent(response.data);
        
        // Fetch user permissions for the organization
        if (response.data.organization_details?.slug) {
          const permissionsResponse = await organizationService.checkPermissions(
            response.data.organization_details.slug
          );
          if (!permissionsResponse.error) {
            setPermissions(permissionsResponse.data);
          }
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        toast.error('An error occurred while loading event details');
        router.push('/event');
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading) {
      fetchEventDetails();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, authLoading]);


  const handleRegister = async () => {
    setRegistering(true);
    try {
      const response = await eventService.registerForEvent(event.slug);
      if (response.error) {
        toast.error(response.message || 'Failed to register for event');
      } else {
        toast.success('Successfully registered for the event!');
        setRegisterDialogOpen(false);
        // Refresh event details to update registration status
        fetchEventDetails();
      }
    } catch (error) {
      console.error('Error registering:', error);
      toast.error('An error occurred during registration');
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!confirm('Are you sure you want to cancel your registration?')) {
      return;
    }

    try {
      const response = await eventService.cancelRegistration(event.slug);
      if (response.error) {
        toast.error(response.message || 'Failed to cancel registration');
      } else {
        toast.success('Registration cancelled successfully');
        fetchEventDetails();
      }
    } catch (error) {
      console.error('Error cancelling registration:', error);
      toast.error('An error occurred while cancelling registration');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.short_description || event.description,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEventStatusBadge = () => {
    if (event.is_past) {
      return <Badge variant="secondary">Past Event</Badge>;
    }
    if (event.is_ongoing) {
      return <Badge variant="default" className="bg-green-500">Ongoing</Badge>;
    }
    if (event.is_upcoming) {
      return <Badge variant="default">Upcoming</Badge>;
    }
    return null;
  };

  const canRegister = () => {
    return (
      event.can_user_register &&
      !event.user_is_registered &&
      !event.is_past &&
      !event.is_ongoing
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
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
      {/* Hero Section with Cover Image */}
      {event.event_image && (
        <div className="relative h-[400px] w-full rounded-2xl overflow-hidden mb-8">
          <Image
            src={event.event_image}
            alt={event.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="flex items-center gap-2 mb-2">
              {getEventStatusBadge()}
              {event.is_featured && (
                <Badge variant="default" className="bg-yellow-500">Featured</Badge>
              )}
              <Badge variant="outline" className="border-white text-white">
                {event.event_type}
              </Badge>
            </div>
            <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
            <p className="text-lg text-gray-200">{event.short_description}</p>
          </div>
        </div>
      )}

      {!event.event_image && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            {getEventStatusBadge()}
            {event.is_featured && (
              <Badge variant="default" className="bg-yellow-500">Featured</Badge>
            )}
            <Badge>{event.event_type}</Badge>
          </div>
          <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
          <p className="text-xl text-muted-foreground">{event.short_description}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Info Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{formatDate(event.start_datetime)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(event.start_datetime)} - {formatTime(event.end_datetime)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  {event.is_online ? (
                    <Video className="h-5 w-5 text-primary mt-0.5" />
                  ) : (
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  )}
                  <div>
                    <p className="font-semibold text-sm text-muted-foreground">
                      {event.is_online ? 'Online Event' : 'Venue'}
                    </p>
                    <p className="font-medium">
                      {event.is_online ? 'Virtual Meeting' : event.venue_name}
                    </p>
                    {event.venue_address && (
                      <p className="text-sm text-muted-foreground">{event.venue_address}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>About This Event</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{event.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          {event.schedule && event.schedule.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Event Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {event.schedule.map((item, index) => (
                    <div key={index} className="flex gap-4 border-l-2 border-primary pl-4">
                      <div className="min-w-[100px]">
                        <p className="font-semibold text-sm">{item.time}</p>
                      </div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        {item.description && (
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Prizes */}
          {event.prizes && Object.keys(event.prizes).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Prizes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-3">
                  {Object.entries(event.prizes).map(([position, prize]) => (
                    <div key={position} className="p-4 rounded-lg bg-muted">
                      <p className="font-semibold text-lg">{position}</p>
                      <p className="text-2xl font-bold text-primary">{prize}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rules */}
          {event.rules && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Rules & Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{event.rules}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Eligibility */}
          {event.eligibility_criteria && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Eligibility Criteria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{event.eligibility_criteria}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Registration Card */}
          <Card>
            <CardHeader>
              <CardTitle>Registration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Registration Status */}
              {event.user_is_registered ? (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>You are registered for this event!</AlertDescription>
                </Alert>
              ) : event.registration_closed ? (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>Registration is closed</AlertDescription>
                </Alert>
              ) : event.is_full ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Event is full</AlertDescription>
                </Alert>
              ) : null}

              {/* Participants Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Participants</span>
                </div>
                <span className="font-bold">
                  {event.registered_count}
                  {event.max_participants && ` / ${event.max_participants}`}
                </span>
              </div>

              {event.spots_remaining !== null && event.spots_remaining > 0 && (
                <p className="text-sm text-muted-foreground">
                  {event.spots_remaining} spots remaining
                </p>
              )}

              {/* Registration Deadline */}
              {event.registration_deadline && (
                <div className="text-sm">
                  <p className="text-muted-foreground">Registration Deadline</p>
                  <p className="font-medium">{formatDate(event.registration_deadline)}</p>
                </div>
              )}

              {/* Registration Fee */}
              {event.registration_fee > 0 ? (
                <div className="text-sm">
                  <p className="text-muted-foreground">Registration Fee</p>
                  <p className="text-2xl font-bold text-primary">₹{event.registration_fee}</p>
                </div>
              ) : (
                <Badge variant="secondary" className="w-full justify-center py-2">
                  Free Event
                </Badge>
              )}

              <Separator />

              {/* Action Buttons */}
              {event.user_is_registered ? (
                <div className="space-y-2">
                  {event.user_registration?.attendance_status === 'PRESENT' ? (
                    <>
                      <Button className="w-full" variant="default" asChild>
                        <Link href={`/event/verify/${event.user_registration.registration_number}`}>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          View Certificate
                        </Link>
                      </Button>
                      <Button className="w-full" variant="outline" asChild>
                        <Link href={`/event/my-registrations`}>
                          <Ticket className="h-4 w-4 mr-2" />
                          View My Registrations
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button className="w-full" variant="outline" asChild>
                        <Link href={`/event/my-registrations`}>
                          <Ticket className="h-4 w-4 mr-2" />
                          View My Registrations
                        </Link>
                      </Button>
                      <Button
                        className="w-full"
                        variant="destructive"
                        onClick={handleCancelRegistration}
                      >
                        Cancel Registration
                      </Button>
                    </>
                  )}
                </div>
              ) : canRegister() ? (
                <Button className="w-full" onClick={() => setRegisterDialogOpen(true)}>
                  <Ticket className="h-4 w-4 mr-2" />
                  Register Now
                </Button>
              ) : event.is_past ? (
                <Button className="w-full" disabled>
                  Event Ended
                </Button>
              ) : event.is_ongoing ? (
                <Button className="w-full" disabled>
                  Event Ongoing
                </Button>
              ) : (
                <Button className="w-full" disabled>
                  Registration Closed
                </Button>
              )}

              <Button
                className="w-full"
                variant="outline"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Event
              </Button>
            </CardContent>
          </Card>

          {/* Organization Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Organized By
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={`/organization/${event.organization_details.slug}`}>
                <div className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  {event.organization_details.logo && (
                    <div className="relative h-12 w-12 rounded-full overflow-hidden">
                      <Image
                        src={event.organization_details.logo}
                        alt={event.organization_details.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{event.organization_details.name}</p>
                    {event.organization_details.is_verified && (
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Contact Card */}
          {(event.contact_email || event.contact_phone || event.contact_person) && (
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {event.contact_person && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{event.contact_person}</span>
                  </div>
                )}
                {event.contact_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`mailto:${event.contact_email}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {event.contact_email}
                    </a>
                  </div>
                )}
                {event.contact_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`tel:${event.contact_phone}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {event.contact_phone}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Admin Actions */}
          {permissions.is_admin && (
            <Card>
              <CardHeader>
                <CardTitle>Manage Event</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline" asChild>
                  <Link href={`/event/${slug}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Event
                  </Link>
                </Button>
                <Button className="w-full" variant="outline" asChild>
                  <Link href={`/event/${slug}/dashboard`}>
                    <Settings className="h-4 w-4 mr-2" />
                    Event Dashboard
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Links */}
          {(event.google_maps_link || event.meeting_link) && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {event.google_maps_link && (
                  <Button className="w-full" variant="outline" asChild>
                    <a href={event.google_maps_link} target="_blank" rel="noopener noreferrer">
                      <MapPin className="h-4 w-4 mr-2" />
                      View on Maps
                    </a>
                  </Button>
                )}
                {event.meeting_link && event.user_is_registered && (
                  <Button className="w-full" variant="outline" asChild>
                    <a href={event.meeting_link} target="_blank" rel="noopener noreferrer">
                      <Video className="h-4 w-4 mr-2" />
                      Join Meeting
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Registration Confirmation Dialog */}
      <Dialog className="" open={registerDialogOpen} onOpenChange={setRegisterDialogOpen}>
        <DialogContent className="md:max-w-fit">
          <DialogHeader>
            <DialogTitle>Confirm Registration</DialogTitle>
            <DialogDescription>
              You are about to register for {event.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Event</p>
              <p className="font-medium">{event.title}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date & Time</p>
              <p className="font-medium">
                {formatDate(event.start_datetime)} at {formatTime(event.start_datetime)}
              </p>
            </div>
            {event.registration_fee > 0 && (
              <div>
                <p className="text-sm text-muted-foreground">Registration Fee</p>
                <p className="text-xl font-bold text-primary">₹{event.registration_fee}</p>
              </div>
            )}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please ensure you can attend the event before registering.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRegisterDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRegister} disabled={registering}>
              {registering ? 'Registering...' : 'Confirm Registration'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventDetailClient;
