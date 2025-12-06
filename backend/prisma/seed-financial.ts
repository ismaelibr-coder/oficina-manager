import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Iniciando seed de dados financeiros...')

    // Verificar se já existem dados
    const existingProducts = await prisma.product.count()
    if (existingProducts > 0) {
        console.log('ℹ️  Já existem dados no banco. Adicionando novos dados...')
    }

    // Criar produtos
    console.log('📦 Criando produtos...')
    const products = await Promise.all([
        prisma.product.create({ data: { name: 'Óleo Motor 5W30', description: 'Óleo sintético', costPrice: 45.00, salePrice: 89.90, stock: 50, minStock: 10 } }),
        prisma.product.create({ data: { name: 'Filtro de Óleo', description: 'Filtro original', costPrice: 15.00, salePrice: 35.00, stock: 30, minStock: 5 } }),
        prisma.product.create({ data: { name: 'Filtro de Ar', description: 'Filtro de ar condicionado', costPrice: 25.00, salePrice: 55.00, stock: 25, minStock: 5 } }),
        prisma.product.create({ data: { name: 'Pastilha de Freio', description: 'Jogo completo', costPrice: 80.00, salePrice: 180.00, stock: 20, minStock: 4 } }),
        prisma.product.create({ data: { name: 'Disco de Freio', description: 'Par dianteiro', costPrice: 150.00, salePrice: 320.00, stock: 15, minStock: 3 } }),
        prisma.product.create({ data: { name: 'Vela de Ignição', description: 'Jogo 4 unidades', costPrice: 35.00, salePrice: 75.00, stock: 40, minStock: 8 } }),
        prisma.product.create({ data: { name: 'Bateria 60Ah', description: 'Bateria automotiva', costPrice: 280.00, salePrice: 520.00, stock: 10, minStock: 2 } }),
        prisma.product.create({ data: { name: 'Correia Dentada', description: 'Kit completo', costPrice: 120.00, salePrice: 280.00, stock: 12, minStock: 3 } }),
    ])

    // Criar serviços
    console.log('🔧 Criando serviços...')
    const services = await Promise.all([
        prisma.service.create({ data: { name: 'Troca de Óleo', description: 'Troca de óleo e filtro', price: 120.00, estimatedHours: 1 } }),
        prisma.service.create({ data: { name: 'Alinhamento', description: 'Alinhamento de direção', price: 80.00, estimatedHours: 0.75 } }),
        prisma.service.create({ data: { name: 'Balanceamento', description: 'Balanceamento de rodas', price: 60.00, estimatedHours: 0.5 } }),
        prisma.service.create({ data: { name: 'Troca de Pastilhas', description: 'Troca de pastilhas de freio', price: 150.00, estimatedHours: 1.5 } }),
        prisma.service.create({ data: { name: 'Revisão Completa', description: 'Revisão geral do veículo', price: 350.00, estimatedHours: 3 } }),
        prisma.service.create({ data: { name: 'Troca de Correia', description: 'Troca de correia dentada', price: 200.00, estimatedHours: 2 } }),
        prisma.service.create({ data: { name: 'Diagnóstico Eletrônico', description: 'Diagnóstico computadorizado', price: 100.00, estimatedHours: 1 } }),
    ])

    // Criar clientes
    console.log('👥 Criando clientes...')
    const customers = await Promise.all([
        prisma.customer.create({ data: { name: 'João Silva', email: 'joao@email.com', phone: '(11) 98765-4321', cpfCnpj: '123.456.789-00' } }),
        prisma.customer.create({ data: { name: 'Maria Santos', email: 'maria@email.com', phone: '(11) 98765-4322', cpfCnpj: '234.567.890-11' } }),
        prisma.customer.create({ data: { name: 'Pedro Oliveira', email: 'pedro@email.com', phone: '(11) 98765-4323', cpfCnpj: '345.678.901-22' } }),
        prisma.customer.create({ data: { name: 'Ana Costa', email: 'ana@email.com', phone: '(11) 98765-4324', cpfCnpj: '456.789.012-33' } }),
        prisma.customer.create({ data: { name: 'Carlos Souza', email: 'carlos@email.com', phone: '(11) 98765-4325', cpfCnpj: '567.890.123-44' } }),
    ])

    // Criar veículos
    console.log('🚗 Criando veículos...')
    const vehicles = await Promise.all([
        prisma.vehicle.create({ data: { plate: 'ABC-1234', brand: 'Volkswagen', model: 'Gol', year: 2020, color: 'Prata', customerId: customers[0].id } }),
        prisma.vehicle.create({ data: { plate: 'DEF-5678', brand: 'Fiat', model: 'Uno', year: 2019, color: 'Branco', customerId: customers[1].id } }),
        prisma.vehicle.create({ data: { plate: 'GHI-9012', brand: 'Chevrolet', model: 'Onix', year: 2021, color: 'Preto', customerId: customers[2].id } }),
        prisma.vehicle.create({ data: { plate: 'JKL-3456', brand: 'Honda', model: 'Civic', year: 2022, color: 'Azul', customerId: customers[3].id } }),
        prisma.vehicle.create({ data: { plate: 'MNO-7890', brand: 'Toyota', model: 'Corolla', year: 2021, color: 'Vermelho', customerId: customers[4].id } }),
    ])

    // Buscar box e mecânico
    const box = await prisma.box.findFirst()
    const mechanic = await prisma.user.findFirst({ where: { role: 'ADMIN' } })

    if (!box || !mechanic) {
        console.error('❌ Box ou mecânico não encontrado. Execute o seed principal primeiro.')
        return
    }

    // Criar ordens de serviço concluídas (últimos 30 dias)
    console.log('📋 Criando ordens de serviço...')

    const now = new Date()
    const osData = []

    // Gerar 20 OS concluídas nos últimos 30 dias
    for (let i = 0; i < 20; i++) {
        const daysAgo = Math.floor(Math.random() * 30)
        const createdAt = new Date(now)
        createdAt.setDate(createdAt.getDate() - daysAgo)

        const completedAt = new Date(createdAt)
        completedAt.setHours(completedAt.getHours() + Math.floor(Math.random() * 4) + 2)

        const vehicle = vehicles[Math.floor(Math.random() * vehicles.length)]
        const customer = customers.find(c => c.id === vehicle.customerId)!

        // Criar agendamento
        const scheduledEnd = new Date(createdAt)
        scheduledEnd.setHours(scheduledEnd.getHours() + 2)

        const appointment = await prisma.appointment.create({
            data: {
                customerId: customer.id,
                vehicleId: vehicle.id,
                boxId: box.id,
                scheduledStart: createdAt,
                scheduledEnd: scheduledEnd,
                description: 'Manutenção programada',
                status: 'COMPLETED',
            }
        })

        // Criar OS
        const serviceOrder = await prisma.serviceOrder.create({
            data: {
                orderNumber: `OS-${String(i + 1).padStart(4, '0')}`,
                appointmentId: appointment.id,
                vehicleId: vehicle.id,
                mechanicId: mechanic.id,
                status: 'COMPLETED',
                createdAt,
                approvedAt: new Date(createdAt.getTime() + 30 * 60000),
                completedAt,
                subtotal: 0,
                total: 0,
            }
        })

        // Adicionar itens aleatórios
        const numServices = Math.floor(Math.random() * 3) + 1
        const numProducts = Math.floor(Math.random() * 4) + 1

        let subtotal = 0

        // Adicionar serviços
        for (let j = 0; j < numServices; j++) {
            const service = services[Math.floor(Math.random() * services.length)]
            const quantity = 1
            const total = service.price * quantity

            await prisma.serviceOrderItem.create({
                data: {
                    serviceOrderId: serviceOrder.id,
                    type: 'SERVICE',
                    serviceId: service.id,
                    description: service.name,
                    quantity,
                    unitPrice: service.price,
                    total,
                }
            })

            subtotal += total
        }

        // Adicionar produtos
        for (let j = 0; j < numProducts; j++) {
            const product = products[Math.floor(Math.random() * products.length)]
            const quantity = Math.floor(Math.random() * 3) + 1
            const total = product.salePrice * quantity

            await prisma.serviceOrderItem.create({
                data: {
                    serviceOrderId: serviceOrder.id,
                    type: 'PRODUCT',
                    productId: product.id,
                    description: product.name,
                    quantity,
                    unitPrice: product.salePrice,
                    total,
                }
            })

            subtotal += total
        }

        // Atualizar totais da OS
        await prisma.serviceOrder.update({
            where: { id: serviceOrder.id },
            data: {
                subtotal,
                total: subtotal,
            }
        })

        osData.push({ orderNumber: serviceOrder.orderNumber, total: subtotal })
    }

    // Criar algumas OS pendentes de pagamento
    console.log('💰 Criando OS pendentes de pagamento...')
    for (let i = 0; i < 5; i++) {
        const daysAgo = Math.floor(Math.random() * 7)
        const createdAt = new Date(now)
        createdAt.setDate(createdAt.getDate() - daysAgo)

        const vehicle = vehicles[Math.floor(Math.random() * vehicles.length)]
        const customer = customers.find(c => c.id === vehicle.customerId)!

        const scheduledEnd = new Date(createdAt)
        scheduledEnd.setHours(scheduledEnd.getHours() + 2)

        const appointment = await prisma.appointment.create({
            data: {
                customerId: customer.id,
                vehicleId: vehicle.id,
                boxId: box.id,
                scheduledStart: createdAt,
                scheduledEnd: scheduledEnd,
                description: 'Serviço aguardando pagamento',
                status: 'COMPLETED',
            }
        })

        const serviceOrder = await prisma.serviceOrder.create({
            data: {
                orderNumber: `OS-${String(20 + i + 1).padStart(4, '0')}`,
                appointmentId: appointment.id,
                vehicleId: vehicle.id,
                mechanicId: mechanic.id,
                status: Math.random() > 0.5 ? 'APPROVED' : 'COMPLETED',
                createdAt,
                approvedAt: new Date(createdAt.getTime() + 30 * 60000),
                subtotal: 0,
                total: 0,
            }
        })

        // Adicionar itens
        const service = services[Math.floor(Math.random() * services.length)]
        const product = products[Math.floor(Math.random() * products.length)]

        await prisma.serviceOrderItem.create({
            data: {
                serviceOrderId: serviceOrder.id,
                type: 'SERVICE',
                serviceId: service.id,
                description: service.name,
                quantity: 1,
                unitPrice: service.price,
                total: service.price,
            }
        })

        await prisma.serviceOrderItem.create({
            data: {
                serviceOrderId: serviceOrder.id,
                type: 'PRODUCT',
                productId: product.id,
                description: product.name,
                quantity: 2,
                unitPrice: product.salePrice,
                total: product.salePrice * 2,
            }
        })

        const total = service.price + (product.salePrice * 2)

        await prisma.serviceOrder.update({
            where: { id: serviceOrder.id },
            data: {
                subtotal: total,
                total,
            }
        })
    }

    console.log('✅ Seed de dados financeiros concluído!')
    console.log(`📊 Criados:`)
    console.log(`   - ${products.length} produtos`)
    console.log(`   - ${services.length} serviços`)
    console.log(`   - ${customers.length} clientes`)
    console.log(`   - ${vehicles.length} veículos`)
    console.log(`   - 20 OS concluídas (últimos 30 dias)`)
    console.log(`   - 5 OS pendentes de pagamento`)
    console.log(`\n💡 Agora você pode acessar o Dashboard Financeiro!`)
}

main()
    .catch((e) => {
        console.error('❌ Erro ao executar seed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
