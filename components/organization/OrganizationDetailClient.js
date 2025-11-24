'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getOrganizationBySlug, getOrganizationEvents, getOrganizationMembers } from '@/services/organizationService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Building2, CheckCircle, Users, Calendar, Mail, Phone, Globe,
  Facebook, Instagram, Linkedin, Twitter, MapPin, Edit, Settings
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';

const OrganizationDetailClient = ({ slug }) => {
  const router = useRouter();
  const [organization, setOrganization] = useState(null);
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    const fetchOrganizationData = async () => {
      setLoading(true);
      try {
        // Fetch organization details
        const { data: orgData, error: orgError } = await getOrganizationBySlug(slug);
  
        if (orgError || !orgData) {
          console.error('Error fetching organization:', orgError);
          router.push('/organization');
          return;
        }
  
        setOrganization(orgData);
  
        // Fetch events
        const { data: eventsData } = await getOrganizationEvents(slug);
        setEvents(eventsData?.results || []);
  
        // Fetch members
        const { data: membersData } = await getOrganizationMembers(slug);
        setMembers(membersData || []);
  
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrganizationData();
    
  }, [router, slug]);


  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-muted rounded-lg" />
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Organization Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The organization you are looking for does not exist.
        </p>
        <Button onClick={() => router.push('/organization')}>
          Browse Organizations
        </Button>
      </div>
    );
  }

  const getSocialIcon = (platform) => {
    const icons = {
      facebook: Facebook,
      instagram: Instagram,
      linkedin: Linkedin,
      twitter: Twitter,
    };
    const IconComponent = icons[platform.toLowerCase()] || Globe;
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Cover Image */}
      <div className="relative h-64 md:h-80 w-full rounded-lg overflow-hidden mb-8 bg-muted">
        {organization.cover_image ? (
          <Image
            src={organization.cover_image}
            alt={organization.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/10 to-primary/5">
            <Building2 className="w-24 h-24 text-muted-foreground" />
          </div>
        )}

        {/* Action Buttons */}
        {organization.user_is_admin && (
          <div className="absolute top-4 right-4 flex gap-2">
            <Button size="sm" onClick={() => router.push(`/organization/${slug}/edit`)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button size="sm" variant="outline" onClick={() => router.push(`/organization/${slug}/dashboard`)}>
              <Settings className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </div>
        )}
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        {/* Logo */}
        {organization.logo && (
          <div className="relative w-32 h-32 rounded-lg overflow-hidden border-4 border-background shadow-lg flex-shrink-0">
            <Image
              src={organization.logo}
              alt={`${organization.name} logo`}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Organization Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-3xl md:text-4xl font-bold">{organization.name}</h1>
            {organization.is_verified && (
              <Badge className="bg-blue-500 text-white ml-2">
                <CheckCircle className="w-4 h-4 mr-1" />
                Verified
              </Badge>
            )}
          </div>

          <p className="text-muted-foreground text-lg mb-4">
            {organization.description}
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2 text-muted-foreground" />
              <span className="font-medium">{organization.member_count}</span>
              <span className="text-muted-foreground ml-1">members</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
              <span className="font-medium">{organization.event_count}</span>
              <span className="text-muted-foreground ml-1">events</span>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
          <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
        </TabsList>

        {/* About Tab */}
        <TabsContent value="about" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {organization.contact_email && (
                <div className="flex items-center">
                  <Mail className="w-5 h-5 mr-3 text-muted-foreground" />
                  <a href={`mailto:${organization.contact_email}`} className="text-primary hover:underline">
                    {organization.contact_email}
                  </a>
                </div>
              )}
              {organization.contact_phone && (
                <div className="flex items-center">
                  <Phone className="w-5 h-5 mr-3 text-muted-foreground" />
                  <a href={`tel:${organization.contact_phone}`} className="text-primary hover:underline">
                    {organization.contact_phone}
                  </a>
                </div>
              )}
              {organization.website && (
                <div className="flex items-center">
                  <Globe className="w-5 h-5 mr-3 text-muted-foreground" />
                  <a href={organization.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {organization.website}
                  </a>
                </div>
              )}

              {organization.social_links && Object.keys(organization.social_links).length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h4 className="font-medium mb-3">Social Media</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(organization.social_links).map(([platform, url]) => (
                        <Button
                          key={platform}
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a href={url} target="_blank" rel="noopener noreferrer">
                            {getSocialIcon(platform)}
                            <span className="ml-2 capitalize">{platform}</span>
                          </a>
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="mt-6">
          {events.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No events yet</h3>
                <p className="text-muted-foreground">
                  This organization has not hosted any events yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/event/${event.slug}`)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                      <Badge>{event.event_type}</Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {event.short_description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <Calendar className="w-4 h-4 mr-2" />
                      {format(new Date(event.start_datetime), 'PPP')}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="w-4 h-4 mr-2" />
                      {event.registered_count} registered
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="mt-6">
          {members.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No members</h3>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => (
                <Card key={member.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {member.user_details?.full_name}
                      </CardTitle>
                      <Badge variant={member.role === 'ADMIN' ? 'default' : 'secondary'}>
                        {member.role}
                      </Badge>
                    </div>
                    {member.user_details?.college_name && (
                      <CardDescription>
                        {member.user_details.college_name}
                      </CardDescription>
                    )}
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="mt-6">
          {!organization.gallery_images || organization.gallery_images.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No gallery images</h3>
                <p className="text-muted-foreground">
                  This organization has not uploaded any gallery images yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {organization.gallery_images.map((image) => (
                <div key={image.id} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={image.image}
                    alt={image.caption || 'Gallery image'}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                  {image.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-sm">
                      {image.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrganizationDetailClient;
