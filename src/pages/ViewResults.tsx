import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Download, Info, FileText } from 'lucide-react';
import { getScenarioWithResults } from '@/db/api';
import { runSensitivityAnalysis } from '@/lib/simulation';
import { exportToPDF } from '@/lib/pdfExport';
import ProbabilityChart from '@/components/simulation/ProbabilityChart';
import TimelineChart from '@/components/simulation/TimelineChart';
import ComparisonTable from '@/components/simulation/ComparisonTable';
import RiskBreakdownDisplay from '@/components/simulation/RiskBreakdownDisplay';
import SensitivityChart from '@/components/simulation/SensitivityChart';
import { useToast } from '@/hooks/use-toast';
import type { Scenario, SimulationResult, SensitivityAnalysis } from '@/types/types';

export default function ViewResults() {
  const { id } = useParams<{ id: string }>();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [sensitivityAnalysis, setSensitivityAnalysis] = useState<SensitivityAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    
    setIsLoading(true);
    const { scenario: loadedScenario, results: loadedResults } = await getScenarioWithResults(id);
    setScenario(loadedScenario);
    setResults(loadedResults);
    
    // Run sensitivity analysis
    if (loadedScenario) {
      const analysis = runSensitivityAnalysis(
        loadedScenario.variables,
        loadedScenario.time_horizon_weeks
      );
      setSensitivityAnalysis(analysis);
    }
    
    setIsLoading(false);
  };

  const handleExportJSON = () => {
    if (!scenario || results.length === 0) return;

    const exportData = {
      scenario: {
        title: scenario.title,
        description: scenario.description,
        option_a: scenario.option_a,
        option_b: scenario.option_b,
        time_horizon_weeks: scenario.time_horizon_weeks,
        created_at: scenario.created_at
      },
      results: results.map(r => ({
        option: r.option_name,
        outcome_distribution: r.outcome_distribution,
        risk_breakdown: r.risk_breakdown,
        confidence_level: r.confidence_level
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scenario.title.replace(/\s+/g, '_')}_results.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    if (!scenario || results.length < 2) {
      toast({
        title: 'Cannot export',
        description: 'Need both simulation results to generate PDF',
        variant: 'destructive'
      });
      return;
    }

    setIsExporting(true);
    try {
      await exportToPDF(scenario, results[0], results[1]);
      toast({
        title: 'PDF exported successfully',
        description: 'Your report has been downloaded'
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: 'Export failed',
        description: 'Could not generate PDF report',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="mb-8 h-10 w-64 bg-muted" />
          <div className="grid gap-6">
            <Skeleton className="h-96 w-full bg-muted" />
            <Skeleton className="h-96 w-full bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (!scenario || results.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Results Found</CardTitle>
            <CardDescription>
              This simulation doesn't exist or hasn't been run yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const resultA = results.find(r => r.option_name === scenario.option_a);
  const resultB = results.find(r => r.option_name === scenario.option_b);

  if (!resultA || !resultB) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Incomplete Results</CardTitle>
            <CardDescription>
              Results for both options are not available.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="@container min-h-screen p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="glass rounded-2xl p-6">
          <Button asChild variant="ghost" className="mb-4">
            <Link to="/simulations">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Simulations
            </Link>
          </Button>
          
          <div className="flex flex-col gap-4 @md:flex-row @md:items-start @md:justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold gradient-text">{scenario.title}</h1>
              {scenario.description && (
                <p className="text-muted-foreground">{scenario.description}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  {scenario.option_a}
                </Badge>
                <Badge variant="outline" className="bg-secondary/10 text-secondary">
                  {scenario.option_b}
                </Badge>
                <Badge variant="outline">
                  {scenario.time_horizon_weeks} weeks
                </Badge>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleExportJSON} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export JSON
              </Button>
              <Button 
                onClick={handleExportPDF} 
                variant="default" 
                className="gap-2"
                disabled={isExporting}
              >
                <FileText className="h-4 w-4" />
                {isExporting ? 'Generating...' : 'Export PDF'}
              </Button>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <Card className="glass border-primary/50 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Key Insights</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>{resultA.option_name}</strong> has a mean outcome of{' '}
              <strong className="text-primary">{resultA.outcome_distribution.mean}</strong> with{' '}
              <strong>{resultA.outcome_distribution.excellent}%</strong> chance of excellent results.
            </p>
            <p>
              <strong>{resultB.option_name}</strong> has a mean outcome of{' '}
              <strong className="text-secondary">{resultB.outcome_distribution.mean}</strong> with{' '}
              <strong>{resultB.outcome_distribution.excellent}%</strong> chance of excellent results.
            </p>
            <p className="text-muted-foreground">
              Confidence levels: {resultA.option_name} ({(resultA.confidence_level * 100).toFixed(0)}%),{' '}
              {resultB.option_name} ({(resultB.confidence_level * 100).toFixed(0)}%)
            </p>
          </CardContent>
        </Card>

        {/* Comparison Table */}
        <div className="mb-6">
          <ComparisonTable optionA={resultA} optionB={resultB} />
        </div>

        {/* Probability Distributions */}
        <div className="mb-6 grid gap-6 @lg:grid-cols-2">
          <ProbabilityChart
            distribution={resultA.outcome_distribution}
            title={`${resultA.option_name} - Outcome Distribution`}
            color="hsl(var(--chart-1))"
          />
          <ProbabilityChart
            distribution={resultB.outcome_distribution}
            title={`${resultB.option_name} - Outcome Distribution`}
            color="hsl(var(--chart-2))"
          />
        </div>

        {/* Timeline Evolution */}
        <div className="mb-6 grid gap-6 @lg:grid-cols-2">
          <TimelineChart
            data={resultA.timeline_data}
            title={`${resultA.option_name} - Timeline Evolution`}
          />
          <TimelineChart
            data={resultB.timeline_data}
            title={`${resultB.option_name} - Timeline Evolution`}
          />
        </div>

        {/* Risk Breakdown */}
        <div className="mb-6 grid gap-6 @lg:grid-cols-2">
          <RiskBreakdownDisplay
            risks={resultA.risk_breakdown}
            title={`${resultA.option_name} - Risk Analysis`}
          />
          <RiskBreakdownDisplay
            risks={resultB.risk_breakdown}
            title={`${resultB.option_name} - Risk Analysis`}
          />
        </div>

        {/* Sensitivity Analysis */}
        {sensitivityAnalysis && (
          <div className="mb-6">
            <SensitivityChart analysis={sensitivityAnalysis} />
          </div>
        )}

        {/* Assumptions */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">Simulation Assumptions</CardTitle>
            <CardDescription>
              These assumptions were used to model the outcomes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {scenario.assumptions.map((assumption) => (
                <li key={assumption.id} className="flex gap-2 text-sm">
                  <span className="text-muted-foreground">•</span>
                  <span>{assumption.text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
