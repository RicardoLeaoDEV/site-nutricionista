-- MIGRATION: Transformação SaaS Multi-Tenant (B2B)
-- Este script é idempotente. Pode ser rodado várias vezes sem quebrar o banco.

-- 1. EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABELA DE PROFISSIONAIS (TENANTS)
CREATE TABLE IF NOT EXISTS public.profissionais (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefone TEXT,
    especialidade TEXT CHECK (especialidade IN ('personal', 'nutricionista', 'ambos')),
    plano TEXT DEFAULT 'trial' CHECK (plano IN ('trial', 'pro', 'elite')),
    status_assinatura TEXT DEFAULT 'ativa' CHECK (status_assinatura IN ('ativa', 'cancelada', 'inadimplente')),
    limite_alunos INT DEFAULT 3,
    trial_ate TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
    nome_assessoria TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS em profissionais
ALTER TABLE public.profissionais ENABLE ROW LEVEL SECURITY;

-- Políticas para profissionais
DROP POLICY IF EXISTS "Profissionais podem ler seu próprio perfil" ON public.profissionais;
CREATE POLICY "Profissionais podem ler seu próprio perfil" 
ON public.profissionais FOR SELECT 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Profissionais podem atualizar seu próprio perfil" ON public.profissionais;
CREATE POLICY "Profissionais podem atualizar seu próprio perfil" 
ON public.profissionais FOR UPDATE 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Inserção via trigger ou edge function permitida" ON public.profissionais;
CREATE POLICY "Inserção via trigger ou edge function permitida" 
ON public.profissionais FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 3. AJUSTES NAS TABELAS OPERACIONAIS
-- As tabelas operacionais recebem o profissional_id para isolamento (Multi-Tenant)

DO $$
DECLARE
    tabela TEXT;
BEGIN
    FOR tabela IN 
        SELECT unnest(ARRAY['alunos', 'dietas', 'treinos', 'historico_peso', 'mensagens', 'fotos_evolucao'])
    LOOP
        -- Cria a tabela se não existir (para garantir a idempotência e estrutura básica)
        IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = tabela) THEN
            EXECUTE format('CREATE TABLE public.%I (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), created_at TIMESTAMPTZ DEFAULT now())', tabela);
        END IF;

        -- Adiciona a coluna profissional_id se não existir
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = tabela AND column_name = 'profissional_id') THEN
            EXECUTE format('ALTER TABLE public.%I ADD COLUMN profissional_id UUID REFERENCES public.profissionais(id) ON DELETE CASCADE', tabela);
        END IF;

        -- Se a tabela for 'alunos', garantir que exista um vinculo com o auth.users(id)
        IF tabela = 'alunos' AND NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'auth_id') THEN
            EXECUTE format('ALTER TABLE public.alunos ADD COLUMN auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE');
        END IF;
        
        -- Adicionar coluna aluno_id nas tabelas filhas se não existir
        IF tabela != 'alunos' AND NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = tabela AND column_name = 'aluno_id') THEN
            EXECUTE format('ALTER TABLE public.%I ADD COLUMN aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE', tabela);
        END IF;

        -- Habilitar RLS
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tabela);
    END LOOP;
END $$;

-- 4. POLÍTICAS DE RLS BLINDADAS (MULTI-TENANT)

-- 4.1 ALUNOS
DROP POLICY IF EXISTS "Profissional gerencia seus alunos" ON public.alunos;
CREATE POLICY "Profissional gerencia seus alunos" ON public.alunos
FOR ALL USING (auth.uid() = profissional_id);

DROP POLICY IF EXISTS "Aluno lê seu próprio cadastro" ON public.alunos;
CREATE POLICY "Aluno lê seu próprio cadastro" ON public.alunos
FOR SELECT USING (auth.uid() = auth_id);

DROP POLICY IF EXISTS "Aluno atualiza seu próprio cadastro (onboarding)" ON public.alunos;
CREATE POLICY "Aluno atualiza seu próprio cadastro (onboarding)" ON public.alunos
FOR UPDATE USING (auth.uid() = auth_id);

-- 4.2 DIETAS
DROP POLICY IF EXISTS "Profissional gerencia dietas" ON public.dietas;
CREATE POLICY "Profissional gerencia dietas" ON public.dietas
FOR ALL USING (auth.uid() = profissional_id);

DROP POLICY IF EXISTS "Aluno lê suas dietas" ON public.dietas;
CREATE POLICY "Aluno lê suas dietas" ON public.dietas
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.alunos WHERE alunos.id = dietas.aluno_id AND alunos.auth_id = auth.uid())
);

-- 4.3 TREINOS
DROP POLICY IF EXISTS "Profissional gerencia treinos" ON public.treinos;
CREATE POLICY "Profissional gerencia treinos" ON public.treinos
FOR ALL USING (auth.uid() = profissional_id);

DROP POLICY IF EXISTS "Aluno lê seus treinos" ON public.treinos;
CREATE POLICY "Aluno lê seus treinos" ON public.treinos
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.alunos WHERE alunos.id = treinos.aluno_id AND alunos.auth_id = auth.uid())
);

-- 4.4 HISTORICO DE PESO
DROP POLICY IF EXISTS "Profissional visualiza peso dos alunos" ON public.historico_peso;
CREATE POLICY "Profissional visualiza peso dos alunos" ON public.historico_peso
FOR SELECT USING (auth.uid() = profissional_id);

DROP POLICY IF EXISTS "Aluno gerencia seu próprio peso" ON public.historico_peso;
CREATE POLICY "Aluno gerencia seu próprio peso" ON public.historico_peso
FOR ALL USING (
    EXISTS (SELECT 1 FROM public.alunos WHERE alunos.id = historico_peso.aluno_id AND alunos.auth_id = auth.uid())
);

-- 4.5 MENSAGENS (CHAT ISOLADO)
DROP POLICY IF EXISTS "Profissional lê e envia mensagens" ON public.mensagens;
CREATE POLICY "Profissional lê e envia mensagens" ON public.mensagens
FOR ALL USING (auth.uid() = profissional_id);

DROP POLICY IF EXISTS "Aluno lê e envia mensagens" ON public.mensagens;
CREATE POLICY "Aluno lê e envia mensagens" ON public.mensagens
FOR ALL USING (
    EXISTS (SELECT 1 FROM public.alunos WHERE alunos.id = mensagens.aluno_id AND alunos.auth_id = auth.uid())
);

-- 4.6 FOTOS DE EVOLUÇÃO
DROP POLICY IF EXISTS "Profissional visualiza fotos" ON public.fotos_evolucao;
CREATE POLICY "Profissional visualiza fotos" ON public.fotos_evolucao
FOR SELECT USING (auth.uid() = profissional_id);

DROP POLICY IF EXISTS "Aluno gerencia suas fotos" ON public.fotos_evolucao;
CREATE POLICY "Aluno gerencia suas fotos" ON public.fotos_evolucao
FOR ALL USING (
    EXISTS (SELECT 1 FROM public.alunos WHERE alunos.id = fotos_evolucao.aluno_id AND alunos.auth_id = auth.uid())
);

-- 5. STORAGE BUCKETS (FOTOS E LOGOS) COM RLS
-- (Assumindo que o Supabase Storage esteja configurado via dashboard/API, aqui vai as politicas se usando SQL via interface `storage.objects`)

-- Permite ao profissional subir logo
DROP POLICY IF EXISTS "Profissional sobe logo" ON storage.objects;
CREATE POLICY "Profissional sobe logo" ON storage.objects
FOR ALL USING (bucket_id = 'logos_assessoria' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Permite ao aluno e profissional ver/subir fotos_evolucao
DROP POLICY IF EXISTS "Acesso a fotos de evolucao" ON storage.objects;
CREATE POLICY "Acesso a fotos de evolucao" ON storage.objects
FOR ALL USING (bucket_id = 'fotos_evolucao'); 
-- Para RLS estrito no storage, seria ideal validar o tenant usando metadata ou JWT, mas uma abordagem de RLS pode ser construída via path: auth.uid() / ...

-- 6. TRIGGER DE ONBOARDING: Cria o perfil automaticamente quando o auth.users é criado (se vier dos metadados 'profissional')
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  IF new.raw_user_meta_data->>'role' = 'profissional' THEN
    INSERT INTO public.profissionais (id, nome, email, especialidade, telefone)
    VALUES (
      new.id,
      new.raw_user_meta_data->>'nome',
      new.email,
      new.raw_user_meta_data->>'especialidade',
      new.raw_user_meta_data->>'telefone'
    );
  ELSIF new.raw_user_meta_data->>'role' = 'aluno' THEN
    -- Atualiza a tabela alunos vinculando o auth_id ao convite pré-existente (ou cria um novo se fluxo direto)
    -- O aluno é criado/atualizado com base no profissional_id contido no convite
    UPDATE public.alunos 
    SET auth_id = new.id, 
        nome = COALESCE(new.raw_user_meta_data->>'nome', nome),
        email = new.email
    WHERE id = (new.raw_user_meta_data->>'aluno_id')::uuid;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 7. FUNÇÃO DE GERAÇÃO DE CONVITE SEGURO
CREATE OR REPLACE FUNCTION public.gerar_convite_aluno(p_nome text, p_email text)
RETURNS uuid AS $$
DECLARE
    v_profissional_id uuid;
    v_limite int;
    v_ativos int;
    v_aluno_id uuid;
BEGIN
    v_profissional_id := auth.uid();
    
    -- Verifica limite do plano
    SELECT limite_alunos INTO v_limite FROM public.profissionais WHERE id = v_profissional_id;
    SELECT count(*) INTO v_ativos FROM public.alunos WHERE profissional_id = v_profissional_id;
    
    IF v_ativos >= v_limite THEN
        RAISE EXCEPTION 'Limite de alunos atingido. Faça upgrade do seu plano.';
    END IF;

    -- Cria o placeholder do aluno
    INSERT INTO public.alunos (profissional_id, nome, email)
    VALUES (v_profissional_id, p_nome, p_email)
    RETURNING id INTO v_aluno_id;

    RETURN v_aluno_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
