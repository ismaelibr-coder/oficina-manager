import { authService } from './auth'
import { config } from '@/config'

export interface Service {
    id: string
    name: string
    description?: string
    estimatedHours: number
    price: number
    active: boolean
}

export interface CreateServiceData {
    name: string
    description?: string
    estimatedHours?: number
    price: number
}

class ServicesService {
    private getHeaders() {
        const token = authService.getToken()
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    }

    async list(search?: string): Promise<Service[]> {
        const url = search
            ? `${config.apiUrl}/services?search=${encodeURIComponent(search)}`
            : `${config.apiUrl}/services`

        const response = await fetch(url, {
            headers: this.getHeaders(),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao listar serviços')
        }

        const json = await response.json()
        // Handle both paginated and non-paginated responses
        return Array.isArray(json) ? json : (json.data || [])
    }

    async getById(id: string): Promise<Service> {
        const response = await fetch(`${config.apiUrl}/services/${id}`, {
            headers: this.getHeaders(),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao buscar serviço')
        }

        return response.json()
    }

    async create(data: CreateServiceData): Promise<Service> {
        const response = await fetch(`${config.apiUrl}/services`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao criar serviço')
        }

        return response.json()
    }

    async update(id: string, data: Partial<CreateServiceData>): Promise<Service> {
        const response = await fetch(`${config.apiUrl}/services/${id}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao atualizar serviço')
        }

        return response.json()
    }

    async delete(id: string): Promise<void> {
        const response = await fetch(`${config.apiUrl}/services/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao excluir serviço')
        }
    }
}

export const servicesService = new ServicesService()
