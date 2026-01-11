-- Create user_role enum
CREATE TYPE public.user_role AS ENUM ('user', 'admin');

-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  username text UNIQUE,
  role public.user_role NOT NULL DEFAULT 'user'::public.user_role,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create scenarios table
CREATE TABLE public.scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  option_a text NOT NULL,
  option_b text NOT NULL,
  time_horizon_weeks integer NOT NULL DEFAULT 12,
  variables jsonb NOT NULL DEFAULT '{}'::jsonb,
  assumptions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create simulation_results table
CREATE TABLE public.simulation_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id uuid NOT NULL REFERENCES public.scenarios(id) ON DELETE CASCADE,
  option_name text NOT NULL,
  outcome_distribution jsonb NOT NULL DEFAULT '{}'::jsonb,
  timeline_data jsonb NOT NULL DEFAULT '[]'::jsonb,
  risk_breakdown jsonb NOT NULL DEFAULT '{}'::jsonb,
  confidence_level numeric NOT NULL DEFAULT 0.75,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_scenarios_user_id ON public.scenarios(user_id);
CREATE INDEX idx_simulation_results_scenario_id ON public.simulation_results(scenario_id);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_results ENABLE ROW LEVEL SECURITY;

-- Create helper function to check admin role
CREATE OR REPLACE FUNCTION is_admin(uid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = uid AND p.role = 'admin'::user_role
  );
$$;

-- Profiles policies
CREATE POLICY "Admins have full access to profiles" ON profiles
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id)
  WITH CHECK (role IS NOT DISTINCT FROM (SELECT role FROM profiles WHERE id = auth.uid()));

-- Scenarios policies
CREATE POLICY "Users can view their own scenarios" ON scenarios
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scenarios" ON scenarios
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scenarios" ON scenarios
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scenarios" ON scenarios
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all scenarios" ON scenarios
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));

-- Simulation results policies
CREATE POLICY "Users can view results of their scenarios" ON simulation_results
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM scenarios s
      WHERE s.id = simulation_results.scenario_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create results for their scenarios" ON simulation_results
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM scenarios s
      WHERE s.id = simulation_results.scenario_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete results of their scenarios" ON simulation_results
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM scenarios s
      WHERE s.id = simulation_results.scenario_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all results" ON simulation_results
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));

-- Create public_profiles view
CREATE VIEW public_profiles AS
  SELECT id, username, role, created_at FROM profiles;

-- Create trigger function to sync new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
BEGIN
  SELECT COUNT(*) INTO user_count FROM profiles;
  -- Insert a profile synced with fields collected at signup
  INSERT INTO public.profiles (id, email, username, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    CASE WHEN user_count = 0 THEN 'admin'::public.user_role ELSE 'user'::public.user_role END
  );
  RETURN NEW;
END;
$$;

-- Create trigger to sync users on confirmation
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL)
  EXECUTE FUNCTION handle_new_user();