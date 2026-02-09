import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

declare const globalThis: {
  prismaAdapter: InstanceType<typeof PrismaPg>;
  prismaGlobal: PrismaClient;
} & typeof global;

function createPrisma() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

const prisma =
  globalThis.prismaGlobal ?? (globalThis.prismaGlobal = createPrisma());

export { prisma };
export default prisma;

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}
