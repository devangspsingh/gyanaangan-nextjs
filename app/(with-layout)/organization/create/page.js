import React from 'react';
import OrganizationCreateForm from '@/components/organization/OrganizationCreateForm';

export const metadata = {
  title: 'Create Organization | Gyan Aangan',
  description: 'Create a new organization to host events and build your community.',
};

const CreateOrganizationPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-3">Create Organization</h1>
            <p className="text-muted-foreground text-lg">
              Start your organization to host amazing events and build your community
            </p>
          </div>
          
          <OrganizationCreateForm />
        </div>
      </div>
    </div>
  );
};

export default CreateOrganizationPage;
