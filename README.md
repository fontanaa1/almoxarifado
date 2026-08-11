# 📦 Sistema de Gestão de Almoxarifado (SENAI)

## Sobre o Projeto

Um sistema web moderno e responsivo desenvolvido para otimizar o controle e a gestão de estoque em almoxarifados. Criado com foco na praticidade operacional, o sistema automatiza o cadastro de materiais e simplifica processos rotineiros como entradas, saídas e auditorias.

### Principais Funcionalidades:

- 📊 **Dashboard em Tempo Real**: Visão geral do estoque, itens em baixa quantidade, número de categorias e movimentações do dia.
- 🏷️ **Geração Automática de SKUs**: Organização inteligente de materiais baseada em Famílias e Tipos (ex: FER.MAN.0001).
- 📱 **Leitor e Gerador de QR Code Integrado**: Permite escanear a etiqueta de um produto direto pela câmera do celular ou webcam para registrar entradas e saídas de forma instantânea.
- 🔄 **Histórico de Movimentações**: Rastreamento completo de quem retirou ou adicionou materiais, incluindo data, hora e o motivo da movimentação.
- 🗄️ **Arquivo Morto**: Sistema de arquivamento para itens obsoletos ou danificados, sem perder o histórico.

### Tecnologias Utilizadas:

- **Front-end**: HTML5, JavaScript (Vanilla), Tailwind CSS (estilização) e bibliotecas `html5-qrcode` / `qrcodejs`.
- **Back-end**: Node.js com Express hospedado via arquitetura Serverless na Vercel.
- **Banco de Dados**: PostgreSQL hospedado no Supabase.

### Acesso à Hospedagem

- **Frontend**: https://github.com/fontanaa1/frontend_almoxarifado.git
- **Backend API**: https://github.com/11isinha/backend_almoxarifado3.git

---

## 📋 Índice

- [Pré-requisitos](#pré-requisitos)
- [Instalação e Configuração](#instalação-e-configuração)
- [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Executando o Projeto](#executando-o-projeto)
- [Deploy na Vercel](#deploy-na-vercel)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Endpoints da API](#endpoints-da-api)
- [Como Usar](#como-usar)
- [Contribuição](#contribuição)
- [Licença](#licença)

---

## 🚀 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) (versão 16 ou superior)
- [npm](https://www.npmjs.com/) (geralmente vem com o Node.js)
- [Git](https://git-scm.com/)
- Uma conta no [Supabase](https://supabase.com/) para o banco de dados
- Uma conta na [Vercel](https://vercel.com/) para deploy 

---

## 📦 Instalação e Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/almoxarifado-senai.git
cd almoxarifado-senai
```

### 2. Instale as dependências do backend

```bash
npm install
```

### 3. Instale as dependências adicionais

```bash
npm install @supabase/supabase-js cors dotenv express qrcode
```

### 4. Configure o arquivo .env

Crie um arquivo .env na raiz do projeto:

```bash
SUPABASE_URL=sua_url_do_supabase
SUPABASE_KEY=sua_chave_anon_do_supabase
PORT=300
```

---

## 🗄️ Configuração do Banco de Dados

### 1. Crie uma conta no Supabase

Acesse https://supabase.com e crie uma conta gratuita.

### 2. Crie um novo projeto

-Clique em "New Project"
-Escolha um nome para o projeto
-Defina uma senha forte para o banco de dados
-Aguarde a criação (pode levar alguns minutos)

### 3.  Execute as migrações SQL

No painel do Supabase, vá para SQL Editor e execute o seguinte script :

```bash
-- Tabela de Famílias
CREATE TABLE familias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo VARCHAR(3) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Tipos
CREATE TABLE tipos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    familia_id UUID REFERENCES familias(id) ON DELETE CASCADE,
    codigo VARCHAR(3) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(familia_id, codigo)
);

-- Tabela de Materiais
CREATE TABLE materiais (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sku VARCHAR(15) NOT NULL UNIQUE, -- Formato: FFF.TTT.PPPP
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(50),
    localizacao VARCHAR(100),
    quantidade INTEGER DEFAULT 0,
    estoque_minimo INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ativo', -- ativo, morto, baixa
    qr_code TEXT,
    motivo_arquivamento TEXT,
    data_arquivamento DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Movimentações
CREATE TABLE movimentacoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    material_id UUID REFERENCES materiais(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL, -- entrada, saida, arquivamento, restauracao
    quantidade INTEGER NOT NULL,
    responsavel VARCHAR(100) NOT NULL,
    motivo TEXT,
    observacao TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Função para atualizar o updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_materiais_updated_at
BEFORE UPDATE ON materiais
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Função para gerar próximo código SKU
CREATE OR REPLACE FUNCTION gerar_proximo_sku(
    p_familia_codigo VARCHAR(3),
    p_tipo_codigo VARCHAR(3)
)
RETURNS VARCHAR(15) AS $$
DECLARE
    v_proximo_numero INTEGER;
    v_sku VARCHAR(15);
BEGIN
    -- Busca o maior número sequencial para a combinação de família e tipo
    SELECT COALESCE(MAX(CAST(SUBSTRING(sku FROM 9 FOR 4) AS INTEGER)), 0) + 1
    INTO v_proximo_numero
    FROM materiais
    WHERE sku LIKE p_familia_codigo || '.' || p_tipo_codigo || '.%';
    
    -- Formata o SKU com 4 dígitos
    v_sku := p_familia_codigo || '.' || p_tipo_codigo || '.' || LPAD(v_proximo_numero::TEXT, 4, '0');
    
    RETURN v_sku;
END;
$$ LANGUAGE plpgsql;

-- Índices para performance
CREATE INDEX idx_materiais_sku ON materiais(sku);
CREATE INDEX idx_materiais_status ON materiais(status);
CREATE INDEX idx_movimentacoes_material_id ON movimentacoes(material_id);
CREATE INDEX idx_movimentacoes_created_at ON movimentacoes(created_at);
```

### 4. Obtenha as credenciais do Supabase

No painel do Supabase:

1. Vá para Settings → API
2. Copie a URL e a anon/public key
3. Adicione essas informações ao seu arquivo .env

## 🔧 Variáveis de Ambiente

Arquivo .env (Backend)
```bash
# Supabase Configuration
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua_chave_anon_aqui

# Server Configuration
PORT=3000
NODE_ENV=development

# Frontend URL (para CORS)
FRONTEND_URL=http://localhost:5500
```
Variáveis para o Frontend
No arquivo index.html do frontend, configure a URL da API:
```bash
// ALTERE PARA A URL DO SEU BACKEND
const API_URL = 'http://localhost:3000/api';
// Em produção: 'https://seu-backend.vercel.app/api'

```
## ▶️ Executando o Projeto
### Backend
```bash
# Modo desenvolvimento (com nodemon)
npm run dev

# Modo produção
npm start
```
O servidor estará rodando em http://localhost:3000

### Frontend
Para o frontend, você pode:

1. Usar o Live Server do VS Code:

Abra o arquivo index.html

Clique com o botão direito → "Open with Live Server"

2. Usar um servidor HTTP simples:
```bash
npx serve public/
```
3.Abrir diretamente:

Double-click no arquivo index.html

### Testando a API
```bash
# Health Check
curl http://localhost:3000/health

# Listar Famílias
curl http://localhost:3000/api/familias

# Listar Materiais
curl http://localhost:3000/api/materiais?status=ativo
```
## 🚀 Deploy na Vercel

### Backend (Serverless)
1. Estrutura para a Vercel
```bash
backend-vercel/
├── api/
│   └── server.js          # Seu backend completo
├── .env                   # Variáveis de ambiente
├── package.json
├── vercel.json
└── .gitignore
```
2. Arquivo vercel.json
```bash
{
  "version": 2,
  "builds": [
    {
      "src": "api/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/server.js"
    }
  ]
}
```
3. Deploy via CLI
```bash
# Instale a Vercel CLI
npm i -g vercel

# Na pasta do backend
vercel

# Para produção
vercel --prod
```
4. Configurar Variáveis no Painel da Vercel
Vá em **Settings** → **Environment Variables** e adicione:

| Name | Value |
| --- | --- |
| `SUPABASE_URL` | `https://seu-projeto.supabase.co` |
| `SUPABASE_KEY` | `sua_chave_anon` |
| `NODE_ENV` | `production` |

### Frontend
Opção 1: Deploy na Vercel
```bash
# Na pasta do frontend
vercel --prod
```
Opção 2: Deploy no GitHub Pages
1. Crie um repositório no GitHub
2. Push do frontend
3. Ative o GitHub Pages nas configurações

Opção 3: Deploy no Netlify
1. Crie uma conta no Netlify
2. Arraste a pasta do frontend
3. Ou conecte seu repositório GitHub

## 📁 Estrutura do Projeto
```bash
almoxarifado-senai/
├── api/
│   └── server.js              # Backend principal (Serverless)
├── public/
│   └── index.html             # Frontend completo
├── database/
│   └── migrations/
│       ├── 001_create_familias.sql
│       ├── 002_create_tipos.sql
│       ├── 003_create_materiais.sql
│       ├── 004_create_movimentacoes.sql
│       └── 005_create_functions.sql
├── .env                       # Variáveis de ambiente (não commitado)
├── .gitignore
├── package.json
├── vercel.json                # Configuração da Vercel
└── README.md                  # Este arquivo
```
## 🔌 Endpoints da API

### Famílias

| Método | Endpoint | Descrição |
| --- | --- | --- |
| GET | `/api/familias` | Lista todas as famílias |
| POST | `/api/familias` | Cria uma nova família |
| PUT | `/api/familias/:id` | Atualiza uma família |
| DELETE | `/api/familias/:id` | Exclui uma família |

### Tipos

| Método | Endpoint | Descrição |
| --- | --- | --- |
| GET | `/api/tipos?familia_codigo=001` | Lista tipos por família |
| POST | `/api/tipos` | Cria um novo tipo |

### Materiais

| Método | Endpoint | Descrição |
| --- | --- | --- |
| GET | `/api/materiais` | Lista materiais com filtros |
| GET | `/api/materiais/proximo-sku` | Gera próximo SKU |
| GET | `/api/materiais/:sku` | Busca material por SKU |
| POST | `/api/materiais` | Cadastra novo material |
| PUT | `/api/materiais/:sku` | Atualiza material |
| DELETE | `/api/materiais/:sku` | Exclui material |
| POST | `/api/materiais/:sku/arquivar` | Move para arquivo morto |
| POST | `/api/materiais/:sku/restaurar` | Restaura do arquivo morto |

### Movimentações

| Método | Endpoint | Descrição |
| --- | --- | --- |
| GET | `/api/movimentacoes` | Lista movimentações |
| POST | `/api/movimentacoes/entrada` | Registra entrada |
| POST | `/api/movimentacoes/saida` | Registra saída |

### Estatísticas

| Método | Endpoint | Descrição |
| --- | --- | --- |
| GET | `/api/estatisticas` | Estatísticas do sistema |

## 🎯 Como Usar

### 1. Cadastrar uma Família
1. Acesse o Dashboard
2. Clique em "Novo Item"
3. Selecione a Família e o Tipo
4. O SKU será gerado automaticamente
5. Preencha os demais campos
6. Clique em "Cadastrar"

### 2. Registrar Entrada via QR Code
1. Acesse a aba "QR Code"
2. Aponte a câmera para o QR Code do material
3. O sistema identificará automaticamente o item
4. Informe a quantidade e o responsável
5. Clique em "Entrada"

### 3. Registrar Saída via QR Code
1. Acesse a aba "QR Code"
2. Aponte a câmera para o QR Code do material
3. Informe a quantidade e o responsável
4. Clique em "Saída"

### 4. Arquivar um Material
1. Na lista de materiais, clique no ícone de arquivo
2. Informe o motivo do arquivamento
3. O material será movido para o "Arquivo Morto"

### 5. Visualizar Histórico
1. Acesse a aba "Movimentações"
2. Use os filtros para buscar por tipo ou período
3. Veja todas as movimentações registradas

## 🤝 Contribuição
Contribuições são bem-vindas! Siga os passos:

1. Fork o projeto
2. Crie uma branch para sua feature (git checkout -b feature/AmazingFeature)
3. Commit suas mudanças (git commit -m 'Add some AmazingFeature')
4. Push para a branch (git push origin feature/AmazingFeature)
5. Abra um Pull Request

## 📞 Contato
- Desenvolvedores: Isabella Rosa, Kemmily, Felipe Jacques e Lorena.
- LinkedIn: linkedin.com/in/isabella-rosa-3bb848394, linkedin.com/in/kemmily-de-sousa-carvalho-655853394, linkedin.com/in/felipe-jacques-944126411 e linkedin.com/in/lorena-fontana-souza-b92857394.
