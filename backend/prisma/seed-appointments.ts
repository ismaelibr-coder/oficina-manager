import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Populando agendamentos para a semana atual...')

    // 1. Buscar dados base
    const customer = await prisma.customer.findFirst()
    const vehicle = await prisma.vehicle.findFirst({ where: { customerId: customer?.id } })
    const box1 = await prisma.box.findFirst({ where: { name: 'Box 1' } })
    const box2 = await prisma.box.findFirst({ where: { name: 'Box 2' } })
    const box3 = await prisma.box.findFirst({ where: { name: 'Box 3' } })

    if (!customer || !vehicle || !box1 || !box2 || !box3) {
        throw new Error('Dados base (cliente, veículo, boxes) não encontrados. Rode o seed principal primeiro.')
    }

    // Limpar agendamentos futuros para evitar conflitos no seed
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Primeiro deletar ServiceOrders relacionados para evitar erro de FK
    const appointmentsToDelete = await prisma.appointment.findMany({
        where: { scheduledStart: { gte: today } },
        select: { id: true }
    })

    if (appointmentsToDelete.length > 0) {
        await prisma.serviceOrder.deleteMany({
            where: { appointmentId: { in: appointmentsToDelete.map(a => a.id) } }
        })
    }

    await prisma.appointment.deleteMany({
        where: {
            scheduledStart: { gte: today }
        }
    })
    console.log('🧹 Agendamentos futuros limpos.')

    // 2. Criar Agendamentos Dinâmicos (Semana Atual)
    const appointments = []
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay() + 1) // Segunda-feira

    // Segunda-feira (Ontem ou Hoje)
    const monday = new Date(startOfWeek)
    appointments.push({
        customerId: customer.id,
        vehicleId: vehicle.id,
        boxId: box1.id,
        scheduledStart: new Date(monday.setHours(9, 0, 0, 0)),
        scheduledEnd: new Date(monday.setHours(11, 0, 0, 0)),
        status: 'COMPLETED',
        description: 'Troca de Óleo - Segunda Manhã'
    })

    // Terça-feira (Hoje ou Amanhã)
    const tuesday = new Date(startOfWeek)
    tuesday.setDate(tuesday.getDate() + 1)
    appointments.push({
        customerId: customer.id,
        vehicleId: vehicle.id,
        boxId: box2.id,
        scheduledStart: new Date(tuesday.setHours(14, 0, 0, 0)),
        scheduledEnd: new Date(tuesday.setHours(16, 0, 0, 0)),
        status: 'SCHEDULED',
        description: 'Revisão Freios - Terça Tarde'
    })

    // Quarta-feira
    const wednesday = new Date(startOfWeek)
    wednesday.setDate(wednesday.getDate() + 2)
    appointments.push({
        customerId: customer.id,
        vehicleId: vehicle.id,
        boxId: box1.id,
        scheduledStart: new Date(wednesday.setHours(10, 0, 0, 0)),
        scheduledEnd: new Date(wednesday.setHours(12, 0, 0, 0)),
        status: 'SCHEDULED',
        description: 'Alinhamento - Quarta Manhã'
    })

    // Conflito Potencial na Quarta (para testar Drag & Drop)
    appointments.push({
        customerId: customer.id,
        vehicleId: vehicle.id,
        boxId: box3.id,
        scheduledStart: new Date(wednesday.setHours(10, 0, 0, 0)),
        scheduledEnd: new Date(wednesday.setHours(11, 0, 0, 0)),
        status: 'SCHEDULED',
        description: 'Diagnóstico Rápido - Quarta Manhã'
    })

    // Quinta-feira (Cascata Test)
    const thursday = new Date(startOfWeek)
    thursday.setDate(thursday.getDate() + 3)
    appointments.push({
        customerId: customer.id,
        vehicleId: vehicle.id,
        boxId: box1.id,
        scheduledStart: new Date(thursday.setHours(8, 0, 0, 0)),
        scheduledEnd: new Date(thursday.setHours(9, 0, 0, 0)),
        status: 'SCHEDULED',
        description: 'Cascata A - Quinta'
    })
    appointments.push({
        customerId: customer.id,
        vehicleId: vehicle.id,
        boxId: box1.id,
        scheduledStart: new Date(thursday.setHours(9, 0, 0, 0)),
        scheduledEnd: new Date(thursday.setHours(10, 0, 0, 0)),
        status: 'SCHEDULED',
        description: 'Cascata B - Quinta'
    })

    // Sexta-feira
    const friday = new Date(startOfWeek)
    friday.setDate(friday.getDate() + 4)
    appointments.push({
        customerId: customer.id,
        vehicleId: vehicle.id,
        boxId: box2.id,
        scheduledStart: new Date(friday.setHours(15, 0, 0, 0)),
        scheduledEnd: new Date(friday.setHours(17, 0, 0, 0)),
        status: 'SCHEDULED',
        description: 'Entrega Veículo - Sexta'
    })

    for (const apt of appointments) {
        await prisma.appointment.create({ data: apt as any })
    }

    console.log(`✅ ${appointments.length} agendamentos criados para a semana de ${startOfWeek.toLocaleDateString()}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
