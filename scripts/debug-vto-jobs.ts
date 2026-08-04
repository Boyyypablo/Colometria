import "dotenv/config";
import { PrismaClient } from "@prisma/client";

async function main() {
  const p = new PrismaClient();
  const jobs = await p.simulationJob.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      status: true,
      provider: true,
      type: true,
      targetColorHex: true,
      inputPath: true,
      outputPath: true,
      errorMessage: true,
      createdAt: true,
    },
  });
  console.log(JSON.stringify(jobs, null, 2));
  await p.$disconnect();
}

main();
