'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { appointmentsService, Appointment } from '@/services/appointments'
import { authService } from '@/services/auth'

export default function AppointmentsPage() {
    const router = useRouter()
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0])

    useEffect(() => {
        loadAppointments()
    }, [filterDate])

    const loadAppointments = async () => {
        try {
            setLoading(true)
            // Carregar agendamentos do dia selecionado
            const start = new Date(filterDate)
            start.setHours(0, 0, 0, 0)

            const end = new Date(filterDate)
            end.setHours(23, 59, 59, 999)

            const data = await appointmentsService.list({
                start: start.toISOString(),
                end: end.toISOString()
            })
            setAppointments(data)
        } catch (error: any) {
            alert(error.message)
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SCHEDULED': return 'bg-blue-100 text-blue-800'
            case 'CHECKED_IN': return 'bg-yellow-100 text-yellow-800'
            case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800'
            case 'COMPLETED': return 'bg-green-100 text-green-800'
            case 'CANCELLED': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'SCHEDULED': return 'Agendado'
            case 'CHECKED_IN': return 'Na Oficina'
            case 'IN_PROGRESS': return 'Em Andamento'
            case 'COMPLETED': return 'Concluído'
            case 'CANCELLED': return 'Cancelado'
            default: return status
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push('/dashboard')} className="px-4 py-2 text-gray-600 hover:text-gray-900">Voltar</button>
                        <button onClick={() => { authService.logout(); router.push('/') }} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Sair</button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="flex items-center gap-4">
                        <label className="text-gray-700 font-medium">Data:</label>
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                        />
                    </div>
                    <button onClick={() => router.push('/dashboard/appointments/new')} className="w-full sm:w-auto px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">+ Novo Agendamento</button>
                </div>

                {loading ? (
                    <div className="text-center py-12">Carregando...</div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        {appointments.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500">Nenhum agendamento para esta data</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horário</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente / Veículo</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Box</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {appointments.map((appointment) => (
                                            <tr key={appointment.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {format(new Date(appointment.scheduledStart), 'HH:mm')} - {format(new Date(appointment.scheduledEnd), 'HH:mm')}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">{appointment.customer?.name}</div>
                                                    <div className="text-sm text-gray-500">{appointment.vehicle?.model} - {appointment.vehicle?.plate}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{appointment.box?.name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                                                        {getStatusLabel(appointment.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => router.push(`/dashboard/appointments/${appointment.id}`)}
                                                        className="text-primary-600 hover:text-primary-900"
                                                    >
                                                        Detalhes
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}
