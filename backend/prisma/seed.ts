import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Iniciando seed...')

    // Criar hash da senha
    const passwordHash = await bcrypt.hash('admin123', 10)

    // Criar ou atualizar usuário admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@oficina.com' },
        update: {},
        create: {
            email: 'admin@oficina.com',
            name: 'Administrador',
            password: passwordHash,
            role: 'ADMIN',
            active: true,
        },
    })

    console.log(`✅ Usuário admin criado/verificado: ${admin.email}`)
    console.log('🔑 Senha padrão: admin123')

    // Criar boxes
    const boxes = ['Box 1', 'Box 2', 'Box 3']

    for (const boxName of boxes) {
        await prisma.box.upsert({
            where: { name: boxName },
            update: {},
            create: {
                name: boxName,
                description: `Box de atendimento ${boxName}`,
                status: 'AVAILABLE',
                active: true,
            },
        })
    }
    console.log('✅ Boxes criados/verificados')

    // Produtos Padrão
    const products = [
        { name: 'Óleo 5W30 Sintético', code: 'OLE-5W30', description: 'Óleo de motor sintético de alta performance', costPrice: 25.00, salePrice: 45.00, stock: 50, minStock: 10 },
        { name: 'Filtro de Óleo Universal', code: 'FIL-OLE-01', description: 'Filtro de óleo compatível com diversos modelos', costPrice: 15.00, salePrice: 30.00, stock: 30, minStock: 5 },
        { name: 'Filtro de Ar', code: 'FIL-AR-01', description: 'Filtro de ar do motor', costPrice: 20.00, salePrice: 40.00, stock: 20, minStock: 5 },
        { name: 'Pastilha de Freio Dianteira', code: 'PAS-FRE-D', description: 'Jogo de pastilhas dianteiras', costPrice: 80.00, salePrice: 160.00, stock: 10, minStock: 2 },
        { name: 'Disco de Freio Ventilado', code: 'DIS-FRE-V', description: 'Disco de freio ventilado dianteiro', costPrice: 120.00, salePrice: 240.00, stock: 8, minStock: 2 },
        { name: 'Fluido de Freio DOT4', code: 'FLU-FRE-4', description: 'Fluido de freio DOT4 500ml', costPrice: 18.00, salePrice: 35.00, stock: 20, minStock: 5 },
        { name: 'Lâmpada H4', code: 'LAM-H4', description: 'Lâmpada de farol H4', costPrice: 10.00, salePrice: 25.00, stock: 40, minStock: 10 },
        { name: 'Aditivo Radiador', code: 'ADI-RAD', description: 'Aditivo para radiador concentrado', costPrice: 22.00, salePrice: 45.00, stock: 25, minStock: 5 },
    ]

    for (const product of products) {
        await prisma.product.upsert({
            where: { code: product.code },
            update: {},
            create: product,
        })
    }
    console.log('✅ Produtos padrão criados/verificados')

    // Serviços Padrão
    const services = [
        { name: 'Troca de Óleo e Filtro', description: 'Mão de obra para troca de óleo e filtro', estimatedHours: 0.5, price: 50.00 },
        { name: 'Alinhamento 3D', description: 'Alinhamento de direção computadorizado', estimatedHours: 1.0, price: 80.00 },
        { name: 'Balanceamento de Rodas', description: 'Balanceamento por roda', estimatedHours: 0.25, price: 25.00 },
        { name: 'Troca de Pastilhas (Par)', description: 'Mão de obra para troca de pastilhas', estimatedHours: 1.0, price: 100.00 },
        { name: 'Revisão Geral', description: 'Check-up completo de itens de segurança', estimatedHours: 2.0, price: 250.00 },
        { name: 'Diagnóstico Eletrônico', description: 'Scanner e diagnóstico de falhas', estimatedHours: 0.5, price: 120.00 },
        { name: 'Troca de Fluido de Freio', description: 'Sangria e troca completa do fluido', estimatedHours: 1.0, price: 150.00 },
        { name: 'Higienização de Ar Condicionado', description: 'Limpeza e troca do filtro de cabine', estimatedHours: 0.5, price: 80.00 },
    ]

    for (const service of services) {
        // Usando name como chave única para o seed, já que não temos código no serviço
        const existingService = await prisma.service.findFirst({ where: { name: service.name } })
        if (!existingService) {
            await prisma.service.create({ data: service })
        }
    }
    console.log('✅ Serviços padrão criados/verificados')

    // Templates de Checklist Padrão
    const templates = [
        {
            name: 'Vistoria de Entrada (Completa)',
            description: 'Vistoria detalhada para entrada do veículo, incluindo lataria e acessórios.',
            items: [
                // Lataria e Externo
                'Para-choque Dianteiro (Riscos/Amassados)',
                'Para-choque Traseiro (Riscos/Amassados)',
                'Capô (Pintura/Amassados)',
                'Porta Dianteira Esquerda',
                'Porta Dianteira Direita',
                'Porta Traseira Esquerda',
                'Porta Traseira Direita',
                'Teto e Colunas',
                'Porta-malas / Tampa Traseira',
                'Retrovisores (Lentes e Capas)',
                'Para-brisa (Trincas/Pedras)',
                'Vidros Laterais e Traseiro',
                'Faróis e Lanternas (Quebrados/Trincados)',
                'Rodas e Calotas (Arranhões)',
                'Pneus (Estado/Sulcos)',
                'Estepe, Macaco e Chave de Roda',

                // Interno
                'Bancos e Estofamento',
                'Painel e Instrumentos',
                'Rádio / Multimídia',
                'Ar Condicionado (Funcionamento)',
                'Vidros Elétricos',
                'Travas Elétricas',
                'Tapetes',

                // Motor e Cofre
                'Nível de Óleo do Motor',
                'Nível de Fluido de Freio',
                'Nível de Água do Radiador',
                'Bateria (Estado Visual)',
                'Vazamentos Aparentes'
            ]
        },
        {
            name: 'Revisão Mecânica Padrão',
            description: 'Checklist focado em itens mecânicos e de segurança para revisões periódicas.',
            items: [
                'Óleo do Motor (Nível e Validade)',
                'Filtro de Ar do Motor',
                'Filtro de Cabine (Ar Condicionado)',
                'Correias (Dentada e Acessórios)',
                'Velas e Cabos de Ignição',
                'Pastilhas de Freio Dianteiras',
                'Discos de Freio Dianteiros',
                'Lonas/Tambores Traseiros',
                'Fluido de Freio (Teste de Umidade)',
                'Suspensão Dianteira (Folgas/Ruídos)',
                'Suspensão Traseira (Amortecedores)',
                'Sistema de Arrefecimento (Vazamentos)',
                'Escapamento (Fixação e Furos)',
                'Luzes (Faróis, Setas, Freio, Ré)',
                'Limpadores de Para-brisa',
                'Pneus (Calibragem e Desgaste)'
            ]
        }
    ]

    for (const template of templates) {
        const existingTemplate = await prisma.checklistTemplate.findFirst({ where: { name: template.name } })

        if (!existingTemplate) {
            await prisma.checklistTemplate.create({
                data: {
                    name: template.name,
                    description: template.description,
                    items: {
                        create: template.items.map((itemName, index) => ({
                            name: itemName,
                            order: index
                        }))
                    }
                }
            })
        }
    }
    console.log('✅ Templates de Checklist criados/verificados')
}

main()
    .catch((e) => {
        console.error('❌ Erro no seed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
