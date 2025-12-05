import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

declare global {
  var prisma: PrismaClient | undefined
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

let prisma: PrismaClient

if (!globalThis.prisma) {
  globalThis.prisma = new PrismaClient({ adapter })
}

prisma = globalThis.prisma

export default prisma
