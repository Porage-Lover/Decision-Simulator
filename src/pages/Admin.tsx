import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, Users } from 'lucide-react';
import { getAllProfiles, updateProfileRole } from '@/db/api';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Profile } from '@/types/types';

export default function Admin() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setIsLoading(true);
    const data = await getAllProfiles();
    setProfiles(data);
    setIsLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    const success = await updateProfileRole(userId, newRole);

    if (success) {
      toast({
        title: 'Success',
        description: 'User role updated successfully'
      });
      loadProfiles();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive'
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = {
    totalUsers: profiles.length,
    admins: profiles.filter(p => p.role === 'admin').length,
    regularUsers: profiles.filter(p => p.role === 'user').length
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-primary">
            <Shield className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Admin Panel</h1>
          </div>
          <p className="mt-2 text-muted-foreground">
            Manage users and their roles
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 @md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Users</CardDescription>
              <CardTitle className="text-3xl">{stats.totalUsers}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Administrators</CardDescription>
              <CardTitle className="text-3xl">{stats.admins}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Regular Users</CardDescription>
              <CardTitle className="text-3xl">{stats.regularUsers}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <CardTitle>User Management</CardTitle>
            </div>
            <CardDescription>
              View and manage user roles and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full bg-muted" />
                ))}
              </div>
            ) : profiles.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell className="font-medium">
                          {profile.username || 'N/A'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {profile.email || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={profile.role === 'admin' ? 'default' : 'secondary'}
                          >
                            {profile.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(profile.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Select
                            value={profile.role}
                            onValueChange={(value: 'user' | 'admin') =>
                              handleRoleChange(profile.id, value)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                No users found
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Important Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              • The first user to register automatically becomes an admin
            </p>
            <p>
              • Admins can view all simulations and manage user roles
            </p>
            <p>
              • Regular users can only view and manage their own simulations
            </p>
            <p>
              • Be careful when changing roles - admins have full access to the system
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
