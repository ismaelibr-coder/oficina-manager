'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

type ReportType = 'revenue' | 'service-orders' | 'products' | 'services' | 'customers'

export default function ReportsPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [status, setStatus] = useState('')

    const downloadReport = async (reportType: ReportType) => {
        try {
            setLoading(true)

            const token = authService.getToken()
            if (!token) {
                alert('Você precisa estar autenticado')
                return
            }

            // Construir URL com parâmetros
            const params = new URLSearchParams()
            if (startDate) params.append('startDate', startDate)
            if (endDate) params.append('endDate', endDate)
            if (status && reportType === 'service-orders') params.append('status', status)

            const url = `${API_URL}/reports/${reportType}?${params}`

            // Fazer download
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (!response.ok) {
                throw new Error('Erro ao gerar relatório')
            }

            // Obter blob e criar download
            const blob = await response.blob()
            const downloadUrl = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = downloadUrl
            a.download = `relatorio-${reportType}-${Date.now()}.xlsx`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(downloadUrl)
            document.body.removeChild(a)
        } catch (error) {
            console.error('Erro ao baixar relatório:', error)
            alert('Erro ao gerar relatório')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filtros */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h2 className="text-lg font-semibold mb-4">Filtros</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Data Início
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Data Fim
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status (apenas OS)
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Todos</option>
                                <option value="PENDING">Pendente</option>
                                <option value="IN_PROGRESS">Em Andamento</option>
                                <option value="AWAITING_APPROVAL">Aguardando Aprovação</option>
                                <option value="APPROVED">Aprovado</option>
                                <option value="COMPLETED">Concluído</option>
                                <option value="CANCELLED">Cancelado</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Relatórios Disponíveis */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Relatório de Faturamento */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Faturamento</h3>
                                <p className="text-sm text-gray-600">OS concluídas</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Relatório detalhado de todas as ordens de serviço concluídas com valores e clientes.
                        </p>
                        <button
                            onClick={() => downloadReport('revenue')}
                            disabled={loading}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                        >
                            {loading ? 'Gerando...' : 'Baixar Excel'}
                        </button>
                    </div>

                    {/* Relatório de Ordens de Serviço */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Ordens de Serviço</h3>
                                <p className="text-sm text-gray-600">Todos os status</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Listagem completa de ordens de serviço com status, datas e mecânicos responsáveis.
                        </p>
                        <button
                            onClick={() => downloadReport('service-orders')}
                            disabled={loading}
                            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
                        >
                            {loading ? 'Gerando...' : 'Baixar Excel'}
                        </button>
                    </div>

                    {/* Relatório de Produtos */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Produtos Vendidos</h3>
                                <p className="text-sm text-gray-600">Peças e materiais</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Relatório de todos os produtos vendidos com quantidades e valores.
                        </p>
                        <button
                            onClick={() => downloadReport('products')}
                            disabled={loading}
                            className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-400"
                        >
                            {loading ? 'Gerando...' : 'Baixar Excel'}
                        </button>
                    </div>

                    {/* Relatório de Serviços */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mr-4">
                                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Serviços Realizados</h3>
                                <p className="text-sm text-gray-600">Mão de obra</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Relatório de todos os serviços realizados com mecânicos e valores.
                        </p>
                        <button
                            onClick={() => downloadReport('services')}
                            disabled={loading}
                            className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:bg-gray-400"
                        >
                            {loading ? 'Gerando...' : 'Baixar Excel'}
                        </button>
                    </div>

                    {/* Relatório de Clientes */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Clientes</h3>
                                <p className="text-sm text-gray-600">Histórico completo</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Relatório de clientes com histórico de agendamentos e gastos totais.
                        </p>
                        <button
                            onClick={() => downloadReport('customers')}
                            disabled={loading}
                            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400"
                        >
                            {loading ? 'Gerando...' : 'Baixar Excel'}
                        </button>
                    </div>
                </div>

                {/* Informações */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex">
                        <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h4 className="text-sm font-semibold text-blue-900 mb-1">Dica</h4>
                            <p className="text-sm text-blue-800">
                                Use os filtros de data para gerar relatórios de períodos específicos.
                                Os relatórios são gerados em formato Excel (.xlsx) e podem ser abertos em qualquer planilha eletrônica.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
