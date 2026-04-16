import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/crypto.js";

const prisma = new PrismaClient();

const seedUsers = [
  {
    email: "admin@lab.local",
    fullName: "Admin User",
    role: "admin" as const,
    password: "admin1234"
  },
  {
    email: "staff@lab.local",
    fullName: "Lab Staff User",
    role: "lab_staff" as const,
    password: "staff1234"
  },
  {
    email: "verifier@lab.local",
    fullName: "Verifier User",
    role: "verifier" as const,
    password: "verify1234"
  },
  {
    email: "user@lab.local",
    fullName: "Standard User",
    role: "user" as const,
    password: "user1234"
  }
];

async function main() {
  for (const seedUser of seedUsers) {
    const passwordHash = await hashPassword(seedUser.password);
    await prisma.user.upsert({
      where: { email: seedUser.email },
      update: {
        fullName: seedUser.fullName,
        role: seedUser.role,
        passwordHash
      },
      create: {
        email: seedUser.email,
        fullName: seedUser.fullName,
        role: seedUser.role,
        passwordHash
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed completed.");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
