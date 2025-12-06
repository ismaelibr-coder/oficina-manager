'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { boxesService, Box } from '@/services/boxes'
import { authService } from '@/services/auth'

export default function BoxesPage() {
    const router = useRouter()
    const [boxes, setBoxes] = useState<Box[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadBoxes()
    }, [])

    const loadBoxes = async () => {
        try {
            setLoading(true)
            const data = await boxesService.list()
            setBoxes(data)
        } catch (error: any) {
            alert(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este box?')) return

        try {
            await boxesService.delete(id)
            loadBoxes()
        } catch (error: any) {
            alert(error.message)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'AVAILABLE': return 'bg-green-100 text-green-800'
            case 'OCCUPIED': return 'bg-red-100 text-red-800'
            case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'AVAILABLE': return 'Disponível'
            case 'OCCUPIED': return 'Ocupado'
            case 'MAINTENANCE': return 'Manutenção'
            default: return status
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Boxes</h1>
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push('/dashboard')} className="px-4 py-2 text-gray-600 hover:text-gray-900">Voltar</button>
                        <button onClick={() => { authService.logout(); router.push('/') }} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Sair</button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6 flex justify-end">
                    <button onClick={() => router.push('/dashboard/boxes/new')} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">+ Novo Box</button>
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {boxes.map((box) => (
                                        <tr key={box.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{box.name}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-500">{box.description || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(box.status)}`}>
                                                    {getStatusLabel(box.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => router.push(`/dashboard/boxes/${box.id}/edit`)}
                                                    className="text-primary-600 hover:text-primary-900 mr-4"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(box.id)}
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
