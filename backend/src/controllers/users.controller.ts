import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { AuthRequest } from '../middleware/auth.middleware'

const prisma = new PrismaClient()

export class UsersController {
    // Listar todos os usuários
    async list(req: AuthRequest, res: Response) {
        try {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    active: true,
                    createdAt: true,
                    updatedAt: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            })

            return res.json(users)
        } catch (error) {
            console.error('Erro ao listar usuários:', error)
            return res.status(500).json({ message: 'Erro ao listar usuários' })
        }
    }

    // Buscar usuário por ID
    async getById(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params

            const user = await prisma.user.findUnique({
                where: { id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    active: true,
                    createdAt: true,
                    updatedAt: true,
                },
            })

            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado' })
            }

            return res.json(user)
        } catch (error) {
            console.error('Erro ao buscar usuário:', error)
            return res.status(500).json({ message: 'Erro ao buscar usuário' })
        }
    }

    // Criar novo usuário
    async create(req: AuthRequest, res: Response) {
        try {
            const { name, email, password, role } = req.body

            // Validar campos obrigatórios
            if (!name || !email || !password) {
                return res.status(400).json({ message: 'Nome, email e senha são obrigatórios' })
            }

            // Verificar se email já existe
            const existingUser = await prisma.user.findUnique({
                where: { email },
            })

            if (existingUser) {
                return res.status(400).json({ message: 'Email já cadastrado' })
            }

            // Hash da senha
            const hashedPassword = await bcrypt.hash(password, 10)

            // Criar usuário
            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: role || 'MECHANIC',
                    active: true,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    active: true,
                    createdAt: true,
                },
            })

            return res.status(201).json(user)
        } catch (error) {
            console.error('Erro ao criar usuário:', error)
            return res.status(500).json({ message: 'Erro ao criar usuário' })
        }
    }

    // Atualizar usuário
    async update(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params
            const { name, email, password, role, active } = req.body

            // Verificar se usuário existe
            const existingUser = await prisma.user.findUnique({
                where: { id },
            })

            if (!existingUser) {
                return res.status(404).json({ message: 'Usuário não encontrado' })
            }

            // Se email foi alterado, verificar se já existe
            if (email && email !== existingUser.email) {
                const emailExists = await prisma.user.findUnique({
                    where: { email },
                })

                if (emailExists) {
                    return res.status(400).json({ message: 'Email já cadastrado' })
                }
            }

            // Preparar dados para atualização
            const updateData: any = {}
            if (name) updateData.name = name
            if (email) updateData.email = email
            if (role) updateData.role = role
            if (typeof active === 'boolean') updateData.active = active
            if (password) {
                updateData.password = await bcrypt.hash(password, 10)
            }

            // Atualizar usuário
            const user = await prisma.user.update({
                where: { id },
                data: updateData,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    active: true,
                    updatedAt: true,
                },
            })

            return res.json(user)
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error)
            return res.status(500).json({ message: 'Erro ao atualizar usuário' })
        }
    }

    // Excluir usuário
    async delete(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params

            // Verificar se usuário existe
            const user = await prisma.user.findUnique({
                where: { id },
            })

            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado' })
            }

            // Não permitir excluir a si mesmo
            if (req.user?.id === id) {
                return res.status(400).json({ message: 'Não é possível excluir seu próprio usuário' })
            }

            // Excluir usuário
            await prisma.user.delete({
                where: { id },
            })

            return res.json({ message: 'Usuário excluído com sucesso' })
        } catch (error) {
            console.error('Erro ao excluir usuário:', error)
            return res.status(500).json({ message: 'Erro ao excluir usuário' })
        }
    }
}
