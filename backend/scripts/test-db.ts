import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🧪 Iniciando testes de verificação...')

    try {
        // 1. Testar conexão com banco
        console.log('📡 Testando conexão com banco de dados...')
        await prisma.$connect()
        console.log('✅ Conexão estabelecida com sucesso!')

        // 2. Verificar usuário admin
        console.log('👤 Verificando usuário admin...')
        const admin = await prisma.user.findUnique({
            where: { email: 'admin@oficina.com' },
        })

        if (admin) {
            console.log(`✅ Usuário admin encontrado: ${admin.name} (${admin.email})`)
            console.log(`   Role: ${admin.role}`)
            console.log(`   Ativo: ${admin.active}`)
        } else {
            console.error('❌ Usuário admin NÃO encontrado!')
            process.exit(1)
        }

        // 3. Contar total de usuários
        const userCount = await prisma.user.count()
        console.log(`📊 Total de usuários no sistema: ${userCount}`)

    } catch (error) {
        console.error('❌ Erro durante os testes:', error)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

main()
