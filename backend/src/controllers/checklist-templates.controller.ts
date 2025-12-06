import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.middleware'

const prisma = new PrismaClient()

export class ChecklistTemplatesController {
    // Listar templates
    async list(req: AuthRequest, res: Response) {
        try {
            const templates = await prisma.checklistTemplate.findMany({
                where: { active: true },
                include: {
                    items: {
                        orderBy: { order: 'asc' }
                    }
                },
                orderBy: { name: 'asc' },
            })

            return res.json(templates)
        } catch (error) {
            console.error('Erro ao listar templates:', error)
            return res.json([])
        }
    }

    // Buscar template por ID
    async getById(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params

            const template = await prisma.checklistTemplate.findUnique({
                where: { id },
                include: {
                    items: {
                        orderBy: { order: 'asc' }
                    }
                },
            })

            if (!template) {
                return res.status(404).json({ message: 'Template não encontrado' })
            }

            return res.json(template)
        } catch (error) {
            console.error('Erro ao buscar template:', error)
            return res.status(500).json({ message: 'Erro ao buscar template' })
        }
    }

    // Criar template
    async create(req: AuthRequest, res: Response) {
        try {
            const { name, description, items } = req.body

            if (!name) {
                return res.status(400).json({ message: 'Nome do template é obrigatório' })
            }

            const template = await prisma.checklistTemplate.create({
                data: {
                    name,
                    description,
                    items: {
                        create: items?.map((item: any, index: number) => ({
                            name: item.name,
                            order: index
                        })) || []
                    }
                },
                include: {
                    items: true
                }
            })

            return res.status(201).json(template)
        } catch (error) {
            console.error('Erro ao criar template:', error)
            return res.status(500).json({ message: 'Erro ao criar template' })
        }
    }

    // Atualizar template
    async update(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params
            const { name, description, items } = req.body

            const existingTemplate = await prisma.checklistTemplate.findUnique({ where: { id } })
            if (!existingTemplate) {
                return res.status(404).json({ message: 'Template não encontrado' })
            }

            // Transação para atualizar template e substituir itens
            const template = await prisma.$transaction(async (tx) => {
                // Atualiza dados básicos
                const updated = await tx.checklistTemplate.update({
                    where: { id },
                    data: {
                        name,
                        description,
                    }
                })

                // Se items foram enviados, substitui todos (estratégia simples)
                if (items) {
                    // Remove itens antigos
                    await tx.checklistTemplateItem.deleteMany({
                        where: { templateId: id }
                    })

                    // Cria novos itens
                    if (items.length > 0) {
                        await tx.checklistTemplateItem.createMany({
                            data: items.map((item: any, index: number) => ({
                                templateId: id,
                                name: item.name,
                                order: index
                            }))
                        })
                    }
                }

                return updated
            })

            // Busca template atualizado com itens
            const finalTemplate = await prisma.checklistTemplate.findUnique({
                where: { id },
                include: { items: { orderBy: { order: 'asc' } } }
            })

            return res.json(finalTemplate)
        } catch (error) {
            console.error('Erro ao atualizar template:', error)
            return res.status(500).json({ message: 'Erro ao atualizar template' })
        }
    }

    // Excluir template (soft delete)
    async delete(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params

            await prisma.checklistTemplate.update({
                where: { id },
                data: { active: false },
            })

            return res.json({ message: 'Template excluído com sucesso' })
        } catch (error) {
            console.error('Erro ao excluir template:', error)
            return res.status(500).json({ message: 'Erro ao excluir template' })
        }
    }
}
