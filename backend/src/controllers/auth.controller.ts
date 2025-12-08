import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { sendEmail, passwordResetTemplate } from '../services/email.service'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-change-it'
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'

export class AuthController {
    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body

            if (!email || !password) {
                return res.status(400).json({ message: 'Email e senha são obrigatórios' })
            }

            const user = await prisma.user.findUnique({
                where: { email },
            })

            if (!user) {
                return res.status(401).json({ message: 'Credenciais inválidas' })
            }

            const isValidPassword = await bcrypt.compare(password, user.password)

            if (!isValidPassword) {
                return res.status(401).json({ message: 'Credenciais inválidas' })
            }

            if (!user.active) {
                return res.status(403).json({ message: 'Usuário inativo' })
            }

            const token = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    role: user.role
                },
                JWT_SECRET,
                { expiresIn: '1d' }
            )

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
            return res.status(500).json({
                message: 'Erro interno do servidor',
                debug: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            })
        }
    }

    async requestPasswordReset(req: Request, res: Response) {
        try {
            const { email } = req.body

            if (!email) {
                return res.status(400).json({ message: 'Email é obrigatório' })
            }

            const user = await prisma.user.findUnique({
                where: { email }
            })

            if (!user) {
                return res.json({
                    message: 'Se o email existir, você receberá instruções para redefinir sua senha'
                })
            }

            const resetToken = crypto.randomBytes(32).toString('hex')
            const expiresAt = new Date(Date.now() + 3600000) // 1 hora

            await prisma.passwordResetToken.create({
                data: {
                    email: user.email,
                    token: resetToken,
                    expiresAt,
                    used: false
                }
            })

            const resetUrl = `${FRONTEND_URL}/reset-password/${resetToken}`

            // Tentar enviar o email - se falhar, lançar erro
            await sendEmail({
                to: user.email,
                subject: 'Recuperação de Senha - Oficina Manager',
                html: passwordResetTemplate(resetUrl, user.name)
            })

            return res.json({
                message: 'Se o email existir, você receberá instruções para redefinir sua senha'
            })

        } catch (error) {
            console.error('Erro ao solicitar reset de senha:', error)
            return res.status(500).json({ message: 'Erro interno do servidor' })
        }
    }

    async resetPassword(req: Request, res: Response) {
        try {
            const { token, newPassword } = req.body

            if (!token || !newPassword) {
                return res.status(400).json({ message: 'Token e nova senha são obrigatórios' })
            }

            if (newPassword.length < 6) {
                return res.status(400).json({ message: 'Senha deve ter no mínimo 6 caracteres' })
            }

            const resetToken = await prisma.passwordResetToken.findFirst({
                where: {
                    token,
                    used: false,
                    expiresAt: { gt: new Date() }
                }
            })

            if (!resetToken) {
                return res.status(400).json({ message: 'Token inválido ou expirado' })
            }

            const user = await prisma.user.findUnique({
                where: { email: resetToken.email }
            })

            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado' })
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10)

            await prisma.$transaction([
                prisma.user.update({
                    where: { id: user.id },
                    data: { password: hashedPassword }
                }),
                prisma.passwordResetToken.update({
                    where: { id: resetToken.id },
                    data: { used: true }
                })
            ])

            return res.json({ message: 'Senha alterada com sucesso' })

        } catch (error) {
            console.error('Erro ao resetar senha:', error)
            return res.status(500).json({ message: 'Erro interno do servidor' })
        }
    }
}
