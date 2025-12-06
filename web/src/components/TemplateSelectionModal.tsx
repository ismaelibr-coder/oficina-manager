import { useState, useEffect } from 'react'
import { checklistTemplatesService, ChecklistTemplate } from '@/services/checklist-templates'

interface TemplateSelectionModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (templateId: string) => void
}

export default function TemplateSelectionModal({ isOpen, onClose, onConfirm }: TemplateSelectionModalProps) {
    const [templates, setTemplates] = useState<ChecklistTemplate[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedId, setSelectedId] = useState<string>('')

    useEffect(() => {
        if (isOpen) {
            loadTemplates()
        }
    }, [isOpen])

    const loadTemplates = async () => {
        try {
            setLoading(true)
            const data = await checklistTemplatesService.list()
            setTemplates(data)
            if (data.length > 0) {
                setSelectedId(data[0].id)
            }
        } catch (error) {
            console.error('Erro ao carregar templates:', error)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Selecionar Modelo de Checklist</h2>

                {loading ? (
                    <div className="text-center py-4">Carregando modelos...</div>
                ) : templates.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                        Nenhum modelo encontrado.
                        <br />
                        Um checklist em branco será criado.
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Modelo
                            </label>
                            <select
                                value={selectedId}
                                onChange={(e) => setSelectedId(e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white"
                            >
                                {templates.map(t => (
                                    <option key={t.id} value={t.id}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {selectedId && (
                            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
                                {templates.find(t => t.id === selectedId)?.description || 'Sem descrição'}
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => onConfirm(selectedId)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    )
}
