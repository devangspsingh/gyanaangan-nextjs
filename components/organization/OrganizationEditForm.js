'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getOrganizationBySlug } from '@/services/organizationService';
import OrganizationCreateForm from './OrganizationCreateForm';
import { Loader2 } from 'lucide-react';

const OrganizationEditForm = ({ slug }) => {
  const router = useRouter();
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrganization = async () => {
      setLoading(true);
      try {
        const { data, error } = await getOrganizationBySlug(slug);
        
        if (error || !data) {
          console.error('Error fetching organization:', error);
          router.push('/organization');
          return;
        }
  
        // Check if user is admin
        if (!data.user_is_admin) {
          router.push(`/organization/${slug}`);
          return;
        }
  
        setOrganization(data);
      } catch (error) {
        console.error('Error:', error);
        router.push('/organization');
      } finally {
        setLoading(false);
      }
    };
    fetchOrganization();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);


  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!organization) {
    return null;
  }

  return (
    <OrganizationCreateForm 
      initialData={organization} 
      isEditMode={true}
    />
  );
};

export default OrganizationEditForm;
