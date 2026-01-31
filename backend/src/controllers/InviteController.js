const InviteService = require('../services/InviteService');

class InviteController {
  /**
   * Cria um novo convite (iToken)
   */
  async create(req, res) {
    try {
      const { email, condominiumId } = req.body;

      if (!email || !condominiumId) {
        return res.status(400).json({ error: 'Email e ID do condomínio são obrigatórios' });
      }

      const invite = await InviteService.generateInvite(email, condominiumId);

      return res.json({
        success: true,
        iToken: invite.token,
        expiresAt: invite.expiresAt,
        message: `Convite gerado com sucesso: ${invite.token}`
      });

    } catch (error) {
      console.error('Erro ao gerar convite:', error);
      return res.status(500).json({ error: 'Erro interno ao gerar convite' });
    }
  }
}

module.exports = new InviteController();