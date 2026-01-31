/**
 * Script de seed para popular o banco de dados com dados iniciais
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed do banco de dados...');

  // Criar usuário administrador padrão
  const adminPassword = await bcrypt.hash('123456', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ana.com' },
    update: {
      password: adminPassword,
      role: 'SUPER_ADMIN',
      active: true
    },
    create: {
      email: 'admin@ana.com',
      name: 'Administrador',
      password: adminPassword,
      role: 'SUPER_ADMIN',
      active: true
    }
  });
  
  console.log(`Usuário admin criado: ${admin.email}`);

  // Criar condomínio de exemplo
  const condominium = await prisma.condominium.upsert({
    where: { id: 'demo-condominium' },
    update: {},
    create: {
      id: 'demo-condominium',
      name: 'Condomínio Residencial Ana',
      address: 'Rua Exemplo, 123 - Centro',
      type: 'CONDOMINIUM',
      phone: '(11) 99999-9999',
      email: 'contato@condominioana.com',
      managerId: admin.id
    }
  });

  console.log(`Condomínio criado: ${condominium.name}`);

  // Criar moradores de exemplo
  const residents = [
    {
      name: 'João Silva',
      document: '123.456.789-00',
      email: 'joao@email.com',
      phone: '(11) 98888-8888',
      unit: '101',
      block: 'A',
      type: 'RESIDENT'
    },
    {
      name: 'Maria Santos',
      document: '987.654.321-00',
      email: 'maria@email.com',
      phone: '(11) 97777-7777',
      unit: '202',
      block: 'A',
      type: 'RESIDENT'
    },
    {
      name: 'Carlos Oliveira',
      document: '111.222.333-44',
      email: 'carlos@email.com',
      phone: '(11) 96666-6666',
      unit: '301',
      block: 'B',
      type: 'TENANT'
    }
  ];

  for (const residentData of residents) {
    const resident = await prisma.resident.create({
      data: {
        ...residentData,
        condominiumId: condominium.id
      }
    });
    console.log(`Morador criado: ${resident.name}`);
  }

  // Criar dispositivo de exemplo
  const device = await prisma.device.create({
    data: {
      name: 'Portaria Principal',
      ip: '192.168.1.100',
      port: 80,
      model: 'iDAccess Pro',
      serialNumber: 'CTRL-001',
      location: 'Entrada principal',
      status: 'OFFLINE',
      condominiumId: condominium.id
    }
  });

  console.log(`Dispositivo criado: ${device.name}`);

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
