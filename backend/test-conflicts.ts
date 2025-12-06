import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🧪 Iniciando testes de conflito...')

    // 1. Preparar dados
    const mechanic = await prisma.user.findUnique({ where: { email: 'mecanico@oficina.com' } })
    if (!mechanic) throw new Error('Mecânico não encontrado. Rode o seed primeiro.')

    const customer = await prisma.customer.findFirst()
    if (!customer) throw new Error('Cliente não encontrado.')

    const vehicle = await prisma.vehicle.findFirst({ where: { customerId: customer.id } })
    if (!vehicle) throw new Error('Veículo não encontrado.')

    const box1 = await prisma.box.findFirst({ where: { name: 'Box 1' } })
    const box2 = await prisma.box.findFirst({ where: { name: 'Box 2' } })
    if (!box1 || !box2) throw new Error('Boxes não encontrados.')

    // Limpar agendamentos de teste anteriores
    await prisma.serviceOrder.deleteMany({ where: { orderNumber: { startsWith: 'TEST-' } } })
    await prisma.appointment.deleteMany({ where: { description: { startsWith: 'TEST-' } } })

    const now = new Date()
    const start = new Date(now.getTime() + 24 * 60 * 60 * 1000) // Amanhã
    start.setHours(10, 0, 0, 0)
    const end = new Date(start.getTime() + 60 * 60 * 1000) // 1 hora depois

    console.log(`\n📅 Horário base: ${start.toISOString()} - ${end.toISOString()}`)

    // 2. Criar Agendamento A (Base)
    console.log('\n[1] Criando Agendamento A (Box 1)...')
    const apptA = await prisma.appointment.create({
        data: {
            customerId: customer.id,
            vehicleId: vehicle.id,
            boxId: box1.id,
            scheduledStart: start,
            scheduledEnd: end,
            description: 'TEST-Agendamento A',
            status: 'SCHEDULED'
        }
    })
    console.log('✅ Agendamento A criado.')

    // 3. Testar Conflito de Box (Agendamento B no mesmo Box/Horário)
    console.log('\n[2] Testando Conflito de Box (Agendamento B no Box 1)...')
    const conflictBox = await prisma.appointment.findMany({
        where: {
            boxId: box1.id,
            status: { not: 'CANCELLED' },
            AND: [
                { scheduledStart: { lt: end } },
                { scheduledEnd: { gt: start } }
            ]
        }
    })

    if (conflictBox.length > 0) {
        console.log('✅ Conflito de Box detectado corretamente!')
    } else {
        console.error('❌ FALHA: Conflito de Box NÃO detectado.')
    }

    // 4. Criar OS para Agendamento A (Vincula Mecânico)
    console.log('\n[3] Criando OS para Agendamento A (Vinculando Mecânico)...')
    await prisma.serviceOrder.create({
        data: {
            orderNumber: `TEST-${Date.now()}`,
            appointmentId: apptA.id,
            vehicleId: vehicle.id,
            mechanicId: mechanic.id,
            status: 'PENDING'
        }
    })
    console.log('✅ OS criada e mecânico vinculado.')

    // 5. Criar Agendamento C (Box 2 - Sem conflito de Box, mas mesmo horário)
    console.log('\n[4] Criando Agendamento C (Box 2)...')
    const apptC = await prisma.appointment.create({
        data: {
            customerId: customer.id,
            vehicleId: vehicle.id,
            boxId: box2.id, // Box diferente!
            scheduledStart: start,
            scheduledEnd: end,
            description: 'TEST-Agendamento C',
            status: 'SCHEDULED'
        }
    })
    console.log('✅ Agendamento C criado (Box diferente).')

    // 6. Testar Conflito de Mecânico (Tentar criar OS para Appt C com mesmo mecânico)
    console.log('\n[5] Testando Conflito de Mecânico (OS para Appt C)...')

    const mechanicConflicts = await prisma.appointment.findMany({
        where: {
            id: { not: apptC.id },
            status: { not: 'CANCELLED' },
            AND: [
                { scheduledStart: { lt: end } },
                { scheduledEnd: { gt: start } }
            ],
            serviceOrder: {
                mechanicId: mechanic.id
            }
        }
    })

    if (mechanicConflicts.length > 0) {
        console.log('✅ Conflito de Mecânico detectado corretamente!')
        console.log(`   Conflito com Agendamento ID: ${mechanicConflicts[0].id}`)
    } else {
        console.error('❌ FALHA: Conflito de Mecânico NÃO detectado.')
    }

    // Limpeza final
    console.log('\n🧹 Limpando dados de teste...')
    await prisma.serviceOrder.deleteMany({ where: { orderNumber: { startsWith: 'TEST-' } } })
    await prisma.appointment.deleteMany({ where: { description: { startsWith: 'TEST-' } } })
    console.log('✅ Limpeza concluída.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
