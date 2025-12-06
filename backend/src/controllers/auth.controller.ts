import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-change-it'

export class AuthController {
    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body

            // Validar input
            if (!email || !password) {
                return res.status(400).json({ message: 'Email e senha são obrigatórios' })
            }

            // Buscar usuário
            const user = await prisma.user.findUnique({
                where: { email },
            })

            if (!user) {
                return res.status(401).json({ message: 'Credenciais inválidas' })
            }

            // Verificar senha
            const isValidPassword = await bcrypt.compare(password, user.password)

            if (!isValidPassword) {
                return res.status(401).json({ message: 'Credenciais inválidas' })
            }

            // Verificar se está ativo
            if (!user.active) {
                return res.status(403).json({ message: 'Usuário inativo' })
            }

            // Gerar token
            const token = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    role: user.role
                },
                JWT_SECRET,
                { expiresIn: '1d' }
            )

            // Retornar dados (sem senha)
            return res.json({
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                token,
            })

        } catch (error) {
            console.error('Erro no login:', error)
            return res.status(500).json({ message: 'Erro interno do servidor' })
        }
    }
}
