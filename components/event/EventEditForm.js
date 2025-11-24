'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import EventCreateForm from './EventCreateForm';
import eventService from '@/services/eventService';
import organizationService from '@/services/organizationService';

import { useAuth } from '@/context/AuthContext';

const EventEditForm = ({ slug }) => {
  const router = useRouter();
  const { loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const response = await eventService.getEventBySlug(slug);
        if (response.error) {
          toast({
            title: 'Error',
            description: response.message || 'Failed to load event',
            variant: 'destructive',
          });
          router.push('/event');
          return;
        }
  
        setEvent(response.data);
  
        // Check if user has permission to edit (must be admin of the organization)
        const permissionsResponse = await organizationService.checkPermissions(
          response.data.organization_details.slug
        );
        if (permissionsResponse.error || !permissionsResponse.data.is_admin) {
          toast({
            title: 'Access Denied',
            description: 'You do not have permission to edit this event.',
            variant: 'destructive',
          });
          router.push(`/event/${slug}`);
          return;
        }
  
        setHasPermission(true);
      } catch (error) {
        console.error('Error fetching event:', error);
        toast({
          title: 'Error',
          description: 'Failed to load event data',
          variant: 'destructive',
        });
        router.push('/event');
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading) {
      fetchEvent();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, authLoading]);


  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!event || !hasPermission) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You do not have permission to edit this event or the event was not found.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return <EventCreateForm isEditMode={true} eventSlug={slug} />;
};

export default EventEditForm;
