'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { checklistTemplatesService } from '@/services/checklist-templates'

export default function NewChecklistTemplatePage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    })
    const [items, setItems] = useState<{ name: string }[]>([{ name: '' }])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleAddItem = () => {
        setItems([...items, { name: '' }])
    }

    const handleRemoveItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index)
        setItems(newItems)
    }

    const handleItemChange = (index: number, value: string) => {
        const newItems = [...items]
        newItems[index].name = value
        setItems(newItems)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        // Filtrar itens vazios
        const validItems = items.filter(item => item.name.trim() !== '')

        if (validItems.length === 0) {
            setError('Adicione pelo menos um item ao checklist')
            setLoading(false)
            return
        }

        try {
            await checklistTemplatesService.create({
                name: formData.name,
                description: formData.description || undefined,
                items: validItems
            })
            router.push('/dashboard/checklist-templates')
        } catch (error: any) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">Novo Modelo de Checklist</h1>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"><p className="text-sm text-red-600">{error}</p></div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Informações Básicas</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Modelo *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900"
                                    placeholder="Ex: Revisão Geral 10.000km"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                                <textarea
                                    rows={2}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900"
                                    placeholder="Descrição opcional"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-medium text-gray-900">Itens de Verificação</h2>
                            <button type="button" onClick={handleAddItem} className="text-sm text-primary-600 hover:text-primary-800 font-medium">
                                + Adicionar Item
                            </button>
                        </div>

                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <span className="text-gray-400 font-medium w-6 text-center">{index + 1}.</span>
                                    <input
                                        type="text"
                                        value={item.name}
                                        onChange={(e) => handleItemChange(index, e.target.value)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900"
                                        placeholder={`Item de verificação ${index + 1}`}
                                    />
                                    {items.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(index)}
                                            className="p-2 text-gray-400 hover:text-red-600"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="submit" disabled={loading} className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium">
                            {loading ? 'Salvando...' : 'Salvar Modelo'}
                        </button>
                        <button type="button" onClick={() => router.push('/dashboard/checklist-templates')} className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 font-medium">
                            Cancelar
                        </button>
                    </div>
                </form>
            </main>
        </div>
    )
}
