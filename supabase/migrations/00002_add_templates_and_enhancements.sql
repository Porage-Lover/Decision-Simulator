-- Add notes field to scenarios
ALTER TABLE public.scenarios ADD COLUMN IF NOT EXISTS notes text;

-- Add tags field to scenarios
ALTER TABLE public.scenarios ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Create scenario_templates table
CREATE TABLE IF NOT EXISTS public.scenario_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  time_horizon_weeks integer NOT NULL DEFAULT 12,
  variables jsonb NOT NULL DEFAULT '{}'::jsonb,
  assumptions jsonb NOT NULL DEFAULT '[]'::jsonb,
  icon text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create variable_presets table
CREATE TABLE IF NOT EXISTS public.variable_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  variables jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.scenario_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variable_presets ENABLE ROW LEVEL SECURITY;

-- Templates are public (everyone can read)
CREATE POLICY "Anyone can view templates" ON scenario_templates
  FOR SELECT USING (true);

-- Only admins can manage templates
CREATE POLICY "Admins can manage templates" ON scenario_templates
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- Variable presets policies
CREATE POLICY "Users can view their own presets" ON variable_presets
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own presets" ON variable_presets
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own presets" ON variable_presets
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Insert default templates
INSERT INTO public.scenario_templates (name, description, category, option_a, option_b, time_horizon_weeks, variables, assumptions, icon) VALUES
(
  'Study Habits Decision',
  'Compare different study schedules to optimize learning outcomes while managing burnout risk',
  'Education',
  'Study 2 hours/day',
  'Study 1 hour/day',
  12,
  '{"effort": {"name": "effort", "label": "Daily Effort Level", "value": 80, "min": 0, "max": 100, "step": 5, "unit": "%", "description": "How much effort you put in each day"}, "consistency": {"name": "consistency", "label": "Consistency Probability", "value": 70, "min": 0, "max": 100, "step": 5, "unit": "%", "description": "Likelihood of maintaining your routine"}, "burnout_risk": {"name": "burnout_risk", "label": "Burnout Risk", "value": 40, "min": 0, "max": 100, "step": 5, "unit": "%", "description": "Risk of burning out over time"}, "retention": {"name": "retention", "label": "Knowledge Retention", "value": 75, "min": 0, "max": 100, "step": 5, "unit": "%", "description": "How well you retain what you learn"}, "learning_rate": {"name": "learning_rate", "label": "Learning Rate", "value": 70, "min": 0, "max": 100, "step": 5, "unit": "%", "description": "How quickly you acquire new skills"}, "stress": {"name": "stress", "label": "Base Stress Level", "value": 35, "min": 0, "max": 100, "step": 5, "unit": "%", "description": "Your baseline stress level"}}',
  '[{"id": "1", "text": "Consistency drops by 20% after sustained effort over time", "editable": true}, {"id": "2", "text": "Burnout risk increases non-linearly with stress and time", "editable": true}, {"id": "3", "text": "Learning compounds weekly with diminishing returns", "editable": true}]',
  '📚'
),
(
  'Career Path Choice',
  'Evaluate startup vs corporate career paths considering growth, stability, and work-life balance',
  'Career',
  'Join Startup',
  'Join Large Company',
  104,
  '{"effort": {"name": "effort", "label": "Work Intensity", "value": 85, "min": 0, "max": 100, "step": 5, "unit": "%", "description": "How intensely you work"}, "consistency": {"name": "consistency", "label": "Job Stability", "value": 50, "min": 0, "max": 100, "step": 5, "unit": "%", "description": "Likelihood of consistent employment"}, "burnout_risk": {"name": "burnout_risk", "label": "Burnout Risk", "value": 55, "min": 0, "max": 100, "step": 5, "unit": "%", "description": "Risk of career burnout"}, "retention": {"name": "retention", "label": "Skill Retention", "value": 85, "min": 0, "max": 100, "step": 5, "unit": "%", "description": "How well you retain skills"}, "learning_rate": {"name": "learning_rate", "label": "Learning Opportunities", "value": 80, "min": 0, "max": 100, "step": 5, "unit": "%", "description": "Rate of skill acquisition"}, "stress": {"name": "stress", "label": "Work Stress", "value": 60, "min": 0, "max": 100, "step": 5, "unit": "%", "description": "Baseline work stress"}}',
  '[{"id": "1", "text": "Startups offer faster learning but higher risk", "editable": true}, {"id": "2", "text": "Corporate roles provide stability but slower growth", "editable": true}, {"id": "3", "text": "Network effects compound over 2+ years", "editable": true}]',
  '💼'
),
(
  'Fitness Commitment',
  'Compare intensive vs moderate exercise routines for sustainable fitness goals',
  'Health',
  'Intense Workout (5x/week)',
  'Moderate Exercise (3x/week)',
  24,
  '{"effort": {"name": "effort", "label": "Exercise Intensity", "value": 75, "min": 0, "max": 100, "step": 5, "unit": "%", "description": "Workout intensity level"}, "consistency": {"name": "consistency", "label": "Adherence Rate", "value": 65, "min": 0, "max": 100, "step": 5, "unit": "%", "description": "Likelihood of sticking to routine"}, "burnout_risk": {"name": "burnout_risk", "label": "Injury/Burnout Risk", "value": 45, "min": 0, "max": 100, "step": 5, "unit": "%", "description": "Risk of injury or giving up"}, "retention": {"name": "retention", "label": "Fitness Retention", "value": 70, "min": 0, "max": 100, "step": 5, "unit": "%", "description": "How well you maintain fitness"}, "learning_rate": {"name": "learning_rate", "label": "Adaptation Rate", "value": 60, "min": 0, "max": 100, "step": 5, "unit": "%", "description": "How quickly you adapt"}, "stress": {"name": "stress", "label": "Life Stress", "value": 40, "min": 0, "max": 100, "step": 5, "unit": "%", "description": "External stress factors"}}',
  '[{"id": "1", "text": "Intense workouts show faster results but higher dropout", "editable": true}, {"id": "2", "text": "Moderate exercise is more sustainable long-term", "editable": true}, {"id": "3", "text": "Recovery time increases with intensity", "editable": true}]',
  '💪'
),
(
  'Side Project Investment',
  'Decide between aggressive vs balanced time investment in a side project',
  'Business',
  'Full Commitment (20hrs/week)',
  'Balanced Approach (10hrs/week)',
  52,
  '{"effort": {"name": "effort", "label": "Time Investment", "value": 70, "min": 0, "max": 100, "step": 5, "unit": "%", "description": "Weekly time commitment"}, "consistency": {"name": "consistency", "label": "Consistency", "value": 60, "min": 0, "max": 100, "step": 5, "unit": "%", "description": "Ability to maintain schedule"}, "burnout_risk": {"name": "burnout_risk", "label": "Burnout Risk", "value": 50, "min": 0, "max": 100, "step": 5, "unit": "%", "description": "Risk of abandoning project"}, "retention": {"name": "retention", "label": "Skill Retention", "value": 80, "min": 0, "max": 100, "step": 5, "unit": "%", "description": "How well you retain learnings"}, "learning_rate": {"name": "learning_rate", "label": "Learning Speed", "value": 75, "min": 0, "max": 100, "step": 5, "unit": "%", "description": "Rate of skill development"}, "stress": {"name": "stress", "label": "Life Stress", "value": 45, "min": 0, "max": 100, "step": 5, "unit": "%", "description": "External stress level"}}',
  '[{"id": "1", "text": "Side projects require sustained effort over months", "editable": true}, {"id": "2", "text": "Work-life balance affects long-term success", "editable": true}, {"id": "3", "text": "Momentum builds slowly but compounds", "editable": true}]',
  '🚀'
),
(
  'Learning New Skill',
  'Compare intensive bootcamp vs self-paced learning for skill acquisition',
  'Education',
  'Intensive Bootcamp (3 months)',
  'Self-Paced Learning (6 months)',
  26,
  '{"effort": {"name": "effort", "label": "Learning Intensity", "value": 75, "min": 0, "max": 100, "step": 5, "unit": "%", "description": "Daily learning effort"}, "consistency": {"name": "consistency", "label": "Study Consistency", "value": 70, "min": 0, "max": 100, "step": 5, "unit": "%", "description": "Ability to maintain schedule"}, "burnout_risk": {"name": "burnout_risk", "label": "Burnout Risk", "value": 35, "min": 0, "max": 100, "step": 5, "unit": "%", "description": "Risk of giving up"}, "retention": {"name": "retention", "label": "Knowledge Retention", "value": 75, "min": 0, "max": 100, "step": 5, "unit": "%", "description": "How well you retain information"}, "learning_rate": {"name": "learning_rate", "label": "Learning Speed", "value": 65, "min": 0, "max": 100, "step": 5, "unit": "%", "description": "How quickly you learn"}, "stress": {"name": "stress", "label": "Stress Level", "value": 40, "min": 0, "max": 100, "step": 5, "unit": "%", "description": "Overall stress"}}',
  '[{"id": "1", "text": "Intensive learning shows faster results but higher stress", "editable": true}, {"id": "2", "text": "Self-paced allows better work-life balance", "editable": true}, {"id": "3", "text": "Retention improves with spaced repetition", "editable": true}]',
  '🎓'
),
(
  'Investment Strategy',
  'Compare aggressive vs conservative investment approaches for long-term wealth',
  'Finance',
  'Aggressive Portfolio (80% stocks)',
  'Conservative Portfolio (50% stocks)',
  260,
  '{"effort": {"name": "effort", "label": "Active Management", "value": 60, "min": 0, "max": 100, "step": 5, "unit": "%", "description": "Time spent managing investments"}, "consistency": {"name": "consistency", "label": "Contribution Consistency", "value": 85, "min": 0, "max": 100, "step": 5, "unit": "%", "description": "Regular contribution rate"}, "burnout_risk": {"name": "burnout_risk", "label": "Panic Sell Risk", "value": 30, "min": 0, "max": 100, "step": 5, "unit": "%", "description": "Risk of emotional decisions"}, "retention": {"name": "retention", "label": "Strategy Adherence", "value": 80, "min": 0, "max": 100, "step": 5, "unit": "%", "description": "Sticking to strategy"}, "learning_rate": {"name": "learning_rate", "label": "Market Knowledge", "value": 55, "min": 0, "max": 100, "step": 5, "unit": "%", "description": "Investment knowledge growth"}, "stress": {"name": "stress", "label": "Market Stress", "value": 50, "min": 0, "max": 100, "step": 5, "unit": "%", "description": "Stress from volatility"}}',
  '[{"id": "1", "text": "Higher risk portfolios have greater volatility", "editable": true}, {"id": "2", "text": "Long-term investing reduces timing risk", "editable": true}, {"id": "3", "text": "Compound returns accelerate over decades", "editable": true}]',
  '💰'
);