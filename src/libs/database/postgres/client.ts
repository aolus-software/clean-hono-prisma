import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@config";
import { PrismaClient } from "@prisma-generated";

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export { prisma as db };
