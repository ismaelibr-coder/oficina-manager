'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { format } from 'date-fns'
import { serviceOrdersService, ServiceOrder } from '@/services/service-orders'
import { productsService, Product } from '@/services/products'
import { servicesService, Service } from '@/services/services'
import { useIsMobile } from '@/hooks/useIsMobile'

// Função para traduzir status
const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
        'PENDING': 'Pendente',
        'AWAITING_APPROVAL': 'Aguardando Aprovação',
        'APPROVED': 'Aprovado',
        'IN_PROGRESS': 'Em Andamento',
        'COMPLETED': 'Concluído',
        'CANCELLED': 'Cancelado'
    }
    return statusMap[status] || status
}

export default function ServiceOrderDetailsPage() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string
    const isMobile = useIsMobile()

    const [os, setOs] = useState<ServiceOrder | null>(null)
    const [products, setProducts] = useState<Product[]>([])
    const [services, setServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)

    // Form states for adding items
    const [itemType, setItemType] = useState<'PRODUCT' | 'SERVICE'>('PRODUCT')
    const [selectedItem, setSelectedItem] = useState('')
    const [quantity, setQuantity] = useState(1)

    useEffect(() => {
        loadData()
    }, [id])

    const loadData = async () => {
        try {
            setLoading(true)
            const [osData, productsData, servicesData] = await Promise.all([
                serviceOrdersService.getById(id),
                productsService.list(),
                servicesService.list()
            ])
            setOs(osData)
            setProducts(productsData)
            setServices(servicesData)
        } catch (error: any) {
            alert(error.message)
            router.push('/dashboard/service-orders')
        } finally {
            setLoading(false)
        }
    }

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedItem) return

        try {
            setUpdating(true)

            let unitPrice = 0
            let description = ''

            if (itemType === 'PRODUCT') {
                const product = products.find(p => p.id === selectedItem)
                if (product) {
                    unitPrice = product.salePrice
                    description = product.name
                }
            } else {
                const service = services.find(s => s.id === selectedItem)
                if (service) {
                    unitPrice = service.price
                    description = service.name
                }
            }

            await serviceOrdersService.addItem(id, {
                type: itemType,
                productId: itemType === 'PRODUCT' ? selectedItem : undefined,
                serviceId: itemType === 'SERVICE' ? selectedItem : undefined,
                quantity: Number(quantity),
                unitPrice,
                description
            })

            const updatedOs = await serviceOrdersService.getById(id)
            setOs(updatedOs)
            setSelectedItem('')
            setQuantity(1)
        } catch (error: any) {
            alert(error.message)
        } finally {
            setUpdating(false)
        }
    }

    const handleRemoveItem = async (itemId: string) => {
        if (!confirm('Remover este item?')) return

        try {
            setUpdating(true)
            await serviceOrdersService.removeItem(id, itemId)
            const updatedOs = await serviceOrdersService.getById(id)
            setOs(updatedOs)
        } catch (error: any) {
            alert(error.message)
        } finally {
            setUpdating(false)
        }
    }

    const handleStatusChange = async (newStatus: string) => {
        if (!confirm(`Alterar status para ${getStatusLabel(newStatus)}?`)) return

        try {
            setUpdating(true)
            const updated = await serviceOrdersService.updateStatus(id, newStatus)
            setOs(updated)
        } catch (error: any) {
            alert(error.message)
        } finally {
            setUpdating(false)
        }
    }

    if (loading || !os) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Carregando...</div>

    const isEditable = os.status !== 'COMPLETED' && os.status !== 'CANCELLED'

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-900">OS: {os.orderNumber}</h1>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${os.status === 'PENDING' ? 'bg-gray-100 text-gray-800' :
                                os.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                                    os.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-800' :
                                        os.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                            os.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                            }`}>
                            {getStatusLabel(os.status)}
                        </span>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Dados do Veículo/Cliente */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Dados do Veículo</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Cliente</p>
                                    <p className="font-medium">{os.appointment?.customer?.name || os.customer?.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Veículo</p>
                                    <p className="font-medium">{os.vehicle?.model} - {os.vehicle?.plate}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Mecânico Responsável</p>
                                    <p className="font-medium">{os.mechanic?.name || 'Não atribuído'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Data de Abertura</p>
                                    <p className="font-medium">{format(new Date(os.createdAt), 'dd/MM/yyyy HH:mm')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Itens da OS - Responsivo */}
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-medium text-gray-900">Itens da Ordem de Serviço</h2>
                            </div>

                            {isMobile ? (
                                /* Mobile - Cards */
                                <div className="divide-y divide-gray-200">
                                    {os.items?.map((item) => (
                                        <div key={item.id} className="p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex-1">
                                                    <div className="font-semibold text-gray-900">{item.description}</div>
                                                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded mt-1 inline-block">
                                                        {item.type === 'PRODUCT' ? '📦 Peça' : '🔧 Serviço'}
                                                    </span>
                                                </div>
                                                {isEditable && (
                                                    <button
                                                        onClick={() => handleRemoveItem(item.id)}
                                                        className="touch-target ml-2 text-red-600"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <div className="text-gray-500 text-xs">Qtd</div>
                                                    <div className="font-medium">{item.quantity}</div>
                                                </div>
                                                <div>
                                                    <div className="text-gray-500 text-xs">Unit.</div>
                                                    <div className="font-medium">R$ {item.unitPrice.toFixed(2)}</div>
                                                </div>
                                                <div>
                                                    <div className="text-gray-500 text-xs">Total</div>
                                                    <div className="font-bold text-primary-600">R$ {item.total.toFixed(2)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {(!os.items || os.items.length === 0) && (
                                        <div className="p-8 text-center text-gray-500">Nenhum item adicionado</div>
                                    )}
                                    <div className="p-4 bg-gray-50 border-t-2 border-primary-200">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-semibold">Total:</span>
                                            <span className="text-2xl font-bold text-primary-600">R$ {os.total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Desktop - Tabela */
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qtd</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço Unit.</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                                {isEditable && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {os.items?.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900">{item.description}</div>
                                                        <div className="text-xs text-gray-500">{item.type === 'PRODUCT' ? 'Peça' : 'Serviço'}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">{item.quantity}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">R$ {item.unitPrice.toFixed(2)}</td>
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">R$ {item.total.toFixed(2)}</td>
                                                    {isEditable && (
                                                        <td className="px-6 py-4 text-right">
                                                            <button onClick={() => handleRemoveItem(item.id)} className="text-red-600 hover:text-red-900 text-sm">
                                                                Remover
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                            {(!os.items || os.items.length === 0) && (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500 text-sm">
                                                        Nenhum item adicionado
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                        <tfoot className="bg-gray-50">
                                            <tr>
                                                <td colSpan={3} className="px-6 py-4 text-right font-medium text-gray-900">Total Geral:</td>
                                                <td className="px-6 py-4 text-left font-bold text-lg text-primary-600">R$ {os.total.toFixed(2)}</td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Adicionar Item */}
                        {isEditable && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Adicionar Item</h3>
                                <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                        <select
                                            value={itemType}
                                            onChange={(e) => { setItemType(e.target.value as any); setSelectedItem('') }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                                        >
                                            <option value="PRODUCT">Peça/Produto</option>
                                            <option value="SERVICE">Serviço</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
                                        <select
                                            value={selectedItem}
                                            onChange={(e) => setSelectedItem(e.target.value)}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                                        >
                                            <option value="">Selecione...</option>
                                            {itemType === 'PRODUCT' ? (
                                                products.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name} - R$ {p.salePrice.toFixed(2)} (Estoque: {p.stock})</option>
                                                ))
                                            ) : (
                                                services.map(s => (
                                                    <option key={s.id} value={s.id}>{s.name} - R$ {s.price.toFixed(2)}</option>
                                                ))
                                            )}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                min="1"
                                                value={quantity}
                                                onChange={(e) => setQuantity(Number(e.target.value))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                                            />
                                            <button
                                                type="submit"
                                                disabled={updating}
                                                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Coluna Direita: Ações */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Ações da OS</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={() => router.push(`/dashboard/checklists/${os.appointmentId}`)}
                                    className="w-full py-2 px-4 bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                    Ver Checklist
                                </button>
                                {os.status === 'PENDING' && (
                                    <button
                                        onClick={() => handleStatusChange('AWAITING_APPROVAL')}
                                        disabled={updating}
                                        className="w-full py-2 px-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                                    >
                                        Enviar para Aprovação
                                    </button>
                                )}

                                {(os.status === 'PENDING' || os.status === 'AWAITING_APPROVAL') && (
                                    <button
                                        onClick={() => handleStatusChange('APPROVED')}
                                        disabled={updating}
                                        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        Aprovar Orçamento
                                    </button>
                                )}

                                {os.status === 'APPROVED' && (
                                    <button
                                        onClick={() => handleStatusChange('IN_PROGRESS')}
                                        disabled={updating}
                                        className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                                    >
                                        Iniciar Execução
                                    </button>
                                )}

                                {os.status === 'IN_PROGRESS' && (
                                    <button
                                        onClick={() => handleStatusChange('COMPLETED')}
                                        disabled={updating}
                                        className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                    >
                                        Finalizar Serviço
                                    </button>
                                )}

                                {isEditable && (
                                    <button
                                        onClick={() => handleStatusChange('CANCELLED')}
                                        disabled={updating}
                                        className="w-full py-2 px-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 mt-4"
                                    >
                                        Cancelar OS
                                    </button>
                                )}
                            </div>
                        </div>

                        <button onClick={() => router.push('/dashboard/service-orders')} className="w-full py-2 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                            Voltar para Lista
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}
