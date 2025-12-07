'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { checklistsService, Checklist, ChecklistItem } from '@/services/checklists'
import { format } from 'date-fns'
import { useBreakpoint } from '@/hooks/useIsMobile'

export default function ChecklistExecutionPage() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string
    const breakpoint = useBreakpoint()

    const [checklist, setChecklist] = useState<Checklist | null>(null)
    const [loading, setLoading] = useState(true)
    const [updatingItem, setUpdatingItem] = useState<string | null>(null)
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

    useEffect(() => {
        loadChecklist()
    }, [id])

    const loadChecklist = async () => {
        try {
            const data = await checklistsService.getByAppointmentId(id)
            setChecklist(data)
        } catch (error: any) {
            alert(error.message)
            router.back()
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (itemId: string, status: ChecklistItem['status']) => {
        try {
            setUpdatingItem(itemId)
            const updatedItem = await checklistsService.updateItem(itemId, { status })

            if (checklist) {
                const newItems = checklist.items.map(item =>
                    item.id === itemId ? { ...item, status: updatedItem.status } : item
                )
                setChecklist({ ...checklist, items: newItems })
            }
        } catch (error: any) {
            alert(error.message)
        } finally {
            setUpdatingItem(null)
        }
    }

    const saveNotes = async (itemId: string, notes: string) => {
        try {
            setUpdatingItem(itemId)
            const updatedItem = await checklistsService.updateItem(itemId, { notes })
            if (checklist) {
                const newItems = checklist.items.map(item =>
                    item.id === itemId ? { ...item, notes: updatedItem.notes } : item
                )
                setChecklist({ ...checklist, items: newItems })
            }
        } catch (error: any) {
            alert(error.message)
        } finally {
            setUpdatingItem(null)
        }
    }

    const handlePhotoUpload = async (itemId: string, file: File, inputElement: HTMLInputElement | null) => {
        try {
            setUpdatingItem(itemId)
            console.log('[Checklist] Starting photo upload for item:', itemId, 'File:', file.name, file.size, 'bytes')

            const url = await checklistsService.uploadPhoto(file)
            console.log('[Checklist] Photo uploaded successfully:', url)

            const item = checklist?.items.find(i => i.id === itemId)
            const currentPhotos = item?.photos || []
            const newPhotos = [...currentPhotos, url]

            await checklistsService.updateItem(itemId, { photos: newPhotos })
            console.log('[Checklist] Item updated with photo')

            if (checklist) {
                const newItems = checklist.items.map(i =>
                    i.id === itemId ? { ...i, photos: newPhotos } : i
                )
                setChecklist({ ...checklist, items: newItems })
            }

            // Reset input to allow selecting the same file again
            if (inputElement) {
                inputElement.value = ''
            }
        } catch (error: any) {
            console.error('[Checklist] Error uploading photo:', error)
            // Use a more mobile-friendly error display
            const errorMessage = error.message || 'Erro desconhecido ao enviar foto'
            if (typeof window !== 'undefined') {
                // Create a toast-like notification
                const toast = document.createElement('div')
                toast.className = 'fixed bottom-4 left-4 right-4 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-slide-up'
                toast.textContent = `❌ ${errorMessage}`
                document.body.appendChild(toast)
                setTimeout(() => {
                    toast.remove()
                }, 4000)
            }
        } finally {
            setUpdatingItem(null)
        }
    }

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Carregando...</div>
    if (!checklist) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Checklist não encontrado</div>

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white shadow sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Checklist Digital</h1>
                        <p className="text-sm text-gray-500">
                            {format(new Date(checklist.createdAt), 'dd/MM/yyyy HH:mm')}
                        </p>
                    </div>
                    <button
                        onClick={() => router.back()}
                        className="touch-target text-gray-600 font-medium hover:text-gray-900 transition-colors"
                    >
                        Voltar
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className={`max-w-4xl mx-auto px-4 sm:px-6 py-6 ${breakpoint.isTablet ? 'grid grid-cols-2 gap-6' : 'space-y-6'}`}>
                {checklist.items.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        {/* Header do Item */}
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 flex-1">{item.name}</h3>
                            <span className={`px-3 py-1.5 rounded-full text-sm font-bold ml-4 ${item.status === 'OK' ? 'bg-green-100 text-green-800' :
                                item.status === 'ATTENTION' ? 'bg-yellow-100 text-yellow-800' :
                                    item.status === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'
                                }`}>
                                {item.status === 'NOT_CHECKED' ? 'Pendente' :
                                    item.status === 'OK' ? 'OK' :
                                        item.status === 'ATTENTION' ? 'Atenção' : 'Crítico'}
                            </span>
                        </div>

                        {/* Botões de Status - Touch Optimized */}
                        <div className="grid grid-cols-3 gap-3 mb-6">
                            <button
                                onClick={() => handleStatusChange(item.id, 'OK')}
                                disabled={updatingItem === item.id}
                                className={`touch-target-lg rounded-xl font-semibold text-base transition-all active-scale ${item.status === 'OK'
                                    ? 'bg-green-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-700'
                                    }`}
                            >
                                ✓ OK
                            </button>
                            <button
                                onClick={() => handleStatusChange(item.id, 'ATTENTION')}
                                disabled={updatingItem === item.id}
                                className={`touch-target-lg rounded-xl font-semibold text-base transition-all active-scale ${item.status === 'ATTENTION'
                                    ? 'bg-yellow-500 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-yellow-50 hover:text-yellow-700'
                                    }`}
                            >
                                ⚠ Atenção
                            </button>
                            <button
                                onClick={() => handleStatusChange(item.id, 'CRITICAL')}
                                disabled={updatingItem === item.id}
                                className={`touch-target-lg rounded-xl font-semibold text-base transition-all active-scale ${item.status === 'CRITICAL'
                                    ? 'bg-red-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-700'
                                    }`}
                            >
                                ✕ Crítico
                            </button>
                        </div>

                        {/* Observações */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Observações
                            </label>
                            <textarea
                                placeholder="Digite suas observações aqui..."
                                defaultValue={item.notes || ''}
                                onBlur={(e) => saveNotes(item.id, e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                rows={3}
                            />
                        </div>

                        {/* Área de Fotos - Touch Optimized */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Fotos ({item.photos?.length || 0})
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {/* Fotos Existentes */}
                                {item.photos?.map((photoUrl, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedPhoto(photoUrl)}
                                        className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-purple-400 transition-all active-scale group"
                                    >
                                        <img
                                            src={photoUrl}
                                            alt={`Foto ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                                            <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                            </svg>
                                        </div>
                                    </button>
                                ))}

                                {/* Botão Adicionar Foto - GRANDE com Loading */}
                                <label className={`w-24 h-24 sm:w-28 sm:h-28 flex flex-col items-center justify-center border-3 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all active-scale ${updatingItem === item.id ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''
                                    }`}>
                                    {updatingItem === item.id ? (
                                        <>
                                            <svg className="animate-spin h-10 w-10 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span className="text-sm font-medium text-purple-600 mt-2">Enviando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="text-sm font-medium text-gray-600 mt-2">Foto</span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        capture="user"
                                        className="hidden"
                                        disabled={updatingItem === item.id}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) handlePhotoUpload(item.id, file, e.target)
                                        }}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                ))}
            </main>

            {/* Modal de Visualização de Foto */}
            {selectedPhoto && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <div className="relative max-w-4xl max-h-full">
                        <button
                            onClick={() => setSelectedPhoto(null)}
                            className="absolute top-4 right-4 touch-target-lg bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                        >
                            <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <img
                            src={selectedPhoto}
                            alt="Foto ampliada"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <p className="text-white text-center mt-4 text-sm">
                            Toque fora da imagem para fechar
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
