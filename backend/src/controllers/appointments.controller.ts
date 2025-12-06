import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.middleware'

const prisma = new PrismaClient()

export class AppointmentsController {
    // Listar agendamentos
    async list(req: AuthRequest, res: Response) {
        try {
            const { start, end, status, customerId, vehicleId } = req.query

            const where: any = {}

            if (start && end) {
                // Ensure dates are valid
                const startDate = new Date(start as string)
                const endDate = new Date(end as string)

                if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                    where.scheduledStart = {
                        gte: startDate,
                        lte: endDate,
                    }
                }
            }

            if (status) {
                where.status = status
            }

            if (customerId) {
                where.customerId = customerId
            }

            if (vehicleId) {
                where.vehicleId = vehicleId
            }

            const appointments = await prisma.appointment.findMany({
                where,
                include: {
                    customer: { select: { id: true, name: true, phone: true } },
                    vehicle: { select: { id: true, plate: true, model: true, brand: true } },
                    box: { select: { id: true, name: true } },
                    serviceOrder: { select: { mechanicId: true } },
                },
                orderBy: { scheduledStart: 'asc' },
            })

            // Normalize response to prevent null pointer exceptions in frontend
            const safeAppointments = appointments.map(app => ({
                ...app,
                customer: app.customer || { id: '', name: 'Cliente Removido', phone: '' },
                vehicle: app.vehicle || { id: '', plate: '---', model: 'Veículo Removido', brand: '' },
                box: app.box || { id: '', name: 'Box Desconhecido' },
                serviceOrder: app.serviceOrder || null
            }))

            return res.json(safeAppointments)
        } catch (error) {
            console.error('Erro CRÍTICO ao listar agendamentos:', error)
            // Fallback para lista vazia para não quebrar o frontend
            return res.json([])
        }
    }

    // Buscar agendamento por ID
    async getById(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params

            const appointment = await prisma.appointment.findUnique({
                where: { id },
                include: {
                    customer: true,
                    vehicle: true,
                    box: true,
                },
            })

            if (!appointment) {
                return res.status(404).json({ message: 'Agendamento não encontrado' })
            }

            return res.json(appointment)
        } catch (error) {
            console.error('Erro ao buscar agendamento:', error)
            return res.status(500).json({ message: 'Erro ao buscar agendamento' })
        }
    }

    // Criar agendamento
    async create(req: AuthRequest, res: Response) {
        try {
            const { customerId, vehicleId, boxId, scheduledStart, scheduledEnd, description, notes } = req.body

            // Validações básicas
            if (!customerId || !vehicleId || !boxId || !scheduledStart || !scheduledEnd) {
                return res.status(400).json({ message: 'Todos os campos obrigatórios devem ser preenchidos' })
            }

            const start = new Date(scheduledStart)
            const end = new Date(scheduledEnd)

            if (start >= end) {
                return res.status(400).json({ message: 'Data de término deve ser posterior à data de início' })
            }

            // Verificar se o veículo já tem agendamento no mesmo horário
            const vehicleConflicts = await prisma.appointment.findMany({
                where: {
                    vehicleId,
                    status: { not: 'CANCELLED' },
                    AND: [
                        { scheduledStart: { lt: end } },
                        { scheduledEnd: { gt: start } }
                    ]
                },
            })

            if (vehicleConflicts.length > 0) {
                return res.status(400).json({ message: 'Este veículo já possui agendamento neste horário' })
            }

            // Verificar disponibilidade do box
            const boxConflicts = await prisma.appointment.findMany({
                where: {
                    boxId,
                    status: { not: 'CANCELLED' },
                    AND: [
                        { scheduledStart: { lt: end } },
                        { scheduledEnd: { gt: start } }
                    ]
                },
            })

            if (boxConflicts.length > 0) {
                return res.status(400).json({ message: 'Box indisponível neste horário' })
            }

            const appointment = await prisma.appointment.create({
                data: {
                    customerId,
                    vehicleId,
                    boxId,
                    scheduledStart: start,
                    scheduledEnd: end,
                    description,
                    notes,
                    status: 'SCHEDULED',
                },
                include: {
                    customer: true,
                    vehicle: true,
                    box: true,
                },
            })

            return res.status(201).json(appointment)
        } catch (error) {
            console.error('Erro ao criar agendamento:', error)
            return res.status(500).json({ message: 'Erro ao criar agendamento' })
        }
    }

    // Atualizar agendamento
    async update(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params
            const { boxId, scheduledStart, scheduledEnd, description, notes, status } = req.body

            const existingAppointment = await prisma.appointment.findUnique({
                where: { id },
                include: { serviceOrder: true }
            })

            if (!existingAppointment) {
                return res.status(404).json({ message: 'Agendamento não encontrado' })
            }

            // Se houver mudança de horário ou box, verificar conflitos
            if ((boxId && boxId !== existingAppointment.boxId) ||
                (scheduledStart && new Date(scheduledStart).getTime() !== existingAppointment.scheduledStart.getTime()) ||
                (scheduledEnd && new Date(scheduledEnd).getTime() !== existingAppointment.scheduledEnd.getTime())) {

                const checkBoxId = boxId || existingAppointment.boxId
                const checkStart = scheduledStart ? new Date(scheduledStart) : existingAppointment.scheduledStart
                const checkEnd = scheduledEnd ? new Date(scheduledEnd) : existingAppointment.scheduledEnd

                if (checkStart >= checkEnd) {
                    return res.status(400).json({ message: 'Data de término deve ser posterior à data de início' })
                }

                // Verificar conflito de Box
                const boxConflicts = await prisma.appointment.findMany({
                    where: {
                        id: { not: id }, // Excluir o próprio agendamento
                        boxId: checkBoxId,
                        status: { not: 'CANCELLED' },
                        AND: [
                            { scheduledStart: { lt: checkEnd } },
                            { scheduledEnd: { gt: checkStart } }
                        ]
                    },
                })

                if (boxConflicts.length > 0) {
                    return res.status(400).json({ message: 'Box indisponível neste horário' })
                }

                // Verificar conflito de Mecânico (se houver OS vinculada)
                if (existingAppointment.serviceOrder?.mechanicId) {
                    const mechanicConflicts = await prisma.appointment.findMany({
                        where: {
                            id: { not: id },
                            status: { not: 'CANCELLED' },
                            AND: [
                                { scheduledStart: { lt: checkEnd } },
                                { scheduledEnd: { gt: checkStart } }
                            ],
                            serviceOrder: {
                                mechanicId: existingAppointment.serviceOrder.mechanicId
                            }
                        }
                    })

                    if (mechanicConflicts.length > 0) {
                        return res.status(400).json({ message: 'Mecânico indisponível neste horário' })
                    }
                }
            }

            const appointment = await prisma.appointment.update({
                where: { id },
                data: {
                    boxId,
                    scheduledStart: scheduledStart ? new Date(scheduledStart) : undefined,
                    scheduledEnd: scheduledEnd ? new Date(scheduledEnd) : undefined,
                    description,
                    notes,
                    status,
                },
                include: {
                    customer: true,
                    vehicle: true,
                    box: true,
                },
            })

            return res.json(appointment)
        } catch (error) {
            console.error('Erro ao atualizar agendamento:', error)
            return res.status(500).json({ message: 'Erro ao atualizar agendamento' })
        }
    }

    // Verificar conflitos (Impact Analysis)
    async checkConflicts(req: AuthRequest, res: Response) {
        try {
            const { id, boxId, scheduledStart, scheduledEnd } = req.body

            if (!boxId || !scheduledStart || !scheduledEnd) {
                return res.status(400).json({ message: 'Dados insuficientes para verificação' })
            }

            const start = new Date(scheduledStart)
            const end = new Date(scheduledEnd)

            // 1. Conflitos de Box
            const boxConflicts = await prisma.appointment.findMany({
                where: {
                    id: id ? { not: id } : undefined,
                    boxId,
                    status: { not: 'CANCELLED' },
                    AND: [
                        { scheduledStart: { lt: end } },
                        { scheduledEnd: { gt: start } }
                    ]
                },
                include: {
                    customer: { select: { name: true } },
                    vehicle: { select: { plate: true, model: true } },
                    box: { select: { name: true } }
                }
            })

            // 2. Conflitos de Mecânico (se ID for fornecido, buscamos a OS associada)
            let mechanicConflicts: any[] = []
            if (id) {
                const appointment = await prisma.appointment.findUnique({
                    where: { id },
                    include: { serviceOrder: true }
                })

                if (appointment?.serviceOrder?.mechanicId) {
                    mechanicConflicts = await prisma.appointment.findMany({
                        where: {
                            id: { not: id },
                            status: { not: 'CANCELLED' },
                            AND: [
                                { scheduledStart: { lt: end } },
                                { scheduledEnd: { gt: start } }
                            ],
                            serviceOrder: {
                                mechanicId: appointment.serviceOrder.mechanicId
                            }
                        },
                        include: {
                            customer: { select: { name: true } },
                            vehicle: { select: { plate: true, model: true } }
                        }
                    })
                }
            }

            return res.json({
                hasConflicts: boxConflicts.length > 0 || mechanicConflicts.length > 0,
                boxConflicts,
                mechanicConflicts
            })
        } catch (error) {
            console.error('Erro ao verificar conflitos:', error)
            return res.status(500).json({ message: 'Erro ao verificar conflitos' })
        }
    }

    // Cancelar agendamento (Delete lógico ou update status)
    async delete(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params

            await prisma.appointment.update({
                where: { id },
                data: { status: 'CANCELLED' },
            })

            return res.json({ message: 'Agendamento cancelado com sucesso' })
        } catch (error) {
            console.error('Erro ao cancelar agendamento:', error)
            return res.status(500).json({ message: 'Erro ao cancelar agendamento' })
        }
    }
    // Simular Reagendamento em Cascata
    async simulateCascade(req: AuthRequest, res: Response) {
        try {
            const { id, boxId, scheduledStart, scheduledEnd } = req.body

            if (!boxId || !scheduledStart || !scheduledEnd) {
                return res.status(400).json({ message: 'Dados insuficientes' })
            }

            const moves: any[] = []
            const queue: any[] = [{
                id, // Pode ser undefined se for novo agendamento
                boxId,
                start: new Date(scheduledStart),
                end: new Date(scheduledEnd),
                reason: 'INITIAL_MOVE'
            }]

            // Set para evitar loops infinitos
            const processedIds = new Set<string>()
            if (id) processedIds.add(id)

            while (queue.length > 0) {
                const current = queue.shift()

                // Adicionar à lista de movimentos (exceto o inicial se for apenas simulação de conflito)
                if (current.reason !== 'INITIAL_MOVE') {
                    moves.push(current)
                }

                // Buscar conflitos para este movimento
                // 1. Conflitos de Box
                const boxConflicts = await prisma.appointment.findMany({
                    where: {
                        id: { notIn: Array.from(processedIds) }, // Ignora já processados
                        boxId: current.boxId,
                        status: { not: 'CANCELLED' },
                        AND: [
                            { scheduledStart: { lt: current.end } },
                            { scheduledEnd: { gt: current.start } }
                        ]
                    },
                    include: {
                        customer: { select: { name: true } },
                        vehicle: { select: { plate: true, model: true } }
                    }
                })

                // 2. Conflitos de Mecânico
                // Precisamos saber o mecânico deste agendamento (current)
                let mechanicId = null
                if (current.id) {
                    const appt = await prisma.appointment.findUnique({
                        where: { id: current.id },
                        include: { serviceOrder: true }
                    })
                    mechanicId = appt?.serviceOrder?.mechanicId
                }

                // Processar conflitos de Box
                for (const conflict of boxConflicts) {
                    if (processedIds.has(conflict.id)) continue

                    const duration = conflict.scheduledEnd.getTime() - conflict.scheduledStart.getTime()
                    const newStart = current.end // Move para logo após o agendamento que causou conflito
                    const newEnd = new Date(newStart.getTime() + duration)

                    const nextMove = {
                        id: conflict.id,
                        boxId: conflict.boxId, // Mantém o mesmo box
                        start: newStart,
                        end: newEnd,
                        reason: `CASCADE_FROM_${current.id || 'NEW'}`,
                        customer: conflict.customer,
                        vehicle: conflict.vehicle,
                        originalStart: conflict.scheduledStart,
                        originalEnd: conflict.scheduledEnd
                    }

                    queue.push(nextMove)
                    processedIds.add(conflict.id)
                }
            }

            return res.json(moves)
        } catch (error) {
            console.error('Erro na simulação de cascata:', error)
            return res.status(500).json({ message: 'Erro ao simular cascata' })
        }
    }

    // Aplicar Atualização em Lote (Batch Update)
    async batchUpdate(req: AuthRequest, res: Response) {
        try {
            const { moves } = req.body // Array de { id, start, end, boxId }

            if (!moves || !Array.isArray(moves) || moves.length === 0) {
                return res.status(400).json({ message: 'Nenhum movimento fornecido' })
            }

            await prisma.$transaction(
                moves.map((move: any) =>
                    prisma.appointment.update({
                        where: { id: move.id },
                        data: {
                            scheduledStart: move.start,
                            scheduledEnd: move.end,
                            boxId: move.boxId
                        }
                    })
                )
            )

            return res.json({ message: 'Reagendamento em cascata aplicado com sucesso', count: moves.length })
        } catch (error) {
            console.error('Erro no batch update:', error)
            return res.status(500).json({ message: 'Erro ao aplicar atualizações' })
        }
    }
}
