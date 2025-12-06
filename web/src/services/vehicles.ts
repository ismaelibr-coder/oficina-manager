import { authService } from './auth'

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
            ? `http://localhost:3001/api/vehicles?${params}`
            : 'http://localhost:3001/api/vehicles'

        const response = await fetch(url, {
            headers: this.getHeaders(),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao listar veículos')
        }

        return response.json()
    }

    async getById(id: string): Promise<Vehicle> {
        const response = await fetch(`http://localhost:3001/api/vehicles/${id}`, {
            headers: this.getHeaders(),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao buscar veículo')
        }

        return response.json()
    }

    async create(data: CreateVehicleData): Promise<Vehicle> {
        const response = await fetch('http://localhost:3001/api/vehicles', {
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
        const response = await fetch(`http://localhost:3001/api/vehicles/${id}`, {
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
        const response = await fetch(`http://localhost:3001/api/vehicles/${id}`, {
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
