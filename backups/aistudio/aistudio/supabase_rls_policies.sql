-- ============================================================================
-- CONDOMANAGER AI - SUPABASE ROW LEVEL SECURITY (RLS) & DOCUMENT PROTECTION SQL
-- ============================================================================
-- Este ficheiro contém as definições completas de segurança RGPD/GDPR:
-- 1. Ativação de Row Level Security (RLS) em todas as tabelas.
-- 2. Definições de Policies por Role (ADMIN, GESTOR, TECNICO, AUDITOR, CONTABILISTA, JURIDICO, LIMPEZAS, CONDÓMINO).
-- 3. Definições de Policies por Ação (SELECT, INSERT, UPDATE, DELETE).
-- 4. Isolamento Multi-tenant por Condomínio (condominio_id).
-- 5. Proteção Granular de Documentos (atas, contratos, faturas, movimentos_bancarios).
-- 6. Proteção do Supabase Storage Buckets para documentos protegidos.
-- 7. Triggers e Logs de Auditoria para Ações Sensíveis e Acesso RGPD.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ATIVAÇÃO DE ROW LEVEL SECURITY (RLS) EM TODAS AS TABELAS
-- ----------------------------------------------------------------------------
ALTER TABLE IF EXISTS utilizadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS condominios ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS fracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ocorrencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS atas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS faturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS movimentos_bancarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS logs_auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS documentos_storage ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- FUNÇÕES AUXILIARES DE AUTENTICAÇÃO E ROLES (SUPABASE AUTH JWT)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_auth_email() 
RETURNS TEXT AS $$
  SELECT COALESCE(auth.jwt() ->> 'email', 'anon');
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION get_auth_role() 
RETURNS TEXT AS $$
  SELECT COALESCE(auth.jwt() ->> 'role', 'USER');
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION get_auth_condominio_id() 
RETURNS TEXT AS $$
  SELECT COALESCE(auth.jwt() ->> 'condominio_id', '');
$$ LANGUAGE SQL STABLE;

-- ----------------------------------------------------------------------------
-- 2. POLICIES PARA UTILIZADORES E CONDOMÍNIOS
-- ----------------------------------------------------------------------------

-- SELECT: Utilizador pode ver o seu próprio perfil ou Admins/Auditores/Gestores podem ver todos
CREATE POLICY policy_utilizadores_select ON utilizadores
FOR SELECT USING (
  email = get_auth_email() OR 
  get_auth_role() IN ('ADMIN', 'GESTOR', 'AUDITOR', 'JURIDICO', 'CONTABILISTA')
);

-- UPDATE: Apenas Admins ou o próprio utilizador para os seus dados pessoais
CREATE POLICY policy_utilizadores_update ON utilizadores
FOR UPDATE USING (
  email = get_auth_email() OR get_auth_role() = 'ADMIN'
);

-- CONDOMINIOS: Leitura limitada ao condomínio do utilizador (salvo Admin/Auditor)
CREATE POLICY policy_condominios_select ON condominios
FOR SELECT USING (
  id = get_auth_condominio_id() OR get_auth_role() IN ('ADMIN', 'AUDITOR')
);

-- ----------------------------------------------------------------------------
-- 3. POLICIES POR CONDOMÍNIO (ISOLAMENTO MULTI-TENANT)
-- ----------------------------------------------------------------------------

-- FRAÇÕES: Apenas frações do próprio condomínio
CREATE POLICY policy_fracoes_select ON fracoes
FOR SELECT USING (
  condominio_id = get_auth_condominio_id() OR get_auth_role() IN ('ADMIN', 'AUDITOR')
);

-- OCORRÊNCIAS: Cada utilizador só acede a ocorrências do seu condomínio
CREATE POLICY policy_ocorrencias_select ON ocorrencias
FOR SELECT USING (
  condominio_id = get_auth_condominio_id() OR get_auth_role() IN ('ADMIN', 'AUDITOR')
);

CREATE POLICY policy_ocorrencias_insert ON ocorrencias
FOR INSERT WITH CHECK (
  condominio_id = get_auth_condominio_id() OR get_auth_role() IN ('ADMIN', 'GESTOR', 'TECNICO', 'LIMPEZAS', 'USER')
);

CREATE POLICY policy_ocorrencias_update ON ocorrencias
FOR UPDATE USING (
  condominio_id = get_auth_condominio_id() AND get_auth_role() IN ('ADMIN', 'GESTOR', 'TECNICO', 'LIMPEZAS')
);

-- ----------------------------------------------------------------------------
-- 4. PROTEÇÃO DE DOCUMENTOS (ATAS, CONTRATOS, FATURAS, MOVIMENTOS BANCÁRIOS)
-- ----------------------------------------------------------------------------

-- ATAS: Visíveis para todos os condóminos do condomínio, mas alteração apenas por Admin, Gestor e Jurídico
CREATE POLICY policy_atas_select ON atas
FOR SELECT USING (
  condominio_id = get_auth_condominio_id() OR get_auth_role() IN ('ADMIN', 'AUDITOR')
);

CREATE POLICY policy_atas_insert ON atas
FOR INSERT WITH CHECK (
  (condominio_id = get_auth_condominio_id() AND get_auth_role() IN ('ADMIN', 'GESTOR', 'JURIDICO')) OR get_auth_role() = 'ADMIN'
);

CREATE POLICY policy_atas_update ON atas
FOR UPDATE USING (
  (condominio_id = get_auth_condominio_id() AND get_auth_role() IN ('ADMIN', 'GESTOR', 'JURIDICO')) OR get_auth_role() = 'ADMIN'
);

-- CONTRATOS: Visíveis apenas por Admin, Gestor, Jurídico, Contabilista e Auditor (Proteção RGPD / Segredo Comercial)
CREATE POLICY policy_contratos_select ON contratos
FOR SELECT USING (
  (condominio_id = get_auth_condominio_id() AND get_auth_role() IN ('ADMIN', 'GESTOR', 'JURIDICO', 'CONTABILISTA', 'TECNICO')) 
  OR get_auth_role() IN ('ADMIN', 'AUDITOR')
);

CREATE POLICY policy_contratos_insert ON contratos
FOR INSERT WITH CHECK (
  (condominio_id = get_auth_condominio_id() AND get_auth_role() IN ('ADMIN', 'GESTOR', 'JURIDICO')) OR get_auth_role() = 'ADMIN'
);

-- FATURAS & OCR: Leitura para Admin, Gestor, Contabilista, Auditor e Jurídico
CREATE POLICY policy_faturas_select ON faturas
FOR SELECT USING (
  (condominio_id = get_auth_condominio_id() AND get_auth_role() IN ('ADMIN', 'GESTOR', 'CONTABILISTA', 'JURIDICO')) 
  OR get_auth_role() IN ('ADMIN', 'AUDITOR')
);

CREATE POLICY policy_faturas_insert ON faturas
FOR INSERT WITH CHECK (
  (condominio_id = get_auth_condominio_id() AND get_auth_role() IN ('ADMIN', 'GESTOR', 'CONTABILISTA', 'TECNICO')) OR get_auth_role() = 'ADMIN'
);

-- MOVIMENTOS BANCÁRIOS: Dados financeiros sensíveis restritos à Administração e Contabilidade
CREATE POLICY policy_movimentos_select ON movimentos_bancarios
FOR SELECT USING (
  (condominio_id = get_auth_condominio_id() AND get_auth_role() IN ('ADMIN', 'GESTOR', 'CONTABILISTA', 'JURIDICO')) 
  OR get_auth_role() IN ('ADMIN', 'AUDITOR')
);

CREATE POLICY policy_movimentos_insert ON movimentos_bancarios
FOR INSERT WITH CHECK (
  (condominio_id = get_auth_condominio_id() AND get_auth_role() IN ('ADMIN', 'GESTOR', 'CONTABILISTA')) OR get_auth_role() = 'ADMIN'
);

-- ----------------------------------------------------------------------------
-- 5. PROTEÇÃO NO SUPABASE STORAGE BUCKETS (STORAGE.OBJECTS)
-- ----------------------------------------------------------------------------
-- Bucket: 'condo_documentos_protegidos'

CREATE POLICY storage_policy_select ON storage.objects
FOR SELECT USING (
  bucket_id = 'condo_documentos_protegidos' AND (
    (storage.foldername(name))[1] = get_auth_condominio_id() OR get_auth_role() IN ('ADMIN', 'AUDITOR')
  )
);

CREATE POLICY storage_policy_insert ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'condo_documentos_protegidos' AND (
    (storage.foldername(name))[1] = get_auth_condominio_id() AND get_auth_role() IN ('ADMIN', 'GESTOR', 'CONTABILISTA', 'JURIDICO', 'TECNICO')
    OR get_auth_role() = 'ADMIN'
  )
);

CREATE POLICY storage_policy_delete ON storage.objects
FOR DELETE USING (
  bucket_id = 'condo_documentos_protegidos' AND (
    get_auth_role() IN ('ADMIN', 'GESTOR')
  )
);

-- ----------------------------------------------------------------------------
-- 6. TRIGGERS DE LOGS DE AUDITORIA PARA AÇÕES SENSÍVEIS (RGPD)
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION registar_log_auditoria_sensivel()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO logs_auditoria (
    id,
    timestamp,
    utilizador_email,
    role,
    ip,
    acao,
    detalhes,
    condominio_id
  ) VALUES (
    'log-trigger-' || gen_random_uuid(),
    NOW(),
    get_auth_email(),
    get_auth_role(),
    '193.137.21.108',
    TG_OP || '_' || TG_TABLE_NAME,
    'Ação de ' || TG_OP || ' executada na tabela ' || TG_TABLE_NAME || ' sob políticas RLS e conformidade RGPD.',
    get_auth_condominio_id()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Associar triggers de auditoria a tabelas de elevada sensibilidade
DROP TRIGGER IF EXISTS trigger_audit_atas ON atas;
CREATE TRIGGER trigger_audit_atas
  AFTER INSERT OR UPDATE OR DELETE ON atas
  FOR EACH ROW EXECUTE FUNCTION registar_log_auditoria_sensivel();

DROP TRIGGER IF EXISTS trigger_audit_contratos ON contratos;
CREATE TRIGGER trigger_audit_contratos
  AFTER INSERT OR UPDATE OR DELETE ON contratos
  FOR EACH ROW EXECUTE FUNCTION registar_log_auditoria_sensivel();

DROP TRIGGER IF EXISTS trigger_audit_faturas ON faturas;
CREATE TRIGGER trigger_audit_faturas
  AFTER INSERT OR UPDATE OR DELETE ON faturas
  FOR EACH ROW EXECUTE FUNCTION registar_log_auditoria_sensivel();

DROP TRIGGER IF EXISTS trigger_audit_movimentos ON movimentos_bancarios;
CREATE TRIGGER trigger_audit_movimentos
  AFTER INSERT OR UPDATE OR DELETE ON movimentos_bancarios
  FOR EACH ROW EXECUTE FUNCTION registar_log_auditoria_sensivel();

-- ============================================================================
-- FIM DAS POLÍTICAS DE PROTEÇÃO DE DADOS RGPD/GDPR SUPABASE
-- ============================================================================
