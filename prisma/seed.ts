import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10)
  const userPassword = await bcrypt.hash('user123', 10)

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: { email: 'admin@example.com', password: adminPassword, name: 'Admin', role: Role.ADMIN },
  })
  await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: { email: 'user@example.com', password: userPassword, name: 'User', role: Role.USER },
  })

  const artist = await prisma.artist.upsert({
    where: { id: 'sample-artist-1' },
    update: {},
    create: { id: 'sample-artist-1', name: 'Sample Artist', bio: 'A sample artist for testing.' },
  })

  console.log('Seed complete:', { artist })
}

main().catch(console.error).finally(() => prisma.$disconnect())
