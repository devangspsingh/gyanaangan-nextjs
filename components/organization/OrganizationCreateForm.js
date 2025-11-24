// ✅ CLEAN + OFFICIAL SHADCN/SONNER SETUP (NO CUSTOM HOOK)
// Using the built-in toast API from shadcn v2
// Just import { toast } from "sonner".
// Ensure <Toaster /> is added once in your root layout.

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createOrganization, updateOrganization } from '@/services/organizationService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, X } from 'lucide-react';
import Image from 'next/image';

// ⭐ OFFICIAL SHADCN V2 WAY: direct import from "sonner"
import { toast } from 'sonner';

// IMPORTANT: Add <Toaster /> once inside app/layout.tsx:
// import { Toaster } from "sonner";
// <Toaster richColors position="top-right" />

const OrganizationCreateForm = ({ initialData = null, isEditMode = false }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    contact_email: initialData?.contact_email || '',
    contact_phone: initialData?.contact_phone || '',
    website: initialData?.website || '',
    social_links: initialData?.social_links || {},
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(initialData?.logo || null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(initialData?.cover_image || null);

  const [newSocialPlatform, setNewSocialPlatform] = useState('');
  const [newSocialUrl, setNewSocialUrl] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setLogoFile(f);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(f);
    }
  };

  const handleCoverChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setCoverFile(f);
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result);
      reader.readAsDataURL(f);
    }
  };

  const addSocialLink = () => {
    if (newSocialPlatform && newSocialUrl) {
      setFormData(prev => ({
        ...prev,
        social_links: {
          ...prev.social_links,
          [newSocialPlatform]: newSocialUrl
        }
      }));
      setNewSocialPlatform('');
      setNewSocialUrl('');
    }
  };

  const removeSocialLink = (platform) => {
    setFormData(prev => {
      const updated = { ...prev.social_links };
      delete updated[platform];
      return { ...prev, social_links: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();

      Object.keys(formData).forEach(key => {
        if (key === 'social_links') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });

      if (logoFile) submitData.append('logo', logoFile);
      if (coverFile) submitData.append('cover_image', coverFile);

      let response;
      if (isEditMode && initialData?.slug) {
        response = await updateOrganization(initialData.slug, submitData);
      } else {
        response = await createOrganization(submitData);
      }

      if (!response.error) {
        toast.success(isEditMode ? 'Organization Updated' : 'Organization Created', {
          description: isEditMode
            ? 'Your organization has been updated successfully.'
            : 'Your organization has been created successfully.',
        });

        router.push(`/organization/${response.data.slug}`);
      } else {
        toast.error('Error', {
          description: response.message || 'Something went wrong.',
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Unexpected Error', {
        description: 'Please try again later.',
      });
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* BASIC INFO */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Provide organization details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Organization Name *</Label>
            <Input id="name" name="name" required value={formData.name} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              required
              value={formData.description}
              onChange={handleChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* IMAGES */}
      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Logo */}
          <div>
            <Label>Logo</Label>
            <div className="flex gap-4 mt-2 items-center">
              {logoPreview && (
                <div className="relative w-24 h-24 border rounded-lg overflow-hidden">
                  <Image src={logoPreview} alt="logo-preview" fill className="object-cover" />
                </div>
              )}
              <Input type="file" accept="image/*" onChange={handleLogoChange} />
            </div>
          </div>

          {/* Cover */}
          <div>
            <Label>Cover Image</Label>
            <div className="mt-2">
              {coverPreview && (
                <div className="relative w-full h-48 border rounded-lg overflow-hidden mb-2">
                  <Image src={coverPreview} alt="cover-preview" fill className="object-cover" />
                </div>
              )}
              <Input type="file" accept="image/*" onChange={handleCoverChange} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CONTACT */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input name="contact_email" placeholder="Email" value={formData.contact_email} onChange={handleChange} />
          <Input name="contact_phone" placeholder="Phone" value={formData.contact_phone} onChange={handleChange} />
          <Input name="website" placeholder="Website" value={formData.website} onChange={handleChange} />
        </CardContent>
      </Card>

      {/* SOCIAL LINKS */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(formData.social_links).map(([platform, url]) => (
            <div key={platform} className="flex items-center gap-2 p-2 border rounded">
              <span className="font-medium capitalize">{platform}:</span>
              <span className="flex-1 truncate">{url}</span>
              <Button variant="ghost" size="icon" onClick={() => removeSocialLink(platform)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}

          <div className="flex gap-2">
            <Input placeholder="Platform" value={newSocialPlatform} onChange={(e) => setNewSocialPlatform(e.target.value)} />
            <Input placeholder="URL" value={newSocialUrl} onChange={(e) => setNewSocialUrl(e.target.value)} />
            <Button size="icon" onClick={addSocialLink}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ACTION BUTTONS */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} 
          {isEditMode ? 'Update Organization' : 'Create Organization'}
        </Button>
      </div>
    </form>
  );
};

export default OrganizationCreateForm;
