# Arquitetura do Sistema Ana

## 📐 Visão Geral da Arquitetura

O Ana é um sistema distribuído em camadas que integra aplicações mobile, web e desktop com um backend centralizado em nuvem, sincronizando dados com controladoras Control ID via rede.

```
┌─────────────────────────────────────────────────────────────────┐
│                      APLICAÇÕES CLIENTES                         │
├─────────────────────────────────────────────────────────────────┤
│  Mobile App  │  Web Dashboard  │  Desktop App (Electron)         │
│  (React)     │  (React + Vite) │  (Electron + React)             │
└────────┬──────────────┬──────────────┬──────────────────────────┘
         │              │              │
         └──────────────┼──────────────┘
                        │ HTTP/WebSocket
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│            ANA - BACKEND (Node.js + Express em Nuvem)            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  API REST + WebSocket (Socket.io)                   │        │
│  │  - Autenticação (JWT)                               │        │
│  │  - Validação de dados                               │        │
│  │  - Tratamento de erros                              │        │
│  └─────────────────────────────────────────────────────┘        │
│                        │                                         │
│  ┌─────────────────────▼─────────────────────────┐             │
│  │  CAMADA DE NEGÓCIO (Controllers + Services)    │             │
│  │  - AuthController                              │             │
│  │  - ResidentController                          │             │
│  │  - AccessController                            │             │
│  │  - InviteController                            │             │
│  │  - DeviceController                            │             │
│  │  - InviteService (gera iToken)                │             │
│  │  - ControlIdService (sincronização)            │             │
│  └─────────────────────┬─────────────────────────┘             │
│                        │                                         │
│  ┌─────────────────────▼─────────────────────────┐             │
│  │  CAMADA DE DADOS (Prisma ORM)                  │             │
│  │  - Models: User, Resident, Visitor, Invite    │             │
│  │  - Models: Access, Device, Condominium        │             │
│  └─────────────────────┬─────────────────────────┘             │
│                        │                                         │
│  ┌─────────────────────▼─────────────────────────┐             │
│  │  BANCO DE DADOS (PostgreSQL/SQLite)           │             │
│  │  - Residentes com fotos (blob/referência)      │             │
│  │  - Convites (iToken)                           │             │
│  │  - Logs de acesso                              │             │
│  │  - Configurações de dispositivos               │             │
│  └─────────────────────────────────────────────────┘             │
│                                                                   │
└────────┬────────────────────────────────────────────────────────┘
         │ Protocolo Control ID
         │ (HTTP/TCP/UDP)
         ▼
┌─────────────────────────────────────────────────────────────────┐
│         CONTROLADORAS CONTROL ID (Rede Local/Remota)             │
├─────────────────────────────────────────────────────────────────┤
│  - Reconhecimento facial (biometria)                             │
│  - Registros de acesso em tempo real                             │
│  - Armazenamento local de dados biométricos                      │
│  - Portas de controle físico                                     │
└─────────────────────────────────────────────────────────────────┘
```

## 🏗️ Arquitetura em Camadas

### 1. **Camada de Apresentação (Clients)**

#### Frontend Web (React + Vite)
- Dashboard administrativo
- Gerenciamento de residentes, visitantes e acessos
- Geração de convites (iToken)
- Visualização de logs em tempo real
- Responsive design com Tailwind CSS

#### Aplicativo Mobile
- Cadastro de residentes
- Solicitação de convites
- Acesso via iToken
- Captura de fotos biométricas

#### Aplicação Desktop (Electron)
- Versão desktop do dashboard
- Integração com câmera local
- Captura biométrica avançada

### 2. **Camada de API (Backend)**

```
Backend Structure:
src/
├── routes/
│   ├── index.js              (Agregador de rotas)
│   ├── auth.routes.js        (Autenticação)
│   ├── resident.routes.js    (Residentes)
│   ├── visitor.routes.js     (Visitantes)
│   ├── invite.routes.js      (Convites/iToken)
│   ├── access.routes.js      (Logs de acesso)
│   ├── device.routes.js      (Dispositivos Control ID)
│   └── condominium.routes.js (Condominiums)
│
├── controllers/
│   ├── AuthController.js     (Lógica de autenticação)
│   ├── ResidentController.js (CRUD de residentes)
│   ├── InviteController.js   (Geração/validação iToken)
│   ├── AccessController.js   (Registros de acesso)
│   └── ...
│
├── services/
│   ├── InviteService.js      (Geração de iToken + email)
│   ├── ControlIdService.js   (Sincronização Control ID)
│   └── ...
│
├── middlewares/
│   ├── auth.js               (Validação JWT)
│   └── validators.js         (Validação de dados)
│
├── config/
│   ├── logger.js             (Sistema de logs)
│   └── socket.js             (WebSocket)
│
└── database/
    └── seed.js               (Dados iniciais)
```

### 3. **Camada de Dados (Prisma ORM)**

O Prisma fornece uma abstração do banco de dados com:

```
prisma/
├── schema.prisma  (Definição de modelos)
└── migrations/    (Histórico de alterações)
```

**Principais Modelos:**

- **User**: Administradores e gerenciadores
- **Resident**: Residentes com foto biométrica
- **Visitor**: Visitantes
- **Invite**: Convites com iToken
- **Access**: Logs de entrada/saída
- **Device**: Controladoras Control ID
- **Condominium**: Prédios/Condomínios

### 4. **Camada de Integração (Control ID)**

```
ControlIdService
├── sincronizarResidente()      (Envia novo residente + foto)
├── atualizarFoto()             (Atualiza foto biométrica)
├── sincronizarAcesso()         (Recebe logs de acesso)
├── gerenciarPermissões()       (Define permissões)
└── conectarDispositivo()       (Conecta com controladora)
```

## 🔄 Fluxos Principais

### Fluxo 1: Cadastro via iToken

```
1. APP MOBILE
   ├─ Usuário abre app
   └─ Clica em "Solicitar Cadastro"
                    │
                    ▼
2. BACKEND (Ana)
   ├─ Recebe solicitação
   ├─ Cria registro em "Invite"
   ├─ Gera iToken único (UUID/JWT)
   └─ Envia email com link
                    │
                    ▼
3. EMAIL
   ├─ Usuário recebe: 
   │  "https://ana.com/cadastro?token=xyz123"
   └─ Clica no link
                    │
                    ▼
4. WEB DASHBOARD
   ├─ Valida iToken
   ├─ Abre formulário de cadastro
   └─ Usuário preenche dados + tira foto
                    │
                    ▼
5. BACKEND (Ana)
   ├─ Recebe dados + foto
   ├─ Cria Resident
   ├─ Marca Invite como "completed"
   └─ Envia para Control ID
                    │
                    ▼
6. CONTROLADORAS
   ├─ Recebem foto biométrica
   ├─ Processam reconhecimento facial
   └─ Armazenam localmente
                    │
                    ▼
7. SISTEMA
   └─ Residente pode entrar/sair com reconhecimento facial
```

### Fluxo 2: Controle de Acesso em Tempo Real

```
1. RESIDENTE CHEGA À PORTA
   └─ Sensor Control ID captura imagem
                    │
                    ▼
2. CONTROLADORA
   ├─ Processa reconhecimento facial
   ├─ Compara com banco biométrico
   └─ Se reconhecido, abre porta
                    │
                    ▼
3. CONTROLADORA
   ├─ Registra acesso (timestamp)
   └─ Envia para Ana (via WebSocket/HTTP)
                    │
                    ▼
4. BACKEND (Ana)
   ├─ Recebe registro de acesso
   ├─ Cria record em "Access"
   ├─ Valida permissões
   └─ Emite via Socket.io
                    │
                    ▼
5. DASHBOARD/APP
   ├─ Recebe atualização em tempo real
   ├─ Mostra no histórico de acessos
   └─ Exibe notificação (opcional)
```

## 🔐 Segurança

### Autenticação
- **JWT (JSON Web Tokens)**: Tokens com expiração
- **Refresh Tokens**: Renovação segura de sessões
- **Password Hashing**: Bcrypt para senhas

### Validação
- **Middleware de Auth**: Protege rotas privadas
- **Validação de Entrada**: Sanitização de dados
- **CORS**: Controle de origem de requisições

### Dados Sensíveis
- **Fotos Biométricas**: Criptografadas no armazenamento
- **iToken**: Tokens únicos com expiração
- **Logs de Acesso**: Auditáveis e rastreáveis

### iToken Security
```
POST /api/invites
├─ Gera UUID único
├─ Define expiração (ex: 7 dias)
├─ Armazena com hash no BD
├─ Envia por email encriptado
└─ Valida antes de usar

GET /api/invites/link/:itoken
├─ Procura iToken no BD
├─ Verifica expiração
├─ Verifica se já foi usado
└─ Se válido, permite cadastro
```

## 📊 Modelo de Dados Detalhado

### User
```prisma
model User {
  id          String    @id @default(cuid())
  email       String    @unique
  password    String    (hash bcrypt)
  name        String
  role        String    (admin, manager, resident)
  condominium Condominium @relation(...)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

### Resident
```prisma
model Resident {
  id              String    @id @default(cuid())
  name            String
  email           String
  document        String    @unique
  phone           String
  photo           String    (caminho da imagem)
  photoHash       String    (hash para Control ID)
  unit             String
  condominium     Condominium @relation(...)
  controlIdId     String    (ID na controladora)
  accessPermitted Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  syncedAt        DateTime? (última sincronização)
  accesses        Access[]
}
```

### Invite
```prisma
model Invite {
  id         String    @id @default(cuid())
  iToken     String    @unique (token do link)
  email      String
  status     String    (pending, completed, expired)
  residentId String?   (preenchido após cadastro)
  createdAt  DateTime  @default(now())
  expiresAt  DateTime
  usedAt     DateTime?
}
```

### Access
```prisma
model Access {
  id          String    @id @default(cuid())
  resident    Resident  @relation(...)
  device      Device    @relation(...)
  direction   String    (entrada, saída)
  timestamp   DateTime  @default(now())
  recognized  Boolean   (reconhecimento bem-sucedido)
  confidence  Float     (nível de confiança: 0-100)
}
```

### Device
```prisma
model Device {
  id           String    @id @default(cuid())
  name         String
  ip           String
  port         Int
  model        String    (Control ID model)
  status       String    (online, offline)
  condominium  Condominium @relation(...)
  accesses     Access[]
  lastSync     DateTime?
}
```

## 🚀 Padrões de Desenvolvimento

### Padrão Controller-Service-Repository
```javascript
// Route
router.post('/residents', authenticate, residentController.create);

// Controller
class ResidentController {
  async create(req, res) {
    const resident = await residentService.create(req.body);
    await controlIdService.syncResident(resident);
    res.json(resident);
  }
}

// Service
class ResidentService {
  async create(data) {
    return await prisma.resident.create({ data });
  }
}
```

### Padrão de Erro Centralizado
```javascript
// Middleware de erro
app.use((err, req, res, next) => {
  logger.error(err);
  res.status(err.status || 500).json({
    error: err.message,
    code: err.code
  });
});
```

### Padrão de WebSocket para Atualizações em Tempo Real
```javascript
io.on('connection', (socket) => {
  socket.on('access:new', (data) => {
    io.to('dashboard').emit('access:update', data);
  });
});
```

## 📈 Escalabilidade

### Horizontal Scaling
- Backend em containers (Docker)
- Load balancer (Nginx/HAProxy)
- Múltiplas instâncias em nuvem

### Banco de Dados
- PostgreSQL para produção
- Replicação e backups automáticos
- Cache com Redis (opcional)

### Armazenamento de Fotos
- Cloud Storage (AWS S3, Azure Blob, Google Cloud Storage)
- CDN para distribuição global
- Compressão e otimização de imagens

## 🔄 Deployment

### Ambiente de Desenvolvimento
```
npm run dev     # Backend
npm run dev     # Frontend (Vite)
```

### Ambiente de Produção
```
Docker Compose
├─ Backend API
├─ PostgreSQL
├─ Redis (cache)
└─ Nginx (reverse proxy)

Cloud Deployment:
├─ Railway, Heroku, AWS, Azure, DigitalOcean
└─ CI/CD com GitHub Actions
```

## 📝 Logs e Monitoramento

### Sistema de Logs
```javascript
// Logger centralizado
logger.info('Residente cadastrado', { residentId: '123' });
logger.error('Erro na sincronização Control ID', { error: err });
logger.audit('Acesso concedido', { resident: 'João', time: '10:30' });
```

### Métricas
- Número de acessos por hora
- Taxa de sincronização com Control ID
- Tempo de resposta de API
- Taxa de erro (4xx, 5xx)

---

**Última atualização:** 31 de Janeiro de 2026
