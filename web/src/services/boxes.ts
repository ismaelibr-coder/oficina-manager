import { authService } from './auth'
import { config } from '@/config'

export interface Box {
    id: string
    name: string
    description?: string
    status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE'
    active: boolean
}

export interface CreateBoxData {
    name: string
    description?: string
    status?: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE'
}

class BoxesService {
    private getHeaders() {
        const token = authService.getToken()
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    }

    async list(): Promise<Box[]> {
        const response = await fetch(`${config.apiUrl}/boxes`, {
            headers: this.getHeaders(),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao listar boxes')
        }

        return response.json()
    }

    async getById(id: string): Promise<Box> {
        const response = await fetch(`${config.apiUrl}/boxes/${id}`, {
            headers: this.getHeaders(),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao buscar box')
        }

        return response.json()
    }

    async create(data: CreateBoxData): Promise<Box> {
        const response = await fetch(`${config.apiUrl}/boxes`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao criar box')
        }

        return response.json()
    }

    async update(id: string, data: Partial<CreateBoxData>): Promise<Box> {
        const response = await fetch(`${config.apiUrl}/boxes/${id}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao atualizar box')
        }

        return response.json()
    }

    async delete(id: string): Promise<void> {
        const response = await fetch(`${config.apiUrl}/boxes/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao excluir box')
        }
    }
}

export const boxesService = new BoxesService()
