import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getUserScenarios, deleteScenario, deleteSimulationResults } from '@/db/api';
import SimulationCard from '@/components/simulation/SimulationCard';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Scenario } from '@/types/types';

export default function SavedSimulations() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [filteredScenarios, setFilteredScenarios] = useState<Scenario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadScenarios();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      setFilteredScenarios(
        scenarios.filter(
          (s) =>
            s.title.toLowerCase().includes(query) ||
            s.description?.toLowerCase().includes(query) ||
            s.option_a.toLowerCase().includes(query) ||
            s.option_b.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredScenarios(scenarios);
    }
  }, [searchQuery, scenarios]);

  const loadScenarios = async () => {
    setIsLoading(true);
    const data = await getUserScenarios();
    setScenarios(data);
    setFilteredScenarios(data);
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      // Delete simulation results first
      await deleteSimulationResults(deleteId);
      // Then delete scenario
      const success = await deleteScenario(deleteId);

      if (success) {
        toast({
          title: 'Success',
          description: 'Simulation deleted successfully'
        });
        loadScenarios();
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete simulation',
        variant: 'destructive'
      });
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Saved Simulations</h1>
          <p className="text-muted-foreground">
            View and manage all your decision simulations
          </p>
        </div>

        {/* Search and Actions */}
        <div className="mb-6 flex flex-col gap-4 @md:flex-row @md:items-center @md:justify-between">
          <div className="relative flex-1 @md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search simulations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button asChild>
            <Link to="/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Simulation
            </Link>
          </Button>
        </div>

        {/* Simulations Grid */}
        {isLoading ? (
          <div className="grid gap-6 @md:grid-cols-2 @lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="mb-4 h-6 w-3/4 bg-muted" />
                  <Skeleton className="mb-2 h-4 w-full bg-muted" />
                  <Skeleton className="mb-4 h-4 w-2/3 bg-muted" />
                  <Skeleton className="h-10 w-full bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredScenarios.length > 0 ? (
          <div className="grid gap-6 @md:grid-cols-2 @lg:grid-cols-3">
            {filteredScenarios.map((scenario) => (
              <SimulationCard
                key={scenario.id}
                scenario={scenario}
                onDelete={(id) => setDeleteId(id)}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              {searchQuery ? (
                <>
                  <p className="mb-4 text-center text-muted-foreground">
                    No simulations found matching "{searchQuery}"
                  </p>
                  <Button variant="outline" onClick={() => setSearchQuery('')}>
                    Clear Search
                  </Button>
                </>
              ) : (
                <>
                  <p className="mb-4 text-center text-muted-foreground">
                    You haven't created any simulations yet.
                  </p>
                  <Button asChild>
                    <Link to="/create">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Your First Simulation
                    </Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Simulation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this simulation? This action cannot be undone.
              All associated results will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
