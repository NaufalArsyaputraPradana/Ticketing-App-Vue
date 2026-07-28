const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding bank and promo...');
  
  // 1. Bank
  const bank = await prisma.platformBankAccount.create({
    data: {
      bank_name: 'BCA',
      account_number: '1234567890',
      account_name: 'PT TicketFlow Indonesia',
      is_active: true
    }
  });
  console.log('Bank seeded:', bank.bank_name);

  // 2. Promo (Find EO first)
  const eo = await prisma.user.findFirst({ where: { role: 'organizer' } });
  if (eo) {
    const promo = await prisma.promoCode.create({
      data: {
        code: 'PROMO20',
        discount_type: 'percentage',
        discount_value: 20,
        usage_limit: 100,
        organizer_id: eo.id
      }
    });
    console.log('Promo seeded:', promo.code);
  }

  console.log('Done.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
