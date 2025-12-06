import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.middleware'
import * as XLSX from 'xlsx'

const prisma = new PrismaClient()

export class ReportsController {
    // Gerar relatório de faturamento em Excel
    async generateRevenueReport(req: AuthRequest, res: Response) {
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
                    items: {
                        include: {
                            product: true,
                            service: true,
                        },
                    },
                },
                orderBy: {
                    completedAt: 'desc',
                },
            })

            // Preparar dados para Excel
            const data = serviceOrders.map((os) => ({
                'OS': os.orderNumber,
                'Data Conclusão': os.completedAt ? new Date(os.completedAt).toLocaleDateString('pt-BR') : '',
                'Cliente': os.appointment?.customer?.name || '',
                'Telefone': os.appointment?.customer?.phone || '',
                'Veículo': `${os.vehicle.brand} ${os.vehicle.model}`,
                'Placa': os.vehicle.plate,
                'Subtotal': os.subtotal,
                'Total': os.total,
                'Status': os.status,
            }))

            // Criar workbook
            const wb = XLSX.utils.book_new()
            const ws = XLSX.utils.json_to_sheet(data)

            // Adicionar worksheet ao workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Faturamento')

            // Gerar buffer
            const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

            // Enviar arquivo
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            res.setHeader('Content-Disposition', `attachment; filename=relatorio-faturamento-${Date.now()}.xlsx`)
            return res.send(buffer)
        } catch (error) {
            console.error('Erro ao gerar relatório de faturamento:', error)
            return res.status(500).json({ message: 'Erro ao gerar relatório de faturamento' })
        }
    }

    // Gerar relatório de OS em Excel
    async generateServiceOrdersReport(req: AuthRequest, res: Response) {
        try {
            const { startDate, endDate, status } = req.query

            const where: any = {}

            if (status) {
                where.status = status
            }

            if (startDate && endDate) {
                where.createdAt = {
                    gte: new Date(startDate as string),
                    lte: new Date(endDate as string),
                }
            }

            const serviceOrders = await prisma.serviceOrder.findMany({
                where,
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
                    mechanic: {
                        select: {
                            name: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            })

            // Preparar dados para Excel
            const data = serviceOrders.map((os) => ({
                'OS': os.orderNumber,
                'Data Criação': new Date(os.createdAt).toLocaleDateString('pt-BR'),
                'Cliente': os.appointment?.customer?.name || '',
                'Veículo': `${os.vehicle.brand} ${os.vehicle.model}`,
                'Placa': os.vehicle.plate,
                'Mecânico': os.mechanic?.name || '',
                'Status': os.status,
                'Total': os.total,
                'Data Aprovação': os.approvedAt ? new Date(os.approvedAt).toLocaleDateString('pt-BR') : '',
                'Data Conclusão': os.completedAt ? new Date(os.completedAt).toLocaleDateString('pt-BR') : '',
            }))

            // Criar workbook
            const wb = XLSX.utils.book_new()
            const ws = XLSX.utils.json_to_sheet(data)

            // Adicionar worksheet ao workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Ordens de Serviço')

            // Gerar buffer
            const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

            // Enviar arquivo
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            res.setHeader('Content-Disposition', `attachment; filename=relatorio-os-${Date.now()}.xlsx`)
            return res.send(buffer)
        } catch (error) {
            console.error('Erro ao gerar relatório de OS:', error)
            return res.status(500).json({ message: 'Erro ao gerar relatório de OS' })
        }
    }

    // Gerar relatório de produtos vendidos em Excel
    async generateProductSalesReport(req: AuthRequest, res: Response) {
        try {
            const { startDate, endDate } = req.query

            const where: any = {
                type: 'PRODUCT',
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
                include: {
                    product: true,
                    serviceOrder: {
                        include: {
                            appointment: {
                                include: {
                                    customer: {
                                        select: {
                                            name: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            })

            // Preparar dados para Excel
            const data = items.map((item) => ({
                'OS': item.serviceOrder.orderNumber,
                'Data': item.serviceOrder.completedAt ? new Date(item.serviceOrder.completedAt).toLocaleDateString('pt-BR') : '',
                'Cliente': item.serviceOrder.appointment?.customer?.name || '',
                'Produto': item.product?.name || item.description,
                'Quantidade': item.quantity,
                'Preço Unitário': item.unitPrice,
                'Total': item.total,
            }))

            // Criar workbook
            const wb = XLSX.utils.book_new()
            const ws = XLSX.utils.json_to_sheet(data)

            // Adicionar worksheet ao workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Produtos Vendidos')

            // Gerar buffer
            const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

            // Enviar arquivo
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            res.setHeader('Content-Disposition', `attachment; filename=relatorio-produtos-${Date.now()}.xlsx`)
            return res.send(buffer)
        } catch (error) {
            console.error('Erro ao gerar relatório de produtos:', error)
            return res.status(500).json({ message: 'Erro ao gerar relatório de produtos' })
        }
    }

    // Gerar relatório de serviços realizados em Excel
    async generateServicesReport(req: AuthRequest, res: Response) {
        try {
            const { startDate, endDate } = req.query

            const where: any = {
                type: 'SERVICE',
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
                include: {
                    service: true,
                    serviceOrder: {
                        include: {
                            appointment: {
                                include: {
                                    customer: {
                                        select: {
                                            name: true,
                                        },
                                    },
                                },
                            },
                            mechanic: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            })

            // Preparar dados para Excel
            const data = items.map((item) => ({
                'OS': item.serviceOrder.orderNumber,
                'Data': item.serviceOrder.completedAt ? new Date(item.serviceOrder.completedAt).toLocaleDateString('pt-BR') : '',
                'Cliente': item.serviceOrder.appointment?.customer?.name || '',
                'Serviço': item.service?.name || item.description,
                'Mecânico': item.serviceOrder.mechanic?.name || '',
                'Quantidade': item.quantity,
                'Preço Unitário': item.unitPrice,
                'Total': item.total,
            }))

            // Criar workbook
            const wb = XLSX.utils.book_new()
            const ws = XLSX.utils.json_to_sheet(data)

            // Adicionar worksheet ao workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Serviços Realizados')

            // Gerar buffer
            const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

            // Enviar arquivo
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            res.setHeader('Content-Disposition', `attachment; filename=relatorio-servicos-${Date.now()}.xlsx`)
            return res.send(buffer)
        } catch (error) {
            console.error('Erro ao gerar relatório de serviços:', error)
            return res.status(500).json({ message: 'Erro ao gerar relatório de serviços' })
        }
    }

    // Gerar relatório de clientes em Excel
    async generateCustomersReport(req: AuthRequest, res: Response) {
        try {
            const customers = await prisma.customer.findMany({
                include: {
                    vehicles: true,
                    appointments: {
                        include: {
                            serviceOrder: true,
                        },
                    },
                },
                orderBy: {
                    name: 'asc',
                },
            })

            // Preparar dados para Excel
            const data = customers.map((customer) => {
                const totalAppointments = customer.appointments.length
                const completedOrders = customer.appointments.filter(
                    (app) => app.serviceOrder?.status === 'COMPLETED'
                ).length
                const totalSpent = customer.appointments
                    .filter((app) => app.serviceOrder?.status === 'COMPLETED')
                    .reduce((acc, app) => acc + (app.serviceOrder?.total || 0), 0)

                return {
                    'Nome': customer.name,
                    'Email': customer.email,
                    'Telefone': customer.phone,
                    'CPF/CNPJ': customer.cpfCnpj,
                    'Veículos': customer.vehicles.length,
                    'Total Agendamentos': totalAppointments,
                    'OS Concluídas': completedOrders,
                    'Total Gasto': totalSpent,
                }
            })

            // Criar workbook
            const wb = XLSX.utils.book_new()
            const ws = XLSX.utils.json_to_sheet(data)

            // Adicionar worksheet ao workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Clientes')

            // Gerar buffer
            const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

            // Enviar arquivo
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            res.setHeader('Content-Disposition', `attachment; filename=relatorio-clientes-${Date.now()}.xlsx`)
            return res.send(buffer)
        } catch (error) {
            console.error('Erro ao gerar relatório de clientes:', error)
            return res.status(500).json({ message: 'Erro ao gerar relatório de clientes' })
        }
    }
}
