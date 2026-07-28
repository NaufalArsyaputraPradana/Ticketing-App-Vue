const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Menghapus data lama (jika ada)...');
  await prisma.review.deleteMany();
  await prisma.withdrawal.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.transactionItem.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.ticketCategory.deleteMany();
  await prisma.event.deleteMany();
  await prisma.eventCategory.deleteMany();
  await prisma.user.deleteMany();

  console.log('Membuat Users...');
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@ticketflow.com',
      password: passwordHash,
      role: 'admin',
      phone: '08111111111'
    }
  });

  const organizer = await prisma.user.create({
    data: {
      name: 'Ismaya Live',
      email: 'eo@ticketflow.com',
      password: passwordHash,
      role: 'organizer',
      phone: '08222222222'
    }
  });

  const user = await prisma.user.create({
    data: {
      name: 'Budi Santoso',
      email: 'user@ticketflow.com',
      password: passwordHash,
      role: 'user',
      phone: '08333333333'
    }
  });

  console.log('Membuat Kategori Event...');
  const categoryMusic = await prisma.eventCategory.create({
    data: { name: 'Musik', icon: '🎸' }
  });
  
  const categorySeminar = await prisma.eventCategory.create({
    data: { name: 'Seminar', icon: '🎤' }
  });

  console.log('Membuat Event...');
  const event1 = await prisma.event.create({
    data: {
      organizer_id: organizer.id,
      category_id: categoryMusic.id,
      title: 'Coldplay Music of the Spheres',
      slug: 'coldplay-music-of-the-spheres',
      description: 'Konser tur dunia Coldplay di Jakarta.',
      venue_name: 'Stadion Utama Gelora Bung Karno',
      city: 'Jakarta',
      start_date: new Date('2026-11-15T19:00:00.000Z'),
      end_date: new Date('2026-11-15T23:00:00.000Z'),
      status: 'published',
      is_featured: true
    }
  });

  const event2 = await prisma.event.create({
    data: {
      organizer_id: organizer.id,
      category_id: categorySeminar.id,
      title: 'Tech Conference 2026',
      slug: 'tech-conference-2026',
      description: 'Seminar teknologi terbesar tahun ini.',
      venue_name: 'Jakarta Convention Center',
      city: 'Jakarta',
      start_date: new Date('2026-12-10T09:00:00.000Z'),
      end_date: new Date('2026-12-10T17:00:00.000Z'),
      status: 'published',
      is_featured: false
    }
  });

  console.log('Membuat Kategori Tiket...');
  await prisma.ticketCategory.createMany({
    data: [
      {
        event_id: event1.id,
        name: 'Festival',
        price: 1500000,
        quota: 1000
      },
      {
        event_id: event1.id,
        name: 'VIP',
        price: 3500000,
        quota: 200
      },
      {
        event_id: event2.id,
        name: 'Regular',
        price: 500000,
        quota: 500
      }
    ]
  });

  console.log('Seeding Selesai!');
  console.log(`
    Akses Login:
    - Admin: admin@ticketflow.com (Pass: password123)
    - Organizer: eo@ticketflow.com (Pass: password123)
    - User: user@ticketflow.com (Pass: password123)
  `);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
