'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { appointmentsService } from '@/services/appointments'
import { customersService, Customer } from '@/services/customers'
import { vehiclesService, Vehicle } from '@/services/vehicles'
import { boxesService, Box } from '@/services/boxes'

export default function NewAppointmentPage() {
    const router = useRouter()
    const [customers, setCustomers] = useState<Customer[]>([])
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [boxes, setBoxes] = useState<Box[]>([])

    const [formData, setFormData] = useState({
        customerId: '',
        vehicleId: '',
        boxId: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '08:00',
        endTime: '09:00',
        description: '',
        notes: ''
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        loadInitialData()
    }, [])

    useEffect(() => {
        if (formData.customerId) {
            loadCustomerVehicles(formData.customerId)
        } else {
            setVehicles([])
            setFormData(prev => ({ ...prev, vehicleId: '' }))
        }
    }, [formData.customerId])

    const loadInitialData = async () => {
        try {
            const [customersData, boxesData] = await Promise.all([
                customersService.list(),
                boxesService.list()
            ])
            setCustomers(customersData)
            setBoxes(boxesData)
        } catch (error: any) {
            setError('Erro ao carregar dados iniciais: ' + error.message)
        }
    }

    const loadCustomerVehicles = async (customerId: string) => {
        try {
            const data = await vehiclesService.list(customerId)
            setVehicles(data)
        } catch (error: any) {
            console.error('Erro ao carregar veículos:', error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            // Combinar data e hora
            const start = new Date(`${formData.date}T${formData.startTime}`)
            const end = new Date(`${formData.date}T${formData.endTime}`)

            const newAppointment = await appointmentsService.create({
                customerId: formData.customerId,
                vehicleId: formData.vehicleId,
                boxId: formData.boxId,
                scheduledStart: start.toISOString(),
                scheduledEnd: end.toISOString(),
                description: formData.description,
                notes: formData.notes
            })

            router.push(`/dashboard/appointments/${newAppointment.id}`)
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
                    <h1 className="text-2xl font-bold text-gray-900">Novo Agendamento</h1>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"><p className="text-sm text-red-600">{error}</p></div>}

                <div className="bg-white rounded-lg shadow p-6">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Seleção de Cliente e Veículo */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Cliente *</label>
                                <select
                                    required
                                    value={formData.customerId}
                                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-base text-gray-900"
                                    onFocus={(e) => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                                >
                                    <option value="">Selecione um cliente</option>
                                    {customers.map((customer) => (
                                        <option key={customer.id} value={customer.id}>{customer.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Veículo *</label>
                                <select
                                    required
                                    value={formData.vehicleId}
                                    onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                                    disabled={!formData.customerId}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-base text-gray-900 disabled:bg-gray-100"
                                    onFocus={(e) => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                                >
                                    <option value="">Selecione um veículo</option>
                                    {vehicles.map((vehicle) => (
                                        <option key={vehicle.id} value={vehicle.id}>{vehicle.model} - {vehicle.plate}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Data, Hora e Box */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Data *</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-base text-gray-900"
                                    onFocus={(e) => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Início *</label>
                                <input
                                    type="time"
                                    required
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-base text-gray-900"
                                    onFocus={(e) => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Término *</label>
                                <input
                                    type="time"
                                    required
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-base text-gray-900"
                                    onFocus={(e) => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Box *</label>
                            <select
                                required
                                value={formData.boxId}
                                onChange={(e) => setFormData({ ...formData, boxId: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-base text-gray-900"
                                onFocus={(e) => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                            >
                                <option value="">Selecione um box</option>
                                {boxes.map((box) => (
                                    <option key={box.id} value={box.id}>{box.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Detalhes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Descrição do Serviço</label>
                            <textarea
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-base text-gray-900 resize-none"
                                onFocus={(e) => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                                placeholder="Ex: Troca de óleo e filtros"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Observações Internas</label>
                            <textarea
                                rows={2}
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-base text-gray-900 resize-none"
                                onFocus={(e) => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                                placeholder="Notas visíveis apenas para a oficina"
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button type="submit" disabled={loading} className="flex-1 bg-primary-600 text-white min-h-[48px] px-6 rounded-lg hover:bg-primary-700 disabled:opacity-50 font-semibold text-base active-scale">
                                {loading ? 'Agendando...' : 'Agendar'}
                            </button>
                            <button type="button" onClick={() => router.push('/dashboard/appointments')} className="flex-1 bg-gray-200 text-gray-700 min-h-[48px] px-6 rounded-lg hover:bg-gray-300 font-semibold text-base active-scale">
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}
