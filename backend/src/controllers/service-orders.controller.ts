import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.middleware'
import { getPaginationParams, buildPaginationResult } from '../utils/pagination'

const prisma = new PrismaClient()

export class ServiceOrdersController {
    // Listar OS com paginação
    async list(req: AuthRequest, res: Response) {
        try {
            const { status, search } = req.query

            // Get pagination params
            const { page, pageSize, skip, take } = getPaginationParams(req.query, {
                defaultPageSize: 50,
                maxPageSize: 100
            })

            const where: any = {}

            if (status) {
                where.status = status
            }

            if (search) {
                where.OR = [
                    { orderNumber: { contains: search as string } },
                    { vehicle: { plate: { contains: search as string, mode: 'insensitive' } } },
                ]
            }

            // Get total count
            const total = await prisma.serviceOrder.count({ where })

            // Get paginated data
            const serviceOrders = await prisma.serviceOrder.findMany({
                where,
                skip,
                take,
                include: {
                    vehicle: true,
                    mechanic: { select: { id: true, name: true, email: true } },
                    items: {
                        include: {
                            product: true,
                            service: true,
                        }
                    },
                    appointment: {
                        include: {
                            customer: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            })

            // Hardening: map and protect against nulls before returning
            const safeServiceOrders = serviceOrders.map(os => ({
                ...os,
                vehicle: os.vehicle || { plate: 'N/A', model: 'Desconhecido', brand: '' },
                mechanic: os.mechanic || { name: 'Não atribuído' },
                items: os.items || [],
                appointment: os.appointment ? {
                    ...os.appointment,
                    customer: os.appointment.customer || { name: 'Cliente Desconhecido' }
                } : null
            }))

            // Return paginated result
            return res.json(buildPaginationResult(safeServiceOrders, total, page, pageSize))
        } catch (error) {
            console.error('Erro ao listar OS:', error)
            // Fail-safe: return empty paginated result
            return res.json(buildPaginationResult([], 0, 1, 50))
        }
    }

    // Buscar OS por ID
    async getById(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params

            const serviceOrder = await prisma.serviceOrder.findUnique({
                where: { id },
                include: {
                    vehicle: true,
                    mechanic: { select: { id: true, name: true, email: true } },
                    items: {
                        include: {
                            product: true,
                            service: true,
                        }
                    },
                    appointment: {
                        include: {
                            customer: true
                        }
                    }
                },
            })

            if (!serviceOrder) {
                return res.status(404).json({ message: 'Ordem de Serviço não encontrada' })
            }

            return res.json(serviceOrder)
        } catch (error) {
            console.error('Erro ao buscar OS:', error)
            return res.status(500).json({ message: 'Erro ao buscar Ordem de Serviço' })
        }
    }

    // Criar OS a partir de agendamento
    async create(req: AuthRequest, res: Response) {
        try {
            const { appointmentId, mechanicId } = req.body

            // Verificar se agendamento existe
            const appointment = await prisma.appointment.findUnique({
                where: { id: appointmentId },
            })

            if (!appointment) {
                return res.status(404).json({ message: 'Agendamento não encontrado' })
            }

            // Verificar se já existe OS para este agendamento
            const existingOS = await prisma.serviceOrder.findUnique({
                where: { appointmentId },
            })

            if (existingOS) {
                return res.status(400).json({ message: 'Já existe uma OS para este agendamento' })
            }

            // Gerar número da OS (sequencial simples baseado no timestamp para exemplo)
            const orderNumber = `OS-${Date.now().toString().slice(-6)}`

            const targetMechanicId = mechanicId || req.user?.id

            // Verificar disponibilidade do mecânico
            if (targetMechanicId) {
                const mechanicConflicts = await prisma.appointment.findMany({
                    where: {
                        id: { not: appointmentId },
                        status: { not: 'CANCELLED' },
                        AND: [
                            { scheduledStart: { lt: appointment.scheduledEnd } },
                            { scheduledEnd: { gt: appointment.scheduledStart } }
                        ],
                        serviceOrder: {
                            mechanicId: targetMechanicId
                        }
                    }
                })

                if (mechanicConflicts.length > 0) {
                    return res.status(400).json({ message: 'Mecânico indisponível neste horário' })
                }
            }

            const serviceOrder = await prisma.serviceOrder.create({
                data: {
                    orderNumber,
                    appointmentId,
                    vehicleId: appointment.vehicleId,
                    mechanicId: targetMechanicId,
                    status: 'PENDING',
                },
            })

            // Atualizar status do agendamento
            await prisma.appointment.update({
                where: { id: appointmentId },
                data: { status: 'IN_PROGRESS' },
            })

            return res.status(201).json(serviceOrder)
        } catch (error) {
            console.error('Erro ao criar OS:', error)
            return res.status(500).json({ message: 'Erro ao criar Ordem de Serviço' })
        }
    }

    // Adicionar Item (Produto ou Serviço)
    async addItem(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params
            const { type, productId, serviceId, quantity, unitPrice, description } = req.body

            const serviceOrder = await prisma.serviceOrder.findUnique({ where: { id } })
            if (!serviceOrder) {
                return res.status(404).json({ message: 'OS não encontrada' })
            }

            if (serviceOrder.status === 'COMPLETED' || serviceOrder.status === 'CANCELLED') {
                return res.status(400).json({ message: 'Não é possível alterar uma OS finalizada' })
            }

            let itemDescription = description
            let price = unitPrice

            // Validar Produto/Serviço e pegar dados
            if (type === 'PRODUCT') {
                const product = await prisma.product.findUnique({ where: { id: productId } })
                if (!product) return res.status(404).json({ message: 'Produto não encontrado' })

                // Verificar estoque
                if (product.stock < quantity) {
                    return res.status(400).json({ message: `Estoque insuficiente. Disponível: ${product.stock}` })
                }

                itemDescription = itemDescription || product.name
                price = price || product.salePrice
            } else if (type === 'SERVICE') {
                const service = await prisma.service.findUnique({ where: { id: serviceId } })
                if (!service) return res.status(404).json({ message: 'Serviço não encontrado' })

                itemDescription = itemDescription || service.name
                price = price || service.price
            } else {
                return res.status(400).json({ message: 'Tipo de item inválido' })
            }

            const total = price * quantity

            // Criar item
            await prisma.serviceOrderItem.create({
                data: {
                    serviceOrderId: id,
                    type,
                    productId,
                    serviceId,
                    description: itemDescription,
                    quantity,
                    unitPrice: price,
                    total,
                },
            })

            // Atualizar totais da OS
            await this.updateTotals(id)

            return res.json({ message: 'Item adicionado com sucesso' })
        } catch (error) {
            console.error('Erro ao adicionar item:', error)
            return res.status(500).json({ message: 'Erro ao adicionar item' })
        }
    }

    // Remover Item
    async removeItem(req: AuthRequest, res: Response) {
        try {
            const { id, itemId } = req.params

            const item = await prisma.serviceOrderItem.findUnique({ where: { id: itemId } })
            if (!item) return res.status(404).json({ message: 'Item não encontrado' })

            await prisma.serviceOrderItem.delete({ where: { id: itemId } })

            // Atualizar totais da OS
            await this.updateTotals(id)

            return res.json({ message: 'Item removido com sucesso' })
        } catch (error) {
            console.error('Erro ao remover item:', error)
            return res.status(500).json({ message: 'Erro ao remover item' })
        }
    }

    // Atualizar Status
    async updateStatus(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params
            const { status } = req.body

            const serviceOrder = await prisma.serviceOrder.findUnique({
                where: { id },
                include: { items: true }
            })

            if (!serviceOrder) {
                return res.status(404).json({ message: 'OS não encontrada' })
            }

            const updateData: any = { status }

            if (status === 'APPROVED' && !serviceOrder.approvedAt) {
                updateData.approvedAt = new Date()
            }

            if (status === 'COMPLETED' && !serviceOrder.completedAt) {
                updateData.completedAt = new Date()

                // Baixar estoque ao concluir
                for (const item of serviceOrder.items) {
                    if (item.type === 'PRODUCT' && item.productId) {
                        await prisma.product.update({
                            where: { id: item.productId },
                            data: { stock: { decrement: item.quantity } }
                        })
                    }
                }

                // Atualizar agendamento para concluído também
                await prisma.appointment.update({
                    where: { id: serviceOrder.appointmentId },
                    data: { status: 'COMPLETED' }
                })
            }

            const updatedServiceOrder = await prisma.serviceOrder.update({
                where: { id },
                data: updateData,
            })

            return res.json(updatedServiceOrder)
        } catch (error) {
            console.error('Erro ao atualizar status da OS:', error)
            return res.status(500).json({ message: 'Erro ao atualizar status da OS' })
        }
    }

    // Método auxiliar para recalcular totais
    private async updateTotals(serviceOrderId: string) {
        const items = await prisma.serviceOrderItem.findMany({
            where: { serviceOrderId },
        })

        const subtotal = items.reduce((acc, item) => acc + item.total, 0)
        const total = subtotal

        await prisma.serviceOrder.update({
            where: { id: serviceOrderId },
            data: {
                subtotal,
                total,
            },
        })
    }

    // Buscar OS em andamento com alertas
    async getInProgressAlerts(req: AuthRequest, res: Response) {
        try {
            const serviceOrders = await prisma.serviceOrder.findMany({
                where: {
                    status: {
                        in: ['IN_PROGRESS', 'AWAITING_APPROVAL']
                    }
                },
                include: {
                    vehicle: { select: { id: true, plate: true, model: true, brand: true } },
                    mechanic: { select: { id: true, name: true } },
                    appointment: {
                        include: {
                            customer: { select: { id: true, name: true, phone: true } }
                        }
                    }
                },
                orderBy: { createdAt: 'asc' }
            })

            const now = new Date()
            const alerts = serviceOrders.map(os => {
                const createdAt = new Date(os.createdAt)
                const hoursInProgress = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60))
                const daysInProgress = Math.floor(hoursInProgress / 24)

                let alertLevel: 'critical' | 'warning' | 'info' = 'info'
                if (daysInProgress >= 2) {
                    alertLevel = 'critical'
                } else if (daysInProgress >= 1) {
                    alertLevel = 'warning'
                }

                return {
                    id: os.id,
                    orderNumber: os.orderNumber,
                    status: os.status,
                    vehicle: os.vehicle || { plate: 'N/A', model: 'Desconhecido', brand: '' },
                    customer: os.appointment?.customer || { name: 'Cliente Desconhecido', phone: '' },
                    mechanic: os.mechanic || { name: 'Não atribuído' },
                    createdAt: os.createdAt,
                    hoursInProgress,
                    daysInProgress,
                    alertLevel
                }
            })

            return res.json(alerts)
        } catch (error: any) {
            console.error('Erro CRÍTICO ao buscar alertas de OS:', error)
            // Retornar array vazio em vez de erro 500 para não quebrar o frontend
            return res.json([])
        }
    }
}
