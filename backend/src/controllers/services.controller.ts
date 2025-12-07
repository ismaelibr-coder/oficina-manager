import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.middleware'
import { getPaginationParams, buildPaginationResult } from '../utils/pagination'

const prisma = new PrismaClient()

export class ServicesController {
    // Listar serviços com paginação
    async list(req: AuthRequest, res: Response) {
        try {
            const { search } = req.query

            // Get pagination params
            const { page, pageSize, skip, take } = getPaginationParams(req.query, {
                defaultPageSize: 50,
                maxPageSize: 100
            })

            const where: any = search
                ? {
                    name: { contains: search as string, mode: 'insensitive' as any },
                    active: true,
                }
                : { active: true }

            // Get total count
            const total = await prisma.service.count({ where })

            // Get paginated data
            const services = await prisma.service.findMany({
                where,
                skip,
                take,
                orderBy: { name: 'asc' },
            })

            return res.json(buildPaginationResult(services, total, page, pageSize))
        } catch (error) {
            console.error('Erro ao listar serviços:', error)
            return res.json(buildPaginationResult([], 0, 1, 50))
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
