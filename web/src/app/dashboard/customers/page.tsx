'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { customersService, Customer } from '@/services/customers'
import { authService } from '@/services/auth'

export default function CustomersPage() {
    const router = useRouter()
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        loadCustomers()
    }, [])

    const loadCustomers = async (searchTerm?: string) => {
        try {
            setLoading(true)
            const data = await customersService.list(searchTerm)
            setCustomers(data)
        } catch (error: any) {
            alert(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        loadCustomers(search)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este cliente?')) return

        try {
            await customersService.delete(id)
            await loadCustomers()
        } catch (error: any) {
            alert(error.message)
        }
    }

    if (loading) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Carregando...</div>
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Gerenciar Clientes</h1>
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push('/dashboard')} className="px-4 py-2 text-gray-600 hover:text-gray-900">Voltar</button>
                        <button onClick={() => { authService.logout(); router.push('/') }} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Sair</button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6 flex gap-4">
                    <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por nome, email, telefone ou CPF/CNPJ..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                        />
                        <button type="submit" className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Buscar</button>
                    </form>
                    <button onClick={() => router.push('/dashboard/customers/new')} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">+ Novo Cliente</button>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CPF/CNPJ</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {customers.map((customer) => (
                                <tr key={customer.id}>
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{customer.name}</div></td>
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-500">{customer.phone}</div></td>
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-500">{customer.email || '-'}</div></td>
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-500">{customer.cpfCnpj || '-'}</div></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => router.push(`/dashboard/customers/${customer.id}/edit`)} className="text-primary-600 hover:text-primary-900 mr-4">Editar</button>
                                        <button onClick={() => handleDelete(customer.id)} className="text-red-600 hover:text-red-900">Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {customers.length === 0 && <div className="text-center py-12"><p className="text-gray-500">Nenhum cliente cadastrado</p></div>}
                </div>
            </main>
        </div>
    )
}
