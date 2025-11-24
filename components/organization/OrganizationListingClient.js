'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getOrganizations } from '@/services/organizationService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Users, Calendar, CheckCircle, Building2, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const OrganizationCard = ({ organization }) => {
  const router = useRouter();

  return (
    <Card className="pt-0 relative overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group">
      <div className="relative h-48 w-full overflow-hidden bg-muted">
        {organization.cover_image ? (
          <Image
            src={organization.cover_image}
            alt={organization.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/10 to-primary/5">
            <Building2 className="w-16 h-16 text-muted-foreground" />
          </div>
        )}
        {organization.is_verified && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-blue-500 text-white">
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          </div>
        )}
      </div>

      {/* Logo Overlay */}
      {organization.logo && (
        <div className="absolute top-36 left-4 w-24 h-24 rounded-full border-4 border-background bg-background overflow-hidden shadow-lg">
          <Image
            src={organization.logo}
            alt={`${organization.name} logo`}
            fill
            className="object-cover"
          />
        </div>
      )}

      <CardHeader className={organization.logo ? 'pt-16' : ''}>
        <CardTitle className="line-clamp-1 group-hover:text-primary transition-colors">
          {organization.name}
        </CardTitle>
        <CardDescription className="line-clamp-2 min-h-[40px]">
          {organization.description || 'No description available'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-muted-foreground">
            <Users className="w-4 h-4 mr-2" />
            <span>{organization.member_count || 0} members</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{organization.event_count || 0} events</span>
          </div>
        </div>

        {organization.social_links && Object.keys(organization.social_links).length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              {Object.keys(organization.social_links).length} social link(s)
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          onClick={() => router.push(`/organization/${organization.slug}`)}
        >
          View Organization
        </Button>
      </CardFooter>
    </Card>
  );
};

const OrganizationListingClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [filter, setFilter] = useState(searchParams.get('filter') || 'all');
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalCount: 0,
  });

  useEffect(() => {
    fetchOrganizations();
  }, [filter, searchQuery, pagination.page]);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        page_size: 12,
        search: searchQuery || undefined,
        verified: filter === 'verified' ? true : undefined,
        my_organizations: filter === 'my' ? true : undefined,
      };

      const { data, error, fullResponse } = await getOrganizations(params);

      if (!error && data) {
        setOrganizations(data.results || []);
        setPagination({
          page: pagination.page,
          totalPages: Math.ceil((data.count || 0) / 12),
          totalCount: data.count || 0,
        });
      } else {
        console.error('Error fetching organizations:', error);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchOrganizations();
  };

  const handleFilterChange = (value) => {
    setFilter(value);
    setPagination({ ...pagination, page: 1 });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-3">Organizations</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Discover clubs, companies, and organizations hosting amazing events and opportunities.
        </p>
      </div>

      {/* Create Organization CTA */}
      <div className="mb-6 text-center">
        <Button onClick={() => router.push('/organization/create')} size="lg">
          <Plus className="w-4 h-4 mr-2" />
          Create Organization
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search organizations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={handleFilterChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Organizations</TabsTrigger>
            <TabsTrigger value="verified">Verified</TabsTrigger>
            <TabsTrigger value="my">My Organizations</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          {loading ? 'Loading...' : `Found ${pagination.totalCount} organization(s)`}
        </p>
      </div>

      {/* Organizations Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-48 bg-muted animate-pulse" />
              <CardHeader>
                <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                <div className="h-6 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : organizations.length === 0 ? (
        <div className="text-center py-16">
          <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No organizations found</h3>
          <p className="text-muted-foreground mb-4">
            {filter === 'my' 
              ? "You haven't joined any organizations yet" 
              : 'Try adjusting your filters or search query'}
          </p>
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setFilter('all');
                setPagination({ page: 1, totalPages: 1, totalCount: 0 });
              }}
            >
              Reset Filters
            </Button>
            <Button onClick={() => router.push('/organization/create')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Organization
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((organization) => (
            <OrganizationCard key={organization.id} organization={organization} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            disabled={pagination.page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            disabled={pagination.page === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default OrganizationListingClient;
