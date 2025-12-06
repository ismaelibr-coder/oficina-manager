import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.middleware'

const prisma = new PrismaClient()

export class VehiclesController {
    // Listar todos os veículos
    async list(req: AuthRequest, res: Response) {
        try {
            const { customerId, search } = req.query

            const where: any = {}

            if (customerId) {
                where.customerId = customerId as string
            }

            if (search) {
                where.OR = [
                    { plate: { contains: search as string, mode: 'insensitive' as any } },
                    { model: { contains: search as string, mode: 'insensitive' as any } },
                    { brand: { contains: search as string, mode: 'insensitive' as any } },
                ]
            }

            const vehicles = await prisma.vehicle.findMany({
                where,
                include: {
                    customer: {
                        select: {
                            id: true,
                            name: true,
                            phone: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            })

            // Hardening: protect against null customers
            const safeVehicles = vehicles.map(v => ({
                ...v,
                customer: v.customer || { name: 'Cliente Removido', phone: '' }
            }))

            return res.json(safeVehicles)
        } catch (error) {
            console.error('Erro ao listar veículos:', error)
            // Fail-safe: return empty array
            return res.json([])
        }
    }

    // Buscar veículo por ID
    async getById(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params

            const vehicle = await prisma.vehicle.findUnique({
                where: { id },
                include: {
                    customer: true,
                },
            })

            if (!vehicle) {
                return res.status(404).json({ message: 'Veículo não encontrado' })
            }

            return res.json(vehicle)
        } catch (error) {
            console.error('Erro ao buscar veículo:', error)
            return res.status(500).json({ message: 'Erro ao buscar veículo' })
        }
    }

    // Criar novo veículo
    async create(req: AuthRequest, res: Response) {
        try {
            const { customerId, plate, model, brand, year, color, currentKm } = req.body

            // Validar campos obrigatórios
            if (!customerId || !plate || !model) {
                return res.status(400).json({ message: 'Cliente, placa e modelo são obrigatórios' })
            }

            // Verificar se cliente existe
            const customer = await prisma.customer.findUnique({
                where: { id: customerId },
            })

            if (!customer) {
                return res.status(404).json({ message: 'Cliente não encontrado' })
            }

            // Verificar se placa já existe
            const existingVehicle = await prisma.vehicle.findUnique({
                where: { plate },
            })

            if (existingVehicle) {
                return res.status(400).json({ message: 'Placa já cadastrada' })
            }

            // Criar veículo
            const vehicle = await prisma.vehicle.create({
                data: {
                    customerId,
                    plate: plate.toUpperCase(),
                    model,
                    brand,
                    year,
                    color,
                    currentKm: currentKm || 0,
                },
                include: {
                    customer: {
                        select: {
                            id: true,
                            name: true,
                            phone: true,
                        },
                    },
                },
            })

            return res.status(201).json(vehicle)
        } catch (error) {
            console.error('Erro ao criar veículo:', error)
            return res.status(500).json({ message: 'Erro ao criar veículo' })
        }
    }

    // Atualizar veículo
    async update(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params
            const { plate, model, brand, year, color, currentKm } = req.body

            // Verificar se veículo existe
            const existingVehicle = await prisma.vehicle.findUnique({
                where: { id },
            })

            if (!existingVehicle) {
                return res.status(404).json({ message: 'Veículo não encontrado' })
            }

            // Se placa foi alterada, verificar se já existe
            if (plate && plate !== existingVehicle.plate) {
                const plateExists = await prisma.vehicle.findUnique({
                    where: { plate: plate.toUpperCase() },
                })

                if (plateExists) {
                    return res.status(400).json({ message: 'Placa já cadastrada' })
                }
            }

            // Atualizar veículo
            const vehicle = await prisma.vehicle.update({
                where: { id },
                data: {
                    plate: plate ? plate.toUpperCase() : undefined,
                    model,
                    brand,
                    year,
                    color,
                    currentKm,
                },
                include: {
                    customer: {
                        select: {
                            id: true,
                            name: true,
                            phone: true,
                        },
                    },
                },
            })

            return res.json(vehicle)
        } catch (error) {
            console.error('Erro ao atualizar veículo:', error)
            return res.status(500).json({ message: 'Erro ao atualizar veículo' })
        }
    }

    // Excluir veículo
    async delete(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params

            // Verificar se veículo existe
            const vehicle = await prisma.vehicle.findUnique({
                where: { id },
            })

            if (!vehicle) {
                return res.status(404).json({ message: 'Veículo não encontrado' })
            }

            // Excluir veículo
            await prisma.vehicle.delete({
                where: { id },
            })

            return res.json({ message: 'Veículo excluído com sucesso' })
        } catch (error) {
            console.error('Erro ao excluir veículo:', error)
            return res.status(500).json({ message: 'Erro ao excluir veículo' })
        }
    }
}
