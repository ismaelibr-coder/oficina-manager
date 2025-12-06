import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🧪 Testando Cenário de Cascata (Quinta-feira)...')

    // 1. Buscar agendamentos de teste
    const apptA = await prisma.appointment.findFirst({
        where: { description: 'Cascata A - Quinta' }
    })
    const apptB = await prisma.appointment.findFirst({
        where: { description: 'Cascata B - Quinta' }
    })

    if (!apptA || !apptB) {
        console.error('❌ Agendamentos de teste não encontrados. Rode o seed-appointments.ts primeiro.')
        return
    }

    console.log(`📋 Agendamento A: ${apptA.scheduledStart.toISOString()} - ${apptA.scheduledEnd.toISOString()} (${apptA.id})`)
    console.log(`📋 Agendamento B: ${apptB.scheduledStart.toISOString()} - ${apptB.scheduledEnd.toISOString()} (${apptB.id})`)

    // 2. Simular mover A para 08:30 - 09:30 (Colidindo com B que começa as 09:00)
    // A duração original de A é 1h.
    const newStartA = new Date(apptA.scheduledStart)
    newStartA.setMinutes(30) // 08:30
    const newEndA = new Date(newStartA.getTime() + 60 * 60 * 1000) // 09:30

    console.log(`\n🔄 Simulando movimento de A para: ${newStartA.toISOString()} - ${newEndA.toISOString()}`)

    // 3. Chamar a lógica de simulação (replicando o controller)
    const moves: any[] = []
    const queue: any[] = [{
        id: apptA.id,
        boxId: apptA.boxId,
        start: newStartA,
        end: newEndA,
        reason: 'INITIAL_MOVE'
    }]

    const processedIds = new Set<string>()
    processedIds.add(apptA.id)

    while (queue.length > 0) {
        const current = queue.shift()
        if (current.reason !== 'INITIAL_MOVE') moves.push(current)

        const boxConflicts = await prisma.appointment.findMany({
            where: {
                id: { notIn: Array.from(processedIds) },
                boxId: current.boxId,
                status: { not: 'CANCELLED' },
                AND: [
                    { scheduledStart: { lt: current.end } },
                    { scheduledEnd: { gt: current.start } }
                ]
            }
        })

        for (const conflict of boxConflicts) {
            if (processedIds.has(conflict.id)) continue

            console.log(`   ⚡ Conflito encontrado com: ${conflict.description} (${conflict.scheduledStart.toISOString()})`)

            const duration = conflict.scheduledEnd.getTime() - conflict.scheduledStart.getTime()
            const newStart = current.end
            const newEnd = new Date(newStart.getTime() + duration)

            console.log(`      -> Movendo para: ${newStart.toISOString()} - ${newEnd.toISOString()}`)

            queue.push({
                id: conflict.id,
                boxId: conflict.boxId,
                start: newStart,
                end: newEnd,
                reason: 'CASCADE'
            })
            processedIds.add(conflict.id)
        }
    }

    console.log('\n📊 Resultados:')
    if (moves.length > 0) {
        console.log(`✅ Cascata funcionou! ${moves.length} movimentos gerados.`)
        moves.forEach(m => console.log(`   - ID ${m.id} movido para ${m.start.toISOString()}`))
    } else {
        console.log('❌ Nenhum movimento de cascata gerado.')
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
