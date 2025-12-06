import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export class SeedController {
    async seed(req: Request, res: Response) {
        try {
            console.log('Iniciando seed de produção...')

            // 0. Garantir que exite um Mecânico
            let mechanic = await prisma.user.findFirst({
                where: { role: 'MECHANIC' }
            })

            if (!mechanic) {
                const hashedPassword = await bcrypt.hash('123456', 10)
                mechanic = await prisma.user.create({
                    data: {
                        name: 'Mecânico Demo',
                        email: 'mecanico@oficina.com',
                        password: hashedPassword,
                        role: 'MECHANIC'
                    }
                })
            }

            // 1. Criar Clientes e Veículos (se não existirem)
            const customers = []
            for (let i = 1; i <= 5; i++) {
                // 1. Criar Clientes (Buscar pelo email, pois não é unique no schema)
                let customer = await prisma.customer.findFirst({
                    where: { email: `cliente${i}@exemplo.com` }
                })

                if (!customer) {
                    customer = await prisma.customer.create({
                        data: {
                            name: `Cliente Demo ${i}`,
                            email: `cliente${i}@exemplo.com`,
                            phone: `1199999000${i}`,
                            address: `Rua Exemplo, ${i}`,
                            cpfCnpj: `1234567890${i}` // Adicionando CPF fictício para garantir unicidade se necessário
                        }
                    })
                }
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
            const servicesData = [
                { name: 'Troca de Óleo', price: 150 },
                { name: 'Alinhamento e Balanceamento', price: 120 },
                { name: 'Revisão Completa', price: 450 },
                { name: 'Troca de Pastilhas', price: 200 },
                { name: 'Diagnóstico Eletrônico', price: 100 }
            ]

            const dbServices = []
            for (const s of servicesData) {
                // Upsert services to avoid duplicates
                const found = await prisma.service.findFirst({ where: { name: s.name } })
                if (found) {
                    dbServices.push(found)
                } else {
                    const svc = await prisma.service.create({
                        data: {
                            name: s.name,
                            price: s.price,
                            description: `Serviço de ${s.name}`,
                            estimatedHours: 1
                        }
                    })
                    dbServices.push(svc)
                }
            }

            const productsData = [
                { name: 'Óleo Sintético 5W30', price: 45, cost: 25 },
                { name: 'Filtro de Óleo', price: 30, cost: 15 },
                { name: 'Pastilha de Freio', price: 120, cost: 80 },
                { name: 'Disco de Freio', price: 250, cost: 150 },
                { name: 'Amortecedor Dianteiro', price: 400, cost: 250 }
            ]

            const dbProducts = []
            for (const p of productsData) {
                const found = await prisma.product.findUnique({ where: { code: `PROD-${p.name.substring(0, 3).toUpperCase()}` } })
                if (found) {
                    dbProducts.push(found)
                } else {
                    const prod = await prisma.product.create({
                        data: {
                            name: p.name,
                            description: p.name,
                            code: `PROD-${p.name.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
                            price: p.price, // Note: Schema might use salePrice, let's double check. Schema uses salePrice.
                            salePrice: p.price,
                            costPrice: p.cost,
                            stock: 100,
                            minStock: 10,
                            supplier: 'Fornecedor Demo'
                        }
                    })
                    dbProducts.push(prod)
                }
            }

            console.log('Produtos e serviços criados.')

            // 3. Criar Agendamentos (Futuros e Passados)
            const vehicles = await prisma.vehicle.findMany()

            // Criar Box padrão se não existir
            let box = await prisma.box.findFirst()
            if (!box) {
                box = await prisma.box.create({
                    data: {
                        name: 'Box 01',
                        description: 'Box Principal',
                        status: 'AVAILABLE'
                    }
                })
            }

            // Agendamentos futuros
            const now = new Date()
            for (let i = 0; i < 5; i++) {
                const start = new Date(now)
                start.setDate(now.getDate() + i + 1)
                start.setHours(9, 0, 0, 0)
                const end = new Date(start)
                end.setHours(11, 0, 0, 0)

                await prisma.appointment.create({
                    data: {
                        customerId: customers[i % customers.length].id,
                        vehicleId: vehicles[i % vehicles.length].id,
                        boxId: box.id,
                        scheduledStart: start,
                        scheduledEnd: end,
                        status: 'SCHEDULED',
                        description: 'Manutenção programada'
                    }
                })
            }

            // 4. Criar Ordens de Serviço (Passadas)
            const endDate = new Date()
            const startDate = new Date()
            startDate.setMonth(startDate.getMonth() - 2)

            let currentDate = new Date(startDate)
            let osCount = 0

            while (currentDate <= endDate) {
                const dailyOS = Math.floor(Math.random() * 2) + 1 // 1 ou 2 por dia

                for (let k = 0; k < dailyOS; k++) {
                    const customer = customers[Math.floor(Math.random() * customers.length)]
                    const vehicle = vehicles.find(v => v.customerId === customer.id) || vehicles[0]

                    if (!vehicle) continue

                    // Criar Agendamento Passado CONCLUÍDO para vincular à OS
                    const start = new Date(currentDate)
                    start.setHours(10 + k, 0, 0, 0)
                    const end = new Date(start)
                    end.setHours(11 + k, 0, 0, 0)

                    const appointment = await prisma.appointment.create({
                        data: {
                            customerId: customer.id,
                            vehicleId: vehicle.id,
                            boxId: box.id,
                            scheduledStart: start,
                            scheduledEnd: end,
                            status: 'COMPLETED',
                            description: 'Serviço realizado (Histórico)',
                            checkedInAt: start,
                            checkedOutAt: end
                        }
                    })

                    // Criar OS
                    const os = await prisma.serviceOrder.create({
                        data: {
                            orderNumber: `OS-${Date.now()}-${osCount}`,
                            appointmentId: appointment.id,
                            vehicleId: vehicle.id,
                            mechanicId: mechanic.id,
                            status: 'COMPLETED',
                            approvedAt: start,
                            completedAt: end,
                            total: 0,
                            subtotal: 0,
                            notes: 'Serviço finalizado com sucesso.'
                        }
                    })

                    // Itens e Totais
                    let total = 0

                    // Add Serviço
                    const service = dbServices[Math.floor(Math.random() * dbServices.length)]
                    await prisma.serviceOrderItem.create({
                        data: {
                            serviceOrderId: os.id,
                            type: 'SERVICE',
                            serviceId: service.id,
                            description: service.name, // Correct field
                            quantity: 1,
                            unitPrice: service.price,
                            total: service.price
                        }
                    })
                    total += service.price

                    // Add Produto
                    const product = dbProducts[Math.floor(Math.random() * dbProducts.length)]
                    const qtd = Math.floor(Math.random() * 2) + 1
                    await prisma.serviceOrderItem.create({
                        data: {
                            serviceOrderId: os.id,
                            type: 'PRODUCT',
                            productId: product.id,
                            description: product.name, // Correct field
                            quantity: qtd,
                            unitPrice: product.salePrice,
                            total: product.salePrice * qtd
                        }
                    })
                    total += product.salePrice * qtd

                    // Atualizar OS com totais
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

        } catch (error: any) {
            console.error('Erro no seed:', error)
            return res.status(500).json({
                message: 'Erro ao executar seed',
                error: {
                    name: error.name,
                    message: error.message,
                    meta: error.meta // Prisma specific
                }
            })
        }
    }
}
