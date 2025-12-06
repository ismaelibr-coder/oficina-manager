import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.middleware'

const prisma = new PrismaClient()

export class BoxesController {
    // Listar todos os boxes
    async list(req: AuthRequest, res: Response) {
        try {
            const boxes = await prisma.box.findMany({
                where: { active: true },
                orderBy: { name: 'asc' },
            })

            return res.json(boxes)
        } catch (error) {
            console.error('Erro ao listar boxes:', error)
            // Retorna array vazio em caso de erro para não quebrar o frontend
            return res.json([])
        }
    }

    // Buscar box por ID
    async getById(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params

            const box = await prisma.box.findUnique({
                where: { id },
            })

            if (!box) {
                return res.status(404).json({ message: 'Box não encontrado' })
            }

            return res.json(box)
        } catch (error) {
            console.error('Erro ao buscar box:', error)
            return res.status(500).json({ message: 'Erro ao buscar box' })
        }
    }

    // Criar box
    async create(req: AuthRequest, res: Response) {
        try {
            const { name, description, status } = req.body

            if (!name) {
                return res.status(400).json({ message: 'Nome do box é obrigatório' })
            }

            const existingBox = await prisma.box.findFirst({
                where: { name, active: true }
            })

            if (existingBox) {
                return res.status(400).json({ message: 'Já existe um box com este nome' })
            }

            const box = await prisma.box.create({
                data: {
                    name,
                    description,
                    status: status || 'AVAILABLE',
                },
            })

            return res.status(201).json(box)
        } catch (error) {
            console.error('Erro ao criar box:', error)
            return res.status(500).json({ message: 'Erro ao criar box' })
        }
    }

    // Atualizar box
    async update(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params
            const { name, description, status } = req.body

            const existingBox = await prisma.box.findUnique({ where: { id } })
            if (!existingBox) {
                return res.status(404).json({ message: 'Box não encontrado' })
            }

            if (name && name !== existingBox.name) {
                const nameExists = await prisma.box.findFirst({
                    where: { name, active: true, id: { not: id } }
                })
                if (nameExists) {
                    return res.status(400).json({ message: 'Já existe um box com este nome' })
                }
            }

            const box = await prisma.box.update({
                where: { id },
                data: {
                    name,
                    description,
                    status,
                },
            })

            return res.json(box)
        } catch (error) {
            console.error('Erro ao atualizar box:', error)
            return res.status(500).json({ message: 'Erro ao atualizar box' })
        }
    }

    // Excluir box (soft delete)
    async delete(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params

            // Verificar se há agendamentos futuros ou em andamento
            const activeAppointments = await prisma.appointment.findFirst({
                where: {
                    boxId: id,
                    status: { in: ['SCHEDULED', 'CHECKED_IN', 'IN_PROGRESS'] }
                }
            })

            if (activeAppointments) {
                return res.status(400).json({ message: 'Não é possível excluir um box com agendamentos ativos' })
            }

            await prisma.box.update({
                where: { id },
                data: { active: false },
            })

            return res.json({ message: 'Box excluído com sucesso' })
        } catch (error) {
            console.error('Erro ao excluir box:', error)
            return res.status(500).json({ message: 'Erro ao excluir box' })
        }
    }
}
