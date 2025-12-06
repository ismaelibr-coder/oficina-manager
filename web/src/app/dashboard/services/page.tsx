'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { servicesService, Service } from '@/services/services'
import { authService } from '@/services/auth'

export default function ServicesPage() {
    const router = useRouter()
    const [services, setServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        loadServices()
    }, [])

    const loadServices = async () => {
        try {
            setLoading(true)
            const data = await servicesService.list(searchTerm)
            setServices(data)
        } catch (error: any) {
            alert(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este serviço?')) return

        try {
            await servicesService.delete(id)
            loadServices()
        } catch (error: any) {
            alert(error.message)
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        loadServices()
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Serviços e Mão de Obra</h1>
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push('/dashboard')} className="px-4 py-2 text-gray-600 hover:text-gray-900">Voltar</button>
                        <button onClick={() => { authService.logout(); router.push('/') }} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Sair</button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
                        <input
                            type="text"
                            placeholder="Buscar por nome..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 w-full sm:w-64"
                        />
                        <button type="submit" className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900">Buscar</button>
                    </form>
                    <button onClick={() => router.push('/dashboard/services/new')} className="w-full sm:w-auto px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">+ Novo Serviço</button>
                </div>

                {loading ? (
                    <div className="text-center py-12">Carregando...</div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tempo Estimado</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {services.map((service) => (
                                        <tr key={service.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{service.name}</div>
                                                <div className="text-sm text-gray-500">{service.description || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">R$ {service.price.toFixed(2)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{service.estimatedHours}h</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => router.push(`/dashboard/services/${service.id}/edit`)}
                                                    className="text-primary-600 hover:text-primary-900 mr-4"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(service.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Excluir
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
