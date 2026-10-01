CREATE TABLE public.kpi_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  kpi_code text NOT NULL,
  period text NOT NULL,
  weight numeric NOT NULL DEFAULT 20 CHECK (weight >= 0 AND weight <= 100),
  target numeric,
  objective text,
  updated_by uuid NOT NULL DEFAULT auth.uid(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, kpi_code, period)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kpi_settings TO authenticated;
GRANT ALL ON public.kpi_settings TO service_role;
ALTER TABLE public.kpi_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own KPI settings" ON public.kpi_settings FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "SPV read division KPI settings" ON public.kpi_settings FOR SELECT TO authenticated USING (public.is_spv_of(public.user_division(user_id)));
CREATE POLICY "Managers read KPI settings" ON public.kpi_settings FOR SELECT TO authenticated USING (public.is_manager());
CREATE POLICY "Managers manage KPI settings" ON public.kpi_settings FOR ALL TO authenticated USING (public.is_manager()) WITH CHECK (public.is_manager());

CREATE TABLE public.kpi_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  kpi_code text NOT NULL,
  entry_date date NOT NULL DEFAULT current_date,
  value_a numeric NOT NULL,
  value_b numeric,
  note text NOT NULL DEFAULT '',
  document_id uuid,
  corrected_value_a numeric,
  corrected_value_b numeric,
  correction_reason text,
  corrected_by uuid,
  corrected_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, kpi_code, entry_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kpi_entries TO authenticated;
GRANT ALL ON public.kpi_entries TO service_role;
ALTER TABLE public.kpi_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own KPI entries" ON public.kpi_entries FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users add own KPI entries" ON public.kpi_entries FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own uncorrected KPI entries" ON public.kpi_entries FOR UPDATE TO authenticated USING (user_id = auth.uid() AND corrected_by IS NULL) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users delete own uncorrected KPI entries" ON public.kpi_entries FOR DELETE TO authenticated USING (user_id = auth.uid() AND corrected_by IS NULL);
CREATE POLICY "SPV read division KPI entries" ON public.kpi_entries FOR SELECT TO authenticated USING (public.is_spv_of(public.user_division(user_id)));
CREATE POLICY "SPV correct division KPI entries" ON public.kpi_entries FOR UPDATE TO authenticated USING (public.is_spv_of(public.user_division(user_id))) WITH CHECK (public.is_spv_of(public.user_division(user_id)) AND corrected_by = auth.uid() AND correction_reason IS NOT NULL);
CREATE POLICY "Managers manage KPI entries" ON public.kpi_entries FOR ALL TO authenticated USING (public.is_manager()) WITH CHECK (public.is_manager());

CREATE INDEX kpi_entries_user_period_idx ON public.kpi_entries (user_id, entry_date);
CREATE INDEX kpi_settings_user_period_idx ON public.kpi_settings (user_id, period);