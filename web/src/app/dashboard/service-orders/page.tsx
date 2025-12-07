'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { serviceOrdersService, ServiceOrder } from '@/services/service-orders'
import { authService } from '@/services/auth'
import { Pagination } from '@/components/Pagination'

export default function ServiceOrdersPage() {
    const router = useRouter()
    const [orders, setOrders] = useState<ServiceOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState('')

    // Pagination state
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)
    const [totalPages, setTotalPages] = useState(1)
    const [totalItems, setTotalItems] = useState(0)

    useEffect(() => {
        loadOrders()
    }, [filterStatus, page, pageSize])

    const loadOrders = async () => {
        try {
            setLoading(true)
            // Build query params
            const params = new URLSearchParams()
            if (filterStatus) params.append('status', filterStatus)
            params.append('page', page.toString())
            params.append('pageSize', pageSize.toString())

            const url = `${params.toString() ? '?' + params.toString() : ''}`

            // Call service (we'll update this to handle pagination)
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://oficina-manager.onrender.com/api'}/service-orders${url}`, {
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) throw new Error('Erro ao carregar OSs')

            const json = await response.json()

            // Handle paginated response
            if (json.data) {
                setOrders(json.data)
                setTotalPages(json.pagination?.totalPages || 1)
                setTotalItems(json.pagination?.total || 0)
            } else {
                setOrders(json)
            }
        } catch (error: any) {
            alert(error.message)
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-gray-100 text-gray-800'
            case 'AWAITING_APPROVAL': return 'bg-yellow-100 text-yellow-800'
            case 'APPROVED': return 'bg-blue-100 text-blue-800'
            case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800'
            case 'COMPLETED': return 'bg-green-100 text-green-800'
            case 'CANCELLED': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PENDING': return 'Pendente'
            case 'AWAITING_APPROVAL': return 'Aguardando Aprovação'
            case 'APPROVED': return 'Aprovado'
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
                    <h1 className="text-2xl font-bold text-gray-900">Ordens de Serviço</h1>
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push('/dashboard')} className="px-4 py-2 text-gray-600 hover:text-gray-900">Voltar</button>
                        <button onClick={() => { authService.logout(); router.push('/') }} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Sair</button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="flex items-center gap-4">
                        <label className="text-gray-700 font-medium">Status:</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                        >
                            <option value="">Todos</option>
                            <option value="PENDING">Pendente</option>
                            <option value="AWAITING_APPROVAL">Aguardando Aprovação</option>
                            <option value="APPROVED">Aprovado</option>
                            <option value="IN_PROGRESS">Em Andamento</option>
                            <option value="COMPLETED">Concluído</option>
                            <option value="CANCELLED">Cancelado</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">Carregando...</div>
                ) : (
                    <>
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            {orders.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">Nenhuma Ordem de Serviço encontrada</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nº OS</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente / Veículo</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {orders.map((os) => (
                                                <tr key={os.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-bold text-gray-900">{os.orderNumber}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{format(new Date(os.createdAt), 'dd/MM/yyyy')}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-medium text-gray-900">{os.customer?.name || 'Carregando...'}</div>
                                                        <div className="text-sm text-gray-500">{os.vehicle?.model} - {os.vehicle?.plate}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">R$ {os.total.toFixed(2)}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(os.status)}`}>
                                                            {getStatusLabel(os.status)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            onClick={() => router.push(`/dashboard/service-orders/${os.id}`)}
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

                        {/* Pagination Component */}
                        {totalItems > 0 && (
                            <div className="mt-6">
                                <Pagination
                                    currentPage={page}
                                    totalPages={totalPages}
                                    pageSize={pageSize}
                                    totalItems={totalItems}
                                    onPageChange={(newPage) => setPage(newPage)}
                                    onPageSizeChange={(newSize) => { setPageSize(newSize); setPage(1) }}
                                    pageSizeOptions={[10, 20, 50, 100]}
                                />
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}
