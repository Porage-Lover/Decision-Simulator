import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { createScenario } from '@/db/api';
import { runSimulation, DEFAULT_VARIABLES, DEFAULT_ASSUMPTIONS } from '@/lib/simulation';
import { saveSimulationResult } from '@/db/api';
import VariableSlider from '@/components/simulation/VariableSlider';
import AssumptionsEditor from '@/components/simulation/AssumptionsEditor';
import { Loader2, Play } from 'lucide-react';
import type { Variable, Assumption } from '@/types/types';

export default function CreateSimulation() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [isRunning, setIsRunning] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [timeHorizon, setTimeHorizon] = useState(12);
  const [variables, setVariables] = useState<Record<string, Variable>>({ ...DEFAULT_VARIABLES });
  const [assumptions, setAssumptions] = useState<Assumption[]>([...DEFAULT_ASSUMPTIONS]);

  const handleVariableChange = (name: string, value: number) => {
    setVariables(prev => ({
      ...prev,
      [name]: { ...prev[name], value }
    }));
  };

  const handleVariableReset = (name: string) => {
    setVariables(prev => ({
      ...prev,
      [name]: { ...prev[name], value: DEFAULT_VARIABLES[name].value }
    }));
  };

  const handleResetAllVariables = () => {
    setVariables({ ...DEFAULT_VARIABLES });
  };

  const handleAssumptionsChange = (newAssumptions: Assumption[]) => {
    setAssumptions(newAssumptions);
  };

  const handleResetAssumptions = () => {
    setAssumptions([...DEFAULT_ASSUMPTIONS]);
  };

  const handleRunSimulation = async () => {
    // Validation
    if (!title.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a simulation title',
        variant: 'destructive'
      });
      return;
    }

    if (!optionA.trim() || !optionB.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter both options',
        variant: 'destructive'
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create simulations',
        variant: 'destructive'
      });
      return;
    }

    setIsRunning(true);

    try {
      // Create scenario
      const scenario = await createScenario({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        option_a: optionA.trim(),
        option_b: optionB.trim(),
        time_horizon_weeks: timeHorizon,
        variables,
        assumptions,
        notes: null,
        tags: []
      });

      if (!scenario) {
        throw new Error('Failed to create scenario');
      }

      // Run simulations for both options
      const resultA = runSimulation({
        scenario_id: scenario.id,
        option_name: optionA.trim(),
        variables,
        time_horizon_weeks: timeHorizon
      });

      const resultB = runSimulation({
        scenario_id: scenario.id,
        option_name: optionB.trim(),
        variables,
        time_horizon_weeks: timeHorizon
      });

      // Save results
      await saveSimulationResult(resultA);
      await saveSimulationResult(resultB);

      toast({
        title: 'Success',
        description: 'Simulation completed successfully'
      });

      // Navigate to results page
      navigate(`/results/${scenario.id}`);
    } catch (error) {
      console.error('Error running simulation:', error);
      toast({
        title: 'Error',
        description: 'Failed to run simulation. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Create New Simulation</h1>
          <p className="text-muted-foreground">
            Define your decision scenario and configure variables to model potential outcomes
          </p>
        </div>

        <div className="grid gap-6 @lg:grid-cols-3">
          {/* Main Form */}
          <div className="space-y-6 @lg:col-span-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Scenario Details</CardTitle>
                <CardDescription>
                  Describe the decision you're trying to make
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Simulation Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Study Habits Decision"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide additional context about your decision..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 @md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="optionA">Option A *</Label>
                    <Input
                      id="optionA"
                      placeholder="e.g., Study 2 hours/day"
                      value={optionA}
                      onChange={(e) => setOptionA(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="optionB">Option B *</Label>
                    <Input
                      id="optionB"
                      placeholder="e.g., Study 1 hour/day"
                      value={optionB}
                      onChange={(e) => setOptionB(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeHorizon">Time Horizon (weeks)</Label>
                  <Input
                    id="timeHorizon"
                    type="number"
                    min={1}
                    max={52}
                    value={timeHorizon}
                    onChange={(e) => setTimeHorizon(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    How many weeks into the future to simulate (1-52)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Variables */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Variables</CardTitle>
                    <CardDescription>
                      Adjust the parameters that influence outcomes
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetAllVariables}
                  >
                    Reset All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.values(variables).map((variable) => (
                  <VariableSlider
                    key={variable.name}
                    variable={variable}
                    onChange={(value) => handleVariableChange(variable.name, value)}
                    onReset={() => handleVariableReset(variable.name)}
                    defaultValue={DEFAULT_VARIABLES[variable.name].value}
                  />
                ))}
              </CardContent>
            </Card>

            {/* Assumptions */}
            <AssumptionsEditor
              assumptions={assumptions}
              onChange={handleAssumptionsChange}
              onReset={handleResetAssumptions}
            />
          </div>

          {/* Sidebar */}
          <div className="@lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Ready to Simulate?</CardTitle>
                <CardDescription>
                  Run Monte Carlo simulation to generate outcome distributions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-muted p-4 text-sm">
                  <p className="mb-2 font-medium">What happens next:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• 1000 iterations per option</li>
                    <li>• Probability distributions</li>
                    <li>• Timeline evolution charts</li>
                    <li>• Risk breakdown analysis</li>
                    <li>• Side-by-side comparison</li>
                  </ul>
                </div>

                <Button
                  onClick={handleRunSimulation}
                  disabled={isRunning}
                  className="w-full"
                  size="lg"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Running Simulation...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-5 w-5" />
                      Run Simulation
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  This may take a few seconds
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
