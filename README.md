# Luci College — Portal de Prêmios

Sistema de catálogo de prêmios para alunos da **Luci College Technology Campus**.  
Alunos acumulam pontos por atividades acadêmicas e trocam por produtos e serviços exclusivos.

---

## Stack Tecnológica

| Camada     | Tecnologia                     |
|------------|-------------------------------|
| Frontend   | HTML5, CSS3, JavaScript (ES6+) |
| Backend    | Python 3.11+ / Flask           |
| Banco      | PostgreSQL 15+                 |

---

## Estrutura do Projeto

```
luci-college/
├── backend/
│   ├── app.py          ← API Flask (rotas, autenticação, lógica de negócio)
│   └── schema.sql      ← Schema PostgreSQL + dados de seed
├── static/
│   ├── css/
│   │   └── style.css   ← Estilos completos (tema dark tech)
│   └── js/
│       └── app.js      ← Lógica frontend (login, catálogo, modal, resgates)
├── templates/
│   └── index.html      ← Página única (SPA-like)
├── requirements.txt
└── README.md
```

---

## Setup Rápido

### 1. PostgreSQL — Criar banco e schema

```bash
# Criar banco
psql -U postgres -c "CREATE DATABASE luci_college;"

# Executar schema + seed
psql -U postgres -d luci_college -f backend/schema.sql
```

### 2. Variáveis de ambiente

Crie um arquivo `.env` na raiz:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=luci_college
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui

SECRET_KEY=uma-chave-secreta-forte-aqui
ADMIN_TOKEN=luci-admin-2025
```

### 3. Instalar dependências Python

```bash
pip install -r requirements.txt
```

### 4. Rodar a aplicação

```bash
cd backend
python app.py
```

Acesse: **http://localhost:5000**

---

## Login de Demonstração

| Matrícula    | Senha    | Aluno                  |
|-------------|----------|------------------------|
| `LC2024001` | `luci123`| Ana Luíza Ferreira     |
| `LC2024002` | `luci123`| Carlos Eduardo Silva   |
| `LC2024003` | `luci123`| Mariana Souza Faria    |

---

## Schema do Banco

### Tabelas principais

#### `alunos`
| Coluna                | Tipo          | Descrição                   |
|-----------------------|---------------|-----------------------------|
| `id`                  | SERIAL PK     | Identificador               |
| `matricula`           | VARCHAR(20)   | Código único do aluno       |
| `nome`                | VARCHAR(120)  | Nome completo               |
| `email`               | VARCHAR(150)  | E-mail institucional        |
| `curso`               | VARCHAR(100)  | Curso matriculado           |
| `senha_hash`          | CHAR(64)      | SHA-256 da senha            |
| `pontos_disponiveis`  | INTEGER       | Saldo atual de pontos       |
| `pontos_resgatados`   | INTEGER       | Total histórico resgatado   |
| `ativo`               | BOOLEAN       | Conta ativa/inativa         |

#### `premios`
| Coluna       | Tipo               | Descrição                 |
|--------------|--------------------|---------------------------|
| `id`         | SERIAL PK          | Identificador             |
| `nome`       | VARCHAR(120)       | Nome do prêmio            |
| `descricao`  | TEXT               | Descrição detalhada       |
| `emoji`      | VARCHAR(10)        | Ícone de exibição         |
| `categoria`  | ENUM               | mochila/papelaria/servico/acessorio |
| `pontos`     | INTEGER            | Custo em pontos           |
| `estoque`    | INTEGER            | Quantidade disponível     |

#### `resgates`
| Coluna          | Tipo           | Descrição                  |
|-----------------|----------------|----------------------------|
| `id`            | SERIAL PK      | Identificador              |
| `aluno_id`      | FK alunos      | Aluno que resgatou         |
| `premio_id`     | FK premios     | Prêmio resgatado           |
| `pontos_gastos` | INTEGER        | Pontos utilizados          |
| `status`        | ENUM           | pendente/aprovado/cancelado/entregue |
| `data_resgate`  | TIMESTAMP      | Data/hora do resgate       |

#### `movimentos_pontos`
Histórico de todos os créditos e débitos de pontos por aluno.

---

## Endpoints da API

| Método | Rota                          | Descrição                        |
|--------|-------------------------------|----------------------------------|
| POST   | `/api/login`                  | Autenticar aluno                 |
| POST   | `/api/logout`                 | Encerrar sessão                  |
| GET    | `/api/products`               | Listar prêmios (filtro: ?categoria=&q=) |
| GET    | `/api/products/:id`           | Detalhes de um prêmio            |
| POST   | `/api/resgatar`               | Realizar resgate (requer login)  |
| GET    | `/api/historico/:user_id`     | Histórico do aluno               |
| GET    | `/api/ranking`                | Ranking do semestre              |
| POST   | `/api/admin/add-pontos`       | Adicionar pontos (requer token admin) |

---

## Funcionalidades da UI

- ✅ Tela de login com validação e feedback visual
- ✅ Painel de pontos com barra de nível progressiva
- ✅ Catálogo com filtro por categoria e busca em tempo real
- ✅ Cards indicam disponibilidade (saldo suficiente / esgotado)
- ✅ Modal de resgate com confirmação e debite automático
- ✅ Histórico de resgates com status
- ✅ Ranking do semestre com destaque para o aluno logado
- ✅ Design responsivo (mobile-first)
- ✅ Modo demo funciona sem backend (dados mockados no JS)

---

## Segurança

- Senhas armazenadas como SHA-256 (recomendado usar bcrypt em produção)
- Sessão server-side via Flask sessions
- Transações atômicas no PostgreSQL para resgates (evita race conditions)
- Validação de saldo e estoque com `FOR UPDATE` (row-level lock)
- Token admin protege endpoint de adição de pontos

---

*Luci College Technology Campus — Sistema de Prêmios Acadêmicos*
