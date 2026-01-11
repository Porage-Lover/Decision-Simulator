// Database types matching Supabase schema

export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  email: string | null;
  username: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Variable {
  name: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  description?: string;
}

export interface Assumption {
  id: string;
  text: string;
  editable: boolean;
}

export interface Scenario {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  option_a: string;
  option_b: string;
  time_horizon_weeks: number;
  variables: Record<string, Variable>;
  assumptions: Assumption[];
  notes: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ScenarioTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  option_a: string;
  option_b: string;
  time_horizon_weeks: number;
  variables: Record<string, Variable>;
  assumptions: Assumption[];
  icon: string | null;
  created_at: string;
}

export interface VariablePreset {
  id: string;
  user_id: string;
  name: string;
  variables: Record<string, Variable>;
  created_at: string;
}

export interface OutcomeDistribution {
  excellent: number;  // Probability of excellent outcome (90-100)
  good: number;       // Probability of good outcome (75-89)
  moderate: number;   // Probability of moderate outcome (60-74)
  poor: number;       // Probability of poor outcome (0-59)
  mean: number;       // Mean outcome score
  median: number;     // Median outcome score
  stdDev: number;     // Standard deviation
}

export interface TimelineDataPoint {
  week: number;
  motivation: number;
  skill: number;
  stress: number;
  consistency: number;
  outcome: number;
}

export interface RiskBreakdown {
  burnout: number;
  dropout: number;
  plateau: number;
  success: number;
}

export interface SimulationResult {
  id: string;
  scenario_id: string;
  option_name: string;
  outcome_distribution: OutcomeDistribution;
  timeline_data: TimelineDataPoint[];
  risk_breakdown: RiskBreakdown;
  confidence_level: number;
  created_at: string;
}

export interface SimulationInput {
  scenario_id: string;
  option_name: string;
  variables: Record<string, Variable>;
  time_horizon_weeks: number;
}

export interface ComparisonData {
  optionA: SimulationResult;
  optionB: SimulationResult;
}

// Form types
export interface ScenarioFormData {
  title: string;
  description: string;
  option_a: string;
  option_b: string;
  time_horizon_weeks: number;
}

// Sensitivity analysis types
export interface SensitivityResult {
  variableName: string;
  variableLabel: string;
  impact: number; // Percentage impact on outcome
  baselineOutcome: number;
  increasedOutcome: number;
  decreasedOutcome: number;
}

export interface SensitivityAnalysis {
  results: SensitivityResult[];
  topInfluencers: SensitivityResult[];
}
