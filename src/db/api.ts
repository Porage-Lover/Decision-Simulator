// API layer for Supabase database operations

import { supabase } from './supabase';
import type { Scenario, SimulationResult, Profile, ScenarioTemplate, VariablePreset } from '@/types/types';

// Profile operations
export async function getCurrentProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

export async function getAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }

  return Array.isArray(data) ? data : [];
}

export async function updateProfileRole(userId: string, role: 'user' | 'admin'): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId);

  if (error) {
    console.error('Error updating profile role:', error);
    return false;
  }

  return true;
}

// Scenario operations
export async function createScenario(scenario: Omit<Scenario, 'id' | 'created_at' | 'updated_at'>): Promise<Scenario | null> {
  const { data, error } = await supabase
    .from('scenarios')
    .insert({
      ...scenario,
      variables: scenario.variables || {},
      assumptions: scenario.assumptions || [],
      notes: scenario.notes || null,
      tags: scenario.tags || []
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating scenario:', error);
    return null;
  }

  return data;
}

export async function getScenario(id: string): Promise<Scenario | null> {
  const { data, error } = await supabase
    .from('scenarios')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching scenario:', error);
    return null;
  }

  return data;
}

export async function getUserScenarios(limit?: number): Promise<Scenario[]> {
  let query = supabase
    .from('scenarios')
    .select('*')
    .order('updated_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching user scenarios:', error);
    return [];
  }

  return Array.isArray(data) ? data : [];
}

export async function updateScenario(id: string, updates: Partial<Scenario>): Promise<boolean> {
  const { error } = await supabase
    .from('scenarios')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating scenario:', error);
    return false;
  }

  return true;
}

export async function deleteScenario(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('scenarios')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting scenario:', error);
    return false;
  }

  return true;
}

// Simulation result operations
export async function saveSimulationResult(result: Omit<SimulationResult, 'id' | 'created_at'>): Promise<SimulationResult | null> {
  const { data, error } = await supabase
    .from('simulation_results')
    .insert({
      ...result,
      outcome_distribution: result.outcome_distribution || {},
      timeline_data: result.timeline_data || [],
      risk_breakdown: result.risk_breakdown || {}
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error saving simulation result:', error);
    return null;
  }

  return data;
}

export async function getSimulationResults(scenarioId: string): Promise<SimulationResult[]> {
  const { data, error } = await supabase
    .from('simulation_results')
    .select('*')
    .eq('scenario_id', scenarioId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching simulation results:', error);
    return [];
  }

  return Array.isArray(data) ? data : [];
}

export async function deleteSimulationResults(scenarioId: string): Promise<boolean> {
  const { error } = await supabase
    .from('simulation_results')
    .delete()
    .eq('scenario_id', scenarioId);

  if (error) {
    console.error('Error deleting simulation results:', error);
    return false;
  }

  return true;
}

// Combined operations
export async function getScenarioWithResults(scenarioId: string): Promise<{
  scenario: Scenario | null;
  results: SimulationResult[];
}> {
  const scenario = await getScenario(scenarioId);
  const results = scenario ? await getSimulationResults(scenarioId) : [];

  return { scenario, results };
}

// Template operations
export async function getAllTemplates(): Promise<ScenarioTemplate[]> {
  const { data, error } = await supabase
    .from('scenario_templates')
    .select('*')
    .order('category', { ascending: true });

  if (error) {
    console.error('Error fetching templates:', error);
    return [];
  }

  return Array.isArray(data) ? data : [];
}

export async function getTemplatesByCategory(category: string): Promise<ScenarioTemplate[]> {
  const { data, error } = await supabase
    .from('scenario_templates')
    .select('*')
    .eq('category', category)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching templates by category:', error);
    return [];
  }

  return Array.isArray(data) ? data : [];
}

// Variable preset operations
export async function getUserPresets(): Promise<VariablePreset[]> {
  const { data, error } = await supabase
    .from('variable_presets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching presets:', error);
    return [];
  }

  return Array.isArray(data) ? data : [];
}

export async function createPreset(preset: Omit<VariablePreset, 'id' | 'created_at'>): Promise<VariablePreset | null> {
  const { data, error } = await supabase
    .from('variable_presets')
    .insert({
      ...preset,
      variables: preset.variables || {}
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating preset:', error);
    return null;
  }

  return data;
}

export async function deletePreset(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('variable_presets')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting preset:', error);
    return false;
  }

  return true;
}
