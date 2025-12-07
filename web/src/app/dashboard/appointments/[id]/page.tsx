'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { appointmentsService, Appointment } from '@/services/appointments'
import { checklistsService } from '@/services/checklists'
import { checklistTemplatesService } from '@/services/checklist-templates'
import ConflictModal from '@/components/ConflictModal'
import TemplateSelectionModal from '@/components/TemplateSelectionModal'

export default function AppointmentDetailsPage() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string

    const [appointment, setAppointment] = useState<Appointment | null>(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)

    // Edit State
    const [isEditing, setIsEditing] = useState(false)
    const [editForm, setEditForm] = useState({
        start: '',
        end: ''
    })

    // Conflict State
    const [conflictModalOpen, setConflictModalOpen] = useState(false)
    const [conflicts, setConflicts] = useState<any>({ boxConflicts: [], mechanicConflicts: [] })
    const [cascadeMoves, setCascadeMoves] = useState<any[]>([])

    useEffect(() => {
        loadAppointment()
    }, [id])

    const loadAppointment = async () => {
        try {
            setLoading(true)
            const data = await appointmentsService.getById(id)
            setAppointment(data)
            // Initialize form with current values in Local Time
            setEditForm({
                start: format(new Date(data.scheduledStart), "yyyy-MM-dd'T'HH:mm"),
                end: format(new Date(data.scheduledEnd), "yyyy-MM-dd'T'HH:mm")
            })
        } catch (error: any) {
            alert(error.message)
            router.push('/dashboard/appointments')
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (newStatus: string) => {
        if (!confirm(`Deseja alterar o status para ${newStatus}?`)) return

        try {
            setUpdating(true)
            const updated = await appointmentsService.update(id, { status: newStatus })
            setAppointment(updated)
        } catch (error: any) {
            alert(error.message)
        } finally {
            setUpdating(false)
        }
    }

    const handleCancel = async () => {
        if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return

        try {
            setUpdating(true)
            await appointmentsService.delete(id)
            router.push('/dashboard/appointments')
        } catch (error: any) {
            alert(error.message)
            setUpdating(false)
        }
    }

    const [templateModalOpen, setTemplateModalOpen] = useState(false)

    const handleCreateChecklist = async () => {
        if (!appointment) return

        try {
            setUpdating(true)
            // Tenta buscar checklist existente
            try {
                await checklistsService.getByAppointmentId(id)
                // Se encontrar, redireciona
                router.push(`/dashboard/checklists/${id}`)
                return
            } catch (e) {
                // Se não encontrar (404), abre modal de seleção
                setTemplateModalOpen(true)
            }
        } catch (error: any) {
            alert(error.message)
        } finally {
            setUpdating(false)
        }
    }

    const handleTemplateConfirm = async (templateId: string) => {
        try {
            setUpdating(true)
            await checklistsService.create({
                appointmentId: id,
                templateId: templateId || undefined
            })
            router.push(`/dashboard/checklists/${id}`)
        } catch (error: any) {
            alert('Erro ao criar checklist: ' + error.message)
        } finally {
            setUpdating(false)
            setTemplateModalOpen(false)
        }
    }

    const handleSaveEdit = async () => {
        if (!appointment) return

        const start = new Date(editForm.start)
        const end = new Date(editForm.end)

        if (start >= end) {
            alert('A data de término deve ser posterior ao início.')
            return
        }

        try {
            setUpdating(true)

            // 1. Check Conflicts
            const result = await appointmentsService.checkConflicts({
                id: appointment.id,
                boxId: appointment.boxId,
                scheduledStart: start.toISOString(),
                scheduledEnd: end.toISOString()
            })

            if (result.hasConflicts) {
                setConflicts(result)

                // 2. Simulate Cascade
                try {
                    const cascadeResult = await appointmentsService.simulateCascade({
                        id: appointment.id,
                        boxId: appointment.boxId,
                        scheduledStart: start.toISOString(),
                        scheduledEnd: end.toISOString()
                    })
                    setCascadeMoves(cascadeResult)
                } catch (err) {
                    console.error('Erro ao simular cascata:', err)
                }

                setConflictModalOpen(true)
                setUpdating(false)
                return
            }

            // No conflicts, update directly
            const updated = await appointmentsService.update(id, {
                scheduledStart: start.toISOString(),
                scheduledEnd: end.toISOString()
            })
            setAppointment(updated)
            setIsEditing(false)
            alert('Agendamento atualizado com sucesso!')

        } catch (error: any) {
            alert(error.message)
        } finally {
            setUpdating(false)
        }
    }

    const handleConflictConfirm = async (action: 'FORCE' | 'CASCADE') => {
        if (!appointment) return

        const start = new Date(editForm.start)
        const end = new Date(editForm.end)

        try {
            setUpdating(true)
            if (action === 'CASCADE' && cascadeMoves.length > 0) {
                const allMoves = [
                    {
                        id: appointment.id,
                        start: start,
                        end: end,
                        boxId: appointment.boxId
                    },
                    ...cascadeMoves.map(m => ({
                        id: m.id,
                        start: m.start,
                        end: m.end,
                        boxId: m.boxId
                    }))
                ]
                await appointmentsService.batchUpdate(allMoves)
            } else {
                // FORCE
                await appointmentsService.update(id, {
                    scheduledStart: start.toISOString(),
                    scheduledEnd: end.toISOString()
                })
            }

            await loadAppointment()
            setIsEditing(false)
            setConflictModalOpen(false)
            alert('Agendamento reagendado com sucesso!')
        } catch (error: any) {
            console.error('Erro ao aplicar reagendamento:', error)
            alert('Erro ao aplicar reagendamento')
        } finally {
            setUpdating(false)
        }
    }

    if (loading || !appointment) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Carregando...</div>

    return (
        <div className="min-h-screen bg-gray-50">
            <TemplateSelectionModal
                isOpen={templateModalOpen}
                onClose={() => setTemplateModalOpen(false)}
                onConfirm={handleTemplateConfirm}
            />
            <ConflictModal
                isOpen={conflictModalOpen}
                onClose={() => setConflictModalOpen(false)}
                onConfirm={handleConflictConfirm}
                conflicts={conflicts}
                cascadeMoves={cascadeMoves}
            />

            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Detalhes</h1>
                    <div className="flex flex-wrap gap-2">
                        {!isEditing && (
                            <button
                                onClick={() => {
                                    if (appointment) {
                                        setEditForm({
                                            start: format(new Date(appointment.scheduledStart), "yyyy-MM-dd'T'HH:mm"),
                                            end: format(new Date(appointment.scheduledEnd), "yyyy-MM-dd'T'HH:mm")
                                        })
                                    }
                                    setIsEditing(true)
                                }}
                                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 text-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="hidden sm:inline">Editar</span> Horário
                            </button>
                        )}
                        <button
                            onClick={handleCreateChecklist}
                            className="px-3 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex items-center gap-1 text-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                            Checklist
                        </button>
                        <button onClick={() => router.push('/dashboard/appointments')} className="px-3 py-2 text-gray-600 hover:text-gray-900 text-sm">Voltar</button>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <h2 className="text-lg font-medium text-gray-900">Informações Gerais</h2>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold 
              ${appointment.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                                appointment.status === 'CHECKED_IN' ? 'bg-yellow-100 text-yellow-800' :
                                    appointment.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-800' :
                                        appointment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                            'bg-red-100 text-red-800'}`}>
                            {appointment.status === 'SCHEDULED' ? 'Agendado' :
                                appointment.status === 'CHECKED_IN' ? 'Na Oficina' :
                                    appointment.status === 'IN_PROGRESS' ? 'Em Andamento' :
                                        appointment.status === 'COMPLETED' ? 'Concluído' : 'Cancelado'}
                        </span>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Cliente</h3>
                                <p className="mt-1 text-lg text-gray-900">{appointment.customer?.name}</p>
                                <p className="text-sm text-gray-500">{appointment.customer?.phone}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Veículo</h3>
                                <p className="mt-1 text-lg text-gray-900">{appointment.vehicle?.model}</p>
                                <p className="text-sm text-gray-500">{appointment.vehicle?.plate} - {appointment.vehicle?.brand}</p>
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <h3 className="text-sm font-medium text-gray-500 mb-2">Horário</h3>
                                {isEditing ? (
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Início</label>
                                                <input
                                                    type="datetime-local"
                                                    value={editForm.start}
                                                    onChange={(e) => setEditForm({ ...editForm, start: e.target.value })}
                                                    disabled={appointment.status === 'IN_PROGRESS'}
                                                    className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white ${appointment.status === 'IN_PROGRESS' ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Término</label>
                                                <input
                                                    type="datetime-local"
                                                    value={editForm.end}
                                                    onChange={(e) => setEditForm({ ...editForm, end: e.target.value })}
                                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={handleSaveEdit}
                                                disabled={updating}
                                                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                {updating ? 'Verificando...' : 'Salvar Alteração'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="mt-1 text-lg text-gray-900">{format(new Date(appointment.scheduledStart), 'dd/MM/yyyy')}</p>
                                        <p className="text-sm text-gray-500">
                                            {format(new Date(appointment.scheduledStart), 'HH:mm')} às {format(new Date(appointment.scheduledEnd), 'HH:mm')}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Box</h3>
                                <p className="mt-1 text-lg text-gray-900">{appointment.box?.name}</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Descrição</h3>
                            <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded-lg">{appointment.description || 'Nenhuma descrição informada'}</p>
                        </div>

                        {appointment.notes && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Observações Internas</h3>
                                <p className="mt-1 text-gray-900 bg-yellow-50 p-3 rounded-lg">{appointment.notes}</p>
                            </div>
                        )}

                        {/* Ações de Status */}
                        {!isEditing && (
                            <div className="border-t border-gray-200 pt-6 mt-6">
                                <h3 className="text-sm font-medium text-gray-500 mb-4">Ações</h3>
                                <div className="flex flex-wrap gap-3">
                                    {appointment.status === 'SCHEDULED' && (
                                        <button
                                            onClick={() => handleStatusChange('CHECKED_IN')}
                                            disabled={updating}
                                            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                                        >
                                            Registrar Entrada (Check-in)
                                        </button>
                                    )}

                                    {appointment.status === 'CHECKED_IN' && (
                                        <button
                                            onClick={() => handleStatusChange('IN_PROGRESS')}
                                            disabled={updating}
                                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                                        >
                                            Iniciar Serviço
                                        </button>
                                    )}

                                    {appointment.status === 'IN_PROGRESS' && (
                                        <button
                                            onClick={() => handleStatusChange('COMPLETED')}
                                            disabled={updating}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                        >
                                            Concluir Serviço
                                        </button>
                                    )}

                                    {appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && appointment.status !== 'IN_PROGRESS' && (
                                        <button
                                            onClick={handleCancel}
                                            disabled={updating}
                                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 ml-auto"
                                        >
                                            Cancelar Agendamento
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-50 px-6 py-4 flex justify-end">
                        <button onClick={() => router.push('/dashboard/appointments')} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                            Voltar
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}
