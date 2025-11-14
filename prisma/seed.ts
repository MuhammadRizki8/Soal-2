// prisma/seed.ts
import { PrismaClient, RoleInternal } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Fungsi untuk hash password
async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

async function main() {
  console.log(`Start seeding ...`);

  // --- Hapus data lama (jika ada) ---
  // Urutan penting agar tidak konflik foreign key
  await prisma.historiApproval.deleteMany();
  await prisma.dokumen.deleteMany();
  await prisma.dataPinjaman.deleteMany();
  await prisma.dataKendaraan.deleteMany();
  await prisma.dataKonsumen.deleteMany();
  await prisma.pengajuanKredit.deleteMany();
  await prisma.salesDealer.deleteMany();
  await prisma.userInternal.deleteMany();

  console.log('Data lama dibersihkan.');

  // --- Buat Pengguna Internal ---
  // Password untuk semua user internal dummy: "internal123"
  const internalPass = await hashPassword('internal123');

  const marketingUser = await prisma.userInternal.create({
    data: {
      username: 'marketing_jkl',
      password_hash: internalPass,
      nama_lengkap: 'Budi (Marketing)',
      role: RoleInternal.MARKETING,
    },
  });

  const atasanUser = await prisma.userInternal.create({
    data: {
      username: 'atasan_jkl',
      password_hash: internalPass,
      nama_lengkap: 'Siti (Atasan)',
      role: RoleInternal.ATASAN_MARKETING,
    },
  });

  const adminUser = await prisma.userInternal.create({
    data: {
      username: 'admin_jkl',
      password_hash: internalPass,
      nama_lengkap: 'Adi (Admin)',
      role: RoleInternal.ADMIN_BACKOFFICE,
    },
  });

  // --- Buat Pengguna Eksternal (Sales) ---
  // Password untuk sales: "sales123"
  const salesPass = await hashPassword('sales123');

  const salesUser = await prisma.salesDealer.create({
    data: {
      username: 'sales_dealer_A',
      password_hash: salesPass,
      nama_dealer: 'Dealer Mobilindo Jaya',
      nama_sales: 'Rina (Sales)',
    },
  });

  console.log('User internal dan eksternal dibuat:');
  console.log({
    marketingUser: marketingUser.username,
    atasanUser: atasanUser.username,
    adminUser: adminUser.username,
    salesUser: salesUser.username,
  });

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
