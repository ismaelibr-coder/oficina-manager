'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { checklistTemplatesService, ChecklistTemplate } from '@/services/checklist-templates'
import { authService } from '@/services/auth'

export default function ChecklistTemplatesPage() {
    const router = useRouter()
    const [templates, setTemplates] = useState<ChecklistTemplate[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadTemplates()
    }, [])

    const loadTemplates = async () => {
        try {
            setLoading(true)
            const data = await checklistTemplatesService.list()
            setTemplates(data)
        } catch (error: any) {
            alert(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este template?')) return

        try {
            await checklistTemplatesService.delete(id)
            loadTemplates()
        } catch (error: any) {
            alert(error.message)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Modelos de Checklist</h1>
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push('/dashboard')} className="px-4 py-2 text-gray-600 hover:text-gray-900">Voltar</button>
                        <button onClick={() => { authService.logout(); router.push('/') }} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Sair</button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6 flex justify-end">
                    <button onClick={() => router.push('/dashboard/checklist-templates/new')} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">+ Novo Modelo</button>
                </div>

                {loading ? (
                    <div className="text-center py-12">Carregando...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates.map((template) => (
                            <div key={template.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                        {template.items.length} itens
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{template.description || 'Sem descrição'}</p>

                                <div className="border-t border-gray-100 pt-4 flex justify-end gap-3">
                                    <button
                                        onClick={() => router.push(`/dashboard/checklist-templates/${template.id}/edit`)}
                                        className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(template.id)}
                                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                                    >
                                        Excluir
                                    </button>
                                </div>
                            </div>
                        ))}
                        {templates.length === 0 && (
                            <div className="col-span-full text-center py-12 text-gray-500">
                                Nenhum modelo de checklist encontrado. Crie o primeiro!
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}
