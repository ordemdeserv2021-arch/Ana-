const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class InviteService {
  /**
   * Gera um iToken numérico de 6 dígitos
   */
  async generateInvite(email, condominiumId) {
    // Gera token de 6 dígitos
    const iToken = crypto.randomInt(100000, 999999).toString();
    
    // Define expiração para 24 horas
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Salva no banco
    const invite = await prisma.invite.create({
      data: {
        token: iToken,
        email,
        condominiumId,
        expiresAt,
        status: 'PENDING'
      }
    });

    return invite;
  }

  /**
   * Valida o iToken
   */
  async validateInvite(token) {
    return await prisma.invite.findFirst({
      where: { 
        token,
        status: 'PENDING',
        expiresAt: { gt: new Date() } // Verifica se não expirou
      }
    });
  }
}

module.exports = new InviteService();