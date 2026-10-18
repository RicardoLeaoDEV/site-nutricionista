-- ==============================================================
-- REAL FIT HUB - SCHEMA DO BANCO DE DADOS SUPABASE
-- Módulos: Agendamentos (appointments), Check-ins Semanais e Antropometria
-- ==============================================================

-- 1. TABELA DE AGENDAMENTOS (Consultas, Treinos e Avaliações Físicas)
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    aluno_nome TEXT NOT NULL,
    profissional_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    profissional_nome TEXT,
    profissional_tipo TEXT DEFAULT 'personal', -- 'personal' ou 'nutricionista'
    tipo TEXT NOT NULL, 
    -- Nomenclaturas Oficiais:
    -- 'Consulta Nutricional Inicial'
    -- 'Retorno / Ajuste Nutricional'
    -- 'Bioimpedância & Avaliação Física'
    -- 'Consultoria Presencial (Personal)'
    -- 'Treino Guiado / Acompanhamento de Carga'
    -- 'Alinhamento de Metas & Feedback Semanal (Online)'
    data TEXT,
    data_iso DATE,
    hora TEXT NOT NULL,
    descricao TEXT, -- Observações / Pauta da Sessão
    status TEXT DEFAULT 'Confirmada', -- 'Confirmada', 'Pendente', 'Concluída', 'Cancelada'
    video BOOLEAN DEFAULT true,
    meet_link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para otimização de busca na agenda
CREATE INDEX IF NOT EXISTS idx_appointments_aluno_id ON appointments(aluno_id);
CREATE INDEX IF NOT EXISTS idx_appointments_data_iso ON appointments(data_iso);
CREATE INDEX IF NOT EXISTS idx_appointments_created_at ON appointments(created_at DESC);

-- Habilitar Row Level Security (RLS)
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso RLS para appointments
DROP POLICY IF EXISTS "Permitir leitura em appointments" ON appointments;
CREATE POLICY "Permitir leitura em appointments"
    ON appointments FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Permitir inserção em appointments" ON appointments;
CREATE POLICY "Permitir inserção em appointments"
    ON appointments FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualização em appointments" ON appointments;
CREATE POLICY "Permitir atualização em appointments"
    ON appointments FOR UPDATE
    USING (true);

DROP POLICY IF EXISTS "Permitir exclusão em appointments" ON appointments;
CREATE POLICY "Permitir exclusão em appointments"
    ON appointments FOR DELETE
    USING (true);


-- 2. TABELA DE CHECK-INS SEMANAIS (Acompanhamento e Feedback Periódico)
CREATE TABLE IF NOT EXISTS checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    aluno_nome TEXT,
    semana_referencia DATE DEFAULT CURRENT_DATE,
    peso_atual NUMERIC(5,2),
    treinos_realizados INTEGER DEFAULT 0,
    adesao_dieta TEXT, -- '100% no plano', 'Pequenos desvios', 'Fora do plano'
    qualidade_sono TEXT, -- 'Ótimo (7-8h)', 'Bom (6-7h)', 'Regular (5h)', 'Péssimo (<5h)'
    nivel_energia TEXT, -- 'Alto', 'Médio', 'Baixo'
    nivel_fome TEXT, -- 'Normal', 'Aumentada à noite', 'Baixa', 'Descontrolada'
    nivel_estresse TEXT, -- 'Baixo', 'Moderado', 'Alto'
    dificuldade_dieta TEXT,
    observacoes TEXT,
    status_indicador TEXT DEFAULT 'verde', -- 'verde' (Em Dia), 'amarelo' (Atenção), 'vermelho' (Pendente/Crítico)
    fotos JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para consultas de checkins
CREATE INDEX IF NOT EXISTS idx_checkins_aluno_id ON checkins(aluno_id);
CREATE INDEX IF NOT EXISTS idx_checkins_created_at ON checkins(created_at DESC);

-- Habilitar RLS
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura em checkins" ON checkins;
CREATE POLICY "Permitir leitura em checkins"
    ON checkins FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Permitir inserção em checkins" ON checkins;
CREATE POLICY "Permitir inserção em checkins"
    ON checkins FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualização em checkins" ON checkins;
CREATE POLICY "Permitir atualização em checkins"
    ON checkins FOR UPDATE
    USING (true);


-- 3. TABELA DE MEDIDAS & AVALIAÇÃO ANTROPOMÉTRICA
CREATE TABLE IF NOT EXISTS medidas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    data_registro DATE DEFAULT CURRENT_DATE,
    peso NUMERIC(5,2),
    altura NUMERIC(4,2),
    percentual_gordura NUMERIC(4,1),
    massa_muscular NUMERIC(4,1),
    pescoco NUMERIC(4,1),
    ombros NUMERIC(4,1),
    torax NUMERIC(4,1),
    cintura NUMERIC(4,1),
    abdomen NUMERIC(4,1),
    quadril NUMERIC(4,1),
    braco_direito NUMERIC(4,1),
    braco_esquerdo NUMERIC(4,1),
    antebraco_direito NUMERIC(4,1),
    antebraco_esquerdo NUMERIC(4,1),
    coxa_direita NUMERIC(4,1),
    coxa_esquerda NUMERIC(4,1),
    panturrilha_direita NUMERIC(4,1),
    panturrilha_esquerda NUMERIC(4,1),
    observacoes TEXT,
    avaliador_nome TEXT,
    tipo_modulo TEXT DEFAULT 'personal', -- 'personal' ou 'nutricionista'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para medidas
CREATE INDEX IF NOT EXISTS idx_medidas_aluno_id ON medidas(aluno_id);
CREATE INDEX IF NOT EXISTS idx_medidas_data_registro ON medidas(data_registro DESC);

-- Habilitar RLS
ALTER TABLE medidas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura em medidas" ON medidas;
CREATE POLICY "Permitir leitura em medidas"
    ON medidas FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Permitir inserção em medidas" ON medidas;
CREATE POLICY "Permitir inserção em medidas"
    ON medidas FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualização em medidas" ON medidas;
CREATE POLICY "Permitir atualização em medidas"
    ON medidas FOR UPDATE
    USING (true);
