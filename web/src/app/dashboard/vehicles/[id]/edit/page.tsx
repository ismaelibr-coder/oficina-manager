'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { vehiclesService } from '@/services/vehicles'

export default function EditVehiclePage() {
    const router = useRouter()
    const params = useParams()
    const vehicleId = params.id as string

    const [formData, setFormData] = useState({
        plate: '',
        model: '',
        brand: '',
        year: new Date().getFullYear(),
        color: '',
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        loadVehicle()
    }, [vehicleId])

    const loadVehicle = async () => {
        try {
            const vehicle = await vehiclesService.getById(vehicleId)
            setFormData({
                plate: vehicle.plate,
                model: vehicle.model,
                brand: vehicle.brand || '',
                year: vehicle.year || new Date().getFullYear(),
                color: vehicle.color || '',
            })
        } catch (error: any) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError('')

        try {
            await vehiclesService.update(vehicleId, formData)
            router.push('/dashboard/vehicles')
        } catch (error: any) {
            setError(error.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Carregando...</div>

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">Editar Veículo</h1>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"><p className="text-sm text-red-600">{error}</p></div>}

                <div className="bg-white rounded-lg shadow p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Placa *</label>
                                <input type="text" required value={formData.plate} onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Modelo *</label>
                                <input type="text" required value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Marca</label>
                                <input type="text" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Ano</label>
                                <input type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Cor</label>
                                <input type="text" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900" />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button type="submit" disabled={saving} className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50">
                                {saving ? 'Salvando...' : 'Salvar'}
                            </button>
                            <button type="button" onClick={() => router.push('/dashboard/vehicles')} className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300">
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}
