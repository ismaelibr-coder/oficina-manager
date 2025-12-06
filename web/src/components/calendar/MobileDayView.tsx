'use client'

import { useState } from 'react'
import { format, addDays, subDays, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useSwipe } from '@/hooks/useSwipe'
import { Appointment } from '@/services/appointments'

interface MobileDayViewProps {
    appointments: Appointment[]
    onAppointmentClick: (appointment: Appointment) => void
}

export const MobileDayView = ({ appointments, onAppointmentClick }: MobileDayViewProps) => {
    const [currentDay, setCurrentDay] = useState(new Date())

    // Filtrar agendamentos do dia atual
    const dayAppointments = appointments.filter(apt =>
        isSameDay(new Date(apt.scheduledStart), currentDay)
    ).sort((a, b) =>
        new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime()
    )

    // Handlers de swipe
    const nextDay = () => setCurrentDay(prev => addDays(prev, 1))
    const previousDay = () => setCurrentDay(prev => subDays(prev, 1))
    const swipeHandlers = useSwipe(nextDay, previousDay)

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SCHEDULED': return 'bg-blue-500'
            case 'CHECKED_IN': return 'bg-yellow-500'
            case 'IN_PROGRESS': return 'bg-purple-500'
            case 'COMPLETED': return 'bg-green-500'
            case 'CANCELLED': return 'bg-red-500'
            case 'RESCHEDULED': return 'bg-orange-500'
            default: return 'bg-gray-500'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'SCHEDULED': return 'Agendado'
            case 'CHECKED_IN': return 'Na Oficina'
            case 'IN_PROGRESS': return 'Em Serviço'
            case 'COMPLETED': return 'Concluído'
            case 'CANCELLED': return 'Cancelado'
            case 'RESCHEDULED': return 'Reagendado'
            default: return status
        }
    }

    return (
        <div className="flex flex-col h-full">
            {/* Seletor de Dia */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="flex items-center justify-between p-4">
                    <button
                        onClick={previousDay}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Dia anterior"
                    >
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <div className="flex-1 text-center">
                        <div className="text-2xl font-bold text-gray-900">
                            {format(currentDay, 'd', { locale: ptBR })}
                        </div>
                        <div className="text-sm text-gray-600">
                            {format(currentDay, 'EEEE', { locale: ptBR })}
                        </div>
                        <div className="text-xs text-gray-500">
                            {format(currentDay, 'MMMM yyyy', { locale: ptBR })}
                        </div>
                    </div>

                    <button
                        onClick={nextDay}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Próximo dia"
                    >
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Indicador de Swipe */}
                <div className="text-center pb-2">
                    <div className="text-xs text-gray-400 flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                        </svg>
                        Deslize para navegar
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Lista de Agendamentos */}
            <div {...swipeHandlers} className="flex-1 overflow-y-auto p-4">
                {dayAppointments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <svg className="w-20 h-20 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-500 font-medium text-lg">Nenhum agendamento</p>
                        <p className="text-gray-400 text-sm mt-1">
                            Não há agendamentos para {format(currentDay, 'd/MM/yyyy')}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {dayAppointments.map((apt) => (
                            <div
                                key={apt.id}
                                onClick={() => onAppointmentClick(apt)}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow active:scale-[0.98] cursor-pointer"
                            >
                                {/* Barra de Status */}
                                <div className={`h-2 ${getStatusColor(apt.status)}`} />

                                <div className="p-4">
                                    {/* Horário e Status */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-purple-100 rounded-lg px-4 py-2 min-w-[80px] text-center">
                                                <div className="text-xs text-purple-600 font-medium">HORÁRIO</div>
                                                <div className="text-xl font-bold text-purple-900">
                                                    {format(new Date(apt.scheduledStart), 'HH:mm')}
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${apt.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                                                apt.status === 'CHECKED_IN' ? 'bg-yellow-100 text-yellow-800' :
                                                    apt.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-800' :
                                                        apt.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                            apt.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                            {getStatusLabel(apt.status)}
                                        </span>
                                    </div>

                                    {/* Cliente */}
                                    <div className="mb-2">
                                        <div className="flex items-center gap-2 text-gray-900 font-semibold text-lg">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            {apt.customer?.name}
                                        </div>
                                    </div>

                                    {/* Veículo */}
                                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                        </svg>
                                        <span className="font-medium">{apt.vehicle?.model}</span>
                                        <span className="text-gray-400">•</span>
                                        <span className="font-mono font-semibold">{apt.vehicle?.plate}</span>
                                    </div>

                                    {/* Box */}
                                    {apt.box && (
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                            Box {apt.box.name}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Botão Hoje */}
            <div className="p-4 bg-white border-t border-gray-200">
                <button
                    onClick={() => setCurrentDay(new Date())}
                    className="w-full min-h-[48px] bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors active:scale-[0.98]"
                >
                    Hoje
                </button>
            </div>
        </div>
    )
}
