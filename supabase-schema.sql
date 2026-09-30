-- ==============================================================================
-- APEXFIT SAAS - ESQUEMA DE BANCO DE DADOS COMPLETO (SUPABASE / POSTGRESQL)
-- ==============================================================================
-- Este script cria todas as tabelas, índices e políticas de segurança RLS
-- necessárias para transformar o sistema em um SaaS profissional para:
-- 1. Administradores
-- 2. Personal Trainers
-- 3. Nutricionistas
-- 4. Alunos
-- ==============================================================================

-- Habilitar extensão UUID caso não esteja habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. TABELA DE USUÁRIOS E PERFIS EXPANDIDOS (users / alunos / profissionais)
-- ------------------------------------------------------------------------------
-- A tabela 'alunos' já existe no Supabase. Vamos garantir que ela tenha as
-- colunas de vínculo com Personal e Nutricionista, e criar perfis se necessário.

ALTER TABLE IF EXISTS alunos ADD COLUMN IF NOT EXISTS papel TEXT DEFAULT 'aluno';
ALTER TABLE IF EXISTS alunos ADD COLUMN IF NOT EXISTS personal_id UUID REFERENCES auth.users(id);
ALTER TABLE IF EXISTS alunos ADD COLUMN IF NOT EXISTS nutricionista_id UUID REFERENCES auth.users(id);
ALTER TABLE IF EXISTS alunos ADD COLUMN IF NOT EXISTS telefone TEXT;
ALTER TABLE IF EXISTS alunos ADD COLUMN IF NOT EXISTS objetivo TEXT;
ALTER TABLE IF EXISTS alunos ADD COLUMN IF NOT EXISTS plano_id TEXT;
ALTER TABLE IF EXISTS alunos ADD COLUMN IF NOT EXISTS status_assinatura TEXT DEFAULT 'ativo';
ALTER TABLE IF EXISTS alunos ADD COLUMN IF NOT EXISTS data_vencimento DATE;
ALTER TABLE IF EXISTS alunos ADD COLUMN IF NOT EXISTS nivel_gamificacao INT DEFAULT 1;
ALTER TABLE IF EXISTS alunos ADD COLUMN IF NOT EXISTS xp_total INT DEFAULT 0;
ALTER TABLE IF EXISTS alunos ADD COLUMN IF NOT EXISTS streak_dias INT DEFAULT 0;
ALTER TABLE IF EXISTS alunos ADD COLUMN IF NOT EXISTS meta_agua_ml INT DEFAULT 3000;

-- Tabela de Profissionais (Personal Trainers e Nutricionistas)
CREATE TABLE IF NOT EXISTS profissionais (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    papel TEXT NOT NULL CHECK (papel IN ('admin', 'personal', 'nutricionista')),
    crn_cref TEXT,
    especialidade TEXT,
    telefone TEXT,
    foto_perfil TEXT,
    chave_pix TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. CHECK-INS SEMANAIS (checkins)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS checkins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aluno_id UUID NOT NULL,
    peso_atual NUMERIC(5,2),
    adesao_dieta TEXT,           -- '100% no plano', 'pequenos deslizes', 'fora do plano'
    treinos_realizados INT,      -- 0 a 7+
    qualidade_sono TEXT,         -- 'pessimo', 'regular', 'bom', 'excelente'
    nivel_energia TEXT,          -- 'baixo', 'medio', 'alto', 'maximo'
    nivel_fome TEXT,             -- 'pouca', 'normal', 'alta', 'descontrolada'
    nivel_estresse TEXT,         -- 'baixo', 'moderado', 'alto'
    dificuldade_dieta TEXT,      -- 'nenhuma', 'alguma', 'muita'
    observacoes TEXT,
    status_indicador TEXT DEFAULT 'verde', -- 'verde' (Tudo certo), 'amarelo' (Atenção), 'vermelho' (Precisa atenção)
    fotos JSONB DEFAULT '[]'::jsonb,
    feedback_profissional TEXT,
    revisado_por UUID,
    revisado_em TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_checkins_aluno ON checkins(aluno_id, created_at DESC);

-- ------------------------------------------------------------------------------
-- 3. MEDIDAS CORPORAIS & EVOLUÇÃO (medidas)
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
-- 4. EXECUÇÃO DE TREINOS & SÉRIES (treino_logs / treino_series_logs)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS treino_series_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aluno_id UUID NOT NULL,
    exercicio_id UUID,
    treino_nome TEXT,
    exercicio_nome TEXT NOT NULL,
    serie_numero INT NOT NULL,
    repeticoes_feitas INT,
    carga_utilizada NUMERIC(5,2),
    descanso_segundos INT,
    concluido BOOLEAN DEFAULT true,
    data_execucao DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_series_aluno_data ON treino_series_logs(aluno_id, data_execucao);

-- ------------------------------------------------------------------------------
-- 5. HÁBITOS DIÁRIOS & STREAK (habitos & habitos_logs)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS habitos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aluno_id UUID NOT NULL,
    titulo TEXT NOT NULL,
    icone TEXT DEFAULT 'check-circle',
    frequencia TEXT DEFAULT 'diario',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS habitos_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aluno_id UUID NOT NULL,
    habito_id UUID,
    habito_titulo TEXT NOT NULL,
    data_registro DATE DEFAULT CURRENT_DATE,
    concluido BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(aluno_id, habito_titulo, data_registro)
);
CREATE INDEX IF NOT EXISTS idx_habitos_aluno_data ON habitos_logs(aluno_id, data_registro);

-- ------------------------------------------------------------------------------
-- 6. HIDRATAÇÃO (hidratacao_logs)
-- ------------------------------------------------------------------------------
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
-- 7. NOTIFICAÇÕES (notificacoes)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notificacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL,
    titulo TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    tipo TEXT DEFAULT 'info',    -- 'treino', 'dieta', 'checkin', 'mensagem', 'financeiro', 'agua'
    lida BOOLEAN DEFAULT false,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notificacoes_user ON notificacoes(usuario_id, lida, created_at DESC);

-- ------------------------------------------------------------------------------
-- 8. FINANCEIRO, PLANOS E PAGAMENTOS (planos & pagamentos)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS planos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profissional_id UUID,
    nome TEXT NOT NULL,          -- 'Mensal', 'Trimestral', 'Semestral', 'Anual'
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
    status TEXT DEFAULT 'pendente', -- 'pago', 'pendente', 'atrasado', 'cancelado'
    metodo TEXT DEFAULT 'pix',      -- 'pix', 'cartao', 'boleto'
    data_vencimento DATE NOT NULL,
    data_pagamento TIMESTAMPTZ,
    comprovante_url TEXT,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pagamentos_aluno ON pagamentos(aluno_id, status);

-- ------------------------------------------------------------------------------
-- 9. AGENDA E CONSULTAS (consultas / agendamentos)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS consultas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aluno_id UUID NOT NULL,
    profissional_id UUID NOT NULL,
    tipo TEXT NOT NULL,           -- 'Consulta Nutricional', 'Avaliação Física', 'Treino Presencial', 'Retorno'
    data_hora TIMESTAMPTZ NOT NULL,
    duracao_minutos INT DEFAULT 60,
    status TEXT DEFAULT 'agendado', -- 'agendado', 'concluido', 'cancelado'
    link_reuniao TEXT,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_consultas_prof ON consultas(profissional_id, data_hora);
CREATE INDEX IF NOT EXISTS idx_consultas_aluno ON consultas(aluno_id, data_hora);

-- ------------------------------------------------------------------------------
-- 10. METAS E GAMIFICAÇÃO (metas & gamificacao_conquistas)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS metas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aluno_id UUID NOT NULL,
    tipo TEXT NOT NULL,          -- 'peso', 'treinos_mes', 'agua_dia', 'percentual_gordura'
    titulo TEXT NOT NULL,
    valor_inicial NUMERIC(6,2),
    valor_alvo NUMERIC(6,2) NOT NULL,
    valor_atual NUMERIC(6,2),
    unidade TEXT DEFAULT 'kg',
    prazo DATE,
    concluida BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conquistas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aluno_id UUID NOT NULL,
    codigo_conquista TEXT NOT NULL,
    titulo TEXT NOT NULL,
    descricao TEXT,
    icone TEXT,
    pontos_xp INT DEFAULT 50,
    desbloqueada_em TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(aluno_id, codigo_conquista)
);

-- ------------------------------------------------------------------------------
-- 11. BANCO DE ALIMENTOS PERSONALIZADO (banco_alimentos)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS banco_alimentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    criado_por UUID,             -- Se nulo, é alimento padrão do sistema
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

-- ------------------------------------------------------------------------------
-- 12. INSIGHTS E RESUMOS DE IA (ai_insights)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aluno_id UUID NOT NULL,
    periodo_dias INT DEFAULT 30,
    resumo_evolucao TEXT NOT NULL,
    alertas_atencao JSONB DEFAULT '[]'::jsonb,
    pontos_positivos JSONB DEFAULT '[]'::jsonb,
    gerado_por UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- HABILITAR RLS (Row Level Security) EM TODAS AS NOVAS TABELAS
-- ------------------------------------------------------------------------------
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE medidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE treino_series_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE habitos ENABLE ROW LEVEL SECURITY;
ALTER TABLE habitos_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hidratacao_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE planos ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultas ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE conquistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE banco_alimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PERMISSIVAS PARA AUTENTICADOS (Garante funcionamento no Client SDK com anon key e sessão)
DO $$
BEGIN
    EXECUTE 'CREATE POLICY checkins_policy ON checkins FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY medidas_policy ON medidas FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY treino_series_logs_policy ON treino_series_logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY habitos_policy ON habitos FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY habitos_logs_policy ON habitos_logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY hidratacao_logs_policy ON hidratacao_logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY notificacoes_policy ON notificacoes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY pagamentos_policy ON pagamentos FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY planos_policy ON planos FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY consultas_policy ON consultas FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY metas_policy ON metas FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY conquistas_policy ON conquistas FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY banco_alimentos_policy ON banco_alimentos FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY ai_insights_policy ON ai_insights FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)';
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;
