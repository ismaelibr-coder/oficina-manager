import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Iniciando simulação de alertas de OS...')

    // Limpar dados existentes (respeitando dependências)
    // Tenta limpar itens primeiro se existirem, ignorando erro se a tabela não existir no client gerado ainda
    try { await prisma.serviceOrderItem.deleteMany() } catch (e) { }
    try { await prisma.checklistItem.deleteMany() } catch (e) { }

    await prisma.checklist.deleteMany()
    await prisma.serviceOrder.deleteMany()
    await prisma.appointment.deleteMany()
    await prisma.vehicle.deleteMany()
    await prisma.customer.deleteMany()

    // 1. Criar Usuário (Mecânico)
    const mechanic = await prisma.user.upsert({
        where: { email: 'mecanico@oficina.com' },
        update: {},
        create: {
            email: 'mecanico@oficina.com',
            name: 'João Mecânico',
            password: 'hashed_password', // Senha fictícia
            role: 'MECHANIC',
        },
    })

    // 2. Criar Boxes (4 boxes)
    const boxes = []
    for (let i = 1; i <= 4; i++) {
        const box = await prisma.box.upsert({
            where: { name: `Box ${i}` },
            update: {},
            create: {
                name: `Box ${i}`,
                status: 'OCCUPIED', // Box ocupado
            },
        })
        boxes.push(box)
    }

    // 3. Criar Clientes e Veículos
    const customersData = [
        { name: 'Ana Silva', car: 'Honda Civic', plate: 'ABC-1234' },
        { name: 'Carlos Souza', car: 'Toyota Corolla', plate: 'XYZ-5678' },
        { name: 'Maria Oliveira', car: 'Ford Ka', plate: 'DEF-9012' },
        { name: 'Pedro Santos', car: 'VW Gol', plate: 'GHI-3456' },
    ]

    const serviceOrders = []

    // Datas para simular os alertas
    const now = new Date()
    const dates = [
        new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 dias atrás (CRÍTICO)
        new Date(now.getTime() - 26 * 60 * 60 * 1000),     // 26 horas atrás (ATENÇÃO)
        new Date(now.getTime() - 2 * 60 * 60 * 1000),      // 2 horas atrás (NORMAL)
        new Date(now.getTime() - 30 * 60 * 1000),          // 30 minutos atrás (NORMAL)
    ]

    for (let i = 0; i < 4; i++) {
        const data = customersData[i]
        const date = dates[i]
        const box = boxes[i]

        // Criar Cliente
        const customer = await prisma.customer.create({
            data: {
                name: data.name,
                phone: '11999999999',
                email: `cliente${i}@email.com`,
            },
        })

        // Criar Veículo
        const vehicle = await prisma.vehicle.create({
            data: {
                customerId: customer.id,
                brand: data.car.split(' ')[0],
                model: data.car,
                year: 2020,
                plate: data.plate,
            },
        })

        // Criar Agendamento (vinculado à OS)
        const appointment = await prisma.appointment.create({
            data: {
                customerId: customer.id,
                vehicleId: vehicle.id,
                boxId: box.id,
                scheduledStart: date,
                scheduledEnd: new Date(date.getTime() + 2 * 60 * 60 * 1000), // +2h
                status: 'IN_PROGRESS',
                description: `Manutenção ${data.car}`,
            },
        })

        // Criar Ordem de Serviço
        const os = await prisma.serviceOrder.create({
            data: {
                orderNumber: Math.floor(Math.random() * 10000).toString(),
                vehicleId: vehicle.id,
                mechanicId: mechanic.id,
                appointmentId: appointment.id,
                status: 'IN_PROGRESS',
                notes: `Serviço em andamento no ${box.name}`,
                createdAt: date, // Data retroativa para simular o tempo decorrido
            },
        })

        serviceOrders.push(os)
    }

    console.log('✅ Simulação concluída!')
    console.log(`- ${serviceOrders.length} OS criadas.`)
    console.log('- Status simulados: Crítico, Atenção, Normal, Normal.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
