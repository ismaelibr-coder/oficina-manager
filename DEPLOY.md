# 🚀 Guia de Deploy - Sistema de Oficina

## 📋 Pré-requisitos

- [x] Conta Vercel (frontend)
- [x] Conta Render (backend)
- [x] Conta Supabase (banco de dados)
- [x] Conta Cloudinary (imagens)
- [x] Conta Resend (emails)
- [ ] Código no GitHub

---

## 🎯 Passo a Passo

### 1. Preparar Repositório GitHub (10min)

```bash
# Inicializar git (se ainda não fez)
cd c:\Users\ismaelr\Desktop\oficina
git init
git add .
git commit -m "Initial commit - Sistema de Oficina"

# Criar repositório no GitHub
# 1. Acessar https://github.com/new
# 2. Nome: oficina-manager
# 3. Privado ou Público (sua escolha)
# 4. Criar

# Conectar e enviar
git remote add origin https://github.com/SEU_USUARIO/oficina-manager.git
git branch -M main
git push -u origin main
```

---

### 2. Configurar Supabase (5min)

**Criar Projeto:**
1. Acessar https://supabase.com/dashboard
2. "New Project"
3. Configurar:
   - Name: `oficina-db`
   - Database Password: `[CRIAR SENHA FORTE]` ← **ANOTE!**
   - Region: `South America (São Paulo)`
4. Aguardar ~2min

**Copiar Connection String:**
1. Settings → Database
2. Connection String → URI
3. Copiar (formato: `postgresql://postgres:[PASSWORD]@...`)
4. **Substituir [PASSWORD] pela senha que criou**

**Migrar Schema:**
```bash
# Opção 1: Usar Prisma (recomendado)
cd backend
npx prisma migrate deploy --preview-feature

# Opção 2: Dump manual
# Se tiver dados locais para migrar
pg_dump oficina > backup.sql
psql [SUPABASE_URL] < backup.sql
```

---

### 3. Deploy Backend no Render (10min)

**Conectar GitHub:**
1. Acessar https://dashboard.render.com
2. "New +" → "Web Service"
3. "Connect GitHub" (se ainda não conectou)
4. Selecionar repositório `oficina-manager`

**Configurar Serviço:**
- Name: `oficina-backend`
- Region: `Oregon (US West)`
- Branch: `main`
- Root Directory: `backend`
- Runtime: `Node`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Instance Type: `Free`

**Environment Variables:**
Clicar em "Advanced" → "Add Environment Variable"

```
NODE_ENV=production
PORT=10000
DATABASE_URL=[COLAR URL DO SUPABASE]
JWT_SECRET=[GERAR RANDOM - use: openssl rand -base64 32]
CLOUDINARY_URL=[SUA CLOUDINARY URL]
RESEND_API_KEY=[SUA RESEND API KEY]
```

**Deploy:**
- Clicar "Create Web Service"
- Aguardar ~5min
- Copiar URL: `https://oficina-backend.onrender.com`

**Testar:**
```bash
# Deve retornar status 200
curl https://oficina-backend.onrender.com/health
```

---

### 4. Deploy Frontend no Vercel (5min)

**Conectar GitHub:**
1. Acessar https://vercel.com/new
2. "Import Git Repository"
3. Selecionar `oficina-manager`

**Configurar Projeto:**
- Framework Preset: `Next.js`
- Root Directory: `web`
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

**Environment Variables:**
```
NEXT_PUBLIC_API_URL=https://oficina-backend.onrender.com
```

**Deploy:**
- Clicar "Deploy"
- Aguardar ~3min
- Copiar URL: `https://oficina-manager.vercel.app`

---

### 5. Configurar Resend (Emails)

**Criar API Key:**
1. Acessar https://resend.com/api-keys
2. "Create API Key"
3. Name: `Oficina Manager`
4. Permission: `Sending access`
5. Copiar chave (começa com `re_`)

**Adicionar no Render:**
1. Dashboard Render → oficina-backend
2. Environment → Edit
3. Adicionar:
   ```
   RESEND_API_KEY=re_sua_chave_aqui
   ```
4. Save Changes (vai fazer redeploy automático)

**Configurar Domínio de Envio (Opcional):**
1. Resend → Domains
2. Add Domain: `oficina.seudominio.com.br`
3. Adicionar registros DNS
4. Verificar

**OU usar domínio padrão:**
- Emails virão de: `onboarding@resend.dev`
- Funciona, mas pode cair em spam

---

### 6. Testar Sistema (10min)

**Checklist:**
- [ ] Acessar `https://oficina-manager.vercel.app`
- [ ] Fazer login (criar usuário admin se necessário)
- [ ] Criar cliente
- [ ] Criar veículo
- [ ] Criar agendamento
- [ ] Visualizar calendário
- [ ] Upload de foto (checklist)
- [ ] Gerar relatório
- [ ] Verificar email (se configurou)

**Criar Usuário Admin (se necessário):**
```bash
# Conectar no banco Supabase
psql [SUPABASE_URL]

# Criar usuário
INSERT INTO users (email, password, name, role) 
VALUES (
  'admin@oficina.com',
  '[HASH_BCRYPT]', -- gerar com: bcrypt.hash('senha123', 10)
  'Administrador',
  'ADMIN'
);
```

---

## 🔧 Troubleshooting

### Backend não responde
```bash
# Ver logs no Render
Dashboard → oficina-backend → Logs

# Problemas comuns:
# 1. Variável de ambiente errada
# 2. Banco não conecta (verificar DATABASE_URL)
# 3. Build falhou (verificar package.json)
```

### Frontend não carrega
```bash
# Ver logs no Vercel
Dashboard → oficina-manager → Deployments → Logs

# Problemas comuns:
# 1. NEXT_PUBLIC_API_URL errada
# 2. Build falhou (verificar next.config.js)
# 3. Dependências faltando
```

### Emails não enviam
```bash
# Verificar:
# 1. RESEND_API_KEY está correta
# 2. Domínio verificado (se usando próprio)
# 3. Logs do Resend: https://resend.com/logs
```

---

## 📊 Monitoramento

### Render (Backend)
- Dashboard → Metrics
- Ver: CPU, Memory, Response Time
- Alertas: Email quando cai

### Vercel (Frontend)
- Analytics → Overview
- Ver: Pageviews, Performance
- Alertas: Email quando erro

### Supabase (Banco)
- Dashboard → Database → Usage
- Ver: Storage usado, Queries
- Alertas: Email quando >80%

---

## 🔄 Atualizações Futuras

**Deploy Automático:**
```bash
# Qualquer push no GitHub = deploy automático!
git add .
git commit -m "Nova funcionalidade"
git push

# Render: Redeploy automático em ~3min
# Vercel: Redeploy automático em ~2min
```

**Rollback (se algo der errado):**
- Render: Dashboard → Deployments → Rollback
- Vercel: Dashboard → Deployments → Promote to Production

---

## 💰 Custos (Grátis!)

```
Vercel:    $0/mês (100GB bandwidth)
Render:    $0/mês (750h/mês)
Supabase:  $0/mês (500MB database)
Cloudinary: $0/mês (25GB storage)
Resend:    $0/mês (100 emails/dia)
──────────────────────────────────
TOTAL:     $0/mês 🎉
```

---

## 🎯 URLs Finais

```
Frontend:  https://oficina-manager.vercel.app
Backend:   https://oficina-backend.onrender.com
Admin:     https://oficina-manager.vercel.app/login
API Docs:  https://oficina-backend.onrender.com/api-docs
```

---

## 📱 Próximo: PWA (App Instalável)

Depois do deploy, podemos transformar em app instalável:
- Adicionar manifest.json
- Service Worker
- Ícones
- **Resultado:** App no celular! 📲

---

**Pronto para começar?** 🚀

Siga os passos acima e me avise se tiver alguma dúvida!
