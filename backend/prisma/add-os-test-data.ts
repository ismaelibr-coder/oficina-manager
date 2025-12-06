import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔧 Criando dados de teste para OS em andamento...')

    // Buscar dados existentes
    const customers = await prisma.customer.findMany({ take: 3 })
    const vehicles = await prisma.vehicle.findMany({ take: 3 })
    const boxes = await prisma.box.findMany({ take: 1 })
    const users = await prisma.user.findMany({ take: 1 })

    if (customers.length === 0 || vehicles.length === 0 || boxes.length === 0 || users.length === 0) {
        console.error('❌ Não há dados suficientes no banco. Execute o seed primeiro.')
        return
    }

    const now = new Date()

    // 1. OS CRÍTICA - Mais de 2 dias em andamento
    const criticalDate = new Date(now)
    criticalDate.setDate(criticalDate.getDate() - 3) // 3 dias atrás

    const criticalAppointment = await prisma.appointment.create({
        data: {
            customerId: customers[0].id,
            vehicleId: vehicles[0].id,
            boxId: boxes[0].id,
            scheduledStart: criticalDate,
            scheduledEnd: new Date(criticalDate.getTime() + 2 * 60 * 60 * 1000),
            description: 'Revisão completa - TESTE CRÍTICO',
            status: 'IN_PROGRESS',
            createdAt: criticalDate
        }
    })

    await prisma.serviceOrder.create({
        data: {
            orderNumber: `OS-CRIT-${Date.now().toString().slice(-4)}`,
            appointmentId: criticalAppointment.id,
            vehicleId: vehicles[0].id,
            mechanicId: users[0].id,
            status: 'IN_PROGRESS',
            createdAt: criticalDate,
            subtotal: 0,
            total: 0
        }
    })

    console.log('✅ OS CRÍTICA criada (3 dias em andamento)')

    // 2. OS ATENÇÃO - 1-2 dias em andamento
    const warningDate = new Date(now)
    warningDate.setDate(warningDate.getDate() - 1.5) // 1.5 dias atrás

    const warningAppointment = await prisma.appointment.create({
        data: {
            customerId: customers[1]?.id || customers[0].id,
            vehicleId: vehicles[1]?.id || vehicles[0].id,
            boxId: boxes[0].id,
            scheduledStart: warningDate,
            scheduledEnd: new Date(warningDate.getTime() + 2 * 60 * 60 * 1000),
            description: 'Troca de óleo - TESTE ATENÇÃO',
            status: 'IN_PROGRESS',
            createdAt: warningDate
        }
    })

    await prisma.serviceOrder.create({
        data: {
            orderNumber: `OS-WARN-${Date.now().toString().slice(-4)}`,
            appointmentId: warningAppointment.id,
            vehicleId: vehicles[1]?.id || vehicles[0].id,
            mechanicId: users[0].id,
            status: 'IN_PROGRESS',
            createdAt: warningDate,
            subtotal: 0,
            total: 0
        }
    })

    console.log('✅ OS ATENÇÃO criada (1.5 dias em andamento)')

    // 3. OS NORMAL - Menos de 1 dia em andamento
    const normalDate = new Date(now)
    normalDate.setHours(normalDate.getHours() - 5) // 5 horas atrás

    const normalAppointment = await prisma.appointment.create({
        data: {
            customerId: customers[2]?.id || customers[0].id,
            vehicleId: vehicles[2]?.id || vehicles[0].id,
            boxId: boxes[0].id,
            scheduledStart: normalDate,
            scheduledEnd: new Date(normalDate.getTime() + 2 * 60 * 60 * 1000),
            description: 'Alinhamento - TESTE NORMAL',
            status: 'IN_PROGRESS',
            createdAt: normalDate
        }
    })

    await prisma.serviceOrder.create({
        data: {
            orderNumber: `OS-NORM-${Date.now().toString().slice(-4)}`,
            appointmentId: normalAppointment.id,
            vehicleId: vehicles[2]?.id || vehicles[0].id,
            mechanicId: users[0].id,
            status: 'IN_PROGRESS',
            createdAt: normalDate,
            subtotal: 0,
            total: 0
        }
    })

    console.log('✅ OS NORMAL criada (5 horas em andamento)')

    console.log('\n🎉 Dados de teste criados com sucesso!')
    console.log('📊 Acesse o dashboard para ver os 3 alertas:')
    console.log('   🔴 1 CRÍTICO (>2 dias)')
    console.log('   🟡 1 ATENÇÃO (1-2 dias)')
    console.log('   🔵 1 NORMAL (<1 dia)')
}

main()
    .catch((e) => {
        console.error('❌ Erro:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
