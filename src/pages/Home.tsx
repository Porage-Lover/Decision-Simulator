import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, TrendingUp, BarChart3, Clock } from 'lucide-react';
import { getUserScenarios } from '@/db/api';
import SimulationCard from '@/components/simulation/SimulationCard';
import type { Scenario } from '@/types/types';

export default function Home() {
  const [recentScenarios, setRecentScenarios] = useState<Scenario[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecentScenarios();
  }, []);

  const loadRecentScenarios = async () => {
    setIsLoading(true);
    const scenarios = await getUserScenarios(3);
    setRecentScenarios(scenarios);
    setIsLoading(false);
  };

  const features = [
    {
      icon: TrendingUp,
      title: 'Probabilistic Modeling',
      description: 'Monte Carlo simulation generates outcome distributions, not single predictions'
    },
    {
      icon: BarChart3,
      title: 'Data Visualization',
      description: 'Interactive charts show probability distributions and timeline evolution'
    },
    {
      icon: Clock,
      title: 'Time-Based Evolution',
      description: 'Model how variables change over weeks and months with realistic decay and growth'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4 py-16 xl:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight xl:text-5xl">
              Make Better Decisions with{' '}
              <span className="text-primary">Probabilistic Modeling</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground xl:text-xl">
              Explore potential outcomes of different choices over time using Monte Carlo simulation. 
              Understand uncertainty, tradeoffs, and second-order effects in your decision-making.
            </p>
            <div className="flex flex-col gap-3 @md:flex-row @md:justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link to="/create">
                  <PlusCircle className="h-5 w-5" />
                  Create New Simulation
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/simulations">View Saved Simulations</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12 xl:py-16">
        <h2 className="mb-8 text-center text-2xl font-bold xl:text-3xl">
          How It Works
        </h2>
        <div className="grid gap-6 @md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title}>
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Recent Simulations Section */}
      <section className="container mx-auto px-4 py-12 xl:py-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold xl:text-3xl">Recent Simulations</h2>
          <Button asChild variant="outline">
            <Link to="/simulations">View All</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-6 @md:grid-cols-2 @lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="mb-2 h-6 w-3/4 bg-muted" />
                  <Skeleton className="h-4 w-full bg-muted" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recentScenarios.length > 0 ? (
          <div className="grid gap-6 @md:grid-cols-2 @lg:grid-cols-3">
            {recentScenarios.map((scenario) => (
              <SimulationCard key={scenario.id} scenario={scenario} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="mb-4 text-center text-muted-foreground">
                You haven't created any simulations yet.
              </p>
              <Button asChild>
                <Link to="/create">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Your First Simulation
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
