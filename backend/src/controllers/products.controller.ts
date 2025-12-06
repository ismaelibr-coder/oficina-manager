import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.middleware'

const prisma = new PrismaClient()

export class ProductsController {
    // Listar produtos
    async list(req: AuthRequest, res: Response) {
        try {
            const { search } = req.query

            const where: any = search
                ? {
                    OR: [
                        { name: { contains: search as string, mode: 'insensitive' as any } },
                        { code: { contains: search as string, mode: 'insensitive' as any } },
                    ],
                    active: true,
                }
                : { active: true }

            const products = await prisma.product.findMany({
                where,
                orderBy: { name: 'asc' },
            })

            return res.json(products)
        } catch (error) {
            console.error('Erro ao listar produtos:', error)
            return res.json([])
        }
    }

    // Buscar produto por ID
    async getById(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params

            const product = await prisma.product.findUnique({
                where: { id },
            })

            if (!product) {
                return res.status(404).json({ message: 'Produto não encontrado' })
            }

            return res.json(product)
        } catch (error) {
            console.error('Erro ao buscar produto:', error)
            return res.status(500).json({ message: 'Erro ao buscar produto' })
        }
    }

    // Criar produto
    async create(req: AuthRequest, res: Response) {
        try {
            const { name, code, description, costPrice, salePrice, stock, minStock, supplier } = req.body

            if (!name || !salePrice) {
                return res.status(400).json({ message: 'Nome e preço de venda são obrigatórios' })
            }

            if (code) {
                const existingProduct = await prisma.product.findUnique({
                    where: { code },
                })

                if (existingProduct) {
                    return res.status(400).json({ message: 'Código de produto já existe' })
                }
            }

            const product = await prisma.product.create({
                data: {
                    name,
                    code,
                    description,
                    costPrice: Number(costPrice || 0),
                    salePrice: Number(salePrice),
                    stock: Number(stock || 0),
                    minStock: Number(minStock || 0),
                    supplier,
                },
            })

            return res.status(201).json(product)
        } catch (error) {
            console.error('Erro ao criar produto:', error)
            return res.status(500).json({ message: 'Erro ao criar produto' })
        }
    }

    // Atualizar produto
    async update(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params
            const { name, code, description, costPrice, salePrice, stock, minStock, supplier } = req.body

            const existingProduct = await prisma.product.findUnique({ where: { id } })
            if (!existingProduct) {
                return res.status(404).json({ message: 'Produto não encontrado' })
            }

            if (code && code !== existingProduct.code) {
                const codeExists = await prisma.product.findUnique({ where: { code } })
                if (codeExists) {
                    return res.status(400).json({ message: 'Código de produto já existe' })
                }
            }

            const product = await prisma.product.update({
                where: { id },
                data: {
                    name,
                    code,
                    description,
                    costPrice: costPrice !== undefined ? Number(costPrice) : undefined,
                    salePrice: salePrice !== undefined ? Number(salePrice) : undefined,
                    stock: stock !== undefined ? Number(stock) : undefined,
                    minStock: minStock !== undefined ? Number(minStock) : undefined,
                    supplier,
                },
            })

            return res.json(product)
        } catch (error) {
            console.error('Erro ao atualizar produto:', error)
            return res.status(500).json({ message: 'Erro ao atualizar produto' })
        }
    }

    // Excluir produto (soft delete)
    async delete(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params

            await prisma.product.update({
                where: { id },
                data: { active: false },
            })

            return res.json({ message: 'Produto excluído com sucesso' })
        } catch (error) {
            console.error('Erro ao excluir produto:', error)
            return res.status(500).json({ message: 'Erro ao excluir produto' })
        }
    }
}
