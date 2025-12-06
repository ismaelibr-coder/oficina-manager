import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addMaintenanceData() {
    console.log('🔧 Adicionando dados de manutenção de teste...')

    // Buscar alguns veículos existentes
    const vehicles = await prisma.vehicle.findMany({
        take: 3,
        where: { active: true }
    })

    if (vehicles.length === 0) {
        console.log('❌ Nenhum veículo encontrado. Crie alguns veículos primeiro.')
        return
    }

    const today = new Date()

    // Veículo 1: Manutenção VENCIDA (há 5 dias)
    if (vehicles[0]) {
        const vencido = new Date(today)
        vencido.setDate(vencido.getDate() - 5)

        await prisma.vehicle.update({
            where: { id: vehicles[0].id },
            data: {
                currentKm: 45000,
                nextMaintenanceKm: 50000,
                nextMaintenanceDate: vencido
            }
        })
        console.log(`✅ ${vehicles[0].plate}: Manutenção VENCIDA (há 5 dias)`)
    }

    // Veículo 2: Manutenção URGENTE (em 3 dias)
    if (vehicles[1]) {
        const urgente = new Date(today)
        urgente.setDate(urgente.getDate() + 3)

        await prisma.vehicle.update({
            where: { id: vehicles[1].id },
            data: {
                currentKm: 29500,
                nextMaintenanceKm: 30000,
                nextMaintenanceDate: urgente
            }
        })
        console.log(`✅ ${vehicles[1].plate}: Manutenção URGENTE (em 3 dias)`)
    }

    // Veículo 3: Manutenção PRÓXIMA (em 15 dias)
    if (vehicles[2]) {
        const proxima = new Date(today)
        proxima.setDate(proxima.getDate() + 15)

        await prisma.vehicle.update({
            where: { id: vehicles[2].id },
            data: {
                currentKm: 18000,
                nextMaintenanceKm: 20000,
                nextMaintenanceDate: proxima
            }
        })
        console.log(`✅ ${vehicles[2].plate}: Manutenção PRÓXIMA (em 15 dias)`)
    }

    console.log('✅ Dados de manutenção adicionados com sucesso!')
}

addMaintenanceData()
    .catch((e) => {
        console.error('❌ Erro:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
