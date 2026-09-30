CREATE TYPE public.app_role AS ENUM ('manager','spv','staf');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
CREATE OR REPLACE FUNCTION public.user_division(_user_id uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT division FROM public.profiles WHERE id = _user_id
$$;
CREATE OR REPLACE FUNCTION public.my_division()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT division FROM public.profiles WHERE id = auth.uid()
$$;
CREATE OR REPLACE FUNCTION public.is_manager()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'manager')
$$;
CREATE OR REPLACE FUNCTION public.is_spv_of(_division text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'spv') AND public.my_division() = _division
$$;

CREATE POLICY "Read roles" ON public.user_roles FOR SELECT TO authenticated USING (true);

-- profiles
ALTER TABLE public.profiles ALTER COLUMN division SET DEFAULT 'HRD';
CREATE POLICY "All signed-in read profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manager updates profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.is_manager());

CREATE OR REPLACE FUNCTION public.guard_profile_division()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.division IS DISTINCT FROM OLD.division AND auth.uid() IS NOT NULL AND NOT public.is_manager() THEN
    RAISE EXCEPTION 'Hanya Manager yang dapat mengubah divisi';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END; $$;
CREATE TRIGGER profiles_guard BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.guard_profile_division();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, division)
  VALUES (NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'display_name',''), NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'division',''), 'HRD'))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, CASE WHEN EXISTS (SELECT 1 FROM public.user_roles) THEN 'staf'::public.app_role ELSE 'manager'::public.app_role END)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END; $$;

-- backfill roles for existing users
INSERT INTO public.user_roles (user_id, role)
SELECT p.id, CASE WHEN row_number() OVER (ORDER BY p.created_at) = 1 THEN 'manager'::public.app_role ELSE 'staf'::public.app_role END
FROM public.profiles p ON CONFLICT (user_id) DO NOTHING;

-- tasks
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  division text NOT NULL DEFAULT public.my_division(),
  title text NOT NULL,
  project text NOT NULL DEFAULT 'Tambahan',
  hours numeric NOT NULL DEFAULT 1,
  done boolean NOT NULL DEFAULT false,
  task_date date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tasks read" ON public.tasks FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_manager() OR public.is_spv_of(division));
CREATE POLICY "Tasks insert own" ON public.tasks FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Tasks update own" ON public.tasks FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Tasks delete own" ON public.tasks FOR DELETE TO authenticated USING (user_id = auth.uid());

-- board cards
CREATE TABLE public.board_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  from_division text NOT NULL,
  to_division text NOT NULL,
  due_date date NOT NULL DEFAULT (current_date + 5),
  col int NOT NULL DEFAULT 0,
  on_time boolean,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.board_cards TO authenticated;
GRANT ALL ON public.board_cards TO service_role;
ALTER TABLE public.board_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cards read" ON public.board_cards FOR SELECT TO authenticated USING (true);
CREATE POLICY "Cards insert" ON public.board_cards FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Cards update" ON public.board_cards FOR UPDATE TO authenticated USING (
  public.is_manager() OR created_by = auth.uid() OR public.my_division() IN (from_division, to_division));
CREATE POLICY "Cards delete" ON public.board_cards FOR DELETE TO authenticated USING (
  public.is_manager() OR created_by = auth.uid() OR public.is_spv_of(from_division) OR public.is_spv_of(to_division));

-- help requests
CREATE TABLE public.help_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  from_division text NOT NULL DEFAULT public.my_division(),
  to_division text NOT NULL,
  goal text,
  due_days int NOT NULL DEFAULT 5,
  status text NOT NULL DEFAULT 'diajukan',
  card_id uuid,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.help_requests TO authenticated;
GRANT ALL ON public.help_requests TO service_role;
ALTER TABLE public.help_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Req read" ON public.help_requests FOR SELECT TO authenticated USING (
  created_by = auth.uid() OR public.is_manager() OR public.my_division() IN (from_division, to_division));
CREATE POLICY "Req insert" ON public.help_requests FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Req update" ON public.help_requests FOR UPDATE TO authenticated USING (public.is_manager() OR public.is_spv_of(to_division));
CREATE POLICY "Req delete" ON public.help_requests FOR DELETE TO authenticated USING (created_by = auth.uid() OR public.is_manager());

-- documents
CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  size bigint NOT NULL DEFAULT 0,
  mime text,
  context text NOT NULL DEFAULT 'Berbagi',
  category text NOT NULL DEFAULT 'Bukti kerja',
  division text NOT NULL DEFAULT public.my_division(),
  uploaded_by uuid NOT NULL DEFAULT auth.uid(),
  uploader_name text NOT NULL DEFAULT '',
  storage_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Docs read" ON public.documents FOR SELECT TO authenticated USING (
  uploaded_by = auth.uid() OR public.is_manager() OR division = public.my_division());
CREATE POLICY "Docs insert" ON public.documents FOR INSERT TO authenticated WITH CHECK (uploaded_by = auth.uid());
CREATE POLICY "Docs update own" ON public.documents FOR UPDATE TO authenticated USING (uploaded_by = auth.uid());
CREATE POLICY "Docs delete" ON public.documents FOR DELETE TO authenticated USING (
  uploaded_by = auth.uid() OR public.is_manager() OR public.is_spv_of(division));

-- shared goals
CREATE TABLE public.shared_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  division text NOT NULL,
  title text NOT NULL,
  target text NOT NULL DEFAULT '',
  progress int NOT NULL DEFAULT 0,
  linked boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shared_goals TO authenticated;
GRANT ALL ON public.shared_goals TO service_role;
ALTER TABLE public.shared_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Goals read" ON public.shared_goals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Goals insert" ON public.shared_goals FOR INSERT TO authenticated WITH CHECK (public.is_manager() OR public.is_spv_of(division));
CREATE POLICY "Goals update" ON public.shared_goals FOR UPDATE TO authenticated USING (public.is_manager() OR public.is_spv_of(division));
CREATE POLICY "Goals delete" ON public.shared_goals FOR DELETE TO authenticated USING (public.is_manager());

-- sharing sessions
CREATE TABLE public.sharing_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  division text NOT NULL DEFAULT public.my_division(),
  title text NOT NULL DEFAULT 'Sesi berbagi',
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.sharing_sessions TO authenticated;
GRANT ALL ON public.sharing_sessions TO service_role;
ALTER TABLE public.sharing_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sessions read" ON public.sharing_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Sessions insert" ON public.sharing_sessions FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Sessions delete" ON public.sharing_sessions FOR DELETE TO authenticated USING (created_by = auth.uid() OR public.is_manager());

-- obstacles & daily reports
CREATE TABLE public.obstacles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  division text NOT NULL DEFAULT public.my_division(),
  note text NOT NULL,
  resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.obstacles TO authenticated;
GRANT ALL ON public.obstacles TO service_role;
ALTER TABLE public.obstacles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Obs read" ON public.obstacles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_manager() OR public.is_spv_of(division));
CREATE POLICY "Obs insert" ON public.obstacles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Obs update" ON public.obstacles FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.is_manager() OR public.is_spv_of(division));

CREATE TABLE public.daily_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  division text NOT NULL DEFAULT public.my_division(),
  report_date date NOT NULL DEFAULT current_date,
  tasks_done int NOT NULL DEFAULT 0,
  tasks_total int NOT NULL DEFAULT 0,
  hours numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, report_date)
);
GRANT SELECT, INSERT, UPDATE ON public.daily_reports TO authenticated;
GRANT ALL ON public.daily_reports TO service_role;
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Rep read" ON public.daily_reports FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_manager() OR public.is_spv_of(division));
CREATE POLICY "Rep insert" ON public.daily_reports FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Rep update" ON public.daily_reports FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- KPI reviews
CREATE TABLE public.kpi_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  period text NOT NULL,
  work_score int NOT NULL DEFAULT 85,
  note text NOT NULL DEFAULT '',
  reviewer_id uuid DEFAULT auth.uid(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, period)
);
GRANT SELECT, INSERT, UPDATE ON public.kpi_reviews TO authenticated;
GRANT ALL ON public.kpi_reviews TO service_role;
ALTER TABLE public.kpi_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "KPI read" ON public.kpi_reviews FOR SELECT TO authenticated USING (
  user_id = auth.uid() OR public.is_manager() OR public.is_spv_of(public.user_division(user_id)));
CREATE POLICY "KPI insert" ON public.kpi_reviews FOR INSERT TO authenticated WITH CHECK (
  user_id <> auth.uid() AND (public.is_manager() OR public.is_spv_of(public.user_division(user_id))));
CREATE POLICY "KPI update" ON public.kpi_reviews FOR UPDATE TO authenticated USING (
  user_id <> auth.uid() AND (public.is_manager() OR public.is_spv_of(public.user_division(user_id))));

-- seed shared goals
INSERT INTO public.shared_goals (division, title, target, progress) VALUES
('MR','Akurasi laporan manajemen risiko','100% laporan tepat waktu',80),
('MR','Mitigasi risiko prioritas','10 risiko termitigasi',60),
('HRD','Rekrutmen posisi kosong','Terisi ≤ 30 hari',70),
('HRD','Pelatihan karyawan','20 jam/karyawan/tahun',55),
('HRD','Retensi karyawan','Turnover < 5%',85),
('Finance','Penutupan buku bulanan','Selesai H+5',75),
('Finance','Efisiensi biaya operasional','Hemat 5%',50),
('NOC','Uptime jaringan','99,9%',92),
('NOC','Respon gangguan','< 15 menit',80),
('NOC','Pemeliharaan preventif','100% jadwal terlaksana',70),
('Keuangan','Penagihan piutang','Kolektibilitas 95%',72),
('Keuangan','Pembayaran vendor tepat waktu','100% sesuai termin',88),
('Procurement','Lead time pengadaan','≤ 14 hari',65),
('Procurement','Penghematan pengadaan','3% dari anggaran',40),
('Customer Care','Kepuasan pelanggan (CSAT)','≥ 90%',84),
('Customer Care','Penyelesaian keluhan','≤ 24 jam',78),
('Corporate & Government Technical Support','SLA dukungan teknis korporat','≥ 98%',86),
('Corporate & Government Technical Support','Aktivasi layanan pelanggan baru','≤ 7 hari',70),
('OPJ','Penyelesaian pekerjaan jaringan','100% sesuai jadwal',68),
('OPJ','Kualitas instalasi','Rework < 3%',75),
('PPJ','Perencanaan pembangunan jaringan','Desain tepat waktu 95%',62),
('PPJ','Realisasi anggaran proyek','Deviasi < 5%',58),
('Help Desk','SLA tiket','95% tiket tertangani ≤ 4 jam',81),
('Help Desk','First call resolution','≥ 75%',69),
('Sales Retail','Pelanggan baru','500 pelanggan/bulan',64),
('Sales Retail','Pendapatan retail','Rp 2 M/bulan',57),
('Sales Corporate & Government','Nilai kontrak baru','Rp 10 M/kuartal',45),
('Sales Corporate & Government','Perpanjangan kontrak','Renewal ≥ 90%',82),
('Legal','Review kontrak','≤ 3 hari kerja',77),
('Legal','Kepatuhan regulasi','0 temuan mayor',90),
('Marketing','Leads berkualitas','1.000 leads/bulan',60),
('Marketing','Efektivitas kampanye','ROI ≥ 3x',52);
