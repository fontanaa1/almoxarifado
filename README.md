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
