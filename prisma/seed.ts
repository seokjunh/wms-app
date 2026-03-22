import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";

export async function main() {
  const admin = await prisma.user.findUnique({
    where: {
      username: "admin",
    },
  });

  if (!admin) {
    const hashedPassword = await bcrypt.hash("admin", 10);

    await prisma.user.create({
      data: {
        username: "admin",
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    console.log("Admin account created (admin/admin)");
  }
}

main();
