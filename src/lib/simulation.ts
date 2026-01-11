// Monte Carlo simulation engine for Decision Simulator

import type {
  Variable,
  OutcomeDistribution,
  TimelineDataPoint,
  RiskBreakdown,
  SimulationInput,
  SimulationResult
} from '@/types/types';

const ITERATIONS = 1000; // Number of Monte Carlo iterations

// Helper function to generate random value with normal distribution
function randomNormal(mean: number, stdDev: number): number {
  // Box-Muller transform
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z0 * stdDev;
}

// Helper function to clamp value between min and max
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// Calculate outcome for a single iteration
function calculateSingleOutcome(
  variables: Record<string, Variable>,
  week: number,
  totalWeeks: number
): number {
  const effort = variables.effort?.value || 50;
  const consistency = variables.consistency?.value || 70;
  const burnoutRisk = variables.burnout_risk?.value || 30;
  const retention = variables.retention?.value || 80;
  const learningRate = variables.learning_rate?.value || 60;
  const stress = variables.stress?.value || 40;

  // Time-based decay and growth factors
  const timeProgress = week / totalWeeks;
  
  // Motivation decay (decreases over time)
  const motivationDecay = Math.exp(-0.5 * timeProgress);
  
  // Skill compounding (increases over time)
  const skillGrowth = 1 + (learningRate / 100) * Math.log(1 + week);
  
  // Fatigue accumulation (increases non-linearly)
  const fatigueAccumulation = Math.pow(timeProgress, 2);
  
  // Burnout penalty (increases with stress and time)
  const burnoutPenalty = (burnoutRisk / 100) * (stress / 100) * fatigueAccumulation * 30;
  
  // Consistency drops after sustained effort
  const consistencyFactor = consistency / 100;
  const adjustedConsistency = consistencyFactor * (1 - 0.2 * fatigueAccumulation);
  
  // Calculate base outcome
  const baseOutcome = (
    (effort / 100) * 
    adjustedConsistency * 
    (retention / 100) * 
    skillGrowth * 
    motivationDecay * 
    100
  );
  
  // Apply burnout penalty
  const finalOutcome = baseOutcome - burnoutPenalty;
  
  // Add random variance (±10%)
  const variance = randomNormal(0, 10);
  
  return clamp(finalOutcome + variance, 0, 100);
}

// Calculate timeline data for visualization
function calculateTimeline(
  variables: Record<string, Variable>,
  totalWeeks: number
): TimelineDataPoint[] {
  const timeline: TimelineDataPoint[] = [];
  const effort = variables.effort?.value || 50;
  const consistency = variables.consistency?.value || 70;
  const burnoutRisk = variables.burnout_risk?.value || 30;
  const learningRate = variables.learning_rate?.value || 60;
  const stress = variables.stress?.value || 40;

  for (let week = 0; week <= totalWeeks; week++) {
    const timeProgress = week / totalWeeks;
    
    // Calculate each metric
    const motivation = clamp(
      100 * Math.exp(-0.5 * timeProgress) + randomNormal(0, 5),
      0,
      100
    );
    
    const skill = clamp(
      50 + (learningRate / 100) * 50 * Math.log(1 + week) + randomNormal(0, 3),
      0,
      100
    );
    
    const currentStress = clamp(
      stress + 20 * Math.pow(timeProgress, 2) + randomNormal(0, 5),
      0,
      100
    );
    
    const currentConsistency = clamp(
      consistency * (1 - 0.2 * Math.pow(timeProgress, 2)) + randomNormal(0, 5),
      0,
      100
    );
    
    const outcome = calculateSingleOutcome(variables, week, totalWeeks);
    
    timeline.push({
      week,
      motivation: Math.round(motivation),
      skill: Math.round(skill),
      stress: Math.round(currentStress),
      consistency: Math.round(currentConsistency),
      outcome: Math.round(outcome)
    });
  }
  
  return timeline;
}

// Calculate risk breakdown
function calculateRiskBreakdown(
  outcomes: number[],
  variables: Record<string, Variable>
): RiskBreakdown {
  const burnoutRisk = variables.burnout_risk?.value || 30;
  const stress = variables.stress?.value || 40;
  const consistency = variables.consistency?.value || 70;
  
  // Calculate probabilities based on outcomes and variables
  const poorOutcomes = outcomes.filter(o => o < 60).length / outcomes.length;
  const excellentOutcomes = outcomes.filter(o => o >= 90).length / outcomes.length;
  
  const burnout = clamp((burnoutRisk / 100) * (stress / 100) * 100, 0, 100);
  const dropout = clamp(poorOutcomes * 100 * (1 - consistency / 100), 0, 100);
  const plateau = clamp((1 - excellentOutcomes) * 50, 0, 100);
  const success = clamp(excellentOutcomes * 100, 0, 100);
  
  return {
    burnout: Math.round(burnout),
    dropout: Math.round(dropout),
    plateau: Math.round(plateau),
    success: Math.round(success)
  };
}

// Calculate outcome distribution from Monte Carlo iterations
function calculateOutcomeDistribution(outcomes: number[]): OutcomeDistribution {
  const sorted = [...outcomes].sort((a, b) => a - b);
  
  const excellent = outcomes.filter(o => o >= 90).length / outcomes.length;
  const good = outcomes.filter(o => o >= 75 && o < 90).length / outcomes.length;
  const moderate = outcomes.filter(o => o >= 60 && o < 75).length / outcomes.length;
  const poor = outcomes.filter(o => o < 60).length / outcomes.length;
  
  const mean = outcomes.reduce((sum, o) => sum + o, 0) / outcomes.length;
  const median = sorted[Math.floor(sorted.length / 2)];
  
  const variance = outcomes.reduce((sum, o) => sum + Math.pow(o - mean, 2), 0) / outcomes.length;
  const stdDev = Math.sqrt(variance);
  
  return {
    excellent: Math.round(excellent * 100),
    good: Math.round(good * 100),
    moderate: Math.round(moderate * 100),
    poor: Math.round(poor * 100),
    mean: Math.round(mean * 10) / 10,
    median: Math.round(median * 10) / 10,
    stdDev: Math.round(stdDev * 10) / 10
  };
}

// Main simulation function
export function runSimulation(input: SimulationInput): Omit<SimulationResult, 'id' | 'created_at'> {
  const { variables, time_horizon_weeks, option_name, scenario_id } = input;
  
  // Run Monte Carlo iterations
  const finalOutcomes: number[] = [];
  
  for (let i = 0; i < ITERATIONS; i++) {
    const outcome = calculateSingleOutcome(variables, time_horizon_weeks, time_horizon_weeks);
    finalOutcomes.push(outcome);
  }
  
  // Calculate distribution
  const outcome_distribution = calculateOutcomeDistribution(finalOutcomes);
  
  // Calculate timeline (single representative run)
  const timeline_data = calculateTimeline(variables, time_horizon_weeks);
  
  // Calculate risk breakdown
  const risk_breakdown = calculateRiskBreakdown(finalOutcomes, variables);
  
  // Calculate confidence level based on standard deviation
  const confidence_level = Math.max(0.5, Math.min(0.95, 1 - (outcome_distribution.stdDev / 100)));
  
  return {
    scenario_id,
    option_name,
    outcome_distribution,
    timeline_data,
    risk_breakdown,
    confidence_level: Math.round(confidence_level * 100) / 100
  };
}

// Default variable configurations
export const DEFAULT_VARIABLES: Record<string, Variable> = {
  effort: {
    name: 'effort',
    label: 'Daily Effort Level',
    value: 70,
    min: 0,
    max: 100,
    step: 5,
    unit: '%',
    description: 'How much effort you put in each day'
  },
  consistency: {
    name: 'consistency',
    label: 'Consistency Probability',
    value: 75,
    min: 0,
    max: 100,
    step: 5,
    unit: '%',
    description: 'Likelihood of maintaining your routine'
  },
  burnout_risk: {
    name: 'burnout_risk',
    label: 'Burnout Risk',
    value: 30,
    min: 0,
    max: 100,
    step: 5,
    unit: '%',
    description: 'Risk of burning out over time'
  },
  retention: {
    name: 'retention',
    label: 'Knowledge Retention',
    value: 80,
    min: 0,
    max: 100,
    step: 5,
    unit: '%',
    description: 'How well you retain what you learn'
  },
  learning_rate: {
    name: 'learning_rate',
    label: 'Learning Rate',
    value: 65,
    min: 0,
    max: 100,
    step: 5,
    unit: '%',
    description: 'How quickly you acquire new skills'
  },
  stress: {
    name: 'stress',
    label: 'Base Stress Level',
    value: 40,
    min: 0,
    max: 100,
    step: 5,
    unit: '%',
    description: 'Your baseline stress level'
  }
};

// Default assumptions
export const DEFAULT_ASSUMPTIONS = [
  {
    id: '1',
    text: 'Consistency drops by 20% after sustained effort over time',
    editable: true
  },
  {
    id: '2',
    text: 'Burnout risk increases non-linearly with stress and time',
    editable: true
  },
  {
    id: '3',
    text: 'Learning compounds weekly with diminishing returns',
    editable: true
  },
  {
    id: '4',
    text: 'Motivation naturally decays over time without external factors',
    editable: true
  },
  {
    id: '5',
    text: 'Skill growth follows logarithmic curve based on learning rate',
    editable: true
  }
];

// Sensitivity Analysis
export function runSensitivityAnalysis(
  variables: Record<string, Variable>,
  timeHorizonWeeks: number
): import('@/types/types').SensitivityAnalysis {
  const results: import('@/types/types').SensitivityResult[] = [];
  const variancePercentage = 20; // Test ±20% change

  // Calculate baseline outcome
  const baselineOutcomes: number[] = [];
  for (let i = 0; i < 100; i++) {
    baselineOutcomes.push(calculateSingleOutcome(variables, timeHorizonWeeks, timeHorizonWeeks));
  }
  const baselineOutcome = baselineOutcomes.reduce((sum, o) => sum + o, 0) / baselineOutcomes.length;

  // Test each variable
  Object.values(variables).forEach((variable) => {
    // Test increased value (+20%)
    const increasedValue = Math.min(variable.max, variable.value * (1 + variancePercentage / 100));
    const increasedVars = {
      ...variables,
      [variable.name]: { ...variable, value: increasedValue }
    };
    const increasedOutcomes: number[] = [];
    for (let i = 0; i < 100; i++) {
      increasedOutcomes.push(calculateSingleOutcome(increasedVars, timeHorizonWeeks, timeHorizonWeeks));
    }
    const increasedOutcome = increasedOutcomes.reduce((sum, o) => sum + o, 0) / increasedOutcomes.length;

    // Test decreased value (-20%)
    const decreasedValue = Math.max(variable.min, variable.value * (1 - variancePercentage / 100));
    const decreasedVars = {
      ...variables,
      [variable.name]: { ...variable, value: decreasedValue }
    };
    const decreasedOutcomes: number[] = [];
    for (let i = 0; i < 100; i++) {
      decreasedOutcomes.push(calculateSingleOutcome(decreasedVars, timeHorizonWeeks, timeHorizonWeeks));
    }
    const decreasedOutcome = decreasedOutcomes.reduce((sum, o) => sum + o, 0) / decreasedOutcomes.length;

    // Calculate impact (average absolute change)
    const impact = Math.abs(increasedOutcome - baselineOutcome) + Math.abs(baselineOutcome - decreasedOutcome);

    results.push({
      variableName: variable.name,
      variableLabel: variable.label,
      impact,
      baselineOutcome,
      increasedOutcome,
      decreasedOutcome
    });
  });

  // Sort by impact (descending)
  results.sort((a, b) => b.impact - a.impact);

  // Get top 3 influencers
  const topInfluencers = results.slice(0, 3);

  return {
    results,
    topInfluencers
  };
}
