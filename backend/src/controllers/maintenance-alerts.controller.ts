import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.middleware'
import { addDays, differenceInDays } from 'date-fns'

const prisma = new PrismaClient()

export class MaintenanceAlertsController {
    // Buscar veículos com manutenção próxima ou vencida
    async getUpcomingMaintenances(req: AuthRequest, res: Response) {
        try {
            const { daysAhead = '30' } = req.query
            const days = parseInt(daysAhead as string)
            const today = new Date()
            const futureDate = addDays(today, days)

            // Buscar veículos ativos
            const vehicles = await prisma.vehicle.findMany({
                where: {
                    active: true,
                    OR: [
                        // Manutenção por data
                        {
                            nextMaintenanceDate: {
                                lte: futureDate
                            }
                        },
                        // Manutenção por km (assumindo que está próximo se nextMaintenanceKm está definido)
                        {
                            nextMaintenanceKm: {
                                not: null
                            }
                        }
                    ]
                },
                include: {
                    customer: {
                        select: {
                            id: true,
                            name: true,
                            phone: true
                        }
                    }
                },
                orderBy: {
                    nextMaintenanceDate: 'asc'
                }
            })

            // Processar e calcular status de cada veículo
            const alerts = vehicles.map(vehicle => {
                let status: 'overdue' | 'urgent' | 'upcoming' | 'ok' = 'ok'
                let daysUntilMaintenance: number | null = null
                let kmUntilMaintenance: number | null = null
                let alertType: 'date' | 'km' | 'both' | null = null

                // Verificar alerta por data
                if (vehicle.nextMaintenanceDate) {
                    daysUntilMaintenance = differenceInDays(vehicle.nextMaintenanceDate, today)

                    if (daysUntilMaintenance < 0) {
                        status = 'overdue'
                    } else if (daysUntilMaintenance <= 7) {
                        status = 'urgent'
                    } else if (daysUntilMaintenance <= 30) {
                        status = 'upcoming'
                    }

                    alertType = 'date'
                }

                // Verificar alerta por km
                if (vehicle.nextMaintenanceKm && vehicle.currentKm) {
                    kmUntilMaintenance = vehicle.nextMaintenanceKm - vehicle.currentKm

                    if (kmUntilMaintenance <= 0) {
                        status = 'overdue'
                    } else if (kmUntilMaintenance <= 500) {
                        status = status === 'overdue' ? 'overdue' : 'urgent'
                    } else if (kmUntilMaintenance <= 2000) {
                        status = status === 'overdue' || status === 'urgent' ? status : 'upcoming'
                    }

                    alertType = vehicle.nextMaintenanceDate ? 'both' : 'km'
                }

                return {
                    vehicleId: vehicle.id,
                    plate: vehicle.plate,
                    brand: vehicle.brand,
                    model: vehicle.model,
                    year: vehicle.year,
                    currentKm: vehicle.currentKm,
                    nextMaintenanceKm: vehicle.nextMaintenanceKm,
                    nextMaintenanceDate: vehicle.nextMaintenanceDate,
                    customer: vehicle.customer,
                    status,
                    daysUntilMaintenance,
                    kmUntilMaintenance,
                    alertType
                }
            })

            // Filtrar apenas alertas relevantes (não ok)
            const relevantAlerts = alerts.filter(alert => alert.status !== 'ok')

            return res.json(relevantAlerts)
        } catch (error) {
            console.error('Erro ao buscar alertas de manutenção:', error)
            return res.status(500).json({ message: 'Erro ao buscar alertas de manutenção' })
        }
    }

    // Buscar alertas por data específica (para o calendário)
    async getAlertsByDate(req: AuthRequest, res: Response) {
        try {
            const { date } = req.query

            if (!date) {
                return res.status(400).json({ message: 'Data é obrigatória' })
            }

            const targetDate = new Date(date as string)
            const vehicles = await prisma.vehicle.findMany({
                where: {
                    active: true,
                    nextMaintenanceDate: {
                        gte: new Date(targetDate.setHours(0, 0, 0, 0)),
                        lte: new Date(targetDate.setHours(23, 59, 59, 999))
                    }
                },
                include: {
                    customer: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            })

            return res.json(vehicles)
        } catch (error) {
            console.error('Erro ao buscar alertas por data:', error)
            return res.status(500).json({ message: 'Erro ao buscar alertas por data' })
        }
    }
}
