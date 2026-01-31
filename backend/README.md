# Ana - Sistema de Controle de Acesso

Sistema de controle de acesso para condomínios e estabelecimentos comerciais, com integração para dispositivos Control ID.

## Tecnologias

- **Node.js** + **Express** - Backend API
- **PostgreSQL** + **Prisma ORM** - Banco de dados
- **Socket.IO** - Comunicação em tempo real
- **JWT** - Autenticação
- **Winston** - Logs

## Requisitos

- Node.js 18+
- PostgreSQL 14+
- NPM ou Yarn

## Instalação

1. Clone o repositório e entre na pasta backend:
```bash
cd Ana/backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o arquivo `.env`:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Execute as migrations do banco:
```bash
npx prisma migrate dev
```

5. (Opcional) Popule o banco com dados de exemplo:
```bash
npm run seed
```

6. Inicie o servidor:
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## Estrutura de Pastas

```
backend/
├── prisma/
│   └── schema.prisma      # Schema do banco de dados
├── src/
│   ├── config/            # Configurações (logger, socket)
│   ├── controllers/       # Controllers da API
│   ├── middlewares/       # Middlewares (auth, validators)
│   ├── routes/            # Rotas da API
│   ├── services/          # Serviços (Control ID, etc)
│   ├── database/          # Seeds e utilitários do banco
│   └── server.js          # Entrada principal
├── logs/                  # Logs da aplicação
└── package.json
```

## API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro (admin)
- `POST /api/auth/refresh` - Atualizar token

### Usuários
- `GET /api/users` - Listar usuários
- `GET /api/users/:id` - Buscar usuário
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Remover usuário

### Condomínios
- `GET /api/condominiums` - Listar condomínios
- `POST /api/condominiums` - Criar condomínio
- `GET /api/condominiums/:id` - Buscar condomínio
- `PUT /api/condominiums/:id` - Atualizar
- `DELETE /api/condominiums/:id` - Remover

### Moradores
- `GET /api/residents` - Listar moradores
- `POST /api/residents` - Cadastrar morador
- `GET /api/residents/:id` - Buscar morador
- `PUT /api/residents/:id` - Atualizar
- `DELETE /api/residents/:id` - Remover
- `POST /api/residents/:id/credentials` - Adicionar credencial
- `PUT /api/residents/:id/block` - Bloquear acesso
- `PUT /api/residents/:id/unblock` - Desbloquear

### Dispositivos
- `GET /api/devices` - Listar dispositivos
- `POST /api/devices` - Cadastrar dispositivo
- `POST /api/devices/:id/sync` - Sincronizar
- `GET /api/devices/:id/status` - Status

### Visitantes
- `GET /api/visitors` - Listar visitantes
- `POST /api/visitors` - Cadastrar visitante
- `POST /api/visitors/:id/checkin` - Check-in
- `POST /api/visitors/:id/checkout` - Check-out

### Acessos
- `GET /api/access/logs` - Histórico de acessos
- `POST /api/access/grant` - Liberar acesso manual
- `GET /api/access/stats` - Estatísticas
- `GET /api/access/report` - Relatório

## WebSocket Events

O sistema usa Socket.IO para comunicação em tempo real:

### Eventos emitidos pelo servidor:
- `access_granted` - Acesso liberado
- `access_denied` - Acesso negado
- `resident_created` - Morador cadastrado
- `resident_updated` - Morador atualizado
- `visitor_checkin` - Visitante entrou
- `visitor_checkout` - Visitante saiu
- `device_synced` - Dispositivo sincronizado

### Eventos do cliente:
- `register_device` - Registrar dispositivo mobile
- `sync_request` - Solicitar sincronização

## Usuário Padrão

Após executar o seed, você pode logar com:
- **Email:** admin@ana.com
- **Senha:** admin123

## Licença

Proprietário - Todos os direitos reservados
