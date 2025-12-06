import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.middleware'

const prisma = new PrismaClient()

export class ServicesController {
    // Listar serviços
    async list(req: AuthRequest, res: Response) {
        try {
            const { search } = req.query

            const where: any = search
                ? {
                    name: { contains: search as string, mode: 'insensitive' as any },
                    active: true,
                }
                : { active: true }

            const services = await prisma.service.findMany({
                where,
                orderBy: { name: 'asc' },
            })

            return res.json(services)
        } catch (error) {
            console.error('Erro ao listar serviços:', error)
            return res.json([])
        }
    }

    // Buscar serviço por ID
    async getById(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params

            const service = await prisma.service.findUnique({
                where: { id },
            })

            if (!service) {
                return res.status(404).json({ message: 'Serviço não encontrado' })
            }

            return res.json(service)
        } catch (error) {
            console.error('Erro ao buscar serviço:', error)
            return res.status(500).json({ message: 'Erro ao buscar serviço' })
        }
    }

    // Criar serviço
    async create(req: AuthRequest, res: Response) {
        try {
            const { name, description, estimatedHours, price } = req.body

            if (!name || !price) {
                return res.status(400).json({ message: 'Nome e preço são obrigatórios' })
            }

            const service = await prisma.service.create({
                data: {
                    name,
                    description,
                    estimatedHours: Number(estimatedHours || 1),
                    price: Number(price),
                },
            })

            return res.status(201).json(service)
        } catch (error) {
            console.error('Erro ao criar serviço:', error)
            return res.status(500).json({ message: 'Erro ao criar serviço' })
        }
    }

    // Atualizar serviço
    async update(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params
            const { name, description, estimatedHours, price } = req.body

            const existingService = await prisma.service.findUnique({ where: { id } })
            if (!existingService) {
                return res.status(404).json({ message: 'Serviço não encontrado' })
            }

            const service = await prisma.service.update({
                where: { id },
                data: {
                    name,
                    description,
                    estimatedHours: estimatedHours !== undefined ? Number(estimatedHours) : undefined,
                    price: price !== undefined ? Number(price) : undefined,
                },
            })

            return res.json(service)
        } catch (error) {
            console.error('Erro ao atualizar serviço:', error)
            return res.status(500).json({ message: 'Erro ao atualizar serviço' })
        }
    }

    // Excluir serviço (soft delete)
    async delete(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params

            await prisma.service.update({
                where: { id },
                data: { active: false },
            })

            return res.json({ message: 'Serviço excluído com sucesso' })
        } catch (error) {
            console.error('Erro ao excluir serviço:', error)
            return res.status(500).json({ message: 'Erro ao excluir serviço' })
        }
    }
}
