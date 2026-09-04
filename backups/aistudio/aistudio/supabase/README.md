# Guia de Configuração: Supabase + GitHub + Vercel / Render

Este guia explica como configurar a infraestrutura de dados e alojamento do **CondoManager AI** em 3 passos simples.

---

## 1. Configurar a Base de Dados no Supabase

1. Aceda a [supabase.com](https://supabase.com) e crie uma conta gratuita.
2. Clique em **"New Project"** e defina um nome (ex: `condomanager-db`) e uma palavra-passe de base de dados.
3. Escolha a região mais próxima (ex: `eu-west-1` - Frankfurt ou `eu-west-3` - Paris / Londres).
4. No menu lateral do Supabase:
   - Vá a **SQL Editor**.
   - Clique em **"New Query"**.
   - Abra o ficheiro `supabase/schema.sql` deste projeto, copie todo o conteúdo, cole no editor e clique em **"Run"**.
5. Obter as chaves de ligação:
   - Vá a **Project Settings** (ícone de engrenagem) ➔ **API**.
   - Copie o **Project URL** e a chave **anon public**.

---

## 2. Definir as Variáveis de Ambiente no Projeto

No seu ficheiro `.env` ou nas definições de ambiente da plataforma, adicione:

```env
VITE_SUPABASE_URL=https://o-seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=a-sua-chave-anonima-publica
```

A aplicação deteta automaticamente as credenciais e passa a guardar e ler diretamente do PostgreSQL do Supabase.

---

## 3. Publicação Automática no Vercel

1. Exporte este projeto para o seu **GitHub** através do menu de definições do Google AI Studio (**Export to GitHub**).
2. Aceda a [vercel.com](https://vercel.com) e inicie sessão com o GitHub.
3. Clique em **"Add New" ➔ "Project"** e selecione o repositório `CondoManager-AI`.
4. Em **Environment Variables**, adicione:
   - `VITE_SUPABASE_URL` = (o seu Project URL)
   - `VITE_SUPABASE_ANON_KEY` = (a sua anon public key)
5. Clique em **"Deploy"**.

A partir deste momento, qualquer alteração que faça no código e envie para o GitHub será publicada automaticamente no seu site em menos de 2 minutos!
