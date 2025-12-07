'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { vehiclesService, Vehicle } from '@/services/vehicles'
import { authService } from '@/services/auth'
import { Pagination } from '@/components/Pagination'
import { fetchPaginated } from '@/services/pagination-helper'

export default function VehiclesPage() {
    const router = useRouter()
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    // Pagination state
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)
    const [totalPages, setTotalPages] = useState(1)
    const [totalItems, setTotalItems] = useState(0)

    useEffect(() => {
        loadVehicles()
    }, [page, pageSize, search])

    const loadVehicles = async () => {
        try {
            setLoading(true)
            const params: Record<string, string> = {}
            if (search) params.search = search

            const result = await fetchPaginated<Vehicle>(
                '/vehicles',
                page,
                pageSize,
                params
            )

            setVehicles(result.data)
            setTotalPages(result.pagination.totalPages)
            setTotalItems(result.pagination.total)
        } catch (error: any) {
            alert(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este veículo?')) return
        try {
            await vehiclesService.delete(id)
            await loadVehicles()
        } catch (error: any) {
            alert(error.message)
        }
    }



    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Gerenciar Veículos</h1>
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push('/dashboard')} className="px-4 py-2 text-gray-600 hover:text-gray-900">Voltar</button>
                        <button onClick={() => { authService.logout(); router.push('/') }} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Sair</button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6 flex gap-4">
                    <form onSubmit={(e) => { e.preventDefault(); setPage(1) }} className="flex-1 flex gap-2">
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por placa, modelo ou marca..." className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900" />
                        <button type="submit" className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Buscar</button>
                    </form>
                    <button onClick={() => router.push('/dashboard/vehicles/new')} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">+ Novo Veículo</button>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {loading ? (
                        <div className="text-center py-12">Carregando...</div>
                    ) : (
                        <>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Placa</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modelo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marca</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ano</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {vehicles.map((vehicle) => (
                                        <tr key={vehicle.id}>
                                            <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{vehicle.plate}</div></td>
                                            <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-500">{vehicle.model}</div></td>
                                            <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-500">{vehicle.brand || '-'}</div></td>
                                            <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-500">{vehicle.year || '-'}</div></td>
                                            <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-500">{vehicle.customer?.name || '-'}</div></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => router.push(`/dashboard/vehicles/${vehicle.id}/edit`)} className="text-primary-600 hover:text-primary-900 mr-4">Editar</button>
                                                <button onClick={() => handleDelete(vehicle.id)} className="text-red-600 hover:text-red-900">Excluir</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {vehicles.length === 0 && !loading && (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">Nenhum veículo cadastrado</p>
                                </div>
                            )}

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
                </div>
            </main>
        </div>
    )
}
