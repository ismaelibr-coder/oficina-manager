import { authService } from './auth'
import { config } from '@/config'

export interface Vehicle {
    id: string
    customerId: string
    plate: string
    model: string
    brand?: string | null
    year?: number | null
    color?: string | null
    customer?: {
        id: string
        name: string
        phone: string
    }
    createdAt?: string
    updatedAt?: string
}

export interface CreateVehicleData {
    customerId: string
    plate: string
    model: string
    brand?: string
    year?: number
    color?: string
}

class VehiclesService {
    private getHeaders() {
        const token = authService.getToken()
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    }

    async list(customerId?: string, search?: string): Promise<Vehicle[]> {
        const params = new URLSearchParams()
        if (customerId) params.append('customerId', customerId)
        if (search) params.append('search', search)

        const url = params.toString()
            ? `${config.apiUrl}/vehicles?${params}`
            : `${config.apiUrl}/vehicles`

        const response = await fetch(url, {
            headers: this.getHeaders(),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao listar veículos')
        }

        const json = await response.json()
        // Handle both paginated and non-paginated responses
        return Array.isArray(json) ? json : (json.data || [])
    }

    async getById(id: string): Promise<Vehicle> {
        const response = await fetch(`${config.apiUrl}/vehicles/${id}`, {
            headers: this.getHeaders(),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao buscar veículo')
        }

        return response.json()
    }

    async create(data: CreateVehicleData): Promise<Vehicle> {
        const response = await fetch(`${config.apiUrl}/vehicles`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao criar veículo')
        }

        return response.json()
    }

    async update(id: string, data: Partial<CreateVehicleData>): Promise<Vehicle> {
        const response = await fetch(`${config.apiUrl}/vehicles/${id}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao atualizar veículo')
        }

        return response.json()
    }

    async delete(id: string): Promise<void> {
        const response = await fetch(`${config.apiUrl}/vehicles/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao excluir veículo')
        }
    }
}

export const vehiclesService = new VehiclesService()
