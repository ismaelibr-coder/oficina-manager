import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.middleware'

const prisma = new PrismaClient()

export class ChecklistsController {
    // Buscar checklist por ID do Agendamento
    async getByAppointmentId(req: AuthRequest, res: Response) {
        try {
            const { appointmentId } = req.params

            const checklist = await prisma.checklist.findUnique({
                where: { appointmentId },
                include: {
                    items: {
                        orderBy: { order: 'asc' }
                    },
                    mechanic: {
                        select: { id: true, name: true }
                    }
                },
            })

            if (!checklist) {
                return res.status(404).json({ message: 'Checklist não encontrado para este agendamento' })
            }

            return res.json(checklist)
        } catch (error) {
            console.error('Erro ao buscar checklist:', error)
            // Fail-safe: return 404 instead of 500 to prevent crash, assuming it just "doesn't exist" if db error
            return res.status(404).json({ message: 'Checklist não encontrado ou erro de conexão' })
        }
    }

    // Criar checklist (iniciar vistoria)
    async create(req: AuthRequest, res: Response) {
        try {
            const { appointmentId, templateId } = req.body

            // Verificar se já existe
            const existingChecklist = await prisma.checklist.findUnique({
                where: { appointmentId }
            })

            if (existingChecklist) {
                return res.status(400).json({ message: 'Já existe um checklist para este agendamento' })
            }

            // Buscar template se informado
            let itemsToCreate: any[] = []
            if (templateId) {
                const template = await prisma.checklistTemplate.findUnique({
                    where: { id: templateId },
                    include: { items: true }
                })

                if (template) {
                    itemsToCreate = template.items.map(item => ({
                        name: item.name,
                        order: item.order,
                        status: 'NOT_CHECKED'
                    }))
                }
            }

            const checklist = await prisma.checklist.create({
                data: {
                    appointmentId,
                    mechanicId: req.user?.id || '', // Assumindo que o usuário logado é quem cria
                    items: {
                        create: itemsToCreate
                    }
                },
                include: {
                    items: true
                }
            })

            return res.status(201).json(checklist)
        } catch (error) {
            console.error('Erro ao criar checklist:', error)
            return res.status(500).json({ message: 'Erro ao criar checklist' })
        }
    }

    // Atualizar item do checklist
    async updateItem(req: AuthRequest, res: Response) {
        try {
            const { itemId } = req.params
            const { status, notes, photos } = req.body

            const item = await prisma.checklistItem.update({
                where: { id: itemId },
                data: {
                    status,
                    notes,
                    photos
                }
            })

            return res.json(item)
        } catch (error) {
            console.error('Erro ao atualizar item do checklist:', error)
            return res.status(500).json({ message: 'Erro ao atualizar item' })
        }
    }
}
