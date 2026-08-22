-- ==============================================================================
-- CONDOMANAGER AI - TABELA DE PERFIS (PROFILES) & AUTENTICAÇÃO SUPABASE
-- ==============================================================================
-- Este script configura a gestão de utilizadores, área pessoal e autenticação:
-- 1. Cria a tabela public.profiles vinculada ao auth.users do Supabase.
-- 2. Cria a função e o trigger para criar perfis automaticamente no registo (Sign Up).
-- 3. Ativa e define políticas de Row Level Security (RLS) para proteger a Área Pessoal.
--
-- INSTRUÇÕES:
-- 1. Aceda a https://supabase.com/dashboard -> SQL Editor
-- 2. Cole este script e clique em "Run" (Executar).
-- ==============================================================================

-- 1. CRIAR A TABELA PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('ADMIN', 'GESTOR', 'EMPRESA_GESTORA', 'USER', 'TECNICO', 'LIMPEZAS', 'CONTABILISTA', 'JURIDICO', 'AUDITOR')),
    telefone TEXT DEFAULT '',
    nif TEXT DEFAULT '',
    fracao TEXT DEFAULT '',
    id_predio TEXT REFERENCES public.predios(id_predio) ON DELETE SET NULL,
    foto_url TEXT DEFAULT '',
    ultimo_acesso TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. FUNÇÃO E TRIGGER AUTOMÁTICO PARA NOVO UTILIZADOR (SIGN UP)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome, role, telefone, nif, fracao, id_predio)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'USER'),
    COALESCE(NEW.raw_user_meta_data->>'telefone', ''),
    COALESCE(NEW.raw_user_meta_data->>'nif', ''),
    COALESCE(NEW.raw_user_meta_data->>'fracao', ''),
    COALESCE(NEW.raw_user_meta_data->>'id_predio', NULL)
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    nome = COALESCE(EXCLUDED.nome, public.profiles.nome),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dispara o trigger sempre que um utilizador se regista em auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. SEGURANÇA ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política 1: Utilizadores podem ver o próprio perfil; Administradores e Gestores podem ver todos
DROP POLICY IF EXISTS "Leitura de perfil próprio ou administradores" ON public.profiles;
CREATE POLICY "Leitura de perfil próprio ou administradores" ON public.profiles
    FOR SELECT USING (
        auth.uid() = id OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'GESTOR', 'EMPRESA_GESTORA', 'AUDITOR'))
    );

-- Política 2: Utilizadores podem atualizar o seu próprio perfil; Administradores podem atualizar qualquer perfil
DROP POLICY IF EXISTS "Atualização do perfil pelo próprio utilizador ou admin" ON public.profiles;
CREATE POLICY "Atualização do perfil pelo próprio utilizador ou admin" ON public.profiles
    FOR UPDATE USING (
        auth.uid() = id OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'GESTOR', 'EMPRESA_GESTORA'))
    );

-- Política 3: Inserção de perfil pelo próprio utilizador autenticado
DROP POLICY IF EXISTS "Inserção de perfil por utilizador autenticado" ON public.profiles;
CREATE POLICY "Inserção de perfil por utilizador autenticado" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. ÍNDICES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_predio ON public.profiles(id_predio);
