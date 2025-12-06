'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth'
import { financialService, DashboardStats, RevenueData, TopService, TopProduct, ServiceVsProduct, PendingPayment } from '@/services/financial'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useIsMobile } from '@/hooks/useIsMobile'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function FinancialDashboardPage() {
    const router = useRouter()
    const isMobile = useIsMobile()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [revenueData, setRevenueData] = useState<RevenueData[]>([])
    const [topServices, setTopServices] = useState<TopService[]>([])
    const [topProducts, setTopProducts] = useState<TopProduct[]>([])
    const [servicesVsProducts, setServicesVsProducts] = useState<ServiceVsProduct[]>([])
    const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([])

    useEffect(() => {
        const user = authService.getUser()
        if (!user || user.role !== 'ADMIN') {
            router.push('/dashboard')
            return
        }

        loadData()
    }, [router])

    const loadData = async () => {
        try {
            setLoading(true)

            // Load data with individual error handling to prevent 404s from breaking the page
            const [statsData, revenueByPeriod, services, products, comparison, payments] = await Promise.allSettled([
                financialService.getDashboardStats().catch(() => ({ monthlyRevenue: 0, pendingPayments: 0, pendingPaymentsCount: 0, completedOrders: 0, averageTicket: 0 })),
                financialService.getRevenueByPeriod().catch(() => []),
                financialService.getTopServices(5).catch(() => []),
                financialService.getTopProducts(5).catch(() => []),
                financialService.getServicesVsProducts().catch(() => []),
                financialService.getPendingPayments().catch(() => ({ serviceOrders: [] })),
            ])

            setStats(statsData.status === 'fulfilled' ? statsData.value : { monthlyRevenue: 0, pendingPayments: 0, pendingPaymentsCount: 0, completedOrders: 0, averageTicket: 0 })
            setRevenueData(revenueByPeriod.status === 'fulfilled' ? revenueByPeriod.value : [])
            setTopServices(services.status === 'fulfilled' ? services.value : [])
            setTopProducts(products.status === 'fulfilled' ? products.value : [])
            setServicesVsProducts(comparison.status === 'fulfilled' ? comparison.value : [])
            setPendingPayments(payments.status === 'fulfilled' ? payments.value.serviceOrders : [])
        } catch (error) {
            console.error('Erro ao carregar dados financeiros:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value)
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Carregando dados financeiros...</p>
                </div>
            </div>
        )
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
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard Financeiro</h1>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Cards de Resumo */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-600">Faturamento do Mês</h3>
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats?.monthlyRevenue || 0)}</p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-600">Pagamentos Pendentes</h3>
                            <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats?.pendingPayments || 0)}</p>
                        <p className="text-sm text-gray-500 mt-1">{stats?.pendingPaymentsCount || 0} OS pendentes</p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-600">Ticket Médio</h3>
                            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats?.averageTicket || 0)}</p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-600">OS Concluídas</h3>
                            <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{stats?.completedOrders || 0}</p>
                        <p className="text-sm text-gray-500 mt-1">Este mês</p>
                    </div>
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Gráfico de Faturamento por Dia */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">Faturamento Diário (Últimos 30 dias)</h3>
                        <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                            <LineChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={formatDate}
                                    tick={{ fontSize: isMobile ? 10 : 12 }}
                                    interval={isMobile ? 'preserveStartEnd' : 0}
                                />
                                <YAxis
                                    tickFormatter={(value) => isMobile ? `${value}` : `R$ ${value}`}
                                    tick={{ fontSize: isMobile ? 10 : 12 }}
                                />
                                <Tooltip formatter={(value) => formatCurrency(Number(value))} labelFormatter={formatDate} />
                                <Legend />
                                <Line type="monotone" dataKey="revenue" name="Faturamento" stroke="#3b82f6" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Gráfico Serviços vs Produtos */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">Serviços vs Produtos</h3>
                        <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                            <PieChart>
                                <Pie
                                    data={servicesVsProducts}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={isMobile ? false : ({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={isMobile ? 80 : 100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {servicesVsProducts.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Top 5 Serviços */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">Top 5 Serviços Mais Lucrativos</h3>
                        <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                            <BarChart data={topServices}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: isMobile ? 10 : 12 }}
                                    angle={isMobile ? -45 : 0}
                                    textAnchor={isMobile ? 'end' : 'middle'}
                                    height={isMobile ? 80 : 30}
                                />
                                <YAxis
                                    tickFormatter={(value) => isMobile ? `${value}` : `R$ ${value}`}
                                    tick={{ fontSize: isMobile ? 10 : 12 }}
                                />
                                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                <Legend />
                                <Bar dataKey="total" name="Faturamento" fill="#10b981" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Top 5 Produtos */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">Top 5 Produtos Mais Vendidos</h3>
                        <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                            <BarChart data={topProducts}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: isMobile ? 10 : 12 }}
                                    angle={isMobile ? -45 : 0}
                                    textAnchor={isMobile ? 'end' : 'middle'}
                                    height={isMobile ? 80 : 30}
                                />
                                <YAxis
                                    tickFormatter={(value) => isMobile ? `${value}` : `R$ ${value}`}
                                    tick={{ fontSize: isMobile ? 10 : 12 }}
                                />
                                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                <Legend />
                                <Bar dataKey="total" name="Faturamento" fill="#f59e0b" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Tabela de OS Pendentes */}
                {pendingPayments.length > 0 && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold">OS Pendentes de Pagamento</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OS</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Veículo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {pendingPayments.map((os) => (
                                        <tr key={os.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {os.orderNumber}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {os.appointment.customer.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {os.vehicle.brand} {os.vehicle.model} - {os.vehicle.plate}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${os.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {os.status === 'COMPLETED' ? 'Concluída' : 'Aprovada'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                {formatCurrency(os.total)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button
                                                    onClick={() => router.push(`/dashboard/service-orders/${os.id}`)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Ver Detalhes
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
