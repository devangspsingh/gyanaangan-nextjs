'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  Calendar,
  MapPin,
  Upload,
  X,
  Plus,
  Info,
  Users,
  Clock,
  AlertCircle,
  Building2,
} from 'lucide-react';
import eventService from '@/services/eventService';
import organizationService from '@/services/organizationService';

const EVENT_TYPES = [
  { value: 'WORKSHOP', label: 'Workshop' },
  { value: 'SEMINAR', label: 'Seminar' },
  { value: 'CONFERENCE', label: 'Conference' },
  { value: 'HACKATHON', label: 'Hackathon' },
  { value: 'COMPETITION', label: 'Competition' },
  { value: 'CULTURAL', label: 'Cultural Event' },
  { value: 'SPORTS', label: 'Sports Event' },
  { value: 'WEBINAR', label: 'Webinar' },
  { value: 'MEETUP', label: 'Meetup' },
  { value: 'OTHER', label: 'Other' },
];

const EventCreateForm = ({ isEditMode = false, eventSlug = null }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [myOrganizations, setMyOrganizations] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    short_description: '',
    event_type: 'WORKSHOP',
    organization: '',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    venue_name: '',
    meeting_link: '',
    is_online: false,
    max_participants: '',
    registration_deadline: '',
    registration_deadline_time: '',
    is_featured: false,
    is_published: true,
    is_registration_open: true,
    tags: [],
  });

  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchMyOrganizations();
    if (isEditMode && eventSlug) {
      fetchEventData();
    }
  }, [isEditMode, eventSlug]);

  const fetchMyOrganizations = async () => {
    setLoadingOrgs(true);
    try {
      const response = await organizationService.getMyOrganizations();
      if (!response.error) {
        const orgs = response.data.results || response.data;
        // Filter only organizations where user is admin
        console.log(orgs)
        const adminOrgs = orgs.filter(org => org.user_is_admin);
        setMyOrganizations(adminOrgs);
        
        if (adminOrgs.length === 0) {
          toast({
            title: 'No Organizations',
            description: 'You need to be an admin of an organization to create events.',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your organizations',
        variant: 'destructive',
      });
    } finally {
      setLoadingOrgs(false);
    }
  };

  const fetchEventData = async () => {
    try {
      const response = await eventService.getEventBySlug(eventSlug);
      if (!response.error) {
        const event = response.data;
        
        // Parse dates and times
        const startDate = new Date(event.start_datetime);
        const endDate = new Date(event.end_datetime);
        const regDeadline = event.registration_deadline ? new Date(event.registration_deadline) : null;

        setFormData({
          title: event.title,
          description: event.description,
          short_description: event.short_description || '',
          event_type: event.event_type,
          organization: event.organization.id,
          start_date: startDate.toISOString().split('T')[0],
          start_time: startDate.toTimeString().slice(0, 5),
          end_date: endDate.toISOString().split('T')[0],
          end_time: endDate.toTimeString().slice(0, 5),
          venue_name: event.venue_name || '',
          meeting_link: event.meeting_link || '',
          is_online: event.is_online,
          max_participants: event.max_participants || '',
          registration_deadline: regDeadline ? regDeadline.toISOString().split('T')[0] : '',
          registration_deadline_time: regDeadline ? regDeadline.toTimeString().slice(0, 5) : '',
          is_featured: event.is_featured,
          is_published: event.is_published,
          is_registration_open: event.is_registration_open,
          tags: event.tags || [],
        });

        if (event.cover_image) {
          setCoverImagePreview(event.cover_image);
        }
      }
    } catch (error) {
      console.error('Error fetching event data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load event data',
        variant: 'destructive',
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCoverImage = () => {
    setCoverImage(null);
    setCoverImagePreview(null);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.title.trim()) errors.push('Event title is required');
    if (!formData.description.trim()) errors.push('Description is required');
    if (!formData.organization) errors.push('Organization is required');
    if (!formData.start_date) errors.push('Start date is required');
    if (!formData.start_time) errors.push('Start time is required');
    if (!formData.end_date) errors.push('End date is required');
    if (!formData.end_time) errors.push('End time is required');

    // Validate dates
    const startDateTime = new Date(`${formData.start_date}T${formData.start_time}`);
    const endDateTime = new Date(`${formData.end_date}T${formData.end_time}`);

    if (endDateTime <= startDateTime) {
      errors.push('End date/time must be after start date/time');
    }

    // Validate registration deadline
    if (formData.registration_deadline && formData.registration_deadline_time) {
      const regDeadline = new Date(`${formData.registration_deadline}T${formData.registration_deadline_time}`);
      if (regDeadline >= startDateTime) {
        errors.push('Registration deadline must be before event start');
      }
    }

    // Validate venue based on mode
    if (!formData.is_online && !formData.venue_name.trim()) {
      errors.push('Venue name is required for offline events');
    }
    if (formData.is_online && !formData.meeting_link.trim()) {
      errors.push('Meeting link is required for online events');
    }

    if (errors.length > 0) {
      errors.forEach(error => {
        toast({
          title: 'Validation Error',
          description: error,
          variant: 'destructive',
        });
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    console.log("hello")
    setLoading(true);
    try {
      const formDataToSend = new FormData();

      // Combine date and time fields
      const startDatetime = `${formData.start_date}T${formData.start_time}:00`;
      const endDatetime = `${formData.end_date}T${formData.end_time}:00`;

      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      if (formData.short_description) formDataToSend.append('short_description', formData.short_description);
      formDataToSend.append('event_type', formData.event_type);
      formDataToSend.append('organization', formData.organization);
      formDataToSend.append('start_datetime', startDatetime);
      formDataToSend.append('end_datetime', endDatetime);
      formDataToSend.append('is_online', formData.is_online);
      formDataToSend.append('is_featured', formData.is_featured);
      formDataToSend.append('is_published', formData.is_published);
      formDataToSend.append('is_registration_open', formData.is_registration_open);

      if (formData.venue_name) formDataToSend.append('venue_name', formData.venue_name);
      if (formData.meeting_link) formDataToSend.append('meeting_link', formData.meeting_link);
      if (formData.max_participants) formDataToSend.append('max_participants', formData.max_participants);

      if (formData.registration_deadline && formData.registration_deadline_time) {
        const regDeadline = `${formData.registration_deadline}T${formData.registration_deadline_time}:00`;
        formDataToSend.append('registration_deadline', regDeadline);
      }

      if (formData.tags.length > 0) {
        formDataToSend.append('tags', JSON.stringify(formData.tags));
      }

      if (coverImage) {
        formDataToSend.append('event_image', coverImage);
      }

      let response;
      if (isEditMode) {
        response = await eventService.updateEvent(eventSlug, formDataToSend);
      } else {
        response = await eventService.createEvent(formDataToSend);
      }

      if (response.error) {
        toast({
          title: 'Error',
          description: response.message || 'Failed to save event',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: isEditMode ? 'Event updated successfully!' : 'Event created successfully!',
        });
        router.push(`/event/${response.data.slug}`);
      }
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingOrgs) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Loading organizations...</p>
        </CardContent>
      </Card>
    );
  }

  if (myOrganizations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Organizations Found</h3>
          <p className="text-muted-foreground mb-4">
            You need to be an admin of an organization to create events.
          </p>
          <Button onClick={() => router.push('/organization/create')}>
            Create Organization
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Enter the basic details about your event</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Annual Tech Conference 2024"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your event in detail..."
                rows={6}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="event_type">Event Type *</Label>
                <Select
                  value={formData.event_type}
                  onValueChange={(value) => handleInputChange('event_type', value)}
                >
                  <SelectTrigger id="event_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="organization">Organization *</Label>
                <Select
                  value={formData.organization}
                  onValueChange={(value) => handleInputChange('organization', value)}
                >
                  <SelectTrigger id="organization">
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {myOrganizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="cover_image">Cover Image</Label>
              <div className="mt-2">
                {coverImagePreview ? (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden">
                    <Image
                      src={coverImagePreview}
                      alt="Cover preview"
                      fill
                      className="object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={removeCoverImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <Input
                      id="cover_image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCoverImageChange}
                    />
                    <Label htmlFor="cover_image" className="cursor-pointer">
                      <span className="text-sm text-muted-foreground">
                        Click to upload cover image
                      </span>
                    </Label>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date & Time */}
        <Card>
          <CardHeader>
            <CardTitle>Date & Time</CardTitle>
            <CardDescription>When will your event take place?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="start_time">Start Time *</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => handleInputChange('start_time', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="end_date">End Date *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="end_time">End Time *</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => handleInputChange('end_time', e.target.value)}
                  required
                />
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="registration_deadline">Registration Deadline</Label>
                <Input
                  id="registration_deadline"
                  type="date"
                  value={formData.registration_deadline}
                  onChange={(e) => handleInputChange('registration_deadline', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="registration_deadline_time">Registration Deadline Time</Label>
                <Input
                  id="registration_deadline_time"
                  type="time"
                  value={formData.registration_deadline_time}
                  onChange={(e) => handleInputChange('registration_deadline_time', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Venue & Mode */}
        <Card>
          <CardHeader>
            <CardTitle>Venue & Mode</CardTitle>
            <CardDescription>Where will your event take place?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_online">Online Event</Label>
                <p className="text-sm text-muted-foreground">
                  Is this an online event?
                </p>
              </div>
              <Switch
                id="is_online"
                checked={formData.is_online}
                onCheckedChange={(checked) => handleInputChange('is_online', checked)}
              />
            </div>

            {!formData.is_online && (
              <div>
                <Label htmlFor="venue_name">Venue Name *</Label>
                <Input
                  id="venue_name"
                  placeholder="e.g., Main Auditorium, Building A"
                  value={formData.venue_name}
                  onChange={(e) => handleInputChange('venue_name', e.target.value)}
                  required={!formData.is_online}
                />
              </div>
            )}

            {formData.is_online && (
              <div>
                <Label htmlFor="meeting_link">Meeting Link *</Label>
                <Input
                  id="meeting_link"
                  type="url"
                  placeholder="e.g., https://meet.google.com/abc-defg-hij"
                  value={formData.meeting_link}
                  onChange={(e) => handleInputChange('meeting_link', e.target.value)}
                  required={formData.is_online}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Registration Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Registration Settings</CardTitle>
            <CardDescription>Configure registration options for your event</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="max_participants">Maximum Participants</Label>
              <Input
                id="max_participants"
                type="number"
                placeholder="Leave empty for unlimited"
                value={formData.max_participants}
                onChange={(e) => handleInputChange('max_participants', e.target.value)}
                min="1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Leave empty if there's no limit on participants
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_registration_open">Registration Open</Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to register for this event
                </p>
              </div>
              <Switch
                id="is_registration_open"
                checked={formData.is_registration_open}
                onCheckedChange={(checked) => handleInputChange('is_registration_open', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Settings</CardTitle>
            <CardDescription>Optional settings and metadata</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add tags (e.g., technology, workshop)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_featured">Featured Event</Label>
                <p className="text-sm text-muted-foreground">
                  Display this event prominently on the homepage
                </p>
              </div>
              <Switch
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_published">Publish Event</Label>
                <p className="text-sm text-muted-foreground">
                  Make this event visible to the public
                </p>
              </div>
              <Switch
                id="is_published"
                checked={formData.is_published}
                onCheckedChange={(checked) => handleInputChange('is_published', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : isEditMode ? 'Update Event' : 'Create Event'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default EventCreateForm;
