import bcrypt from "bcrypt";

export async function main() {
  const admin = await this.prisma.user.findUnique({
    where: {
      username: "admin",
    },
  });

  if (!admin) {
    const hashedPassword = await bcrypt.hash("rhistle1!", 10);

    await this.prisma.user.create({
      data: {
        username: "admin",
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    console.log("관리자 계정 생성, ID: admin");
  }
}

main();
