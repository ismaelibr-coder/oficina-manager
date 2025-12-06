import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const templates = await prisma.checklistTemplate.findMany()
    console.log('Templates found:', templates.length)
    console.log(templates)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
