-- ══════════════════════════════════════════════════════════
--   LUCI COLLEGE — Schema PostgreSQL
--   Banco: luci_college
--   Executar: psql -U postgres -d luci_college -f schema.sql
-- ══════════════════════════════════════════════════════════

-- ─── EXTENSÕES ───────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ─── ENUM TIPOS ──────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE status_resgate AS ENUM ('pendente', 'aprovado', 'cancelado', 'entregue');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE tipo_movimento AS ENUM ('credito', 'debito');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE categoria_premio AS ENUM ('mochila', 'papelaria', 'servico', 'acessorio', 'outro');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ──────────────────────────────────────────────────────────
--  TABELA: alunos
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alunos (
  id                  SERIAL PRIMARY KEY,
  matricula           VARCHAR(20)  NOT NULL UNIQUE,
  nome                VARCHAR(120) NOT NULL,
  email               VARCHAR(150) NOT NULL UNIQUE,
  curso               VARCHAR(100) NOT NULL,
  senha_hash          CHAR(64)     NOT NULL,           -- SHA-256 hex
  pontos_disponiveis  INTEGER      NOT NULL DEFAULT 0 CHECK (pontos_disponiveis >= 0),
  pontos_resgatados   INTEGER      NOT NULL DEFAULT 0,
  ativo               BOOLEAN      NOT NULL DEFAULT TRUE,
  criado_em           TIMESTAMP    NOT NULL DEFAULT NOW(),
  atualizado_em       TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Trigger: atualiza atualizado_em automaticamente
CREATE OR REPLACE FUNCTION set_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_alunos_upd ON alunos;
CREATE TRIGGER trg_alunos_upd
  BEFORE UPDATE ON alunos
  FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();

-- ──────────────────────────────────────────────────────────
--  TABELA: premios
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS premios (
  id          SERIAL PRIMARY KEY,
  nome        VARCHAR(120)     NOT NULL,
  descricao   TEXT             NOT NULL DEFAULT '',
  emoji       VARCHAR(10)      NOT NULL DEFAULT '🎁',
  categoria   categoria_premio NOT NULL DEFAULT 'outro',
  pontos      INTEGER          NOT NULL CHECK (pontos > 0),
  estoque     INTEGER          NOT NULL DEFAULT 0 CHECK (estoque >= 0),
  imagem_url  VARCHAR(300),
  ativo       BOOLEAN          NOT NULL DEFAULT TRUE,
  criado_em   TIMESTAMP        NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────
--  TABELA: resgates
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resgates (
  id              SERIAL PRIMARY KEY,
  aluno_id        INTEGER          NOT NULL REFERENCES alunos(id) ON DELETE RESTRICT,
  premio_id       INTEGER          NOT NULL REFERENCES premios(id) ON DELETE RESTRICT,
  pontos_gastos   INTEGER          NOT NULL,
  status          status_resgate   NOT NULL DEFAULT 'pendente',
  data_resgate    TIMESTAMP        NOT NULL DEFAULT NOW(),
  data_entrega    TIMESTAMP,
  observacao      TEXT
);

CREATE INDEX IF NOT EXISTS idx_resgates_aluno ON resgates(aluno_id);
CREATE INDEX IF NOT EXISTS idx_resgates_premio ON resgates(premio_id);
CREATE INDEX IF NOT EXISTS idx_resgates_status ON resgates(status);

-- ──────────────────────────────────────────────────────────
--  TABELA: movimentos_pontos  (log de créditos/débitos)
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS movimentos_pontos (
  id          SERIAL PRIMARY KEY,
  aluno_id    INTEGER         NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  pontos      INTEGER         NOT NULL,
  tipo        tipo_movimento  NOT NULL,
  motivo      VARCHAR(200)    NOT NULL DEFAULT '',
  criado_em   TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mov_aluno ON movimentos_pontos(aluno_id);

-- ──────────────────────────────────────────────────────────
--  VIEWS ÚTEIS
-- ──────────────────────────────────────────────────────────

-- Ranking geral
CREATE OR REPLACE VIEW vw_ranking AS
  SELECT
    a.id,
    a.nome,
    a.matricula,
    a.curso,
    a.pontos_disponiveis,
    a.pontos_resgatados,
    (a.pontos_disponiveis + a.pontos_resgatados) AS pontos_totais,
    RANK() OVER (ORDER BY (a.pontos_disponiveis + a.pontos_resgatados) DESC) AS posicao
  FROM alunos a
  WHERE a.ativo = TRUE;

-- Extrato por aluno
CREATE OR REPLACE VIEW vw_extrato AS
  SELECT
    r.id,
    a.nome AS aluno,
    a.matricula,
    p.nome AS premio,
    p.categoria,
    r.pontos_gastos,
    r.status,
    r.data_resgate,
    r.data_entrega
  FROM resgates r
  JOIN alunos  a ON a.id = r.aluno_id
  JOIN premios p ON p.id = r.premio_id
  ORDER BY r.data_resgate DESC;

-- ══════════════════════════════════════════════════════════
--  SEED DATA — Dados de exemplo para desenvolvimento
-- ══════════════════════════════════════════════════════════

-- Senha padrão de todos os alunos demo: "luci123"
-- SHA-256("luci123") = 8d9a1fa3c8d9b9399bef7db7cfcf2b6f4e7d3d82db9f8c6b7a9e0d1e5c4f8a92

-- Alunos de exemplo
INSERT INTO alunos (matricula, nome, email, curso, senha_hash, pontos_disponiveis, pontos_resgatados)
VALUES
  ('LC2024001', 'Ana Luíza Ferreira',    'ana.ferreira@luci.edu.br',    'Engenharia de Software',   '8d9a1fa3c8d9b9399bef7db7cfcf2b6f4e7d3d82db9f8c6b7a9e0d1e5c4f8a92', 3850, 1200),
  ('LC2024002', 'Carlos Eduardo Silva',  'carlos.silva@luci.edu.br',    'Ciência da Computação',    '8d9a1fa3c8d9b9399bef7db7cfcf2b6f4e7d3d82db9f8c6b7a9e0d1e5c4f8a92', 6420,  800),
  ('LC2024003', 'Mariana Souza Faria',   'mariana.faria@luci.edu.br',   'Engenharia de Software',   '8d9a1fa3c8d9b9399bef7db7cfcf2b6f4e7d3d82db9f8c6b7a9e0d1e5c4f8a92', 5890, 1100),
  ('LC2024004', 'Rafael Lima Andrade',   'rafael.andrade@luci.edu.br',  'Análise e Sistemas',       '8d9a1fa3c8d9b9399bef7db7cfcf2b6f4e7d3d82db9f8c6b7a9e0d1e5c4f8a92', 5210,  600),
  ('LC2024005', 'Juliana Pires Mello',   'juliana.mello@luci.edu.br',   'Redes de Computadores',    '8d9a1fa3c8d9b9399bef7db7cfcf2b6f4e7d3d82db9f8c6b7a9e0d1e5c4f8a92', 4700,  900),
  ('LC2024006', 'Bruno Carvalho Rocha',  'bruno.rocha@luci.edu.br',     'Cybersecurity',            '8d9a1fa3c8d9b9399bef7db7cfcf2b6f4e7d3d82db9f8c6b7a9e0d1e5c4f8a92', 4300,  700),
  ('LC2024007', 'Letícia Alves Santos',  'leticia.santos@luci.edu.br',  'Ciência da Computação',    '8d9a1fa3c8d9b9399bef7db7cfcf2b6f4e7d3d82db9f8c6b7a9e0d1e5c4f8a92', 3990,  500),
  ('LC2024008', 'Pedro Henrique Gomes',  'pedro.gomes@luci.edu.br',     'Análise e Sistemas',       '8d9a1fa3c8d9b9399bef7db7cfcf2b6f4e7d3d82db9f8c6b7a9e0d1e5c4f8a92', 3760,  400)
ON CONFLICT (matricula) DO NOTHING;

-- Catálogo de prêmios
INSERT INTO premios (nome, descricao, emoji, categoria, pontos, estoque)
VALUES
  ('Mochila Luci College',      'Mochila resistente com logo bordado, compartimento para notebook 15", USB embutido.',                    '🎒', 'mochila',   2500,  8),
  ('Caderno A5 Luci',           'Caderno capa dura A5, 200 páginas pautadas, com marcador de página Luci College.',                       '📓', 'papelaria',  600, 25),
  ('Vale Salgado — Cantina',    'Um salgado ou lanche à escolha na cantina central. Válido por 30 dias após o resgate.',                   '🥪', 'servico',    200, 99),
  ('Kit Canetas (6un)',          'Kit com 6 canetas esferográficas azuis, pretas e vermelhas com logo Luci College.',                       '🖊️', 'papelaria',  300, 40),
  ('Chaveiro Metálico Luci',    'Chaveiro em metal com acabamento fosco e gravação do brasão da Luci College.',                            '🔑', 'acessorio',  150, 60),
  ('Estojo Tech Luci',          'Estojo rígido com zíper duplo, porta estilete, porta USB e espaço para cabos.',                          '💼', 'papelaria',  900, 15),
  ('Garrafa Térmica 500ml',     'Garrafa térmica inox 500ml, mantém temperatura por até 12h. Logo Luci College em relevo.',               '🫙', 'acessorio', 1200, 10),
  ('Vale Almoço — Rest. U.',    'Um almoço completo no Restaurante Universitário. Prato principal, salada e sobremesa.',                   '🍱', 'servico',    450, 30),
  ('Caneca Luci Tech',          'Caneca de porcelana 350ml com design exclusivo da turma de Tecnologia.',                                  '☕', 'acessorio',  500, 20),
  ('Impressão A4 — 50 folhas',  'Crédito de 50 impressões A4 P&B nas impressoras do campus. Expira em 60 dias.',                          '🖨️', 'servico',    350, 99),
  ('Mochila Slim Luci Pro',     'Versão slim premium com sistema anti-roubo e alças acolchoadas ergonômicas.',                             '🎒', 'mochila',   3500,  4),
  ('Agenda 2025 Luci',          'Agenda semanal capa dura 2025 com calendário acadêmico Luci College e datas de avaliações.',              '📅', 'papelaria',  750, 18)
ON CONFLICT DO NOTHING;

-- Histórico de resgates de exemplo (aluno LC2024001)
INSERT INTO resgates (aluno_id, premio_id, pontos_gastos, status, data_resgate)
SELECT
  a.id, p.id, p.pontos, 'aprovado'::status_resgate, NOW() - (n || ' days')::interval
FROM alunos a
CROSS JOIN (VALUES (2,'Caderno A5 Luci',15), (4,'Kit Canetas (6un)',45), (6,'Estojo Tech Luci',80), (3,'Vale Salgado — Cantina',100)) AS h(n, nome, d)
JOIN premios p ON p.nome = h.nome
WHERE a.matricula = 'LC2024001'
ON CONFLICT DO NOTHING;

-- ─── FUNÇÃO: ranking_semestre ─────────────────────────
CREATE OR REPLACE FUNCTION ranking_semestre(limite INT DEFAULT 10)
RETURNS TABLE (
  posicao      BIGINT,
  nome         VARCHAR,
  matricula    VARCHAR,
  curso        VARCHAR,
  pontos_totais INTEGER
) AS $$
  SELECT
    RANK() OVER (ORDER BY (a.pontos_disponiveis + a.pontos_resgatados) DESC) AS posicao,
    a.nome, a.matricula, a.curso,
    (a.pontos_disponiveis + a.pontos_resgatados) AS pontos_totais
  FROM alunos a
  WHERE a.ativo = TRUE
  ORDER BY pontos_totais DESC
  LIMIT limite;
$$ LANGUAGE SQL STABLE;
