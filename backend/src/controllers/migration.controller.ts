import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.middleware'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
const prisma = new PrismaClient()

export class MigrationController {
    // Endpoint para rodar migração (USE APENAS UMA VEZ!)
    async runMigration(req: AuthRequest, res: Response) {
        try {
            // Verificar se usuário é ADMIN
            if (req.user?.role !== 'ADMIN') {
                return res.status(403).json({ message: 'Apenas administradores podem rodar migrações' })
            }

            console.log('🚀 Iniciando migração de índices...')

            // Executar migração
            const { stdout, stderr } = await execAsync('npx prisma migrate deploy')

            console.log('✅ Migração concluída!')
            console.log('Stdout:', stdout)
            if (stderr) console.log('Stderr:', stderr)

            return res.json({
                success: true,
                message: 'Migração executada com sucesso',
                output: stdout,
                timestamp: new Date().toISOString()
            })
        } catch (error: any) {
            console.error('❌ Erro ao rodar migração:', error)
            return res.status(500).json({
                success: false,
                message: 'Erro ao executar migração',
                error: error.message,
                output: error.stdout || '',
                stderr: error.stderr || ''
            })
        }
    }

    // Verificar se migração já foi aplicada
    async checkMigrationStatus(req: AuthRequest, res: Response) {
        try {
            // Verificar se índices existem
            const result = await prisma.$queryRaw`
                SELECT indexname 
                FROM pg_indexes 
                WHERE tablename IN ('customers', 'vehicles', 'appointments')
                AND indexname LIKE '%_idx'
                ORDER BY indexname
            `

            return res.json({
                migrationApplied: Array.isArray(result) && result.length > 0,
                indices: result,
                timestamp: new Date().toISOString()
            })
        } catch (error: any) {
            console.error('Erro ao verificar status:', error)
            return res.status(500).json({
                message: 'Erro ao verificar status da migração',
                error: error.message
            })
        }
    }
}
