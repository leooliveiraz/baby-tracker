-- =============================================
-- BABY TRACKER — Supabase Schema
-- Ordem correta: Tables → Functions → Indexes → Triggers → RLS
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. TABLES (na ordem de dependência)
-- =============================================

-- profiles → auth.users
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- babies → auth.users
CREATE TABLE IF NOT EXISTS babies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  mother_name TEXT,
  father_name TEXT,
  photo TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  avatar_url TEXT
);

-- baby_caregivers → babies, auth.users
CREATE TABLE IF NOT EXISTS baby_caregivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  baby_id UUID NOT NULL REFERENCES babies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'caregiver',
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(baby_id, user_id)
);

-- records → babies, auth.users
CREATE TABLE IF NOT EXISTS records (
  id UUID PRIMARY KEY,
  baby_id UUID NOT NULL REFERENCES babies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  type TEXT NOT NULL CHECK (type IN 
('feeding','diaper','sleep','activity','growth','vaccine','medication','fever','appointment','diary')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 2. FUNCTIONS (tabelas já existem)
-- =============================================

-- Usada nas policies de babies: verifica se user é cuidador
CREATE OR REPLACE FUNCTION public.is_caregiver(baby_id UUID, user_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.baby_caregivers
    WHERE baby_caregivers.baby_id = $1 AND baby_caregivers.user_id = $2
  );
$$;

-- Usada nas policies de baby_caregivers: verifica se user criou o bebê
CREATE OR REPLACE FUNCTION public.is_baby_creator(baby_id UUID, user_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.babies
    WHERE babies.id = $1 AND babies.created_by = $2
  );
$$;

-- Cria perfil automaticamente no cadastro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$;

-- =============================================
-- 3. INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_records_baby_type ON records(baby_id, type);
CREATE INDEX IF NOT EXISTS idx_records_timestamp ON records(baby_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_caregivers_baby ON baby_caregivers(baby_id);
CREATE INDEX IF NOT EXISTS idx_caregivers_user ON baby_caregivers(user_id);

-- =============================================
-- 4. TRIGGERS
-- =============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 5. ROW LEVEL SECURITY
-- =============================================

-- PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- BABIES
ALTER TABLE babies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "babies_select" ON babies
  FOR SELECT USING (
    created_by = auth.uid() OR is_caregiver(id, auth.uid())
  );

CREATE POLICY "babies_insert" ON babies
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "babies_update" ON babies
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "babies_delete" ON babies
  FOR DELETE USING (created_by = auth.uid());

-- BABY_CAREGIVERS
ALTER TABLE baby_caregivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "caregivers_select" ON baby_caregivers
  FOR SELECT USING (
    user_id = auth.uid() OR is_baby_creator(baby_id, auth.uid())
  );

CREATE POLICY "caregivers_insert" ON baby_caregivers
  FOR INSERT WITH CHECK (is_baby_creator(baby_id, auth.uid()));

-- RECORDS
ALTER TABLE records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "records_select" ON records
  FOR SELECT USING (
    baby_id IN (
      SELECT id FROM babies WHERE created_by = auth.uid()
      UNION
      SELECT baby_id FROM baby_caregivers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "records_insert" ON records
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "records_update" ON records
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "records_delete" ON records
  FOR DELETE USING (user_id = auth.uid());

-- =============================================
-- 6. STORAGE (baby photos bucket)
-- =============================================
INSERT INTO storage.buckets (id, name, public, avif_autodetection)
VALUES ('baby-photos', 'baby-photos', true, false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view baby photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'baby-photos');

CREATE POLICY "Authenticated users can upload baby photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'baby-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own baby photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'baby-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own baby photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'baby-photos' AND auth.role() = 'authenticated');
