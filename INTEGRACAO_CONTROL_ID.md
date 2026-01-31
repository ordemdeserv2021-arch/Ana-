# Guia de Integração com Control ID

## 📋 Introdução

Este guia descreve como integrar o Ana com as controladoras Control ID para sincronização de dados biométricos e gerenciamento de acesso facial.

## 🎯 Objetivos da Integração

1. **Sincronizar Residentes**: Enviar dados e fotos para Control ID
2. **Biometria**: Armazenar dados faciais nas controladoras
3. **Acesso em Tempo Real**: Receber logs de entrada/saída
4. **Gerenciamento de Permissões**: Controlar quem pode acessar
5. **Sincronização Bidirecional**: Ana ↔ Control ID

## 🔧 Configuração da Control ID

### Pré-requisitos
- Controladoras Control ID instaladas e configuradas
- IP e porta da controladora disponíveis
- Credenciais de acesso à API Control ID
- Protocolo de comunicação definido (HTTP, TCP, ou proprietário)

### Variáveis de Ambiente

Adicione ao `.env` do backend:

```env
# Control ID Configuration
CONTROL_ID_ENABLED=true
CONTROL_ID_API_URL=http://192.168.1.100:8080
CONTROL_ID_API_KEY=sua-api-key-aqui
CONTROL_ID_API_SECRET=seu-secret-aqui
CONTROL_ID_TIMEOUT=30000
CONTROL_ID_RETRY_ATTEMPTS=3
CONTROL_ID_RETRY_DELAY=5000

# Sincronização
SYNC_INTERVAL=3600000  # 1 hora em ms
SYNC_ON_CREATE=true     # Sincronizar ao criar residente
SYNC_ON_UPDATE=true     # Sincronizar ao atualizar

# Armazenamento de Fotos
PHOTOS_STORAGE=local    # local, s3, azure
PHOTOS_PATH=./uploads/photos
PHOTOS_MAX_SIZE=5242880 # 5MB em bytes
```

## 🏗️ Estrutura de Integração

### ControlIdService

```javascript
// backend/src/services/ControlIdService.js

class ControlIdService {
  // Sincronizar novo residente
  async syncResident(resident)
  
  // Atualizar foto biométrica
  async updateBiometricPhoto(residentId, photoPath)
  
  // Sincronizar permissão de acesso
  async updateAccessPermission(residentId, permitted)
  
  // Receber log de acesso
  async processAccessLog(accessLog)
  
  // Listar residentes na controladora
  async listRemoteResidents()
  
  // Sincronizar banco inteiro
  async fullSync()
  
  // Reconectar dispositivo
  async reconnectDevice(deviceId)
}
```

### Implementação do ControlIdService

```javascript
// backend/src/services/ControlIdService.js

const axios = require('axios');
const logger = require('../config/logger');

class ControlIdService {
  constructor() {
    this.apiUrl = process.env.CONTROL_ID_API_URL;
    this.apiKey = process.env.CONTROL_ID_API_KEY;
    this.timeout = parseInt(process.env.CONTROL_ID_TIMEOUT);
    this.client = axios.create({
      baseURL: this.apiUrl,
      timeout: this.timeout,
      headers: {
        'Authorization': `Bearer ${process.env.CONTROL_ID_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Sincronizar novo residente com foto para Control ID
   */
  async syncResident(resident) {
    try {
      if (!process.env.CONTROL_ID_ENABLED) {
        logger.info('Control ID desativado, pulando sincronização');
        return;
      }

      // 1. Upload da foto
      const photoUrl = await this.uploadPhoto(resident.id, resident.photo);

      // 2. Preparar payload
      const payload = {
        id: resident.id,
        externalId: resident.controlIdId,
        name: resident.name,
        email: resident.email,
        document: resident.document,
        phone: resident.phone,
        unit: resident.unit,
        photoUrl: photoUrl,
        photoHash: this.generatePhotoHash(resident.photo),
        permittedAccess: resident.accessPermitted,
        metadata: {
          createdAt: resident.createdAt,
          source: 'Ana'
        }
      };

      // 3. Enviar para Control ID
      const response = await this.client.post('/api/residents', payload);

      // 4. Atualizar registro local com Control ID ID
      await prisma.resident.update({
        where: { id: resident.id },
        data: {
          controlIdId: response.data.id,
          syncedAt: new Date()
        }
      });

      // 5. Log de sucesso
      logger.info('Residente sincronizado com Control ID', {
        residentId: resident.id,
        controlIdId: response.data.id
      });

      return response.data;

    } catch (error) {
      logger.error('Erro ao sincronizar residente com Control ID', {
        residentId: resident.id,
        error: error.message
      });
      
      // Retentar
      if (this.shouldRetry(error)) {
        await this.retryWithBackoff(() => this.syncResident(resident));
      }
      
      throw error;
    }
  }

  /**
   * Upload de foto para Control ID ou Cloud Storage
   */
  async uploadPhoto(residentId, photoPath) {
    try {
      const photoBuffer = fs.readFileSync(photoPath);
      
      if (process.env.PHOTOS_STORAGE === 's3') {
        return await this.uploadToS3(residentId, photoBuffer);
      } else if (process.env.PHOTOS_STORAGE === 'azure') {
        return await this.uploadToAzure(residentId, photoBuffer);
      } else {
        // Armazenamento local
        const filename = `${residentId}_${Date.now()}.jpg`;
        const storagePath = path.join(process.env.PHOTOS_PATH, filename);
        fs.writeFileSync(storagePath, photoBuffer);
        return `${process.env.APP_URL}/photos/${filename}`;
      }
    } catch (error) {
      logger.error('Erro ao upload de foto', { error: error.message });
      throw error;
    }
  }

  /**
   * Gerar hash da foto para verificação de integridade
   */
  generatePhotoHash(photoPath) {
    const crypto = require('crypto');
    const photoBuffer = fs.readFileSync(photoPath);
    return crypto.createHash('sha256').update(photoBuffer).digest('hex');
  }

  /**
   * Atualizar foto biométrica na Control ID
   */
  async updateBiometricPhoto(residentId, newPhotoPath) {
    try {
      const resident = await prisma.resident.findUnique({
        where: { id: residentId }
      });

      const photoUrl = await this.uploadPhoto(residentId, newPhotoPath);

      const payload = {
        photoUrl: photoUrl,
        photoHash: this.generatePhotoHash(newPhotoPath)
      };

      await this.client.put(
        `/api/residents/${resident.controlIdId}/photo`,
        payload
      );

      logger.info('Foto biométrica atualizada', { residentId });

    } catch (error) {
      logger.error('Erro ao atualizar foto biométrica', { error });
      throw error;
    }
  }

  /**
   * Sincronizar permissão de acesso
   */
  async updateAccessPermission(residentId, permitted) {
    try {
      const resident = await prisma.resident.findUnique({
        where: { id: residentId }
      });

      await this.client.patch(
        `/api/residents/${resident.controlIdId}/access`,
        { permitted }
      );

      logger.info('Permissão de acesso atualizada', { 
        residentId, 
        permitted 
      });

    } catch (error) {
      logger.error('Erro ao atualizar permissão', { error });
      throw error;
    }
  }

  /**
   * Processar log de acesso recebido da Control ID
   */
  async processAccessLog(accessLog) {
    try {
      // accessLog = {
      //   residentId: string,
      //   deviceId: string,
      //   timestamp: datetime,
      //   direction: 'entrada' | 'saída',
      //   recognized: boolean,
      //   confidence: number (0-100)
      // }

      const resident = await prisma.resident.findFirst({
        where: { controlIdId: accessLog.residentId }
      });

      if (!resident) {
        logger.warn('Residente não encontrado', { 
          controlIdId: accessLog.residentId 
        });
        return;
      }

      const device = await prisma.device.findFirst({
        where: { id: accessLog.deviceId }
      });

      // Criar registro de acesso
      const access = await prisma.access.create({
        data: {
          residentId: resident.id,
          deviceId: device.id,
          direction: accessLog.direction,
          timestamp: new Date(accessLog.timestamp),
          recognized: accessLog.recognized,
          confidence: accessLog.confidence
        }
      });

      // Emitir via WebSocket para dashboard em tempo real
      io.to('dashboard').emit('access:new', access);

      logger.info('Acesso registrado', { 
        resident: resident.name,
        timestamp: access.timestamp 
      });

      return access;

    } catch (error) {
      logger.error('Erro ao processar log de acesso', { error });
      throw error;
    }
  }

  /**
   * Sincronização completa do banco de dados
   */
  async fullSync() {
    try {
      logger.info('Iniciando sincronização completa com Control ID');

      const residents = await prisma.resident.findMany({
        where: { 
          condominium: {
            controlIdEnabled: true
          }
        }
      });

      let syncedCount = 0;
      let errorCount = 0;

      for (const resident of residents) {
        try {
          await this.syncResident(resident);
          syncedCount++;
        } catch (error) {
          errorCount++;
          logger.error(`Erro ao sincronizar ${resident.name}`, { error });
        }
      }

      logger.info('Sincronização completa finalizada', {
        total: residents.length,
        synced: syncedCount,
        errors: errorCount
      });

      return { total: residents.length, synced: syncedCount, errors: errorCount };

    } catch (error) {
      logger.error('Erro crítico na sincronização completa', { error });
      throw error;
    }
  }

  /**
   * Verificar conexão com Control ID
   */
  async healthCheck() {
    try {
      const response = await this.client.get('/api/health');
      logger.info('Control ID disponível', { status: response.data });
      return response.data;
    } catch (error) {
      logger.error('Control ID indisponível', { error: error.message });
      throw error;
    }
  }

  /**
   * Determinar se deve retentar
   */
  shouldRetry(error) {
    const retryableErrors = [408, 429, 500, 502, 503, 504];
    return retryableErrors.includes(error.response?.status);
  }

  /**
   * Retentar com backoff exponencial
   */
  async retryWithBackoff(fn, attempt = 1) {
    const maxAttempts = parseInt(process.env.CONTROL_ID_RETRY_ATTEMPTS);
    const baseDelay = parseInt(process.env.CONTROL_ID_RETRY_DELAY);

    if (attempt > maxAttempts) {
      throw new Error('Máximo de tentativas excedido');
    }

    const delay = baseDelay * Math.pow(2, attempt - 1);
    await new Promise(resolve => setTimeout(resolve, delay));

    try {
      return await fn();
    } catch (error) {
      return this.retryWithBackoff(fn, attempt + 1);
    }
  }
}

module.exports = new ControlIdService();
```

## 🔌 Webhook para Receber Logs de Acesso

Control ID pode enviar logs de acesso para Ana via webhook:

```javascript
// backend/src/routes/webhooks.routes.js

router.post('/webhooks/control-id/access', async (req, res) => {
  try {
    // Validar assinatura
    if (!validateWebhookSignature(req)) {
      return res.status(401).json({ error: 'Assinatura inválida' });
    }

    const accessLog = req.body;
    const access = await controlIdService.processAccessLog(accessLog);

    res.json({ 
      success: true, 
      accessId: access.id 
    });

  } catch (error) {
    logger.error('Erro ao processar webhook', { error });
    res.status(500).json({ error: 'Erro ao processar webhook' });
  }
});

function validateWebhookSignature(req) {
  const signature = req.headers['x-control-id-signature'];
  const payload = JSON.stringify(req.body);
  const hash = crypto
    .createHmac('sha256', process.env.CONTROL_ID_API_SECRET)
    .update(payload)
    .digest('hex');
  
  return signature === hash;
}
```

## 📊 Fluxo de Sincronização

### Sincronização Automática ao Criar Residente

```javascript
// backend/src/controllers/ResidentController.js

async create(req, res) {
  try {
    // 1. Criar residente no BD
    const resident = await residentService.create({
      ...req.body,
      condominiumId: req.user.condominiumId
    });

    // 2. Sincronizar com Control ID (se habilitado)
    if (process.env.SYNC_ON_CREATE === 'true') {
      try {
        await controlIdService.syncResident(resident);
      } catch (error) {
        logger.warn('Falha ao sincronizar residente', { error });
        // Continua mesmo com erro de sincronização
      }
    }

    res.status(201).json(resident);

  } catch (error) {
    logger.error('Erro ao criar residente', { error });
    res.status(500).json({ error: 'Erro ao criar residente' });
  }
}
```

### Sincronização Periódica

```javascript
// backend/src/server.js

// Sincronizar a cada 1 hora
setInterval(async () => {
  try {
    logger.info('Iniciando sincronização periódica');
    await controlIdService.fullSync();
  } catch (error) {
    logger.error('Erro na sincronização periódica', { error });
  }
}, process.env.SYNC_INTERVAL || 3600000);
```

## 🧪 Testes de Integração

### Teste de Conexão

```bash
# Health check
curl -H "Authorization: Bearer SEU_API_KEY" \
  http://192.168.1.100:8080/api/health
```

### Teste de Sincronização

```javascript
// backend/src/tests/controlId.test.js

describe('Control ID Integration', () => {
  test('deve sincronizar residente com sucesso', async () => {
    const resident = {
      name: 'João Silva',
      email: 'joao@example.com',
      document: '12345678900',
      photo: '/path/to/photo.jpg'
    };

    const result = await controlIdService.syncResident(resident);
    
    expect(result).toHaveProperty('id');
    expect(result.name).toBe('João Silva');
  });

  test('deve processar log de acesso', async () => {
    const accessLog = {
      residentId: 'control-id-123',
      deviceId: 'device-001',
      timestamp: new Date(),
      direction: 'entrada',
      recognized: true,
      confidence: 98.5
    };

    const result = await controlIdService.processAccessLog(accessLog);
    
    expect(result).toHaveProperty('id');
    expect(result.recognized).toBe(true);
  });
});
```

## 🚨 Tratamento de Erros

### Erros Comuns e Soluções

| Erro | Causa | Solução |
|------|-------|--------|
| ECONNREFUSED | Control ID indisponível | Verificar IP e porta |
| 401 Unauthorized | API key inválida | Verificar credenciais |
| 413 Payload Too Large | Foto muito grande | Comprimir imagem (<5MB) |
| 503 Service Unavailable | Control ID sobrecarregado | Implementar retry com backoff |
| Timeout | Conexão lenta | Aumentar CONTROL_ID_TIMEOUT |

## 📈 Monitoramento

### Métricas de Integração

```javascript
// Monitorar sincronizações bem-sucedidas
logger.info('Sync success', { 
  count: 100,
  duration: 1250 
});

// Monitorar taxas de erro
logger.error('Sync failure', { 
  error: 'Connection timeout',
  attempt: 2 
});

// Monitorar logs de acesso
logger.info('Access logged', { 
  resident: 'João',
  confidence: 99.2,
  timestamp: new Date()
});
```

### Dashboard de Monitoramento

Adicionar ao frontend um painel com:
- Status de conexão com Control ID
- Últimas sincronizações
- Taxa de erro
- Histórico de acessos
- Tempo de resposta médio

## 🔐 Segurança na Integração

### Criptografia
- Usar HTTPS para comunicação com Control ID
- Criptografar fotos no armazenamento
- Usar JWT para autenticação

### Validação
- Validar origem de webhooks (HMAC)
- Sanitizar dados recebidos
- Limitar taxa de requisições

### Logs e Auditoria
- Registrar todas as sincronizações
- Auditar acessos negados
- Manter histórico de atualizações

---

**Última atualização:** 31 de Janeiro de 2026
