import { authService } from './auth'
import { config } from '@/config'

export interface Customer {
    id: string
    name: string
    email?: string | null
    phone: string
    cpfCnpj?: string | null
    address?: string | null
    city?: string | null
    state?: string | null
    zipCode?: string | null
    createdAt?: string
    updatedAt?: string
}

export interface CreateCustomerData {
    name: string
    email?: string
    phone: string
    cpfCnpj?: string
    address?: string
    city?: string
    state?: string
    zipCode?: string
}

class CustomersService {
    private getHeaders() {
        const token = authService.getToken()
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    }

    async list(search?: string): Promise<Customer[]> {
        const url = search
            ? `${config.apiUrl}/customers?search=${encodeURIComponent(search)}`
            : `${config.apiUrl}/customers`

        const response = await fetch(url, {
            headers: this.getHeaders(),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao listar clientes')
        }

        return response.json()
    }

    async getById(id: string): Promise<Customer> {
        const response = await fetch(`${config.apiUrl}/customers/${id}`, {
            headers: this.getHeaders(),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao buscar cliente')
        }

        return response.json()
    }

    async create(data: CreateCustomerData): Promise<Customer> {
        const response = await fetch(`${config.apiUrl}/customers`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao criar cliente')
        }

        return response.json()
    }

    async update(id: string, data: CreateCustomerData): Promise<Customer> {
        const response = await fetch(`${config.apiUrl}/customers/${id}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao atualizar cliente')
        }

        return response.json()
    }

    async delete(id: string): Promise<void> {
        const response = await fetch(`${config.apiUrl}/customers/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao excluir cliente')
        }
    }
}

export const customersService = new CustomersService()
