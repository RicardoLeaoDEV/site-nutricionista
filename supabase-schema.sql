-- ==============================================================================
-- APEXFIT / NUTRILIFE - ESQUEMA COMPLETO DE BANCO DE DADOS (SUPABASE / POSTGRESQL)
-- ==============================================================================
-- Este script configura todas as tabelas e políticas de segurança RLS (Row Level Security)
-- para garantir que tanto o Nutricionista/Admin quanto os Alunos consigam ler e gravar:
-- 1. Dietas e Refeições
-- 2. Fichas de Treino
-- 3. Alunos e Perfis Clínicos / Mensagens
-- 4. Check-ins, Medidas, Antropometria, Hidratação, Hábitos e Financeiro
-- ==============================================================================

-- Habilitar extensão para geração de UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. TABELA DE DIETAS E REFEIÇÕES (dietas)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dietas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aluno_id UUID NOT NULL,
    refeicao TEXT NOT NULL,
    horario TEXT,
    alimentos TEXT NOT NULL,
    substituicoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dietas_aluno_id ON dietas(aluno_id);

-- ------------------------------------------------------------------------------
-- 2. TABELA DE FICHAS DE TREINO (treinos)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS treinos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aluno_id UUID NOT NULL,
    treino_nome TEXT NOT NULL,
    dia_semana TEXT,
    grupo_muscular TEXT,
    exercicio TEXT NOT NULL,
    series TEXT,
    repeticoes TEXT,
    carga TEXT,
    descanso TEXT,
    observacoes TEXT,
    video_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_treinos_aluno_id ON treinos(aluno_id);

-- ------------------------------------------------------------------------------
-- 3. TABELA DE ALUNOS (alunos)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alunos (
    id UUID PRIMARY KEY,
    nome TEXT,
    email TEXT,
    foto_perfil TEXT,
    altura NUMERIC(5,2),
    peso NUMERIC(5,2),
    idade INT,
    papel TEXT DEFAULT 'aluno',
    personal_id UUID,
    nutricionista_id UUID,
    telefone TEXT,
    objetivo TEXT,
    status_assinatura TEXT DEFAULT 'ativo',
    data_vencimento DATE,
    nivel_gamificacao INT DEFAULT 1,
    xp_total INT DEFAULT 0,
    streak_dias INT DEFAULT 0,
    meta_agua_ml INT DEFAULT 3000,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. HISTÓRICO DE PESO (historico_peso)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS historico_peso (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aluno_id UUID NOT NULL,
    peso NUMERIC(5,2) NOT NULL,
    date_registro TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_historico_peso_aluno ON historico_peso(aluno_id, date_registro DESC);

-- ------------------------------------------------------------------------------
-- 5. MENSAGENS E METAS DO SISTEMA (mensagens)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mensagens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aluno_id UUID NOT NULL,
    remetente TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    lida BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_mensagens_aluno_remetente ON mensagens(aluno_id, remetente, created_at DESC);

-- ------------------------------------------------------------------------------
-- 6. CHECK-INS SEMANAIS (checkins)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS checkins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aluno_id UUID NOT NULL,
    peso_atual NUMERIC(5,2),
    adesao_dieta TEXT,
    treinos_realizados INT,
    qualidade_sono TEXT,
    nivel_energia TEXT,
    nivel_fome TEXT,
    nivel_estresse TEXT,
    dificuldade_dieta TEXT,
    observacoes TEXT,
    status_indicador TEXT DEFAULT 'verde',
    fotos JSONB DEFAULT '[]'::jsonb,
    feedback_profissional TEXT,
    revisado_por UUID,
    revisado_em TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_checkins_aluno ON checkins(aluno_id, created_at DESC);

-- ------------------------------------------------------------------------------
-- 7. MEDIDAS CORPORAIS E ANTROPOMETRIA (medidas)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS medidas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aluno_id UUID NOT NULL,
    data_registro DATE DEFAULT CURRENT_DATE,
    peso NUMERIC(5,2),
    braco_direito NUMERIC(4,1),
    braco_esquerdo NUMERIC(4,1),
    torax NUMERIC(4,1),
    cintura NUMERIC(4,1),
    abdomen NUMERIC(4,1),
    quadril NUMERIC(4,1),
    coxa_direita NUMERIC(4,1),
    coxa_esquerda NUMERIC(4,1),
    panturrilha NUMERIC(4,1),
    percentual_gordura NUMERIC(4,1),
    massa_muscular NUMERIC(4,1),
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_medidas_aluno ON medidas(aluno_id, data_registro DESC);

-- ------------------------------------------------------------------------------
-- 8. EXECUÇÃO DE TREINOS & SÉRIES (treino_series_logs)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS treino_series_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aluno_id UUID NOT NULL,
    exercicio_id TEXT NOT NULL,
    exercicio_nome TEXT NOT NULL,
    serie_numero INT NOT NULL,
    descanso_segundos INT DEFAULT 60,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_treino_series_aluno ON treino_series_logs(aluno_id, created_at DESC);

-- ------------------------------------------------------------------------------
-- 9. HÁBITOS DIÁRIOS & HIDRATAÇÃO (habitos, habitos_logs, hidratacao_logs)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS habitos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aluno_id UUID NOT NULL,
    nome TEXT NOT NULL,
    icone TEXT DEFAULT 'check-circle',
    frequencia TEXT DEFAULT 'diario',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS habitos_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    habito_id UUID REFERENCES habitos(id) ON DELETE CASCADE,
    aluno_id UUID NOT NULL,
    data_registro DATE DEFAULT CURRENT_DATE,
    concluido BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(habito_id, data_registro)
);

CREATE TABLE IF NOT EXISTS hidratacao_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aluno_id UUID NOT NULL,
    data_registro DATE DEFAULT CURRENT_DATE,
    total_ml INT DEFAULT 0,
    meta_ml INT DEFAULT 3000,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(aluno_id, data_registro)
);

-- ------------------------------------------------------------------------------
-- 10. NOTIFICAÇÕES (notificacoes)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notificacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL,
    titulo TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    tipo TEXT DEFAULT 'info',
    lida BOOLEAN DEFAULT false,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 11. FINANCEIRO E PLANOS (planos & pagamentos)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS planos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profissional_id UUID,
    nome TEXT NOT NULL,
    valor NUMERIC(8,2) NOT NULL,
    duracao_meses INT DEFAULT 1,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pagamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aluno_id UUID NOT NULL,
    profissional_id UUID,
    plano_nome TEXT NOT NULL,
    valor NUMERIC(8,2) NOT NULL,
    status TEXT DEFAULT 'pendente',
    metodo TEXT DEFAULT 'pix',
    data_vencimento DATE NOT NULL,
    data_pagamento TIMESTAMPTZ,
    comprovante_url TEXT,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 12. BANCO DE ALIMENTOS PERSONALIZADO (banco_alimentos)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS banco_alimentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    criado_por UUID,
    nome TEXT NOT NULL,
    porcao_padrao TEXT DEFAULT '100g',
    calorias NUMERIC(6,2) DEFAULT 0,
    proteinas NUMERIC(5,2) DEFAULT 0,
    carboidratos NUMERIC(5,2) DEFAULT 0,
    gorduras NUMERIC(5,2) DEFAULT 0,
    fibras NUMERIC(5,2) DEFAULT 0,
    categoria TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- POLÍTICAS DE SEGURANÇA (RLS - ROW LEVEL SECURITY)
-- ==============================================================================
-- IMPORTANTE: No Supabase, se o RLS estiver ativado em "dietas" com regras restritas,
-- o Nutricionista (admin) NÃO consegue ler as dietas dos alunos porque o auth.uid()
-- dele difere do aluno_id. As políticas abaixo garantem acesso completo para
-- usuários autenticados (ou especificamente para o UID do Nutricionista).

-- Habilitar RLS em todas as tabelas
ALTER TABLE dietas ENABLE ROW LEVEL SECURITY;
ALTER TABLE treinos ENABLE ROW LEVEL SECURITY;
ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_peso ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE medidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE treino_series_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE habitos ENABLE ROW LEVEL SECURITY;
ALTER TABLE habitos_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hidratacao_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE planos ENABLE ROW LEVEL SECURITY;
ALTER TABLE banco_alimentos ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem para evitar conflitos
DO $$
BEGIN
    DROP POLICY IF EXISTS "dietas_policy_auth" ON dietas;
    DROP POLICY IF EXISTS "treinos_policy_auth" ON treinos;
    DROP POLICY IF EXISTS "alunos_policy_auth" ON alunos;
    DROP POLICY IF EXISTS "historico_peso_policy_auth" ON historico_peso;
    DROP POLICY IF EXISTS "mensagens_policy_auth" ON mensagens;
    DROP POLICY IF EXISTS "checkins_policy_auth" ON checkins;
    DROP POLICY IF EXISTS "medidas_policy_auth" ON medidas;
    DROP POLICY IF EXISTS "treino_series_logs_policy_auth" ON treino_series_logs;
    DROP POLICY IF EXISTS "habitos_policy_auth" ON habitos;
    DROP POLICY IF EXISTS "habitos_logs_policy_auth" ON habitos_logs;
    DROP POLICY IF EXISTS "hidratacao_logs_policy_auth" ON hidratacao_logs;
    DROP POLICY IF EXISTS "notificacoes_policy_auth" ON notificacoes;
    DROP POLICY IF EXISTS "pagamentos_policy_auth" ON pagamentos;
    DROP POLICY IF EXISTS "planos_policy_auth" ON planos;
    DROP POLICY IF EXISTS "banco_alimentos_policy_auth" ON banco_alimentos;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Criar Políticas Permissivas para Usuários Autenticados (Nutricionista + Alunos)
CREATE POLICY "dietas_policy_auth" ON dietas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "treinos_policy_auth" ON treinos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "alunos_policy_auth" ON alunos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "historico_peso_policy_auth" ON historico_peso FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "mensagens_policy_auth" ON mensagens FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "checkins_policy_auth" ON checkins FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "medidas_policy_auth" ON medidas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "treino_series_logs_policy_auth" ON treino_series_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "habitos_policy_auth" ON habitos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "habitos_logs_policy_auth" ON habitos_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "hidratacao_logs_policy_auth" ON hidratacao_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "notificacoes_policy_auth" ON notificacoes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "pagamentos_policy_auth" ON pagamentos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "planos_policy_auth" ON planos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "banco_alimentos_policy_auth" ON banco_alimentos FOR ALL TO authenticated USING (true) WITH CHECK (true);
