# Ana - Sistema de Gerenciamento Residencial

Ana é uma solução completa de gerenciamento residencial que integra um backend robusto, aplicação web moderna e aplicativo desktop, permitindo controle de acessos, residentes, visitantes e dispositivos em condomínios.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Como Rodar](#como-rodar)
- [Funcionalidades](#funcionalidades)
- [API Endpoints](#api-endpoints)

## 🎯 Visão Geral

O Ana é uma solução de gerenciamento residencial em nuvem que se integra com **controladoras Control ID** com reconhecimento facial. O sistema permite que residentes realizem cadastro através de um aplicativo mobile, com sincronização automática de dados (incluindo fotos) para as controladoras via rede.

### 🔄 Fluxo Principal

1. **Usuário cadastra via App Mobile**: Envia solicitação de cadastro
2. **Ana recebe a solicitação**: Sistema em nuvem processa o pedido
3. **Gera link de cadastro (iToken)**: Envia link personalizado para o usuário
4. **Usuário acessa área de cadastro**: Realiza cadastro completo com foto
5. **Sincronização automática**: Ana envia dados para as controladoras Control ID via rede
6. **Controle de Acesso**: Reconhecimento facial funciona nas controladoras

### ✨ Funcionalidades

- **Cadastro de Residentes com Foto**: Captura biométrica para reconhecimento facial
- **Sistema de Convites (iToken)**: Links de cadastro seguros e personalizados
- **Sincronização em Tempo Real**: Integração com controladoras Control ID
- **Controle de Acesso**: Registros de entrada e saída com reconhecimento facial
- **Gestão de Visitantes**: Controle de visitantes com convites
- **Gerenciamento de Dispositivos**: Controle das controladoras e dispositivos
- **Autenticação**: Sistema seguro de login e autorização
- **Dashboard**: Interface visual para monitoramento e relatórios

## 🛠️ Tecnologias

### Backend
- **Node.js** com Express.js
- **Prisma ORM** para gerenciamento de banco de dados
- **Socket.io** para comunicação em tempo real
- **SQLite/PostgreSQL** (configurável no Prisma)
- **JWT** para autenticação
- **Integração Control ID**: Sincronização com controladoras via protocolo de rede

### Frontend Web
- **React 18+** com Vite
- **Tailwind CSS** para estilização
- **Socket.io Client** para comunicação em tempo real
- **Axios** para requisições HTTP
- **Upload de Imagens**: Suporte para captura/upload de fotos biométricas

### Mobile/Desktop
- **Electron** para aplicação desktop multiplataforma
- **React Native** (aplicativo mobile)
- Integração com câmera para captura de fotos
- Integração com API Ana

## 📁 Estrutura do Projeto

```
Ana/
├── backend/                          # API REST e lógica de negócio
│   ├── src/
│   │   ├── controllers/             # Controladores das rotas
│   │   ├── routes/                  # Definição das rotas
│   │   ├── services/                # Serviços de negócio
│   │   ├── middlewares/             # Middlewares de autenticação e validação
│   │   ├── config/                  # Configurações (logger, socket)
│   │   ├── database/                # Seed do banco
│   │   └── server.js                # Arquivo principal
│   ├── prisma/
│   │   ├── schema.prisma            # Definição do banco de dados
│   │   └── migrations/              # Histórico de migrações
│   ├── package.json
│   └── README.md
│
├── web/                              # Aplicação frontend React
│   ├── src/
│   │   ├── components/              # Componentes reutilizáveis
│   │   ├── pages/                   # Páginas da aplicação
│   │   ├── contexts/                # Contextos React (Auth)
│   │   ├── services/                # Serviços (API, Socket)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── dist-web/                    # Build otimizado
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── desktop-app/                      # Aplicação desktop Electron
│   ├── dist-electron/               # Build da aplicação
│   └── package.json
│
├── backend-executables/             # Executáveis do backend
│
└── .gitignore                        # Arquivo Git

```

## 📦 Pré-requisitos

- **Node.js** 16+ (recomendado 18+)
- **npm** ou **yarn**
- **Git** (para versionamento)
- **PostgreSQL** ou **SQLite** (banco de dados)

## 🚀 Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/ordemdeserv2021-arch/Ana-.git
cd Ana
```

### 2. Instale as dependências do Backend
```bash
cd backend
npm install
```

### 3. Configure o banco de dados
Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

Edite `.env` com suas credenciais do banco de dados:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ana_db"
JWT_SECRET="sua-chave-secreta-aqui"
PORT=3000
```

### 4. Rode as migrações do Prisma
```bash
npx prisma migrate dev
```

### 5. Instale as dependências do Frontend
```bash
cd ../web
npm install
```

### 6. Instale as dependências do Desktop (opcional)
```bash
cd ../desktop-app
npm install
```

## ⚙️ Configuração

### Variáveis de Ambiente (Backend)

Crie um arquivo `.env` na pasta `backend/`:

```env
# Banco de dados
DATABASE_URL="postgresql://user:password@localhost:5432/ana_db"

# JWT
JWT_SECRET="sua-chave-secreta-muito-segura"
JWT_EXPIRATION="7d"

# Servidor
PORT=3000
NODE_ENV="development"

# Socket.io
SOCKET_PORT=3001
```

### Configuração de CORS (Backend)

Edite `backend/src/server.js` para permitir requisições do frontend:

```javascript
const cors = require('cors');
app.use(cors({
  origin: "http://localhost:5173", // URL do Vite
  credentials: true
}));
```

## 🏃 Como Rodar

### Rodando o Backend
```bash
cd backend
npm start
# ou em modo desenvolvimento
npm run dev
```

O backend estará disponível em `http://localhost:3000`

### Rodando o Frontend
```bash
cd web
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

### Rodando o Desktop
```bash
cd desktop-app
npm start
```

## ✨ Funcionalidades Principais

### 👥 Gerenciamento de Residentes
- Cadastrar novos residentes com foto
- Captura biométrica para reconhecimento facial
- Atualizar informações
- Listar todos os residentes
- Deletar residentes
- Sincronização automática com contraloradoras Control ID

### 🚪 Controle de Acesso
- Registrar entrada/saída (com reconhecimento facial)
- Visualizar histórico de acessos
- Logs detalhados por data e residente
- Integração em tempo real com controladoras

### 👤 Gestão de Visitantes
- Convidar visitantes
- Controlar acesso de visitantes
- Histórico de visitas
- Sistema de convites com iToken

### 🔐 Sistema de Invites (iToken)
- Gerar links de cadastro personalizados
- Convite por email
- Links com expiração
- Cadastro seguro via link compartilhado
- Rastreamento de uso de convites

### 📊 Dashboard
- Visualização de dados em tempo real
- Gráficos e estatísticas de acesso
- Cards informativos
- Conexão via Socket.io
- Relatórios de acessos

## 🔌 API Endpoints

### Autenticação
```
POST   /api/auth/login       - Login de usuário
POST   /api/auth/register    - Registrar novo usuário
POST   /api/auth/logout      - Logout
```

### Residentes
```
GET    /api/residents        - Listar todos
POST   /api/residents        - Criar novo
GET    /api/residents/:id    - Obter por ID
PUT    /api/residents/:id    - Atualizar
DELETE /api/residents/:id    - Deletar
```

### Acessos
```
GET    /api/access           - Listar logs de acesso
POST   /api/access           - Registrar novo acesso
GET    /api/access/:id       - Obter por ID
```

### Visitantes
```
GET    /api/visitors         - Listar todos
POST   /api/visitors         - Criar novo
GET    /api/visitors/:id     - Obter por ID
PUT    /api/visitors/:id     - Atualizar
DELETE /api/visitors/:id     - Deletar
```

### Convites
```
GET    /api/invites          - Listar convites
POST   /api/invites          - Criar novo convite (gera iToken)
GET    /api/invites/:id      - Obter por ID
PUT    /api/invites/:id      - Atualizar
DELETE /api/invites/:id      - Deletar
GET    /api/invites/link/:itoken - Validar iToken e acessar cadastro
```

### Condominiums
```
GET    /api/condominiums     - Listar todos
POST   /api/condominiums     - Criar novo
GET    /api/condominiums/:id - Obter por ID
PUT    /api/condominiums/:id - Atualizar
DELETE /api/condominiums/:id - Deletar
```

### Devices
```
GET    /api/devices          - Listar todos
POST   /api/devices          - Criar novo
GET    /api/devices/:id      - Obter por ID
PUT    /api/devices/:id      - Atualizar
DELETE /api/devices/:id      - Deletar
```

### Usuários
```
GET    /api/users            - Listar todos
POST   /api/users            - Criar novo
GET    /api/users/:id        - Obter por ID
PUT    /api/users/:id        - Atualizar
DELETE /api/users/:id        - Deletar
```

## 📚 Modelo de Dados (Prisma)

### Principais Entidades

- **User**: Usuários do sistema
- **Resident**: Residentes do condomínio (com foto biométrica)
- **Visitor**: Visitantes
- **Invite**: Convites para cadastro (com iToken)
- **Access**: Registros de acesso (entrada/saída com reconhecimento facial)
- **Condominium**: Informações do condomínio
- **Device**: Controladoras Control ID e dispositivos de acesso

### Campos Importantes

**Resident**
- `id`: ID único
- `name`: Nome completo
- `email`: Email
- `photo`: Foto biométrica (armazenada ou referenciada)
- `controlIdId`: ID na controladora Control ID
- `createdAt`: Data de criação
- `syncedAt`: Última sincronização com controladoras

**Invite**
- `id`: ID único
- `iToken`: Link/Token único para cadastro
- `email`: Email do convidado
- `status`: pending, completed, expired
- `expiresAt`: Data de expiração do link
- `usedAt`: Data de uso do link

## 🔍 Scripts Úteis

```bash
# Backend
npm run dev              # Rodar em desenvolvimento
npm start                # Rodar em produção
npx prisma studio       # Visualizar banco de dados

# Frontend
npm run dev              # Rodar servidor de desenvolvimento
npm run build            # Build para produção
npm run preview          # Preview do build

# Desktop
npm start                # Rodar aplicação Electron
npm run build            # Build instalador
```

## 🤝 Contribuindo

1. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
2. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
3. Push para a branch (`git push origin feature/nova-feature`)
4. Abra um Pull Request

## 📝 Licença

Este projeto está licenciado sob a MIT License.

## 👨‍💻 Autor

**ordemdeserv2021-arch**

---

**Última atualização:** 31 de Janeiro de 2026
