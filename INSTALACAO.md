# Guia de Instalação - Sistema de Gestão de Oficina

## ⚠️ Pré-requisitos Necessários

### 1. Docker Desktop (OBRIGATÓRIO)

O Docker é necessário para rodar o banco de dados PostgreSQL.

**Download**: https://www.docker.com/products/docker-desktop/

**Instalação no Windows**:
1. Baixe o Docker Desktop para Windows
2. Execute o instalador
3. Reinicie o computador quando solicitado
4. Abra o Docker Desktop e aguarde inicializar
5. Verifique a instalação: `docker --version`

### 2. Node.js 20+ (JÁ INSTALADO ✅)

Você já tem o Node.js instalado.

---

## 🚀 Passos para Iniciar o Projeto

### Passo 1: Instalar Docker Desktop

Siga as instruções acima para instalar o Docker Desktop.

### Passo 2: Iniciar o Banco de Dados

Após instalar o Docker, execute:

```bash
cd c:\Users\ismaelr\Desktop\oficina
docker compose up -d
```

Isso irá:
- Baixar a imagem do PostgreSQL
- Criar um container com o banco de dados
- Expor na porta 5432

### Passo 3: Configurar o Backend

```bash
cd backend

# Gerar Prisma Client
npm run prisma:generate

# Criar tabelas no banco de dados
npm run prisma:migrate

# Iniciar servidor de desenvolvimento
npm run dev
```

O backend estará rodando em: http://localhost:3001

### Passo 4: Configurar o Frontend Web (Próximo passo)

```bash
cd web
npm install
npm run dev
```

O frontend estará em: http://localhost:3000

---

## 📋 Checklist de Instalação

- [ ] Docker Desktop instalado e rodando
- [ ] Banco de dados PostgreSQL iniciado (`docker compose up -d`)
- [ ] Prisma Client gerado (`npm run prisma:generate`)
- [ ] Migrations executadas (`npm run prisma:migrate`)
- [ ] Backend rodando (`npm run dev`)
- [ ] Frontend web instalado (próximo passo)
- [ ] App mobile configurado (próximo passo)

---

## 🔧 Comandos Úteis

### Docker
```bash
# Ver containers rodando
docker ps

# Parar banco de dados
docker compose down

# Ver logs do banco
docker compose logs postgres

# Resetar banco (CUIDADO: apaga todos os dados)
docker compose down -v
docker compose up -d
```

### Prisma
```bash
# Abrir interface visual do banco
npm run prisma:studio

# Criar nova migration
npm run prisma:migrate

# Resetar banco de dados
npx prisma migrate reset
```

### Backend
```bash
# Desenvolvimento (com hot reload)
npm run dev

# Build para produção
npm run build

# Rodar produção
npm start
```

---

## ❓ Problemas Comuns

### "docker: command not found"
- Docker Desktop não está instalado ou não está no PATH
- Solução: Instale o Docker Desktop e reinicie o terminal

### "Error: P1001: Can't reach database server"
- O container do PostgreSQL não está rodando
- Solução: Execute `docker compose up -d`

### "Port 5432 already in use"
- Você já tem um PostgreSQL rodando localmente
- Solução 1: Pare o PostgreSQL local
- Solução 2: Mude a porta no docker-compose.yml

---

## 📞 Próximos Passos

Após instalar o Docker e iniciar o banco de dados, podemos:

1. ✅ Testar o backend
2. ⏭️ Configurar o frontend web (Next.js)
3. ⏭️ Configurar o app mobile (React Native)
4. ⏭️ Implementar autenticação
5. ⏭️ Criar os CRUDs básicos
