'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService, User } from '@/services/auth'
import { serviceOrderAlertsService, ServiceOrderAlert } from '@/services/service-order-alerts'
import { appointmentsService, Appointment } from '@/services/appointments'

export default function DashboardPage() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [osAlerts, setOsAlerts] = useState<ServiceOrderAlert[]>([])
    const [loadingAlerts, setLoadingAlerts] = useState(true)
    const [todaysAppointments, setTodaysAppointments] = useState<Appointment[]>([])
    const [loadingAppointments, setLoadingAppointments] = useState(true)

    useEffect(() => {
        const currentUser = authService.getUser()
        if (!currentUser) {
            router.push('/')
            return
        }
        setUser(currentUser)
        loadData()
    }, [router])

    const loadData = async () => {
        setLoadingAlerts(true)
        setLoadingAppointments(true)
        try {
            const [alerts, appointments] = await Promise.all([
                serviceOrderAlertsService.getInProgressAlerts(),
                loadTodaysAppointments()
            ])
            setOsAlerts(alerts)
            setTodaysAppointments(appointments)
        } catch (error: any) {
            console.error('Erro ao carregar dados do dashboard:', error)
            if (error.message === 'Token inválido' || error.message === 'Token não fornecido') {
                authService.logout()
                router.push('/')
            }
        } finally {
            setLoadingAlerts(false)
            setLoadingAppointments(false)
        }
    }

    const loadTodaysAppointments = async () => {
        const today = new Date()
        const start = new Date(today.setHours(0, 0, 0, 0)).toISOString()
        const end = new Date(today.setHours(23, 59, 59, 999)).toISOString()

        return await appointmentsService.list({
            start,
            end,
            status: 'SCHEDULED'
        })
    }

    const handleLogout = () => {
        authService.logout()
        router.push('/')
    }

    if (!user) {
        return <div>Carregando...</div>
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                            Olá, <strong>{user.name}</strong>
                        </span>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Sair
                        </button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Seção de Alertas e Agendamentos */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Visão Geral</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Agendamentos de Hoje */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 border-b border-purple-200">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Agendamentos de Hoje</h3>
                                            <p className="text-sm text-gray-600">{todaysAppointments.length} {todaysAppointments.length === 1 ? 'agendamento' : 'agendamentos'}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => router.push('/dashboard/appointments')}
                                        className="text-sm text-purple-700 hover:text-purple-900 font-medium flex items-center gap-1"
                                    >
                                        Ver todos
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                {loadingAppointments ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                                        <p className="mt-2">Carregando...</p>
                                    </div>
                                ) : todaysAppointments.length === 0 ? (
                                    <div className="text-center py-12">
                                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-gray-500 font-medium">Nenhum agendamento para hoje</p>
                                        <p className="text-sm text-gray-400 mt-1">Aproveite para organizar a oficina!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                        {todaysAppointments.map((apt) => (
                                            <div
                                                key={apt.id}
                                                onClick={() => router.push(`/dashboard/appointments/${apt.id}`)}
                                                className="p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 hover:shadow-md transition-all cursor-pointer group"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex flex-col items-center justify-center bg-purple-100 rounded-lg px-3 py-2 min-w-[60px]">
                                                            <span className="text-xs text-purple-600 font-medium">HORA</span>
                                                            <span className="text-lg font-bold text-purple-900">
                                                                {new Date(apt.scheduledStart).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-gray-900 mb-1">{apt.customer?.name}</div>
                                                            <div className="text-sm text-gray-600 flex items-center gap-2">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                                                </svg>
                                                                {apt.vehicle?.model} • {apt.vehicle?.plate}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${apt.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                                                        apt.status === 'CHECKED_IN' ? 'bg-yellow-100 text-yellow-800' :
                                                            apt.status === 'IN_PROGRESS' ? 'bg-orange-100 text-orange-800' :
                                                                apt.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {apt.status === 'SCHEDULED' ? 'Agendado' :
                                                            apt.status === 'CHECKED_IN' ? 'Na Oficina' :
                                                                apt.status === 'IN_PROGRESS' ? 'Em Serviço' :
                                                                    apt.status === 'COMPLETED' ? 'Concluído' : apt.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Serviços em Andamento */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-6 py-4 border-b border-orange-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Serviços em Andamento</h3>
                                        <p className="text-sm text-gray-600">{osAlerts.length} {osAlerts.length === 1 ? 'ordem de serviço' : 'ordens de serviço'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                {loadingAlerts ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                                        <p className="mt-2">Carregando...</p>
                                    </div>
                                ) : osAlerts.length === 0 ? (
                                    <div className="text-center py-12">
                                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="text-gray-500 font-medium">Nenhum serviço em andamento</p>
                                        <p className="text-sm text-gray-400 mt-1">Todas as OS estão finalizadas</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                        {osAlerts.map((alert) => (
                                            <div
                                                key={alert.id}
                                                onClick={() => router.push(`/dashboard/service-orders/${alert.id}`)}
                                                className={`p-4 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-all ${alert.alertLevel === 'critical' ? 'bg-red-50 border-red-500 hover:bg-red-100' :
                                                    alert.alertLevel === 'warning' ? 'bg-yellow-50 border-yellow-500 hover:bg-yellow-100' :
                                                        'bg-blue-50 border-blue-500 hover:bg-blue-100'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-bold text-gray-900">OS {alert.orderNumber}</span>
                                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${alert.alertLevel === 'critical' ? 'bg-red-600 text-white' :
                                                                alert.alertLevel === 'warning' ? 'bg-yellow-600 text-white' :
                                                                    'bg-blue-600 text-white'
                                                                }`}>
                                                                {alert.alertLevel === 'critical' ? 'CRÍTICO' :
                                                                    alert.alertLevel === 'warning' ? 'ATENÇÃO' : 'NORMAL'}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-gray-600 mb-2">
                                                            {alert.vehicle.brand} {alert.vehicle.model} • {alert.vehicle.plate}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span className="font-medium text-gray-700">
                                                        {alert.daysInProgress === 0
                                                            ? `Em andamento há ${alert.hoursInProgress}h`
                                                            : `Em andamento há ${alert.daysInProgress} dia${alert.daysInProgress > 1 ? 's' : ''}`}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Menu de Funcionalidades */}
                <div className="space-y-8">
                    {/* Seção Operacional - Visível para todos */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Operacional
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <button
                                onClick={() => router.push('/dashboard/appointments')}
                                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-left"
                            >
                                <div className="flex items-center mb-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 mb-1">Agendamentos</h3>
                                <p className="text-xs text-gray-600">Gerenciar agenda</p>
                            </button>

                            <button
                                onClick={() => router.push('/dashboard/calendar')}
                                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-left"
                            >
                                <div className="flex items-center mb-3">
                                    <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 mb-1">Calendário</h3>
                                <p className="text-xs text-gray-600">Visão semanal</p>
                            </button>

                            <button
                                onClick={() => router.push('/dashboard/service-orders')}
                                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-left"
                            >
                                <div className="flex items-center mb-3">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 mb-1">Ordens de Serviço</h3>
                                <p className="text-xs text-gray-600">Orçamentos e serviços</p>
                            </button>

                            <button
                                onClick={() => router.push('/dashboard/checklist-templates')}
                                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-left"
                            >
                                <div className="flex items-center mb-3">
                                    <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 mb-1">Checklists</h3>
                                <p className="text-xs text-gray-600">Modelos de vistoria</p>
                            </button>
                        </div>
                    </div>

                    {/* Seção Cadastros - Visível para todos, mas alguns itens apenas para admin */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            Cadastros
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <button
                                onClick={() => router.push('/dashboard/customers')}
                                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-left"
                            >
                                <div className="flex items-center mb-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 mb-1">Clientes</h3>
                                <p className="text-xs text-gray-600">Gerenciar clientes</p>
                            </button>

                            <button
                                onClick={() => router.push('/dashboard/vehicles')}
                                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-left"
                            >
                                <div className="flex items-center mb-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 mb-1">Veículos</h3>
                                <p className="text-xs text-gray-600">Gerenciar veículos</p>
                            </button>

                            <button
                                onClick={() => router.push('/dashboard/products')}
                                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-left"
                            >
                                <div className="flex items-center mb-3">
                                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 mb-1">Produtos</h3>
                                <p className="text-xs text-gray-600">Peças e estoque</p>
                            </button>

                            <button
                                onClick={() => router.push('/dashboard/services')}
                                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-left"
                            >
                                <div className="flex items-center mb-3">
                                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 mb-1">Serviços</h3>
                                <p className="text-xs text-gray-600">Mão de obra</p>
                            </button>

                            {/* Boxes - Apenas Admin */}
                            {user.role === 'ADMIN' && (
                                <button
                                    onClick={() => router.push('/dashboard/boxes')}
                                    className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-left"
                                >
                                    <div className="flex items-center mb-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                        </div>
                                    </div>
                                    <h3 className="text-base font-semibold text-gray-900 mb-1">Boxes</h3>
                                    <p className="text-xs text-gray-600">Gerenciar espaço</p>
                                </button>
                            )}

                            {/* Usuários - Apenas Admin */}
                            {user.role === 'ADMIN' && (
                                <button
                                    onClick={() => router.push('/dashboard/users')}
                                    className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-left"
                                >
                                    <div className="flex items-center mb-3">
                                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <h3 className="text-base font-semibold text-gray-900 mb-1">Usuários</h3>
                                    <p className="text-xs text-gray-600">Gerenciar usuários</p>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Seção Relatórios e Análises - Apenas Admin */}
                    {user.role === 'ADMIN' && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Relatórios e Análises
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => router.push('/dashboard/financial')}
                                    className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-left"
                                >
                                    <div className="flex items-center mb-3">
                                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <h3 className="text-base font-semibold text-gray-900 mb-1">Dashboard Financeiro</h3>
                                    <p className="text-xs text-gray-600">Faturamento, gráficos e indicadores</p>
                                </button>

                                <button
                                    onClick={() => router.push('/dashboard/reports')}
                                    className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-left"
                                >
                                    <div className="flex items-center mb-3">
                                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <h3 className="text-base font-semibold text-gray-900 mb-1">Relatórios</h3>
                                    <p className="text-xs text-gray-600">Exportar dados em Excel</p>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
