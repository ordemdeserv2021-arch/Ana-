/**
 * Serviço de integração com dispositivos Control ID
 * 
 * Este serviço será responsável pela comunicação com as controladoras
 * Control ID (iDAccess, iDBox, iDFlex, etc)
 * 
 * Documentação Control ID: https://www.controlid.com.br/suporte/
 */

const logger = require('../config/logger');
const axios = require('axios');

class ControlIdService {
  constructor() {
    this.baseUrl = process.env.CONTROL_ID_API_URL;
    this.apiKey = process.env.CONTROL_ID_API_KEY;
  }

  /**
   * Helper para fazer requisições à API da Control ID
   */
  async _request(device, endpoint, data = {}) {
    // Monta a URL: http://IP:PORTA/endpoint.fcgi
    const url = `http://${device.ip}:${device.port || 80}/${endpoint}.fcgi`;
    
    const config = {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000 // 5 segundos de timeout
    };
    
    // Se tiver chave de API configurada (opcional)
    if (this.apiKey) {
      config.headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return axios.post(url, data, config);
  }

  /**
   * Testa conexão com dispositivo
   */
  async pingDevice(ip, port = 80) {
    try {
      logger.info(`Ping ao dispositivo: ${ip}:${port}`);
      // Tenta pegar informações do sistema para validar conexão
      await axios.post(`http://${ip}:${port}/system_information.fcgi`, {}, { timeout: 3000 });
      return true;
    } catch (error) {
      logger.error(`Erro ao pingar dispositivo ${ip}:`, error);
      return false;
    }
  }

  /**
   * Sincroniza usuários com o dispositivo
   */
  async syncUsers(device, users) {
    try {
      logger.info(`Sincronizando ${users.length} usuários com ${device.name}`);
      
      // Formata os usuários para o padrão da Control ID
      const usersList = users.map(u => ({
        name: u.name,
        registration: u.document ? u.document.replace(/\D/g, '') : undefined,
        // Nota: O ID da Control ID geralmente é Inteiro. 
        // Se o dispositivo estiver em modo Enterprise, ele aceita strings ou UUIDs dependendo da config.
        // Aqui estamos enviando o básico para criar.
      }));

      // Envia comando para criar/atualizar usuários
      await this._request(device, 'create_objects', {
        object: 'users',
        values: usersList
      });
      
      return { success: true, synced: users.length };
    } catch (error) {
      logger.error(`Erro ao sincronizar usuários:`, error);
      throw error;
    }
  }

  /**
   * Adiciona credencial ao dispositivo
   */
  async addCredential(device, credential) {
    try {
      logger.info(`Adicionando credencial ao dispositivo ${device.name}`);
      
      if (credential.type === 'CARD') {
        await this._request(device, 'create_objects', {
          object: 'cards',
          values: [{ user_id: credential.userId, value: credential.value }]
        });
      }
      
      return { success: true };
    } catch (error) {
      logger.error(`Erro ao adicionar credencial:`, error);
      throw error;
    }
  }

  /**
   * Remove credencial do dispositivo
   */
  async removeCredential(device, credentialValue) {
    try {
      logger.info(`Removendo credencial do dispositivo ${device.name}`);
      
      await this._request(device, 'destroy_objects', {
        object: 'cards',
        where: { value: credentialValue }
      });
      
      return { success: true };
    } catch (error) {
      logger.error(`Erro ao remover credencial:`, error);
      throw error;
    }
  }

  /**
   * Libera acesso remotamente
   */
  async grantAccess(device) {
    try {
      logger.info(`Liberando acesso no dispositivo ${device.name}`);
      
      await this._request(device, 'execute_actions', {
        actions: [{ action: 'door', parameters: 'door=1' }]
      });
      
      return { success: true };
    } catch (error) {
      logger.error(`Erro ao liberar acesso:`, error);
      throw error;
    }
  }

  /**
   * Busca logs de acesso do dispositivo
   */
  async getAccessLogs(device, startDate, endDate) {
    try {
      logger.info(`Buscando logs de ${device.name}`);
      
      const response = await this._request(device, 'load_objects', {
        object: 'access_logs',
        where: {
          time: { '>=': Math.floor(startDate.getTime() / 1000) }
        }
      });
      
      return response.data.access_logs || [];
    } catch (error) {
      logger.error(`Erro ao buscar logs:`, error);
      throw error;
    }
  }

  /**
   * Reinicia o dispositivo
   */
  async rebootDevice(device) {
    try {
      logger.warn(`Reiniciando dispositivo ${device.name}`);
      
      await this._request(device, 'reboot');
      
      return { success: true };
    } catch (error) {
      logger.error(`Erro ao reiniciar dispositivo:`, error);
      throw error;
    }
  }

  /**
   * Configura webhook para receber eventos do dispositivo
   */
  async configureWebhook(device, webhookUrl) {
    try {
      logger.info(`Configurando webhook para ${device.name}`);
      
      // TODO: Configurar callback de eventos
      // Isso permite receber notificações em tempo real de acessos
      
      return { success: true };
    } catch (error) {
      logger.error(`Erro ao configurar webhook:`, error);
      throw error;
    }
  }
}

module.exports = new ControlIdService();
