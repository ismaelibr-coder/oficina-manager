import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class SeedController {
    async seed(req: Request, res: Response) {
        try {
            console.log('Iniciando seed de produção...')

            // 1. Criar Clientes e Veículos (se não existirem)
            const customers = []
            for (let i = 1; i <= 5; i++) {
                const customer = await prisma.customer.upsert({
                    where: { email: `cliente${i}@exemplo.com` },
                    update: {},
                    create: {
                        name: `Cliente Demo ${i}`,
                        email: `cliente${i}@exemplo.com`,
                        phone: `1199999000${i}`,
                        address: `Rua Exemplo, ${i}`
                    }
                })
                customers.push(customer)

                // Veículo
                await prisma.vehicle.upsert({
                    where: { plate: `ABC-123${i}` },
                    update: {},
                    create: {
                        plate: `ABC-123${i}`,
                        brand: i % 2 === 0 ? 'Toyota' : 'Honda',
                        model: i % 2 === 0 ? 'Corolla' : 'Civic',
                        year: 2020 + i,
                        color: 'Prata',
                        customerId: customer.id
                    }
                })
            }

            console.log('Clientes e veículos criados/verificados.')

            // 2. Criar Produtos e Serviços (se não existirem)
            const services = [
                { name: 'Troca de Óleo', price: 150 },
                { name: 'Alinhamento e Balanceamento', price: 120 },
                { name: 'Revisão Completa', price: 450 },
                { name: 'Troca de Pastilhas', price: 200 },
                { name: 'Diagnóstico Eletrônico', price: 100 }
            ]

            const dbServices = []
            for (const s of services) {
                const svc = await prisma.service.create({
                    data: {
                        name: s.name,
                        price: s.price,
                        description: `Serviço de ${s.name}`,
                        estimatedTime: 60
                    }
                })
                dbServices.push(svc)
            }

            const products = [
                { name: 'Óleo Sintético 5W30', price: 45, cost: 25 },
                { name: 'Filtro de Óleo', price: 30, cost: 15 },
                { name: 'Pastilha de Freio', price: 120, cost: 80 },
                { name: 'Disco de Freio', price: 250, cost: 150 },
                { name: 'Amortecedor Dianteiro', price: 400, cost: 250 }
            ]

            const dbProducts = []
            for (const p of products) {
                const prod = await prisma.product.create({
                    data: {
                        name: p.name,
                        price: p.price,
                        costPrice: p.cost,
                        stock: 100,
                        minStock: 10,
                        unit: 'UN',
                        category: 'Peças'
                    }
                })
                dbProducts.push(prod)
            }

            console.log('Produtos e serviços criados.')

            // 3. Criar Agendamentos (Futuros e Passados)
            const vehicles = await prisma.vehicle.findMany()

            // Agendamentos futuros (pra encher o calendário)
            const now = new Date()
            for (let i = 0; i < 5; i++) {
                const start = new Date(now)
                start.setDate(now.getDate() + i + 1) // Amanhã, depois de amanhã...
                start.setHours(9, 0, 0, 0)
                const end = new Date(start)
                end.setHours(11, 0, 0, 0)

                await prisma.appointment.create({
                    data: {
                        customerId: customers[i % customers.length].id,
                        vehicleId: vehicles[i % vehicles.length].id,
                        scheduledStart: start,
                        scheduledEnd: end,
                        status: 'SCHEDULED',
                        description: 'Manutenção programada',
                        boxId: null // Opcional
                    }
                })
            }

            console.log('Agendamentos criados.')

            // 4. Criar Ordens de Serviço (Passadas e COMPLETADAS) para Dashboard Financeiro
            // Gerar dados para os últimos 3 meses
            const endDate = new Date()
            const startDate = new Date()
            startDate.setMonth(startDate.getMonth() - 2)

            let currentDate = new Date(startDate)
            let osCount = 0

            while (currentDate <= endDate) {
                // Criar 1 a 2 OS por dia
                const dailyOS = Math.floor(Math.random() * 2) + 1

                for (let k = 0; k < dailyOS; k++) {
                    const customer = customers[Math.floor(Math.random() * customers.length)]
                    const vehicle = vehicles.find(v => v.customerId === customer.id) || vehicles[0]

                    if (!vehicle) continue

                    // Criar OS
                    const os = await prisma.serviceOrder.create({
                        data: {
                            customerId: customer.id,
                            vehicleId: vehicle.id,
                            status: 'COMPLETED',
                            mileage: 50000 + (osCount * 1000),
                            description: 'Serviço realizado',
                            createdAt: currentDate,
                            updatedAt: currentDate,
                            completedAt: currentDate,
                            total: 0,
                            subtotal: 0
                        }
                    })

                    // Adicionar itens (Serviços)
                    let total = 0
                    const numServices = Math.floor(Math.random() * 2) + 1
                    for (let s = 0; s < numServices; s++) {
                        const service = dbServices[Math.floor(Math.random() * dbServices.length)]
                        await prisma.serviceOrderItem.create({
                            data: {
                                serviceOrderId: os.id,
                                type: 'SERVICE',
                                name: service.name,
                                quantity: 1,
                                unitPrice: service.price,
                                total: service.price,
                                serviceId: service.id
                            }
                        })
                        total += service.price
                    }

                    // Adicionar itens (Produtos)
                    const numProducts = Math.floor(Math.random() * 3)
                    for (let p = 0; p < numProducts; p++) {
                        const product = dbProducts[Math.floor(Math.random() * dbProducts.length)]
                        const qtd = Math.floor(Math.random() * 2) + 1
                        await prisma.serviceOrderItem.create({
                            data: {
                                serviceOrderId: os.id,
                                type: 'PRODUCT',
                                name: product.name,
                                quantity: qtd,
                                unitPrice: product.price,
                                total: product.price * qtd,
                                productId: product.id
                            }
                        })
                        total += product.price * qtd
                    }

                    // Atualizar total da OS
                    await prisma.serviceOrder.update({
                        where: { id: os.id },
                        data: { total, subtotal: total }
                    })

                    osCount++
                }

                currentDate.setDate(currentDate.getDate() + 1)
            }

            console.log(`Seed concluído. ${osCount} OSs criadas.`)
            return res.json({ message: `Sucesso! Banco populado com ${osCount} OSs e dados de demonstração.` })

        } catch (error) {
            console.error('Erro no seed:', error)
            return res.status(500).json({ message: 'Erro ao executar seed', error })
        }
    }
}
