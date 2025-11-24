import React from 'react';
import OrganizationEditForm from '@/components/organization/OrganizationEditForm';

export const metadata = {
  title: 'Edit Organization | Gyan Aangan',
  description: 'Edit your organization details',
};

const EditOrganizationPage = ({ params }) => {
  const { slug } = params;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-3">Edit Organization</h1>
            <p className="text-muted-foreground text-lg">
              Update your organization details
            </p>
          </div>
          
          <OrganizationEditForm slug={slug} />
        </div>
      </div>
    </div>
  );
};

export default EditOrganizationPage;
