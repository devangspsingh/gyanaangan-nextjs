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
  Image as ImageIcon,
  Settings,
  UserPlus,
  Trash2,
  Edit,
  Upload,
  BarChart3,
  Eye,
  Shield,
  ShieldCheck,
  AlertCircle,
  Plus,
  X,
  Check,
} from 'lucide-react';
import organizationService from '@/services/organizationService';
import eventService from '@/services/eventService';

const OrganizationDashboard = ({ slug }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState(null);
  const [stats, setStats] = useState(null);
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Add Member Dialog State
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('MEMBER');
  const [addingMember, setAddingMember] = useState(false);

  // Upload Gallery Dialog State
  const [uploadGalleryOpen, setUploadGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [slug]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch organization details
      const orgResponse = await organizationService.getOrganizationBySlug(slug);
      if (orgResponse.error) {
        toast({
          title: 'Error',
          description: orgResponse.error,
          variant: 'destructive',
        });
        router.push('/organization');
        return;
      }

      // Check if user is admin
      if (!orgResponse.data.user_is_admin) {
        toast({
          title: 'Access Denied',
          description: 'You do not have permission to access this dashboard.',
          variant: 'destructive',
        });
        router.push(`/organization/${slug}`);
        return;
      }

      setOrganization(orgResponse.data);

      // Fetch stats
      const statsResponse = await organizationService.getOrganizationStats(slug);
      if (!statsResponse.error) {
        setStats(statsResponse.data);
      }

      // Fetch members
      const membersResponse = await organizationService.getOrganizationMembers(slug);
      if (!membersResponse.error) {
        setMembers(membersResponse.data.results || membersResponse.data);
      }

      // Fetch events
      const eventsResponse = await organizationService.getOrganizationEvents(slug);
      if (!eventsResponse.error) {
        setEvents(eventsResponse.data.results || eventsResponse.data);
      }

      // Fetch gallery
      const galleryResponse = await organizationService.getOrganizationGallery(slug);
      if (!galleryResponse.error) {
        setGallery(galleryResponse.data.results || galleryResponse.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an email address',
        variant: 'destructive',
      });
      return;
    }

    setAddingMember(true);
    try {
      const response = await organizationService.addMember(organization.slug, {
        email: newMemberEmail,
        role: newMemberRole,
      });

      if (response.error) {
        toast({
          title: 'Error',
          description: response.error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: 'Member added successfully',
        });
        setAddMemberOpen(false);
        setNewMemberEmail('');
        setNewMemberRole('MEMBER');
        // Refresh members list
        const membersResponse = await organizationService.getOrganizationMembers(organization.slug);
        if (!membersResponse.error) {
          setMembers(membersResponse.data.results || membersResponse.data);
        }
      }
    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        title: 'Error',
        description: 'Failed to add member',
        variant: 'destructive',
      });
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Are you sure you want to remove this member?')) {
      return;
    }

    try {
      const response = await organizationService.removeMember(organization.slug, memberId);
      if (response.error) {
        toast({
          title: 'Error',
          description: response.error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: 'Member removed successfully',
        });
        // Refresh members list
        const membersResponse = await organizationService.getOrganizationMembers(organization.slug);
        if (!membersResponse.error) {
          setMembers(membersResponse.data.results || membersResponse.data);
        }
      }
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove member',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateMemberRole = async (memberId, newRole) => {
    try {
      const response = await organizationService.updateMember(organization.slug, memberId, {
        role: newRole,
      });
      if (response.error) {
        toast({
          title: 'Error',
          description: response.error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: 'Member role updated successfully',
        });
        // Refresh members list
        const membersResponse = await organizationService.getOrganizationMembers(organization.slug);
        if (!membersResponse.error) {
          setMembers(membersResponse.data.results || membersResponse.data);
        }
      }
    } catch (error) {
      console.error('Error updating member role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update member role',
        variant: 'destructive',
      });
    }
  };

  const handleGalleryImageChange = (e) => {
    const files = Array.from(e.target.files);
    setGalleryImages(files);

    // Create previews
    const previews = files.map((file) => URL.createObjectURL(file));
    setGalleryPreviews(previews);
  };

  const handleUploadGallery = async () => {
    if (galleryImages.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one image',
        variant: 'destructive',
      });
      return;
    }

    setUploadingGallery(true);
    try {
      // Upload each image
      for (const image of galleryImages) {
        const formData = new FormData();
        formData.append('image', image);

        const response = await organizationService.addGalleryImage(organization.slug, formData);
        if (response.error) {
          toast({
            title: 'Error',
            description: `Failed to upload ${image.name}: ${response.error}`,
            variant: 'destructive',
          });
        }
      }

      toast({
        title: 'Success',
        description: 'Images uploaded successfully',
      });
      setUploadGalleryOpen(false);
      setGalleryImages([]);
      setGalleryPreviews([]);
      // Refresh gallery
      const galleryResponse = await organizationService.getOrganizationGallery(organization.slug);
      if (!galleryResponse.error) {
        setGallery(galleryResponse.data.results || galleryResponse.data);
      }
    } catch (error) {
      console.error('Error uploading gallery images:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload images',
        variant: 'destructive',
      });
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleDeleteGalleryImage = async (imageId) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const response = await organizationService.deleteGalleryImage(organization.slug, imageId);
      if (response.error) {
        toast({
          title: 'Error',
          description: response.error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: 'Image deleted successfully',
        });
        // Refresh gallery
        const galleryResponse = await organizationService.getOrganizationGallery(organization.slug);
        if (!galleryResponse.error) {
          setGallery(galleryResponse.data.results || galleryResponse.data);
        }
      }
    } catch (error) {
      console.error('Error deleting gallery image:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete image',
        variant: 'destructive',
      });
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN':
        return <ShieldCheck className="h-4 w-4" />;
      case 'MEMBER':
        return <Shield className="h-4 w-4" />;
      case 'VIEWER':
        return <Eye className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'default';
      case 'MEMBER':
        return 'secondary';
      case 'VIEWER':
        return 'outline';
      default:
        return 'outline';
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

  if (!organization) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Organization not found</AlertDescription>
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
            <h1 className="text-3xl font-bold">{organization.name} Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your organization, members, and events</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href={`/organization/${slug}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Public Page
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/organization/${slug}/edit`}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="h-4 w-4 mr-2" />
            Members ({members.length})
          </TabsTrigger>
          <TabsTrigger value="events">
            <Calendar className="h-4 w-4 mr-2" />
            Events ({events.length})
          </TabsTrigger>
          <TabsTrigger value="gallery">
            <ImageIcon className="h-4 w-4 mr-2" />
            Gallery ({gallery.length})
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total_members || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total_events || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.upcoming_events || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gallery Images</CardTitle>
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.gallery_images || 0}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Organization Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Created</Label>
                  <p className="font-medium">{new Date(organization.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="flex items-center gap-2">
                    {organization.is_verified ? (
                      <Badge variant="default">
                        <Check className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Unverified</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Slug</Label>
                  <p className="font-medium text-sm font-mono">{organization.slug}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Active Status</Label>
                  <p className="font-medium">{organization.is_active ? 'Active' : 'Inactive'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest events and member activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{event.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.start_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge>{event.event_type}</Badge>
                  </div>
                ))}
                {events.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No events yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Members</h2>
              <p className="text-muted-foreground">Manage organization members and their roles</p>
            </div>
            <Button onClick={() => setAddMemberOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <Card key={member.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {/* <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-semibold">
                            {console.log(member)}
                          {member?.user_details.full_name?.charAt(0) || 'U'}
                        </span>
                      </div> */}
                      <div>
                        <CardTitle className="text-base">
                          {member?.user_details.full_name}
                        </CardTitle>
                        {member.user_details.college_name && (
                          <CardDescription className="text-xs">{member.user_details.college_name}</CardDescription>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-muted-foreground">Role:</Label>
                      <Badge variant={getRoleBadgeVariant(member.role)} className="gap-1">
                        {getRoleIcon(member.role)}
                        {member.role}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Joined:</Label>
                      <p className="text-sm">{new Date(member.joined_at).toLocaleDateString()}</p>
                    </div>
                    <Separator />
                    <div className="flex gap-2">
                      <Select
                        value={member.role}
                        onValueChange={(value) => handleUpdateMemberRole(member.id, value)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="MEMBER">Member</SelectItem>
                          <SelectItem value="VIEWER">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {members.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No members yet. Add your first member!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Events</h2>
              <p className="text-muted-foreground">Manage your organization's events</p>
            </div>
            <Button asChild>
              <Link href="/event/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  {event.cover_image && (
                    <div className="relative h-40 w-full mb-4 rounded-md overflow-hidden">
                      <Image
                        src={event.cover_image}
                        alt={event.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <CardTitle>{event.name}</CardTitle>
                  <CardDescription>{event.event_type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm text-muted-foreground">Date:</Label>
                      <p className="text-sm">{new Date(event.start_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Registrations:</Label>
                      <p className="text-sm">
                        {event.registration_count} / {event.max_participants || '∞'}
                      </p>
                    </div>
                    <Separator />
                    <div className="flex gap-2">
                      <Button asChild variant="outline" className="flex-1">
                        <Link href={`/event/${event.slug}`}>View</Link>
                      </Button>
                      <Button asChild variant="outline" className="flex-1">
                        <Link href={`/event/${event.slug}/dashboard`}>
                          <Settings className="h-4 w-4 mr-2" />
                          Manage
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {events.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No events yet. Create your first event!</p>
                <Button asChild>
                  <Link href="/event/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Gallery</h2>
              <p className="text-muted-foreground">Manage your organization's photo gallery</p>
            </div>
            <Button onClick={() => setUploadGalleryOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Images
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {gallery.map((image) => (
              <Card key={image.id} className="overflow-hidden">
                <div className="relative h-48 w-full">
                  <Image
                    src={image.image}
                    alt={image.caption || 'Gallery image'}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {new Date(image.uploaded_at).toLocaleDateString()}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteGalleryImage(image.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {gallery.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No images yet. Upload your first image!</p>
                <Button onClick={() => setUploadGalleryOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Images
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Member Dialog */}
      <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Member</DialogTitle>
            <DialogDescription>Invite a user to join your organization by email</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MEMBER">Member</SelectItem>
                  <SelectItem value="VIEWER">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMemberOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMember} disabled={addingMember}>
              {addingMember ? 'Adding...' : 'Add Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Gallery Dialog */}
      <Dialog open={uploadGalleryOpen} onOpenChange={setUploadGalleryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Gallery Images</DialogTitle>
            <DialogDescription>Select images to upload to your organization's gallery</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 mb-4">
              {galleryPreviews.map((preview, index) => (
                <div key={index} className="relative h-20 w-full rounded overflow-hidden">
                  <Image
                    src={preview}
                    alt={`Preview ${index}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
            <div>
              <Label htmlFor="images">Select Images</Label>
              <Input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleGalleryImageChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadGalleryOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUploadGallery} disabled={uploadingGallery}>
              {uploadingGallery ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganizationDashboard;
