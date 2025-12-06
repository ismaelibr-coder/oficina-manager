import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.middleware'

const prisma = new PrismaClient()

export class FinancialController {
    // Obter faturamento total por período
    async getTotalRevenue(req: AuthRequest, res: Response) {
        try {
            const { startDate, endDate } = req.query

            const where: any = {
                status: 'COMPLETED',
            }

            if (startDate && endDate) {
                where.completedAt = {
                    gte: new Date(startDate as string),
                    lte: new Date(endDate as string),
                }
            }

            const serviceOrders = await prisma.serviceOrder.findMany({
                where,
                select: {
                    total: true,
                    completedAt: true,
                },
            })

            const totalRevenue = serviceOrders.reduce((acc, os) => acc + os.total, 0)
            const count = serviceOrders.length

            return res.json({
                totalRevenue,
                count,
                period: {
                    startDate: startDate || null,
                    endDate: endDate || null,
                },
            })
        } catch (error) {
            console.error('Erro ao buscar faturamento total:', error)
            return res.status(500).json({ message: 'Erro ao buscar faturamento total' })
        }
    }

    // Obter faturamento por período (dia/semana/mês)
    async getRevenueByPeriod(req: AuthRequest, res: Response) {
        try {
            const { period = 'month', startDate, endDate } = req.query

            const where: any = {
                status: 'COMPLETED',
            }

            if (startDate && endDate) {
                where.completedAt = {
                    gte: new Date(startDate as string),
                    lte: new Date(endDate as string),
                }
            } else {
                // Default: últimos 30 dias
                const thirtyDaysAgo = new Date()
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                where.completedAt = {
                    gte: thirtyDaysAgo,
                }
            }

            const serviceOrders = await prisma.serviceOrder.findMany({
                where,
                select: {
                    total: true,
                    completedAt: true,
                },
                orderBy: {
                    completedAt: 'asc',
                },
            })

            // Agrupar por data
            const revenueByDate: { [key: string]: number } = {}
            serviceOrders.forEach((os) => {
                if (os.completedAt) {
                    const date = os.completedAt.toISOString().split('T')[0]
                    revenueByDate[date] = (revenueByDate[date] || 0) + os.total
                }
            })

            const chartData = Object.entries(revenueByDate).map(([date, revenue]) => ({
                date,
                revenue,
            }))

            return res.json(chartData)
        } catch (error) {
            console.error('Erro ao buscar faturamento por período:', error)
            return res.status(500).json({ message: 'Erro ao buscar faturamento por período' })
        }
    }

    // Obter serviços mais lucrativos
    async getTopServices(req: AuthRequest, res: Response) {
        try {
            const { limit = 5 } = req.query

            const items = await prisma.serviceOrderItem.findMany({
                where: {
                    type: 'SERVICE',
                    serviceOrder: {
                        status: 'COMPLETED',
                    },
                },
                include: {
                    service: true,
                },
            })

            // Agrupar por serviço
            const serviceStats: { [key: string]: { name: string; total: number; count: number } } = {}

            items.forEach((item) => {
                if (item.service) {
                    const serviceId = item.service.id
                    if (!serviceStats[serviceId]) {
                        serviceStats[serviceId] = {
                            name: item.service.name,
                            total: 0,
                            count: 0,
                        }
                    }
                    serviceStats[serviceId].total += item.total
                    serviceStats[serviceId].count += 1
                }
            })

            // Ordenar por total e pegar top N
            const topServices = Object.values(serviceStats)
                .sort((a, b) => b.total - a.total)
                .slice(0, Number(limit))

            return res.json(topServices)
        } catch (error) {
            console.error('Erro ao buscar top serviços:', error)
            return res.status(500).json({ message: 'Erro ao buscar top serviços' })
        }
    }

    // Obter produtos mais vendidos
    async getTopProducts(req: AuthRequest, res: Response) {
        try {
            const { limit = 5 } = req.query

            const items = await prisma.serviceOrderItem.findMany({
                where: {
                    type: 'PRODUCT',
                    serviceOrder: {
                        status: 'COMPLETED',
                    },
                },
                include: {
                    product: true,
                },
            })

            // Agrupar por produto
            const productStats: { [key: string]: { name: string; total: number; quantity: number } } = {}

            items.forEach((item) => {
                if (item.product) {
                    const productId = item.product.id
                    if (!productStats[productId]) {
                        productStats[productId] = {
                            name: item.product.name,
                            total: 0,
                            quantity: 0,
                        }
                    }
                    productStats[productId].total += item.total
                    productStats[productId].quantity += item.quantity
                }
            })

            // Ordenar por total e pegar top N
            const topProducts = Object.values(productStats)
                .sort((a, b) => b.total - a.total)
                .slice(0, Number(limit))

            return res.json(topProducts)
        } catch (error) {
            console.error('Erro ao buscar top produtos:', error)
            return res.status(500).json({ message: 'Erro ao buscar top produtos' })
        }
    }

    // Obter OS pendentes de pagamento
    async getPendingPayments(req: AuthRequest, res: Response) {
        try {
            const serviceOrders = await prisma.serviceOrder.findMany({
                where: {
                    status: {
                        in: ['APPROVED', 'COMPLETED'],
                    },
                },
                include: {
                    vehicle: {
                        select: {
                            plate: true,
                            model: true,
                            brand: true,
                        },
                    },
                    appointment: {
                        include: {
                            customer: {
                                select: {
                                    name: true,
                                    phone: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            })

            const totalPending = serviceOrders.reduce((acc, os) => acc + os.total, 0)

            return res.json({
                serviceOrders,
                totalPending,
                count: serviceOrders.length,
            })
        } catch (error) {
            console.error('Erro ao buscar pagamentos pendentes:', error)
            return res.status(500).json({ message: 'Erro ao buscar pagamentos pendentes' })
        }
    }

    // Obter estatísticas do dashboard
    async getDashboardStats(req: AuthRequest, res: Response) {
        try {
            // Faturamento do mês atual
            const now = new Date()
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
            const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

            const monthlyRevenue = await prisma.serviceOrder.aggregate({
                where: {
                    status: 'COMPLETED',
                    completedAt: {
                        gte: firstDayOfMonth,
                        lte: lastDayOfMonth,
                    },
                },
                _sum: {
                    total: true,
                },
                _count: true,
            })

            // OS pendentes de pagamento
            const pendingPayments = await prisma.serviceOrder.aggregate({
                where: {
                    status: {
                        in: ['APPROVED', 'COMPLETED'],
                    },
                },
                _sum: {
                    total: true,
                },
                _count: true,
            })

            // Ticket médio
            const averageTicket = monthlyRevenue._count > 0
                ? (monthlyRevenue._sum.total || 0) / monthlyRevenue._count
                : 0

            // Total de OS concluídas no mês
            const completedOrders = monthlyRevenue._count

            return res.json({
                monthlyRevenue: monthlyRevenue._sum.total || 0,
                pendingPayments: pendingPayments._sum.total || 0,
                pendingPaymentsCount: pendingPayments._count,
                averageTicket,
                completedOrders,
            })
        } catch (error) {
            console.error('Erro ao buscar estatísticas do dashboard:', error)
            return res.status(500).json({ message: 'Erro ao buscar estatísticas do dashboard' })
        }
    }

    // Obter comparação serviços vs produtos
    async getServicesVsProducts(req: AuthRequest, res: Response) {
        try {
            const { startDate, endDate } = req.query

            const where: any = {
                serviceOrder: {
                    status: 'COMPLETED',
                },
            }

            if (startDate && endDate) {
                where.serviceOrder.completedAt = {
                    gte: new Date(startDate as string),
                    lte: new Date(endDate as string),
                }
            }

            const items = await prisma.serviceOrderItem.findMany({
                where,
                select: {
                    type: true,
                    total: true,
                },
            })

            const servicesTotal = items
                .filter((item) => item.type === 'SERVICE')
                .reduce((acc, item) => acc + item.total, 0)

            const productsTotal = items
                .filter((item) => item.type === 'PRODUCT')
                .reduce((acc, item) => acc + item.total, 0)

            return res.json([
                { name: 'Serviços', value: servicesTotal },
                { name: 'Produtos', value: productsTotal },
            ])
        } catch (error) {
            console.error('Erro ao buscar comparação serviços vs produtos:', error)
            return res.status(500).json({ message: 'Erro ao buscar comparação' })
        }
    }
}
