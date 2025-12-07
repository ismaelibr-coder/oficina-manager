import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.middleware'
import { getPaginationParams, buildPaginationResult } from '../utils/pagination'

const prisma = new PrismaClient()

export class CustomersController {
    // Listar todos os clientes com paginação
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
                    OR: [
                        { name: { contains: search as string, mode: 'insensitive' as any } },
                        { email: { contains: search as string, mode: 'insensitive' as any } },
                        { phone: { contains: search as string, mode: 'insensitive' as any } },
                        { cpfCnpj: { contains: search as string, mode: 'insensitive' as any } },
                    ],
                }
                : {}

            // Get total count
            const total = await prisma.customer.count({ where })

            // Get paginated data
            const customers = await prisma.customer.findMany({
                where,
                skip,
                take,
                orderBy: {
                    createdAt: 'desc',
                },
            })

            return res.json(buildPaginationResult(customers, total, page, pageSize))
        } catch (error) {
            console.error('Erro ao listar clientes:', error)
            return res.json(buildPaginationResult([], 0, 1, 50))
        }
    }

    // Buscar cliente por ID
    async getById(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params

            const customer = await prisma.customer.findUnique({
                where: { id },
                include: {
                    vehicles: true,
                },
            })

            if (!customer) {
                return res.status(404).json({ message: 'Cliente não encontrado' })
            }

            return res.json(customer)
        } catch (error) {
            console.error('Erro ao buscar cliente:', error)
            return res.status(500).json({ message: 'Erro ao buscar cliente' })
        }
    }

    // Criar novo cliente
    async create(req: AuthRequest, res: Response) {
        try {
            const { name, email, phone, cpfCnpj, address, city, state, zipCode } = req.body

            // Validar campos obrigatórios
            if (!name || !phone) {
                return res.status(400).json({ message: 'Nome e telefone são obrigatórios' })
            }

            // Verificar se CPF/CNPJ já existe (se fornecido)
            if (cpfCnpj) {
                const existingCustomer = await prisma.customer.findUnique({
                    where: { cpfCnpj },
                })

                if (existingCustomer) {
                    return res.status(400).json({ message: 'CPF/CNPJ já cadastrado' })
                }
            }

            // Criar cliente
            const customer = await prisma.customer.create({
                data: {
                    name,
                    email,
                    phone,
                    cpfCnpj,
                    address,
                    city,
                    state,
                    zipCode,
                },
            })

            return res.status(201).json(customer)
        } catch (error) {
            console.error('Erro ao criar cliente:', error)
            return res.status(500).json({ message: 'Erro ao criar cliente' })
        }
    }

    // Atualizar cliente
    async update(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params
            const { name, email, phone, cpfCnpj, address, city, state, zipCode } = req.body

            // Verificar se cliente existe
            const existingCustomer = await prisma.customer.findUnique({
                where: { id },
            })

            if (!existingCustomer) {
                return res.status(404).json({ message: 'Cliente não encontrado' })
            }

            // Se CPF/CNPJ foi alterado, verificar se já existe
            if (cpfCnpj && cpfCnpj !== existingCustomer.cpfCnpj) {
                const cpfExists = await prisma.customer.findUnique({
                    where: { cpfCnpj },
                })

                if (cpfExists) {
                    return res.status(400).json({ message: 'CPF/CNPJ já cadastrado' })
                }
            }

            // Atualizar cliente
            const customer = await prisma.customer.update({
                where: { id },
                data: {
                    name,
                    email,
                    phone,
                    cpfCnpj,
                    address,
                    city,
                    state,
                    zipCode,
                },
            })

            return res.json(customer)
        } catch (error) {
            console.error('Erro ao atualizar cliente:', error)
            return res.status(500).json({ message: 'Erro ao atualizar cliente' })
        }
    }

    // Excluir cliente
    async delete(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params

            // Verificar se cliente existe
            const customer = await prisma.customer.findUnique({
                where: { id },
                include: {
                    vehicles: true,
                },
            })

            if (!customer) {
                return res.status(404).json({ message: 'Cliente não encontrado' })
            }

            // Verificar se cliente tem veículos cadastrados
            if (customer.vehicles.length > 0) {
                return res.status(400).json({
                    message: 'Não é possível excluir cliente com veículos cadastrados'
                })
            }

            // Excluir cliente
            await prisma.customer.delete({
                where: { id },
            })

            return res.json({ message: 'Cliente excluído com sucesso' })
        } catch (error) {
            console.error('Erro ao excluir cliente:', error)
            return res.status(500).json({ message: 'Erro ao excluir cliente' })
        }
    }
}
