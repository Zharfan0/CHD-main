// prisma/seed.js
// Script untuk membuat akun admin pertama di database.
// Jalankan dengan: node prisma/seed.js

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const username = "admin";
  const password = "@dm1n_123"; // Ganti setelah deploy!
  const fullName = "Administrator";

  // Cek apakah admin sudah ada
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    console.log("⚠️  Admin sudah ada, skip.");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.create({
    data: { username, fullName, passwordHash, role: "admin" },
  });

  console.log(`✅ Admin berhasil dibuat:`);
  console.log(`   ID       : ${admin.id}`);
  console.log(`   Username : ${admin.username}`);
  console.log(`   Password : ${password}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
