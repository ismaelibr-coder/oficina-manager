'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { vehiclesService } from '@/services/vehicles'
import { customersService, Customer } from '@/services/customers'
import { fipeService, FipeBrand, FipeModel } from '@/services/fipe'

export default function NewVehiclePage() {
    const router = useRouter()
    const [customers, setCustomers] = useState<Customer[]>([])
    const [brands, setBrands] = useState<FipeBrand[]>([])
    const [models, setModels] = useState<FipeModel[]>([])
    const [selectedBrand, setSelectedBrand] = useState('')
    const [formData, setFormData] = useState({
        customerId: '',
        plate: '',
        model: '',
        brand: '',
        year: new Date().getFullYear(),
        color: '',
        currentKm: 0,
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        loadCustomers()
        loadBrands()
    }, [])

    const loadCustomers = async () => {
        try {
            const data = await customersService.list()
            setCustomers(data)
        } catch (error: any) {
            setError(error.message)
        }
    }

    const loadBrands = async () => {
        const data = await fipeService.getBrands()
        setBrands(data)
    }

    const handleBrandChange = async (brandCode: string) => {
        setSelectedBrand(brandCode)
        const brand = brands.find(b => b.codigo === brandCode)
        if (brand) {
            setFormData({ ...formData, brand: brand.nome, model: '' })
            const modelData = await fipeService.getModels(brandCode)
            setModels(modelData)
        }
    }

    const handleModelChange = (modelName: string) => {
        setFormData({ ...formData, model: modelName })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            await vehiclesService.create(formData)
            router.push('/dashboard/vehicles')
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
                    <h1 className="text-2xl font-bold text-gray-900">Novo Veículo</h1>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"><p className="text-sm text-red-600">{error}</p></div>}

                <div className="bg-white rounded-lg shadow p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Cliente *</label>
                            <select required value={formData.customerId} onChange={(e) => setFormData({ ...formData, customerId: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900">
                                <option value="">Selecione um cliente</option>
                                {customers.map((customer) => (
                                    <option key={customer.id} value={customer.id}>{customer.name} - {customer.phone}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Placa *</label>
                                <input type="text" required value={formData.plate} onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900" placeholder="ABC-1234" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Marca *</label>
                                <select required value={selectedBrand} onChange={(e) => handleBrandChange(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900">
                                    <option value="">Selecione a marca</option>
                                    {brands.map((brand) => (
                                        <option key={brand.codigo} value={brand.codigo}>{brand.nome}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Modelo *</label>
                                <select required value={formData.model} onChange={(e) => handleModelChange(e.target.value)} disabled={!selectedBrand} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 disabled:bg-gray-100">
                                    <option value="">Selecione o modelo</option>
                                    {models.map((model) => (
                                        <option key={model.codigo} value={model.nome}>{model.nome}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Ano</label>
                                <input type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Cor</label>
                                <input type="text" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Quilometragem Atual</label>
                                <input type="number" value={formData.currentKm} onChange={(e) => setFormData({ ...formData, currentKm: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900" placeholder="0" />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button type="submit" disabled={loading} className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50">
                                {loading ? 'Salvando...' : 'Salvar'}
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
