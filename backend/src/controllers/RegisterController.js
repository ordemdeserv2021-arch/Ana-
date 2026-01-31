const { PrismaClient } = require('@prisma/client');
const InviteService = require('../services/InviteService');
const ControlIdService = require('../services/ControlIdService');

const prisma = new PrismaClient();

class RegisterController {
  /**
   * Valida se o token é válido (usado pelo App antes de abrir o form)
   */
  async checkToken(req, res) {
    try {
      const { token } = req.params;
      const invite = await InviteService.validateInvite(token);

      if (!invite) {
        return res.status(404).json({ valid: false, message: 'Token inválido ou expirado' });
      }

      return res.json({ valid: true, email: invite.email, condominiumId: invite.condominiumId });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao validar token' });
    }
  }

  /**
   * Finaliza o cadastro do morador
   */
  async register(req, res) {
    try {
      const { token, name, document, phone, password } = req.body;
      // se o upload multipart foi usado, `req.file` terá a foto
      let photo = req.body.photo;
      if (req.file) {
        // caminho relativo para servir estático via /uploads
        photo = `/uploads/${req.file.filename}`;
      }

      // 1. Valida o token novamente
      const invite = await InviteService.validateInvite(token);
      if (!invite) {
        return res.status(400).json({ error: 'Token inválido ou expirado' });
      }

      // 2. Cria o morador no banco
      const resident = await prisma.resident.create({
        data: {
          name,
          document,
          email: invite.email,
          phone,
          photo,
          condominiumId: invite.condominiumId,
          type: 'RESIDENT',
          active: true
        }
      });

      // 3. Marca o convite como usado
      await prisma.invite.update({
        where: { id: invite.id },
        data: { status: 'USED' }
      });

      // 4. Sincroniza com as controladoras do condomínio
      // Busca dispositivos do condomínio
      const devices = await prisma.device.findMany({
        where: { condominiumId: invite.condominiumId, active: true }
      });

      // Envia para cada dispositivo (assíncrono, não trava a resposta)
      devices.forEach(async (device) => {
        try {
          await ControlIdService.syncUsers(device, [resident]);
          console.log(`Sincronizado com ${device.name}`);
        } catch (err) {
          console.error(`Falha ao sincronizar com ${device.name}:`, err.message);
        }
      });

      return res.json({
        success: true,
        message: 'Cadastro realizado com sucesso!',
        residentId: resident.id
      });

    } catch (error) {
      console.error('Erro no registro:', error);
      return res.status(500).json({ error: 'Erro ao realizar cadastro' });
    }
  }
}

module.exports = new RegisterController();