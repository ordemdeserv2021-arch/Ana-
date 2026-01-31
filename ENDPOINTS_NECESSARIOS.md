# Guia de Implementação - Endpoints Necessários no Backend

Para que o app mobile funcione completamente, o backend Ana precisa implementar os seguintes endpoints.

## 🔐 Autenticação

### 1. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "senha123"
}

Response 200:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-123",
    "name": "João Silva",
    "email": "usuario@example.com",
    "role": "resident"
  }
}
```

### 2. Registrar Novo Usuário
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123"
}

Response 201:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-123",
    "name": "João Silva",
    "email": "joao@example.com"
  }
}
```

### 3. Obter Dados do Usuário (Validar Token)
```http
GET /api/auth/me
Authorization: Bearer <token>

Response 200:
{
  "id": "user-123",
  "name": "João Silva",
  "email": "joao@example.com",
  "role": "resident"
}
```

### 4. Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>

Response 200:
{
  "message": "Logout realizado com sucesso"
}
```

## 📋 Convites (iToken)

### 5. Solicitar Cadastro (Gerar Convite)
```http
POST /api/invites/request
Content-Type: application/json

{
  "email": "novo@example.com"
}

Response 201:
{
  "iToken": "uuid-token-aqui",
  "email": "novo@example.com",
  "expiresAt": "2026-02-07T10:00:00Z",
  "message": "Convite enviado para novo@example.com"
}
```

### 6. Validar Token/Convite
```http
GET /api/invites/verify/:iToken

Response 200:
{
  "valid": true,
  "email": "novo@example.com",
  "expiresAt": "2026-02-07T10:00:00Z"
}

Response 400:
{
  "message": "Token inválido ou expirado"
}
```

## 👤 Residentes

### 7. Cadastro com iToken
```http
POST /api/residents/register-with-token
Content-Type: multipart/form-data

{
  "iToken": "uuid-token",
  "name": "João Silva",
  "document": "12345678900",
  "phone": "(11) 98765-4321",
  "password": "senha123",
  "photo": <arquivo de imagem>
}

Response 201:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "resident-123",
    "name": "João Silva",
    "email": "novo@example.com"
  }
}
```

### 8. Obter Dados do Residente Autenticado
```http
GET /api/residents/me
Authorization: Bearer <token>

Response 200:
{
  "id": "resident-123",
  "name": "João Silva",
  "email": "joao@example.com",
  "document": "12345678900",
  "phone": "(11) 98765-4321",
  "photo": "https://cdn.example.com/photos/resident-123.jpg",
  "unit": "101",
  "accessPermitted": true,
  "syncedAt": "2026-01-31T10:30:00Z"
}
```

## 📊 Dashboard

### 9. Estatísticas do Dashboard
```http
GET /api/dashboard/stats
Authorization: Bearer <token>

Response 200:
{
  "accessesToday": 3,
  "lastAccess": "2026-01-31T10:15:00Z",
  "accessPermitted": true,
  "totalResidents": 45,
  "activeDevices": 5
}
```

## 📈 Acessos

### 10. Listar Histórico de Acessos
```http
GET /api/access?limit=50&page=1&direction=entrada
Authorization: Bearer <token>

Response 200:
{
  "accesses": [
    {
      "id": "access-123",
      "residentId": "resident-123",
      "deviceId": "device-001",
      "direction": "entrada",
      "timestamp": "2026-01-31T10:15:00Z",
      "recognized": true,
      "confidence": 98.5,
      "device": {
        "id": "device-001",
        "name": "Portão Principal"
      }
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 50
}
```

## 🔌 WebSocket Events

### Eventos Emitidos pelo Servidor

#### 1. Novo Acesso
```javascript
socket.on('access:new', (access) => {
  // {
  //   id: 'access-123',
  //   residentId: 'resident-123',
  //   direction: 'entrada',
  //   timestamp: '2026-01-31T10:15:00Z',
  //   confidence: 98.5,
  //   device: { id: 'device-001', name: 'Portão Principal' }
  // }
});
```

#### 2. Atualização de Status
```javascript
socket.on('user:status', (status) => {
  // { userId: 'user-123', status: 'online' }
});
```

## 🛠️ Implementação no Backend

### Adicionar AuthMiddleware

```javascript
// backend/src/middlewares/auth.js

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
};
```

### Criar Controller de Autenticação

```javascript
// backend/src/controllers/AuthController.js

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) throw new Error('Usuário não encontrado');

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) throw new Error('Senha inválida');

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({ token, user });
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  }

  async me(req, res) {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    res.json(user);
  }
}

module.exports = new AuthController();
```

### Criar Rotas

```javascript
// backend/src/routes/auth.routes.js

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const auth = require('../middlewares/auth');

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.get('/me', auth, AuthController.me);
router.post('/logout', auth, (req, res) => {
  res.json({ message: 'Logout realizado' });
});

module.exports = router;
```

### Adicionar ao Socket.io

```javascript
// backend/src/config/socket.js

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  // Quando um novo acesso é criado
  socket.on('access:create', (access) => {
    // Notificar todos os clientes conectados
    io.to('dashboard').emit('access:new', access);
  });

  // Subscriptions
  socket.on('subscribe:dashboard', () => {
    socket.join('dashboard');
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});
```

## 📝 Checklist de Implementação

- [ ] POST /auth/login
- [ ] POST /auth/register
- [ ] GET /auth/me (validar token)
- [ ] POST /auth/logout
- [ ] POST /invites/request
- [ ] GET /invites/verify/:iToken
- [ ] POST /residents/register-with-token (com upload de foto)
- [ ] GET /residents/me
- [ ] GET /dashboard/stats
- [ ] GET /access (com paginação)
- [ ] WebSocket: access:new event
- [ ] AuthMiddleware para proteger rotas
- [ ] CORS configurado para aceitar requests do mobile

## 🧪 Testar com Postman

1. Importe os endpoints acima no Postman
2. Configure a variável `{{token}}` após login
3. Use `Authorization: Bearer {{token}}` nas requisições autenticadas
4. Teste cada endpoint antes de usar no app mobile

---

**Última atualização:** 31 de Janeiro de 2026
