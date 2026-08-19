-- ==============================================================================
-- CONDOMANAGER AI - ESQUEMA COMPLETO DE BASE DE DADOS (POSTGRESQL / SUPABASE)
-- ==============================================================================
-- Este script cria todas as tabelas necessárias, tipos enumerados, índices,
-- chaves estrangeiras e políticas de segurança (Row Level Security - RLS).
--
-- INSTRUÇÕES DE EXECUÇÃO:
-- 1. Aceda ao painel do seu projeto Supabase (https://supabase.com/dashboard)
-- 2. No menu lateral, clique em "SQL Editor"
-- 3. Crie uma "New query", cole este ficheiro na íntegra e clique em "Run" (Executar).
-- ==============================================================================

-- Extensão para geração de UUIDs (caso ainda não esteja ativa)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE PRÉDIOS / CONDOMÍNIOS
CREATE TABLE IF NOT EXISTS public.predios (
    id_predio TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    morada_linha1 TEXT NOT NULL,
    num_porta TEXT DEFAULT '',
    codigo_postal TEXT DEFAULT '',
    localidade TEXT DEFAULT '',
    nif TEXT DEFAULT '',
    iban TEXT DEFAULT '',
    ano_construcao INTEGER,
    regulamento_interno TEXT DEFAULT '',
    patrimonio JSONB DEFAULT '{"tem_elevador": false, "num_elevadores": 0, "tem_garagem": false, "tem_jardins": false, "tem_piscina": false}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE CONTAS BANCÁRIAS DO CONDOMÍNIO
CREATE TABLE IF NOT EXISTS public.contas (
    id_conta TEXT PRIMARY KEY,
    id_predio TEXT REFERENCES public.predios(id_predio) ON DELETE CASCADE,
    banco TEXT NOT NULL,
    iban TEXT NOT NULL,
    titular TEXT DEFAULT '',
    saldo_inicial NUMERIC(12,2) DEFAULT 0.00,
    saldo_atual NUMERIC(12,2) DEFAULT 0.00,
    is_principal BOOLEAN DEFAULT FALSE,
    tipo_conta TEXT DEFAULT 'Ordem', -- 'Ordem' | 'Poupanca' | 'FundoReserva'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA DE FORNECEDORES E PRESTADORES DE SERVIÇO
CREATE TABLE IF NOT EXISTS public.fornecedores (
    id_fornecedor TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    nif TEXT DEFAULT '',
    categoria TEXT DEFAULT 'Geral',
    contacto TEXT DEFAULT '',
    email TEXT DEFAULT '',
    iban TEXT DEFAULT '',
    morada TEXT DEFAULT '',
    observacoes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA DE FRAÇÕES AUTÓNOMAS
CREATE TABLE IF NOT EXISTS public.fracoes (
    id_fracao TEXT PRIMARY KEY,
    id_predio TEXT REFERENCES public.predios(id_predio) ON DELETE CASCADE,
    fracao_nome TEXT NOT NULL,
    piso TEXT DEFAULT '',
    permilagem NUMERIC(8,2) DEFAULT 0.00,
    tipologia TEXT DEFAULT 'Habitação',
    proprietario JSONB DEFAULT '{"nome": "", "nif": "", "email": "", "tlm": "", "morada": ""}'::jsonb,
    inquilino JSONB DEFAULT '{"nome": "", "nif": "", "email": "", "tlm": ""}'::jsonb,
    saldo_inicial NUMERIC(10,2) DEFAULT 0.00,
    administrador_interno TEXT DEFAULT 'Não',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABELA DE MOVIMENTOS FINANCEIROS (RECEITAS E DESPESAS)
CREATE TABLE IF NOT EXISTS public.movimentos (
    id_movimento TEXT PRIMARY KEY,
    id_predio TEXT REFERENCES public.predios(id_predio) ON DELETE CASCADE,
    id_conta TEXT REFERENCES public.contas(id_conta) ON DELETE SET NULL,
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    tipo TEXT NOT NULL, -- 'RECEITA' | 'DESPESA'
    categoria TEXT NOT NULL,
    descricao TEXT NOT NULL,
    valor NUMERIC(12,2) NOT NULL,
    comprovativo_url TEXT DEFAULT '',
    fracao_id TEXT REFERENCES public.fracoes(id_fracao) ON DELETE SET NULL,
    fornecedor_id TEXT REFERENCES public.fornecedores(id_fornecedor) ON DELETE SET NULL,
    forma_pagamento TEXT DEFAULT 'Transferência',
    conciliado BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABELA DE AVISOS DE COBRANÇA E QUOTAS
CREATE TABLE IF NOT EXISTS public.avisos (
    id_aviso TEXT PRIMARY KEY,
    id_predio TEXT REFERENCES public.predios(id_predio) ON DELETE CASCADE,
    id_fracao TEXT REFERENCES public.fracoes(id_fracao) ON DELETE CASCADE,
    mes INTEGER NOT NULL,
    ano INTEGER NOT NULL,
    valor NUMERIC(10,2) NOT NULL,
    tipo_quota TEXT DEFAULT 'Ordinária', -- 'Ordinária' | 'Extraordinária' | 'FundoReserva'
    estado TEXT DEFAULT 'Pendente', -- 'Pendente' | 'Pago' | 'Atrasado'
    data_emissao DATE DEFAULT CURRENT_DATE,
    data_vencimento DATE DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
    data_pagamento DATE,
    entidade TEXT DEFAULT '21111',
    referencia TEXT DEFAULT '',
    iban_destino TEXT DEFAULT '',
    recibo_numero TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABELA DE REUNIÕES E ASSEMBLEIAS DE CONDÓMINOS
CREATE TABLE IF NOT EXISTS public.reunioes (
    id_reuniao TEXT PRIMARY KEY,
    id_predio TEXT REFERENCES public.predios(id_predio) ON DELETE CASCADE,
    tema TEXT NOT NULL,
    data DATE NOT NULL,
    hora TIME NOT NULL,
    local TEXT DEFAULT '',
    is_videoconferencia BOOLEAN DEFAULT FALSE,
    link_video TEXT DEFAULT '',
    ordens_trabalho TEXT DEFAULT '',
    notas TEXT DEFAULT '',
    ata_conteudo TEXT DEFAULT '',
    estado TEXT DEFAULT 'Agendada', -- 'Agendada' | 'Realizada' | 'Aprovada' | 'Cancelada'
    presentes JSONB DEFAULT '[]'::jsonb,
    ausentes JSONB DEFAULT '[]'::jsonb,
    votacoes JSONB DEFAULT '[]'::jsonb,
    quorum NUMERIC(8,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. TABELA DE DOCUMENTOS E ARQUIVO DIGITAL
CREATE TABLE IF NOT EXISTS public.documentos (
    id_documento TEXT PRIMARY KEY,
    id_predio TEXT REFERENCES public.predios(id_predio) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    tipo TEXT NOT NULL, -- 'ata' | 'fatura' | 'contrato' | 'regulamento' | 'relatorio' | 'outro'
    categoria TEXT DEFAULT 'Geral',
    ficheiro_url TEXT DEFAULT '',
    tamanho_bytes BIGINT DEFAULT 0,
    data_upload TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    criado_por TEXT DEFAULT 'Administração',
    privado BOOLEAN DEFAULT FALSE
);

-- 9. TABELA DE OCORRÊNCIAS E MANUTENÇÃO
CREATE TABLE IF NOT EXISTS public.ocorrencias (
    id_ocorrencia TEXT PRIMARY KEY,
    id_predio TEXT REFERENCES public.predios(id_predio) ON DELETE CASCADE,
    id_fracao TEXT REFERENCES public.fracoes(id_fracao) ON DELETE SET NULL,
    titulo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    prioridade TEXT DEFAULT 'Média', -- 'Baixa' | 'Média' | 'Alta' | 'Urgente'
    estado TEXT DEFAULT 'Pendente', -- 'Pendente' | 'Em Análise' | 'Em Resolução' | 'Concluída'
    data_registo TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reportado_por TEXT DEFAULT '',
    foto_url TEXT DEFAULT '',
    custo_estimado NUMERIC(10,2) DEFAULT 0.00,
    fornecedor_atribuido TEXT REFERENCES public.fornecedores(id_fornecedor) ON DELETE SET NULL
);

-- 10. TABELA DE RESERVAS DE ÁREAS COMUNS
CREATE TABLE IF NOT EXISTS public.reservas (
    id_reserva TEXT PRIMARY KEY,
    id_predio TEXT REFERENCES public.predios(id_predio) ON DELETE CASCADE,
    id_fracao TEXT REFERENCES public.fracoes(id_fracao) ON DELETE CASCADE,
    area_comum TEXT NOT NULL,
    data DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    responsavel TEXT NOT NULL,
    num_pessoas INTEGER DEFAULT 1,
    estado TEXT DEFAULT 'Confirmada', -- 'Pendente' | 'Confirmada' | 'Cancelada'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. TABELA DE AUDITORIA DE SEGURANÇA E SESSÕES
CREATE TABLE IF NOT EXISTS public.auditoria_seguranca (
    id BIGSERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    evento TEXT NOT NULL,
    detalhes TEXT DEFAULT '',
    ip_origem TEXT DEFAULT '',
    sucesso BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- POLÍTICAS DE SEGURANÇA (ROW LEVEL SECURITY - RLS)
-- ==============================================================================

ALTER TABLE public.predios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reunioes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocorrencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auditoria_seguranca ENABLE ROW LEVEL SECURITY;

-- Criação de Políticas Públicas de Acesso (Prontas para desenvolvimento e produção)
CREATE POLICY "Acesso completo a predios" ON public.predios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso completo a contas" ON public.contas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso completo a fornecedores" ON public.fornecedores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso completo a fracoes" ON public.fracoes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso completo a movimentos" ON public.movimentos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso completo a avisos" ON public.avisos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso completo a reunioes" ON public.reunioes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso completo a documentos" ON public.documentos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso completo a ocorrencias" ON public.ocorrencias FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso completo a reservas" ON public.reservas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso completo a auditoria" ON public.auditoria_seguranca FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- CONFIGURAÇÃO DO SUPABASE STORAGE (BUCKET PARA DOCUMENTOS E COMPROVATIVOS)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('condo_documentos', 'condo_documentos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Acesso público ao bucket condo_documentos"
ON storage.objects FOR ALL
USING (bucket_id = 'condo_documentos')
WITH CHECK (bucket_id = 'condo_documentos');
