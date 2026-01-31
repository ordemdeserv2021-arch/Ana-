# Aplicativo Mobile Ana - React Native

Aplicativo mobile nativo para iOS e Android do sistema Ana de gerenciamento residencial com integração Control ID.

## 📱 Funcionalidades

- ✅ Login e Autenticação
- ✅ Cadastro de Residentes
- ✅ Cadastro via Convite (iToken)
- ✅ Captura de Foto Biométrica (Câmera)
- ✅ Dashboard com Estatísticas
- ✅ Histórico de Acessos em Tempo Real
- ✅ Perfil de Usuário
- ✅ WebSocket para Atualizações ao Vivo
- ✅ Armazenamento Seguro de Token (SecureStore)

## 🛠️ Pré-requisitos

- Node.js 16+
- npm ou yarn
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode (para compilar para iOS)
- Android: Android Studio + SDK (para compilar para Android)

## 📦 Instalação

### 1. Instalar Dependências

```bash
cd mobile
npm install
# ou
yarn install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env`:

```env
REACT_APP_API_URL=http://192.168.1.100:3000/api
REACT_APP_SOCKET_URL=http://192.168.1.100:3001
```

**Nota:** Substitua o IP pelo endereço do seu servidor Ana.

## 🚀 Rodando o App

### Desenvolvimento com Expo

```bash
npm start
# ou
yarn start
```

Isso abrirá o Expo DevTools. Você pode:
- Escanear o QR code com o app Expo Go (iOS/Android)
- Pressionar `i` para iOS Simulator
- Pressionar `a` para Android Emulator

### Build para iOS

```bash
expo build:ios
# ou com EAS CLI
eas build --platform ios
```

### Build para Android

```bash
expo build:android
# ou com EAS CLI
eas build --platform android
```

## 📁 Estrutura do Projeto

```
mobile/
├── src/
│   ├── contexts/
│   │   └── AuthContext.js       # Gerenciamento de autenticação
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.js    # Tela de login
│   │   │   ├── RegisterScreen.js # Cadastro inicial
│   │   │   └── VerifyTokenScreen.js # Validação de convite
│   │   ├── camera/
│   │   │   └── CameraScreen.js   # Captura de foto e cadastro
│   │   ├── home/
│   │   │   └── HomeScreen.js     # Dashboard principal
│   │   ├── access/
│   │   │   └── AccessHistoryScreen.js # Histórico de acessos
│   │   └── profile/
│   │       └── ProfileScreen.js  # Perfil do usuário
│   └── services/
│       ├── api.js                # Configuração Axios
│       └── socket.js             # Configuração Socket.io
├── App.js                         # Configuração de navegação
├── index.js                       # Entry point com AuthProvider
├── package.json
└── app.json                       # Configuração Expo
```

## 🔐 Fluxos Principais

### Fluxo 1: Login

```
LoginScreen
  ↓
AuthContext.login()
  ↓
API POST /auth/login
  ↓
Salvar token em SecureStore
  ↓
HomeScreen (Dashboard)
```

### Fluxo 2: Cadastro via Convite (iToken)

```
LoginScreen
  ↓
VerifyTokenScreen
  ↓
AuthContext.verifyToken()
  ↓
CameraScreen
  ↓
Capturar foto + Preencher dados
  ↓
AuthContext.completeRegistration()
  ↓
API POST /residents/register-with-token
  ↓
HomeScreen
```

### Fluxo 3: Controle de Acesso em Tempo Real

```
HomeScreen
  ↓
Socket.io subscribe('access:new')
  ↓
Receber atualização do servidor
  ↓
Atualizar lista de últimos acessos
  ↓
Mostrar notificação (opcional)
```

## 🎨 Componentes Principais

### AuthContext

Gerencia estado de autenticação com funções:

```javascript
const {
  state,           // { isLoading, userToken, user, error }
  login,           // async (email, password)
  register,        // async (name, email, password)
  requestSignUp,   // async (email)
  verifyToken,     // async (token)
  completeRegistration, // async (token, userData, photoUri)
  logout,          // async ()
  clearError       // () - limpar erros
} = useContext(AuthContext);
```

### API Service

Cliente Axios pré-configurado:

```javascript
import api from '../services/api';

api.get('/residents/me');
api.post('/access', data);
api.put('/residents/:id', data);
```

### Socket Service

Gerencia conexão WebSocket:

```javascript
import { 
  initSocket,                    // Inicializar Socket
  subscribeToAccessUpdates,      // Inscrever em atualizações
  unsubscribeFromAccessUpdates,  // Desinscrever
  disconnect                     // Desconectar
} from '../services/socket';
```

## 📸 Captura de Foto

O app usa `expo-image-picker` e `expo-camera`:

```javascript
import * as ImagePicker from 'expo-image-picker';

// Tirar foto
const result = await ImagePicker.launchCameraAsync({
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.8
});

// Selecionar da galeria
const result = await ImagePicker.launchImageLibraryAsync({
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.8
});
```

## 🔒 Segurança

### Armazenamento de Token

Tokens são salvos em `SecureStore` (Keychain no iOS, Keystore no Android):

```javascript
import * as SecureStore from 'expo-secure-store';

// Salvar
await SecureStore.setItemAsync('userToken', token);

// Recuperar
const token = await SecureStore.getItemAsync('userToken');

// Deletar
await SecureStore.deleteItemAsync('userToken');
```

### Headers de Autenticação

Token é enviado automaticamente em todas as requisições:

```javascript
api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

### Validação de Token

Token é validado ao iniciar o app via `/auth/me`.

## 📊 Integração com Backend

### Endpoints Utilizados

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/auth/login` | Login |
| POST | `/auth/register` | Registrar novo usuário |
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | Dados do usuário autenticado |
| POST | `/invites/request` | Solicitar convite |
| GET | `/invites/verify/:token` | Validar token/convite |
| POST | `/residents/register-with-token` | Cadastro com iToken |
| GET | `/residents/me` | Dados do residente |
| GET | `/access` | Histórico de acessos |
| GET | `/dashboard/stats` | Estatísticas do dashboard |

## 🧪 Testando Localmente

### Com Expo Go

1. Inicie o servidor: `npm start`
2. Escaneie o QR code no app Expo Go
3. O app recarregará automaticamente com mudanças no código

### Com Emulador Android

1. Abra Android Studio
2. Crie ou inicie um emulador
3. Execute: `npm start`
4. Pressione `a` para abrir no emulador

### Com Simulador iOS

1. Tenha Xcode instalado
2. Execute: `npm start`
3. Pressione `i` para abrir no simulador

## 🐛 Troubleshooting

### Erro: "expo/AppEntry" não encontrado

```bash
expo prebuild
```

### Erro ao conectar à API

- Verifique se o servidor está rodando
- Confirme o IP da máquina (não use localhost em dispositivo físico)
- Verifique o firewall

### Câmera não funciona

- Verifique permissões no arquivo `app.json`
- Teste com o simulador/emulador que suporta câmera

### Token expirado

- Token é renovado automaticamente
- Se houver erro 401, usuário será desconectado automaticamente

## 📝 Próximos Passos

- [ ] Autenticação biométrica (Face ID/Touch ID)
- [ ] Notificações push
- [ ] Modo offline com sincronização
- [ ] Compartilhamento de convites via QR code
- [ ] Relatórios de acessos em PDF
- [ ] Temas claro/escuro

---

**Última atualização:** 31 de Janeiro de 2026
