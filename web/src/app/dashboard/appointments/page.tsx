'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { appointmentsService, Appointment } from '@/services/appointments'
import { authService } from '@/services/auth'
import { Pagination } from '@/components/Pagination'
import { fetchPaginated } from '@/services/pagination-helper'
import { TableSkeleton } from '@/components/Skeletons'

export default function AppointmentsPage() {
    const router = useRouter()
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0])

    // Pagination state
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)
    const [totalPages, setTotalPages] = useState(1)
    const [totalItems, setTotalItems] = useState(0)

    // Sorting state
    const [sortField, setSortField] = useState<string>('scheduledStart')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

    useEffect(() => {
        loadAppointments()
    }, [filterDate, page, pageSize, sortField, sortOrder])

    const loadAppointments = async () => {
        try {
            setLoading(true)
            // Load appointments for selected date with pagination
            const start = new Date(filterDate)
            start.setHours(0, 0, 0, 0)
            const end = new Date(filterDate)
            end.setHours(23, 59, 59, 999)

            // For now, load all and filter/sort client-side
            // TODO: Backend should handle pagination + sorting
            let data = await appointmentsService.list({
                start: start.toISOString(),
                end: end.toISOString()
            })

            // Client-side sorting
            data.sort((a, b) => {
                let aVal: any = a[sortField as keyof Appointment]
                let bVal: any = b[sortField as keyof Appointment]

                // Handle nested properties (e.g., box.name)
                if (sortField === 'boxName') {
                    aVal = a.box?.name || ''
                    bVal = b.box?.name || ''
                }

                if (sortField === 'customerName') {
                    aVal = a.customer?.name || ''
                    bVal = b.customer?.name || ''
                }

                if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
                if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
                return 0
            })

            // Client-side pagination
            const total = data.length
            const startIdx = (page - 1) * pageSize
            const endIdx = startIdx + pageSize
            const paginatedData = data.slice(startIdx, endIdx)

            setAppointments(paginatedData)
            setTotalPages(Math.ceil(total / pageSize))
            setTotalItems(total)
        } catch (error: any) {
            alert(error.message)
            setAppointments([])
        } finally {
            setLoading(false)
        }
    }

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortOrder('asc')
        }
        setPage(1) // Reset to first page when sorting
    }

    const SortIcon = ({ field }: { field: string }) => {
        if (sortField !== field) return <span className="text-gray-400">⇅</span>
        return sortOrder === 'asc' ? <span>↑</span> : <span>↓</span>
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
                {/* Simple Filters */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-gray-700">Data:</label>
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => { setFilterDate(e.target.value); setPage(1) }}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <button
                        onClick={() => router.push('/dashboard/appointments/new')}
                        className="w-full sm:w-auto px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                        + Novo Agendamento
                    </button>
                </div>

                {loading ? (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <TableSkeleton rows={pageSize} />
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th
                                                onClick={() => handleSort('scheduledStart')}
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                                            >
                                                Horário <SortIcon field="scheduledStart" />
                                            </th>
                                            <th
                                                onClick={() => handleSort('customerName')}
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                                            >
                                                Cliente / Veículo <SortIcon field="customerName" />
                                            </th>
                                            <th
                                                onClick={() => handleSort('boxName')}
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                                            >
                                                Box <SortIcon field="boxName" />
                                            </th>
                                            <th
                                                onClick={() => handleSort('status')}
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                                            >
                                                Status <SortIcon field="status" />
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {appointments.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                    Nenhum agendamento para esta data
                                                </td>
                                            </tr>
                                        ) : (
                                            appointments.map((appointment) => (
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
                                                        <div className="text-sm text-gray-900">{appointment.box?.name || '-'}</div>
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
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
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
