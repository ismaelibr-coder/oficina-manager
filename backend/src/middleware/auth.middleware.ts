import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-change-it'

export interface AuthRequest extends Request {
    user?: {
        id: string
        email: string
        role: string
    }
}

export const authMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader) {
            return res.status(401).json({ message: 'Token não fornecido' })
        }

        const token = authHeader.replace('Bearer ', '')

        const decoded = jwt.verify(token, JWT_SECRET) as {
            id: string
            email: string
            role: string
        }

        req.user = decoded
        next()
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido' })
    }
}

export const adminMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Não autenticado' })
    }

    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Acesso negado. Apenas administradores.' })
    }

    next()
}
