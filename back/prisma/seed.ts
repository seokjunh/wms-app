import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcrypt";
import { PrismaClient } from "../src/generated/prisma/client.js";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const hashedPassword = await hash("1234", 10);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {}, // 이미 있으면 업데이트 안 함
    create: {
      username: "admin",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("관리자 계정이 생성되었습니다.");
}

try {
  await main();
  await prisma.$disconnect();
} catch (error) {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
}
