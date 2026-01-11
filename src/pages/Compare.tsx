import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { GitCompare, TrendingUp, AlertTriangle } from 'lucide-react';
import { getUserScenarios, getSimulationResults } from '@/db/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Scenario, SimulationResult } from '@/types/types';

interface ScenarioWithResults {
  scenario: Scenario;
  results: SimulationResult[];
}

export default function Compare() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<ScenarioWithResults[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    setIsLoading(true);
    const data = await getUserScenarios();
    setScenarios(data);
    setIsLoading(false);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      } else if (prev.length < 4) {
        return [...prev, id];
      }
      return prev;
    });
  };

  const handleCompare = async () => {
    if (selectedIds.length < 2) return;

    setIsComparing(true);
    const data: ScenarioWithResults[] = [];

    for (const id of selectedIds) {
      const scenario = scenarios.find(s => s.id === id);
      if (scenario) {
        const results = await getSimulationResults(id);
        data.push({ scenario, results });
      }
    }

    setComparisonData(data);
    setIsComparing(false);
  };

  const getComparisonChartData = () => {
    if (comparisonData.length === 0) return [];

    return comparisonData.map(({ scenario, results }) => {
      const latestResult = results[0];
      return {
        name: scenario.title,
        'Option A Mean': latestResult?.outcome_distribution.mean || 0,
        'Option A Excellent': latestResult?.outcome_distribution.excellent || 0,
        'Option A Burnout': latestResult?.risk_breakdown.burnout || 0
      };
    });
  };

  return (
    <div className="@container p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
              <GitCompare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Compare Scenarios</h1>
              <p className="text-muted-foreground">
                Select 2-4 scenarios to compare side-by-side
              </p>
            </div>
          </div>
        </div>

        {/* Selection */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Select Scenarios</CardTitle>
            <CardDescription>
              Choose up to 4 scenarios to compare ({selectedIds.length}/4 selected)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid gap-4 @md:grid-cols-2 @lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : scenarios.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                No scenarios found. Create some simulations first.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 @md:grid-cols-2 @lg:grid-cols-3">
                  {scenarios.map((scenario) => (
                    <div
                      key={scenario.id}
                      className={`flex items-start gap-3 rounded-lg border p-4 transition-all ${
                        selectedIds.includes(scenario.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Checkbox
                        checked={selectedIds.includes(scenario.id)}
                        onCheckedChange={() => toggleSelection(scenario.id)}
                        disabled={!selectedIds.includes(scenario.id) && selectedIds.length >= 4}
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold">{scenario.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {scenario.option_a} vs {scenario.option_b}
                        </p>
                        <div className="mt-2 flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            {scenario.time_horizon_weeks}w
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center">
                  <Button
                    onClick={handleCompare}
                    disabled={selectedIds.length < 2 || isComparing}
                    size="lg"
                    className="gap-2"
                  >
                    <GitCompare className="h-5 w-5" />
                    {isComparing ? 'Loading...' : 'Compare Selected'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comparison Results */}
        {comparisonData.length > 0 && (
          <>
            {/* Outcome Comparison */}
            <Card className="glass">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <CardTitle>Outcome Comparison</CardTitle>
                </div>
                <CardDescription>Mean outcomes and success probabilities</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getComparisonChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                      stroke="hsl(var(--border))"
                    />
                    <YAxis 
                      tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                      stroke="hsl(var(--border))"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="Option A Mean" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="Option A Excellent" fill="hsl(var(--chart-3))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Risk Comparison */}
            <Card className="glass">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  <CardTitle>Risk Comparison</CardTitle>
                </div>
                <CardDescription>Burnout and dropout risks across scenarios</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getComparisonChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                      stroke="hsl(var(--border))"
                    />
                    <YAxis 
                      tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                      stroke="hsl(var(--border))"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="Option A Burnout" fill="hsl(var(--chart-5))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Detailed Table */}
            <Card className="glass">
              <CardHeader>
                <CardTitle>Detailed Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="p-3 text-left font-semibold">Scenario</th>
                        <th className="p-3 text-left font-semibold">Mean Outcome</th>
                        <th className="p-3 text-left font-semibold">Excellent %</th>
                        <th className="p-3 text-left font-semibold">Burnout %</th>
                        <th className="p-3 text-left font-semibold">Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonData.map(({ scenario, results }) => {
                        const result = results[0];
                        return (
                          <tr key={scenario.id} className="border-b border-border/50">
                            <td className="p-3 font-medium">{scenario.title}</td>
                            <td className="p-3">{result?.outcome_distribution.mean.toFixed(1) || 'N/A'}</td>
                            <td className="p-3">{result?.outcome_distribution.excellent || 'N/A'}%</td>
                            <td className="p-3">{result?.risk_breakdown.burnout || 'N/A'}%</td>
                            <td className="p-3">{result ? (result.confidence_level * 100).toFixed(0) : 'N/A'}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
